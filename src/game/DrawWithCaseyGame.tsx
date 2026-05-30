import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { WORDS, GHOST_PATHS } from '@/game/draw-casey/data';
import type { Word, PathStroke } from '@/game/draw-casey/data';
import { useChalkCanvas } from '@/hooks/useChalkCanvas';
import { cn } from '@/lib/utils';

// ── Chalk palette ────────────────────────────────────────────────
const CHALK_COLORS = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#f5c842', label: 'Yellow' },
  { hex: '#e87fa3', label: 'Pink' },
  { hex: '#4ecdc4', label: 'Teal' },
  { hex: '#74b9ff', label: 'Sky Blue' },
  { hex: '#a8d8a8', label: 'Mint' },
  { hex: '#f4a261', label: 'Orange' },
  { hex: '#c39bd3', label: 'Lavender' },
  { hex: '#ff8b94', label: 'Coral' },
  { hex: '#ffd166', label: 'Butter' },
];

// ── Trace outline renderer ────────────────────────────────────────

// Geometric/angular shapes that should keep sharp corners.
// Everything else gets smooth quadratic curves through the vertices.
const STRAIGHT_LINE_WORDS = new Set(['star', 'drum', 'sandcastle', 'trombone', 'boat']);

function drawTraceOutline(canvas: HTMLCanvasElement, word: string) {
  const strokes: PathStroke[] | undefined = GHOST_PATHS[word];

  const rect = canvas.getBoundingClientRect();
  const W = Math.round(rect.width)  || 640;
  const H = Math.round(rect.height) || 480;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  if (!strokes || strokes.length === 0) return;

  const smooth = !STRAIGHT_LINE_WORDS.has(word);

  // ── Pass 1: soft wide solid outline for depth/readability ──
  ctx.save();
  ctx.strokeStyle = 'rgba(78, 205, 196, 0.18)';
  ctx.lineWidth   = 18;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.setLineDash([]);
  for (const stroke of strokes) {
    ctx.beginPath();
    _drawStroke(ctx, stroke, W, H, smooth);
    ctx.stroke();
  }
  ctx.restore();

  // ── Pass 2: crisp dashed outline ──
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.lineWidth   = 3.5;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.setLineDash([13, 11]);
  ctx.shadowColor = 'rgba(180, 240, 255, 0.7)';
  ctx.shadowBlur  = 6;
  for (const stroke of strokes) {
    ctx.beginPath();
    _drawStroke(ctx, stroke, W, H, smooth);
    ctx.stroke();
  }
  ctx.restore();
}

/** Draw a single stroke — either a circle or a point path (smoothed or straight). */
function _drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: PathStroke,
  W: number,
  H: number,
  smooth: boolean,
) {
  if (stroke[0] === 'circle') {
    const [, cx, cy, r] = stroke as ['circle', number, number, number];
    ctx.arc(cx * W, cy * H, r * Math.min(W, H), 0, Math.PI * 2);
    return;
  }
  const pts = stroke as [number, number][];
  if (pts.length < 2) return;
  if (smooth && pts.length >= 3) {
    _smoothPath(ctx, pts, W, H);
  } else {
    ctx.moveTo(pts[0][0] * W, pts[0][1] * H);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * W, pts[i][1] * H);
  }
}

/**
 * Draw a smooth curve through the points using the classic midpoint-quadratic
 * technique. For closed paths (first ≈ last point) the join is also smoothed.
 */
function _smoothPath(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  W: number,
  H: number,
) {
  const closed =
    pts.length >= 4 &&
    Math.abs(pts[0][0] - pts[pts.length - 1][0]) < 0.015 &&
    Math.abs(pts[0][1] - pts[pts.length - 1][1]) < 0.015;

  const p = closed ? pts.slice(0, -1) : pts;
  const n = p.length;

  if (closed && n >= 3) {
    // Start at the midpoint of the first edge so every corner is curved
    ctx.moveTo((p[0][0] + p[1][0]) / 2 * W, (p[0][1] + p[1][1]) / 2 * H);
    for (let i = 0; i < n; i++) {
      const cp = p[(i + 1) % n];               // control point = the actual vertex
      const ep = p[(i + 2) % n];               // arrive at mid of next edge
      ctx.quadraticCurveTo(
        cp[0] * W, cp[1] * H,
        (cp[0] + ep[0]) / 2 * W,
        (cp[1] + ep[1]) / 2 * H,
      );
    }
    ctx.closePath();
  } else {
    // Open path: anchor first & last points, smooth the interior
    ctx.moveTo(p[0][0] * W, p[0][1] * H);
    for (let i = 0; i < n - 2; i++) {
      const cp = p[i + 1];
      const ep = p[i + 2];
      ctx.quadraticCurveTo(
        cp[0] * W, cp[1] * H,
        (cp[0] + ep[0]) / 2 * W,
        (cp[1] + ep[1]) / 2 * H,
      );
    }
    ctx.lineTo(p[n - 1][0] * W, p[n - 1][1] * H);
  }
}

// ── Portal-style pill button ──────────────────────────────────────
function PillBtn({
  children,
  onClick,
  accent = '#4ecdc4',
  dark = false,
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  accent?: string;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const px =
    size === 'sm' ? 'px-3 py-1.5 text-xs' :
    size === 'lg' ? 'px-7 py-3 text-base' :
                    'px-4 py-2 text-sm';
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border-[3px] border-ink font-extrabold transition-transform hover:-translate-y-0.5 active:translate-y-0.5 select-none',
        px,
        className,
      )}
      style={{
        background: accent,
        color: dark ? '#1a1a1a' : '#fff',
        borderBottomWidth: 5,
        borderRightWidth: 4,
      }}
    >
      {children}
    </button>
  );
}

// ── Casey speech bubble ───────────────────────────────────────────
function CaseyBubble({ text }: { text: string }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-2xl border-[3px] border-[#4ecdc4] bg-[#4ecdc4]/10 px-4 py-3"
    >
      <div className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#4ecdc4]">
        ✨ Casey Bea Jangles
      </div>
      <p className="text-sm font-semibold leading-snug text-ink sm:text-base">{text}</p>
    </motion.div>
  );
}

// ── Stamp badge ───────────────────────────────────────────────────
function Stamp({ emoji, word }: { emoji: string; word: string }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: (Math.random() - 0.5) * 10 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="flex flex-col items-center justify-center rounded-xl border-[3px] border-ink p-1.5"
      style={{ width: 54, height: 54, background: '#f5c842', boxShadow: '0 4px 0 #7a5e00' }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{emoji}</span>
      <span className="mt-0.5 text-[7px] font-extrabold uppercase leading-tight text-ink/70">
        {word}
      </span>
    </motion.div>
  );
}

// ── Shuffle ───────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Mode selection card ───────────────────────────────────────────
function ModeCard({
  emoji,
  title,
  description,
  badge,
  accent,
  onClick,
}: {
  emoji: string;
  title: string;
  description: string;
  badge: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-[3px] border-ink bg-white px-3 py-4 text-center"
      style={{ borderBottomWidth: 5, borderRightWidth: 4, cursor: 'pointer' }}
    >
      <span className="text-4xl leading-none">{emoji}</span>
      <div>
        <div className="text-sm font-extrabold leading-tight text-ink">{title}</div>
        <div className="mt-0.5 text-[11px] font-medium leading-snug text-ink/55">{description}</div>
      </div>
      <div
        className="mt-auto rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white"
        style={{ background: accent }}
      >
        {badge}
      </div>
    </motion.button>
  );
}

// ── Intro screen — fits in one viewport, no scroll ────────────────
function IntroScreen({ onStart }: { onStart: (name: string, traceMode: boolean) => void }) {
  const [name, setName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full w-full flex-col items-center justify-evenly px-5 py-3"
      style={{ maxWidth: 480, margin: '0 auto' }}
    >
      {/* ── Title — above the image ── */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Draw with{' '}
          <span style={{ color: '#4ecdc4', textShadow: '2px 2px 0 rgba(78,205,196,0.25)' }}>
            Casey!
          </span>
        </h1>
        <p className="mt-0.5 text-xs font-medium text-ink/45">
          Chalk drawing adventures for little explorers 🌍
        </p>
      </div>

      {/* ── Casey image ── */}
      <motion.img
        src="/characters/map-casey.png"
        alt="Casey Bea Jangles"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
        className="w-36 sm:w-44"
        style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.10))' }}
      />

      {/* ── Casey bubble ── */}
      <CaseyBubble text="Hi! I'm Casey Bea! Pick how you want to draw, then let's go! 🎨" />

      {/* ── Name input ── */}
      <div className="flex w-full flex-col items-center gap-1.5">
        <label className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-ink/40">
          What's your name? (optional)
        </label>
        <input
          type="text"
          maxLength={20}
          placeholder="Type your name…"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full max-w-xs rounded-xl border-[3px] border-ink bg-white px-4 py-2 text-center text-base font-bold text-ink outline-none transition-colors focus:border-[#4ecdc4]"
          style={{ borderBottomWidth: 4 }}
        />
      </div>

      {/* ── Mode cards ── */}
      <div className="flex w-full gap-3">
        <ModeCard
          emoji="🎨"
          title="Draw Your Own"
          description="Blank board, total freedom!"
          badge="Ages 4+"
          accent="#e87fa3"
          onClick={() => onStart(name.trim() || 'Friend', false)}
        />
        <ModeCard
          emoji="✏️"
          title="Trace It!"
          description="Follow the dotted lines!"
          badge="Ages 2+"
          accent="#4ecdc4"
          onClick={() => onStart(name.trim() || 'Friend', true)}
        />
      </div>
    </motion.div>
  );
}

// ── Game screen ───────────────────────────────────────────────────
function GameScreen({
  playerName,
  word,
  stamps,
  caseyText,
  traceRef,
  traceVisible,
  onToggleTrace,
  onDone,
  onSkip,
  onPrint,
  canvas,
}: {
  playerName: string;
  word: Word;
  stamps: Word[];
  caseyText: string;
  traceRef: React.RefCallback<HTMLCanvasElement>;
  traceVisible: boolean;
  onToggleTrace: () => void;
  onDone: () => void;
  onSkip: () => void;
  onPrint: () => void;
  canvas: ReturnType<typeof useChalkCanvas>;
}) {
  const { drawRef, tool, setTool, brushSize, setBrushSize, color, setColor, clearCanvas } = canvas;
  const hasTrace = !!GHOST_PATHS[word.word];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 py-3 sm:px-5"
    >
      {/* ── Word header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img
            src="/characters/map-casey.png"
            alt=""
            aria-hidden
            className="h-14 w-auto shrink-0"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
          />
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-ink/40">
              Draw this!
            </div>
            <div className="flex items-center gap-2 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              <span>{word.emoji}</span>
              <span>{word.word}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stamps.length > 0 && (
            <div
              className="rounded-full border-[3px] border-ink px-3 py-1 text-xs font-extrabold text-ink"
              style={{ background: '#f5c842', borderBottomWidth: 4 }}
            >
              ⭐ {stamps.length} stamp{stamps.length !== 1 ? 's' : ''}
            </div>
          )}
          <PillBtn onClick={onPrint} accent="#fff" dark size="sm">
            🖨️ Print
          </PillBtn>
        </div>
      </div>

      {/* ── Casey bubble ── */}
      <CaseyBubble text={caseyText} />

      {/* ── Chalkboard ── */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: '4 / 3',
          background: '#1c3d1e',
          border: '10px solid #5c3a1e',
          borderTop: '14px solid #6b4a28',
          borderRadius: 6,
          boxShadow:
            '0 0 0 3px #3a2210, 0 10px 30px rgba(0,0,0,0.2), inset 0 0 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Trace canvas — dashed outlines behind drawing */}
        <canvas
          ref={traceRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: traceVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
        {/* Drawing canvas — where kids draw (transparent bg, on top) */}
        <canvas
          ref={drawRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
            touchAction: 'none',
          }}
        />
      </div>

      {/* ── Tool row ── */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Brush / Eraser */}
        {(['brush', 'eraser'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className="rounded-full border-[3px] border-ink px-3 py-1.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              background: tool === t ? (t === 'brush' ? '#4ecdc4' : '#e87fa3') : '#fff',
              color: tool === t ? '#fff' : '#1a1a1a',
              borderBottomWidth: 4,
              borderRightWidth: 3,
            }}
          >
            {t === 'brush' ? '✏️ Chalk' : '🧹 Erase'}
          </button>
        ))}

        {/* Size dots */}
        {([8, 16, 28] as const).map(s => (
          <button
            key={s}
            onClick={() => { setBrushSize(s); setTool('brush'); }}
            title={`Size ${s}`}
            className="flex items-center justify-center rounded-full border-[3px] border-ink transition-transform hover:-translate-y-0.5"
            style={{
              width: 36,
              height: 36,
              background: brushSize === s ? '#f5c842' : '#fff',
              borderBottomWidth: 4,
            }}
          >
            <span
              style={{
                display: 'block',
                width:  s === 8 ? 6 : s === 16 ? 11 : 18,
                height: s === 8 ? 6 : s === 16 ? 11 : 18,
                borderRadius: '50%',
                background: '#1a1a1a',
              }}
            />
          </button>
        ))}

        {/* Clear */}
        <button
          onClick={clearCanvas}
          title="Clear canvas"
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold text-ink transition-transform hover:-translate-y-0.5"
          style={{ borderBottomWidth: 4 }}
        >
          🗑️ Clear
        </button>

        {/* Trace toggle — only shown when trace data exists */}
        {hasTrace && (
          <button
            onClick={onToggleTrace}
            className="rounded-full border-[3px] border-ink px-3 py-1.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              background: traceVisible ? '#a8d8a8' : '#fff',
              color: '#1a1a1a',
              borderBottomWidth: 4,
              borderRightWidth: 3,
            }}
          >
            {traceVisible ? '✖ Remove Trace' : '👁 Show Trace'}
          </button>
        )}
      </div>

      {/* ── Colour palette ── */}
      <div className="flex flex-wrap justify-center gap-2 px-1">
        {CHALK_COLORS.map(({ hex, label }) => (
          <button
            key={hex}
            title={label}
            onClick={() => setColor(hex)}
            className="rounded-full border-[3px] transition-all hover:scale-110"
            style={{
              width: 32,
              height: 32,
              background: hex,
              borderColor: color === hex ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
              transform: color === hex ? 'scale(1.25)' : undefined,
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PillBtn onClick={onDone} accent="#f5c842" dark size="lg">
          I'm done! 🎉
        </PillBtn>
        <PillBtn onClick={onSkip} accent="#e87fa3">
          Different word 🔀
        </PillBtn>
      </div>

      {/* ── Stamp shelf ── */}
      {stamps.length > 0 ? (
        <div
          className="flex flex-wrap justify-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/15 bg-ink/[0.03] px-4 py-3"
          style={{ minHeight: 70 }}
        >
          {stamps.map((s, i) => (
            <Stamp key={`${s.word}-${i}`} emoji={s.emoji} word={s.word} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-2xl border-[3px] border-dashed border-ink/12 px-4 py-4">
          <span className="text-xs font-medium text-ink/30">
            Your sticker stamps will appear here! 🌟
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ── Pass screen ───────────────────────────────────────────────────
function PassScreen({
  word,
  playerName,
  onNext,
}: {
  word: Word;
  playerName: string;
  onNext: () => void;
}) {
  const line = word.caseyPass[Math.floor(Math.random() * word.caseyPass.length)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-5 py-8 sm:py-12"
    >
      <motion.div
        initial={{ scale: 0.6, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        className="text-center text-5xl font-extrabold text-ink sm:text-6xl"
        style={{ textShadow: '4px 4px 0 rgba(245,200,66,0.45)' }}
      >
        ⭐ AMAZING! ⭐
      </motion.div>

      <CaseyBubble text={line} />

      <div className="flex items-end gap-4">
        <motion.img
          src="/characters/map-casey.png"
          alt="Casey Bea"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-32 sm:w-40"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))' }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.2 }}
          style={{ fontSize: 88, lineHeight: 1 }}
        >
          {word.emoji}
        </motion.div>
      </div>

      <p className="text-center text-lg font-extrabold text-ink">
        {playerName} drew a{' '}
        <span style={{ color: '#4ecdc4' }}>{word.word}</span>!
      </p>

      <PillBtn onClick={onNext} accent="#4ecdc4" size="lg">
        Draw Another! 🎨
      </PillBtn>
    </motion.div>
  );
}

// ── Main orchestrator ─────────────────────────────────────────────
type Phase = 'intro' | 'drawing' | 'pass';

export function DrawWithCaseyGame() {
  const [phase, setPhase]           = useState<Phase>('intro');
  const [playerName, setPlayerName] = useState('Friend');
  const [traceMode, setTraceMode]   = useState(false);   // true = Trace It mode
  const [wordOrder, setWordOrder]   = useState<Word[]>([]);
  const [wordIdx, setWordIdx]       = useState(0);
  const [stamps, setStamps]         = useState<Word[]>([]);
  const [caseyText, setCaseyText]   = useState('');
  const [traceVisible, setTraceVisible] = useState(false);

  const canvas = useChalkCanvas();

  // Callback ref for the trace canvas — fires when the canvas element mounts
  // or unmounts. Using state (not useRef) so the draw-trace effect re-runs
  // automatically whenever the canvas re-mounts after a phase transition.
  const [traceEl, setTraceEl] = useState<HTMLCanvasElement | null>(null);
  const traceRef = useCallback((el: HTMLCanvasElement | null) => setTraceEl(el), []);

  const currentWord = wordOrder[wordIdx % Math.max(wordOrder.length, 1)];

  // ── Start ─────────────────────────────────────────────────────
  const handleStart = useCallback((name: string, trace: boolean) => {
    setPlayerName(name);
    setTraceMode(trace);
    setWordOrder(shuffle(WORDS));
    setWordIdx(0);
    setStamps([]);
    setPhase('drawing');
  }, []);

  // ── Set Casey text + reset trace visibility on each new word ──
  useEffect(() => {
    if (phase !== 'drawing' || !currentWord) return;
    setCaseyText(currentWord.caseyIntro);
    setTraceVisible(traceMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, wordIdx]);

  // ── Draw trace outline when the canvas element mounts ─────────
  // Separate from the word-change effect so it fires AFTER AnimatePresence
  // finishes its exit animation and mounts the new GameScreen canvas.
  useEffect(() => {
    if (!traceEl || phase !== 'drawing' || !currentWord) return;
    drawTraceOutline(traceEl, currentWord.word);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceEl, wordIdx, phase]);

  // ── Done ──────────────────────────────────────────────────────
  const handleDone = useCallback(() => {
    if (!currentWord) return;
    setStamps(prev => [...prev, currentWord]);
    setPhase('pass');
    burstCorrect();
    setTimeout(burstFinale, 300);
  }, [currentWord]);

  // ── Skip ─────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    setWordIdx(i => i + 1);
  }, []);

  // ── Next (from pass screen) ───────────────────────────────────
  const handleNext = useCallback(() => {
    setWordIdx(i => i + 1);
    setPhase('drawing');
  }, []);

  // ── Toggle trace ──────────────────────────────────────────────
  const handleToggleTrace = useCallback(() => {
    setTraceVisible(v => !v);
  }, []);

  // ── Print ─────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    if (!currentWord || !canvas.drawEl) return;
    const draw = canvas.drawEl;
    const tmp  = document.createElement('canvas');
    tmp.width  = draw.width;
    tmp.height = draw.height;
    const tc   = tmp.getContext('2d')!;
    tc.fillStyle = '#1c3d1e';
    tc.fillRect(0, 0, tmp.width, tmp.height);
    tc.drawImage(draw, 0, 0);
    const img = tmp.toDataURL('image/png');

    const stampRow =
      stamps.length > 0
        ? `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px;">${stamps.map(s => `<span style="font-size:26px;background:#f5c842;border:3px solid #1a1a1a;border-radius:10px;padding:5px 9px;">${s.emoji}</span>`).join('')}</div>`
        : '';

    const win = window.open('', '_blank')!;
    win.document.write(`<!DOCTYPE html><html><head><title>My Jangles Drawing!</title>
<style>
  body{font-family:'Trebuchet MS',sans-serif;background:#fffbf0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
  .frame{border:6px solid #1a1a1a;border-radius:20px;padding:28px;text-align:center;max-width:640px;width:100%;box-shadow:0 8px 0 #1a1a1a;}
  h1{color:#1a1a1a;font-size:24px;margin:0 0 4px;font-weight:800;}
  .who{font-size:15px;color:#555;margin-bottom:8px;}
  .word{font-size:42px;font-weight:800;margin:8px 0;color:#4ecdc4;}
  img{max-width:100%;border-radius:10px;border:6px solid #1a1a1a;margin:12px 0;display:block;}
  .brand{font-size:11px;color:#aaa;margin-top:12px;}
</style></head><body>
<div class="frame">
  <h1>My Jangles Drawing!</h1>
  <div class="who">by <strong>${playerName}</strong></div>
  <div class="word">${currentWord.emoji} ${currentWord.word}</div>
  <img src="${img}" alt="drawing" />
  ${stampRow}
  <div class="brand">Draw with Casey! · Jaime Jangles · jaimejangles.com</div>
</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }, [currentWord, canvas.drawEl, stamps, playerName]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" className="h-full w-full">
            <IntroScreen onStart={handleStart} />
          </motion.div>
        )}

        {phase === 'drawing' && currentWord && (
          <motion.div key={`drawing-${wordIdx}`} className="w-full overflow-y-auto">
            <GameScreen
              playerName={playerName}
              word={currentWord}
              stamps={stamps}
              caseyText={caseyText}
              traceRef={traceRef}
              traceVisible={traceVisible}
              onToggleTrace={handleToggleTrace}
              onDone={handleDone}
              onSkip={handleSkip}
              onPrint={handlePrint}
              canvas={canvas}
            />
          </motion.div>
        )}

        {phase === 'pass' && currentWord && (
          <motion.div key={`pass-${wordIdx}`} className="w-full overflow-y-auto">
            <PassScreen word={currentWord} playerName={playerName} onNext={handleNext} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
