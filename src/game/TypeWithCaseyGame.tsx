import { useState, useEffect, useRef } from 'react';
import { useScore } from '@/hooks/use-score';
import { useAuth } from '@/lib/auth-context';
import { Leaderboard } from '@/components/leaderboard';

// ── Finger data ──────────────────────────────────────────────────────────────

const FINGER_COLORS: Record<string, string> = {
  left_pinky:   '#FF6B6B',
  left_ring:    '#FF9F43',
  left_middle:  '#FECA57',
  left_index:   '#48DBFB',
  right_index:  '#54A0FF',
  right_middle: '#A29BFE',
  right_ring:   '#FD79A8',
  right_pinky:  '#00CEC9',
  thumb:        '#6C5CE7',
};

const FINGER_NAMES: Record<string, string> = {
  left_pinky:   'Left Pinky',
  left_ring:    'Left Ring Finger',
  left_middle:  'Left Middle Finger',
  left_index:   'Left Pointer Finger',
  right_index:  'Right Pointer Finger',
  right_middle: 'Right Middle Finger',
  right_ring:   'Right Ring Finger',
  right_pinky:  'Right Pinky',
  thumb:        'Either Thumb',
};

const FINGER_HAND: Record<string, 'left' | 'right' | 'both'> = {
  left_pinky:   'left',
  left_ring:    'left',
  left_middle:  'left',
  left_index:   'left',
  right_index:  'right',
  right_middle: 'right',
  right_ring:   'right',
  right_pinky:  'right',
  thumb:        'both',
};

const KEY_FINGER: Record<string, string> = {
  q: 'left_pinky',  a: 'left_pinky',  z: 'left_pinky',
  w: 'left_ring',   s: 'left_ring',   x: 'left_ring',
  e: 'left_middle', d: 'left_middle', c: 'left_middle',
  r: 'left_index',  f: 'left_index',  v: 'left_index',
  t: 'left_index',  g: 'left_index',  b: 'left_index',
  y: 'right_index', h: 'right_index', n: 'right_index',
  u: 'right_index', j: 'right_index', m: 'right_index',
  i: 'right_middle',k: 'right_middle',
  o: 'right_ring',  l: 'right_ring',
  p: 'right_pinky',
  ' ': 'thumb',
};

const KEYBOARD_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

const HOME_KEYS = new Set(['a','s','d','f','j','k','l']);

// ── Level data ───────────────────────────────────────────────────────────────

type Level = 1 | 2 | 3;

interface LevelData {
  name: string;
  emoji: string;
  desc: string;
  accent: string;
  words: string[];
}

const LEVELS: Record<Level, LevelData> = {
  1: {
    name: 'Home Row Hero',
    emoji: '🏠',
    desc: 'Only A S D F G H J K L — home row keys!',
    accent: '#48DBFB',
    words: ['sad','dad','has','ask','gal','flag','glad','half','fall','hall','flash','dash','hash','lash','shall','glass','flask','lass','fad','lad'],
  },
  2: {
    name: 'Full Keyboard',
    emoji: '⌨️',
    desc: 'All letters — every finger gets a turn!',
    accent: '#A29BFE',
    words: ['cat','dog','fun','big','cup','win','pet','run','hop','zip','fox','jam','bug','cut','dim','fit','got','hit','joy','key'],
  },
  3: {
    name: 'Speed Champ',
    emoji: '⚡',
    desc: 'Longer words and faster fingers!',
    accent: '#FF6B6B',
    words: ['plant','music','tiger','world','happy','sunny','brave','candy','magic','pizza','robot','storm','torch','vivid','wagon','yacht','zebra','apple','cloud','bright'],
  },
};

const WORDS_PER_ROUND = 8;

// ── Left/Right hand finger layouts for hand diagram ──────────────────────────

const LEFT_FINGERS = [
  { id: 'left_pinky',  label: 'P',  keys: 'A Q Z' },
  { id: 'left_ring',   label: 'R',  keys: 'S W X' },
  { id: 'left_middle', label: 'M',  keys: 'D E C' },
  { id: 'left_index',  label: 'I',  keys: 'F G R T V B' },
];

const RIGHT_FINGERS = [
  { id: 'right_index',  label: 'I', keys: 'J H U Y M N' },
  { id: 'right_middle', label: 'M', keys: 'K I' },
  { id: 'right_ring',   label: 'R', keys: 'L O' },
  { id: 'right_pinky',  label: 'P', keys: 'P' },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Screen = 'intro' | 'playing' | 'complete';

export function TypeWithCaseyGame({ onComplete }: { onComplete?: () => void } = {}) {
  const { user, openAuthModal } = useAuth();
  const { saveScore, saving, saved, reset: resetScore } = useScore('type-with-casey');

  const [screen, setScreen]         = useState<Screen>('intro');
  const [level, setLevel]           = useState<Level>(1);
  const [wordIdx, setWordIdx]       = useState(0);
  const [charIdx, setCharIdx]       = useState(0);
  const [mistakes, setMistakes]     = useState(0);
  const [score, setScore]           = useState(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey]     = useState<string | null>(null);
  const [wordDone, setWordDone]     = useState(false);
  const [startTime, setStartTime]   = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [correctTyped, setCorrectTyped] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const levelData  = LEVELS[level];
  const words      = levelData.words.slice(0, WORDS_PER_ROUND);
  const currentWord = words[wordIdx] ?? '';
  const currentChar = currentWord[charIdx] ?? '';
  const currentFinger = currentChar ? (KEY_FINGER[currentChar.toLowerCase()] ?? null) : null;

  // Auto-focus on game start and word change
  useEffect(() => {
    if (screen === 'playing') containerRef.current?.focus();
  }, [screen, wordIdx]);

  // Save score when game completes
  useEffect(() => {
    if (screen === 'complete' && score > 0) saveScore(score);
  }, [screen, score, saveScore]);

  function startGame(lvl: Level) {
    resetScore();
    setLevel(lvl);
    setWordIdx(0);
    setCharIdx(0);
    setMistakes(0);
    setScore(0);
    setPressedKey(null);
    setWrongKey(null);
    setWordDone(false);
    setTotalTyped(0);
    setCorrectTyped(0);
    setStartTime(Date.now());
    setScreen('playing');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (screen !== 'playing' || wordDone) return;

    const raw = e.key;
    const key = raw === ' ' ? ' ' : raw.length === 1 ? raw.toLowerCase() : null;
    if (!key) return;
    e.preventDefault();

    const expected = currentChar === ' ' ? ' ' : currentChar.toLowerCase();

    if (key === expected) {
      setPressedKey(key);
      setCorrectTyped(c => c + 1);
      setTotalTyped(t => t + 1);
      setTimeout(() => setPressedKey(null), 120);

      const nextChar = charIdx + 1;
      if (nextChar >= currentWord.length) {
        const bonus = Math.max(5 - mistakes, 0) * 20;
        setScore(s => s + 100 + bonus);
        setWordDone(true);

        setTimeout(() => {
          const nextWord = wordIdx + 1;
          if (nextWord >= words.length) {
            setScreen('complete');
            onComplete?.();
          } else {
            setWordIdx(nextWord);
            setCharIdx(0);
            setMistakes(0);
            setWordDone(false);
          }
        }, 750);
      } else {
        setCharIdx(nextChar);
      }
    } else {
      setWrongKey(key);
      setTotalTyped(t => t + 1);
      setMistakes(m => m + 1);
      setTimeout(() => setWrongKey(null), 280);
    }
  }

  // ── Sub-renders ─────────────────────────────────────────────────────────────

  function renderKeyboard() {
    return (
      <div
        className="flex flex-col items-center gap-1.5 rounded-2xl border-[3px] border-ink p-3 bg-white select-none"
        style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
      >
        {KEYBOARD_ROWS.map((row, ri) => (
          <div
            key={ri}
            className="flex gap-1"
            style={{ paddingLeft: ri === 1 ? '1rem' : ri === 2 ? '2.25rem' : 0 }}
          >
            {row.map(k => {
              const finger = KEY_FINGER[k];
              const col    = FINGER_COLORS[finger];
              const isActive  = k === currentChar.toLowerCase() && !wordDone;
              const isPressed = pressedKey === k;
              const isWrong   = wrongKey === k;
              const isHome    = HOME_KEYS.has(k);

              return (
                <div
                  key={k}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm border-[2px] border-ink transition-all duration-75"
                  style={{
                    background: isActive ? col : col + '30',
                    borderBottomWidth: isPressed ? 2 : 4,
                    borderRightWidth: isPressed ? 2 : 3,
                    transform: isPressed ? 'translateY(2px) scale(0.95)' : isActive ? 'scale(1.18)' : 'scale(1)',
                    outline: isActive ? `3px solid ${col}` : isWrong ? '3px solid #EF4444' : 'none',
                    outlineOffset: '2px',
                    zIndex: isActive ? 10 : 1,
                    boxShadow: isActive ? `0 0 14px ${col}88` : 'none',
                  }}
                >
                  {k.toUpperCase()}
                  {isHome && (
                    <div className="absolute bottom-[3px] w-1 h-1 rounded-full bg-ink/40" />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Space bar */}
        {(() => {
          const isActive = currentChar === ' ' && !wordDone;
          const isPressed = pressedKey === ' ';
          const col = FINGER_COLORS.thumb;
          return (
            <div
              className="rounded-lg border-[2px] border-ink flex items-center justify-center font-bold text-xs transition-all duration-75"
              style={{
                width: '14rem',
                height: '2.25rem',
                background: isActive ? col : col + '30',
                borderBottomWidth: isPressed ? 2 : 4,
                borderRightWidth: isPressed ? 2 : 3,
                transform: isPressed ? 'translateY(2px)' : 'scale(1)',
                outline: isActive ? `3px solid ${col}` : 'none',
                outlineOffset: '2px',
                boxShadow: isActive ? `0 0 14px ${col}88` : 'none',
              }}
            >
              SPACE
            </div>
          );
        })()}
      </div>
    );
  }

  function renderHandDiagram(activeFinger: string | null) {
    function Hand({ fingers, side }: { fingers: typeof LEFT_FINGERS; side: 'left' | 'right' }) {
      return (
        <div className={`flex gap-1 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
          {fingers.map(f => {
            const isActive = f.id === activeFinger;
            const col = FINGER_COLORS[f.id];
            return (
              <div key={f.id} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-7 rounded-t-full border-[2px] border-ink transition-all duration-150 flex items-end justify-center pb-1 font-extrabold text-[9px]"
                  style={{
                    height: isActive ? '3.5rem' : '2.8rem',
                    background: isActive ? col : col + '55',
                    borderBottomWidth: 2,
                    transform: isActive ? 'translateY(-4px)' : 'none',
                    boxShadow: isActive ? `0 0 10px ${col}88` : 'none',
                  }}
                >
                  {isActive && '↑'}
                </div>
                <div
                  className="text-[8px] font-bold"
                  style={{ color: isActive ? col : '#999' }}
                >
                  {f.keys.split(' ')[0]}
                </div>
              </div>
            );
          })}

          {/* Palm */}
          <div
            className="w-8 rounded-b-xl border-[2px] border-ink self-end"
            style={{ height: '1.5rem', background: '#e5e7eb' }}
          />
        </div>
      );
    }

    return (
      <div className="flex items-end justify-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-wide">Left</div>
          <Hand fingers={LEFT_FINGERS} side="left" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-wide">Right</div>
          <Hand fingers={RIGHT_FINGERS} side="right" />
        </div>
      </div>
    );
  }

  // ── Screens ──────────────────────────────────────────────────────────────────

  if (screen === 'intro') {
    return (
      <div className="flex flex-col items-center gap-6 py-6 max-w-xl mx-auto px-4">
        {/* Title */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink px-4 py-1 text-xs font-extrabold uppercase tracking-[0.2em] mb-3"
            style={{ background: '#FBBF24', borderBottomWidth: 4, borderRightWidth: 3 }}
          >
            Casey Teaches Typing
          </div>
          <h1 className="text-3xl font-extrabold">Type with Casey! ⌨️</h1>
          <p className="mt-2 text-sm text-ink/60 max-w-xs mx-auto">
            Learn to type the right way — proper fingers, proper technique, proper fun!
          </p>
        </div>

        {/* Home row guide */}
        <div
          className="w-full rounded-2xl border-[3px] border-ink p-4"
          style={{ background: '#FFF', borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          <div className="text-center font-extrabold mb-1">🏠 Home Row — Your Starting Position</div>
          <p className="text-center text-xs text-ink/55 mb-3">
            Always start with these fingers on these keys. Feel the bumps on <strong>F</strong> and <strong>J</strong>!
          </p>
          <div className="flex gap-1 justify-center">
            {[
              { k: 'a', label: 'Left\nPinky' },
              { k: 's', label: 'Left\nRing' },
              { k: 'd', label: 'Left\nMiddle' },
              { k: 'f', label: 'Left\nPointer', bump: true },
              null,
              { k: 'j', label: 'Right\nPointer', bump: true },
              { k: 'k', label: 'Right\nMiddle' },
              { k: 'l', label: 'Right\nRing' },
            ].map((item, i) => {
              if (!item) return <div key={i} className="w-3" />;
              const { k, label, bump } = item as { k: string; label: string; bump?: boolean };
              const col = FINGER_COLORS[KEY_FINGER[k]];
              return (
                <div key={k} className="flex flex-col items-center gap-1">
                  <div
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm border-[2px] border-ink"
                    style={{ background: col, borderBottomWidth: 4, borderRightWidth: 3 }}
                  >
                    {k.toUpperCase()}
                    {bump && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-black/30" />}
                  </div>
                  <div className="text-[8px] text-center text-ink/50 font-bold leading-tight whitespace-pre">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-center text-xs text-ink/40">
            Thumbs rest on the <strong>Space bar</strong>
          </div>
        </div>

        {/* Finger color legend */}
        <div
          className="w-full rounded-2xl border-[3px] border-ink p-3"
          style={{ background: '#F9FAFB', borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          <div className="text-center text-xs font-extrabold mb-2 uppercase tracking-wide text-ink/60">Finger Color Map</div>
          <div className="grid grid-cols-2 gap-1.5">
            {[...LEFT_FINGERS, ...RIGHT_FINGERS].map(f => (
              <div key={f.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-ink/20 shrink-0"
                  style={{ background: FINGER_COLORS[f.id] }}
                />
                <span className="text-[10px] font-bold text-ink/70">
                  {FINGER_NAMES[f.id]}: <span className="text-ink/40">{f.keys}</span>
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-ink/20 shrink-0" style={{ background: FINGER_COLORS.thumb }} />
              <span className="text-[10px] font-bold text-ink/70">Thumbs: SPACE</span>
            </div>
          </div>
        </div>

        {/* Level select */}
        <div className="w-full">
          <div className="text-center font-extrabold mb-3 text-sm uppercase tracking-wide text-ink/60">
            Choose Your Level
          </div>
          <div className="flex flex-col gap-3">
            {([1, 2, 3] as Level[]).map(lvl => {
              const d = LEVELS[lvl];
              return (
                <button
                  key={lvl}
                  onClick={() => startGame(lvl)}
                  className="flex items-center gap-3 rounded-2xl border-[3px] border-ink px-4 py-3 text-left transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95"
                  style={{ background: d.accent + '25', borderBottomWidth: 6, borderRightWidth: 5 }}
                >
                  <span className="text-3xl">{d.emoji}</span>
                  <div className="flex-1">
                    <div className="font-extrabold">{d.name}</div>
                    <div className="text-xs text-ink/55 mt-0.5">{d.desc}</div>
                  </div>
                  <span
                    className="rounded-full border-[2px] border-ink px-3 py-1 text-xs font-extrabold"
                    style={{ background: d.accent, borderBottomWidth: 3, borderRightWidth: 2 }}
                  >
                    Play →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'playing') {
    const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;

    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => containerRef.current?.focus()}
        className="flex flex-col gap-4 max-w-xl mx-auto px-4 py-2 outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{levelData.emoji}</span>
            <span className="font-extrabold text-sm">{levelData.name}</span>
          </div>
          <div className="flex gap-3 text-xs font-extrabold text-ink/60">
            <span className="text-ink font-extrabold text-sm">Score: {score}</span>
            <span>Word {wordIdx + 1}/{words.length}</span>
            <span>{accuracy}% acc</span>
          </div>
        </div>

        {/* Word display */}
        <div
          className="flex items-center justify-center gap-1 rounded-2xl border-[3px] border-ink"
          style={{
            background: '#fff',
            borderBottomWidth: 6,
            borderRightWidth: 5,
            minHeight: '6rem',
            padding: '1rem 1.5rem',
          }}
        >
          {wordDone ? (
            <div className="flex flex-col items-center gap-1">
              <div className="text-4xl">✅</div>
              <div className="text-base font-extrabold text-green-500">
                {mistakes === 0 ? 'Perfect! +' + (100 + 100) : 'Nice! +' + (100 + Math.max(5 - mistakes, 0) * 20)}
              </div>
            </div>
          ) : (
            currentWord.split('').map((ch, i) => {
              const done    = i < charIdx;
              const current = i === charIdx;
              const finger  = KEY_FINGER[ch.toLowerCase()];
              const col     = finger ? FINGER_COLORS[finger] : '#ccc';
              return (
                <span
                  key={i}
                  className="text-4xl font-extrabold rounded-xl px-1 transition-all duration-100"
                  style={{
                    display: 'inline-block',
                    background: done ? '#22C55E22' : current ? col + '33' : 'transparent',
                    color: done ? '#22C55E' : current ? col : '#D1D5DB',
                    transform: current ? 'scale(1.2)' : 'scale(1)',
                    outline: current ? `2.5px solid ${col}` : 'none',
                    outlineOffset: 2,
                    animation: wrongKey ? undefined : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })
          )}
        </div>

        {/* Finger tip + shake feedback */}
        <div
          className="flex items-center gap-3 rounded-2xl border-[3px] border-ink p-3 transition-all"
          style={{
            background: currentFinger ? FINGER_COLORS[currentFinger] + '18' : '#f9fafb',
            borderBottomWidth: 5,
            borderRightWidth: 4,
            borderColor: wrongKey ? '#EF4444' : undefined,
            animation: wrongKey ? 'shake 0.25s ease-in-out' : undefined,
          }}
        >
          {currentFinger ? (
            <>
              <div
                className="w-12 h-12 rounded-xl border-[2px] border-ink flex items-center justify-center text-xl shrink-0 font-extrabold"
                style={{ background: FINGER_COLORS[currentFinger], borderBottomWidth: 4, borderRightWidth: 3 }}
              >
                {FINGER_HAND[currentFinger] === 'left' ? '🤚' : FINGER_HAND[currentFinger] === 'right' ? '✋' : '👍'}
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.15em] text-ink/45 font-bold">Use your</div>
                <div className="font-extrabold text-sm" style={{ color: FINGER_COLORS[currentFinger] }}>
                  {FINGER_NAMES[currentFinger]}
                </div>
                <div className="text-[10px] text-ink/40">
                  Press: <strong className="text-ink/70 uppercase">{currentChar === ' ' ? 'Space' : currentChar}</strong>
                </div>
              </div>
              {wrongKey && (
                <div className="text-2xl">❌</div>
              )}
              {pressedKey && !wrongKey && (
                <div className="text-2xl">✅</div>
              )}
            </>
          ) : (
            <div className="text-sm text-ink/40 text-center w-full">Get ready...</div>
          )}
        </div>

        {/* Hand diagram */}
        {renderHandDiagram(currentFinger)}

        {/* Keyboard */}
        {renderKeyboard()}

        {/* Focus hint */}
        <div className="text-center text-[10px] text-ink/30 pb-2">
          Click here then type on your keyboard!
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }

  // Complete screen
  const elapsed = Math.max((Date.now() - startTime) / 60000, 0.01);
  const totalChars = words.join('').length;
  const finalWpm = Math.round((totalChars / 5) / elapsed);
  const finalAcc = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;
  const stars = finalAcc >= 95 ? 3 : finalAcc >= 80 ? 2 : 1;

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-xl mx-auto px-4">
      <div className="text-6xl animate-bounce">🎉</div>
      <h2 className="text-3xl font-extrabold text-center">
        {'⭐'.repeat(stars)}
      </h2>
      <h3 className="text-xl font-extrabold">You finished!</h3>

      {/* Stats */}
      <div className="flex gap-3 w-full justify-center">
        {[
          { label: 'Score', value: score, accent: '#FBBF24' },
          { label: 'WPM',   value: finalWpm, accent: '#48DBFB' },
          { label: 'Accuracy', value: `${finalAcc}%`, accent: '#A29BFE' },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex-1 rounded-2xl border-[3px] border-ink p-3 text-center"
            style={{ background: stat.accent + '30', borderBottomWidth: 6, borderRightWidth: 5 }}
          >
            <div className="text-2xl font-extrabold">{stat.value}</div>
            <div className="text-[10px] text-ink/55 font-bold uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div
        className="rounded-2xl border-[3px] border-ink px-4 py-3 text-sm text-center"
        style={{ background: '#FFF9C4', borderBottomWidth: 5, borderRightWidth: 4 }}
      >
        {finalAcc >= 95
          ? '🏆 Amazing accuracy! You kept your fingers on home row perfectly!'
          : finalAcc >= 80
          ? '👍 Great job! Remember: eyes on screen, fingers on home row!'
          : '💡 Tip: Start slow and focus on the right finger for each key!'}
      </div>

      {/* Leaderboard */}
      <div
        className="w-full rounded-2xl border-[3px] border-ink p-4"
        style={{ background: '#1a1a2e', borderBottomWidth: 6, borderRightWidth: 5 }}
      >
        <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-1">
          🏆 Top Typists — Type with Casey
        </div>
        {user ? (
          <p className="text-xs font-bold mb-2" style={{ color: saving ? '#9ca3af' : saved ? '#4ade80' : 'transparent' }}>
            {saving ? 'Saving score…' : '✓ Score saved to leaderboard'}
          </p>
        ) : (
          <button
            onClick={() => openAuthModal('sign-up')}
            className="text-xs font-bold text-yellow-400 underline hover:text-yellow-300 mb-2 block"
          >
            🏆 Sign in to save your score
          </button>
        )}
        <Leaderboard gameSlug="type-with-casey" limit={5} theme="dark" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => startGame(level)}
          className="rounded-full border-[3px] border-ink px-6 py-2.5 font-extrabold text-sm transition-all hover:scale-105 active:scale-95"
          style={{ background: levelData.accent, borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          Play Again 🔄
        </button>
        {level < 3 && (
          <button
            onClick={() => startGame((level + 1) as Level)}
            className="rounded-full border-[3px] border-ink px-6 py-2.5 font-extrabold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: LEVELS[(level + 1) as Level].accent, borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Next Level ⬆️
          </button>
        )}
        <button
          onClick={() => setScreen('intro')}
          className="rounded-full border-[3px] border-ink px-6 py-2.5 font-extrabold text-sm transition-all hover:scale-105 active:scale-95"
          style={{ background: '#F3F4F6', borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          Level Select
        </button>
      </div>
    </div>
  );
}
