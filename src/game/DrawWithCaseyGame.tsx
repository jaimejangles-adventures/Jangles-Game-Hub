import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { WORDS, GHOST_PATHS } from '@/game/draw-casey/data';
import type { Word, PathStroke } from '@/game/draw-casey/data';
import { useChalkCanvas } from '@/hooks/useChalkCanvas';
import { cn } from '@/lib/utils';
import { asset } from "@/lib/asset";
import { useAuth } from '@/lib/auth-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Link } from '@tanstack/react-router';

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

const BOLD_COLORS = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#ff0000', label: 'Red' },
  { hex: '#0057ff', label: 'Blue' },
  { hex: '#00b800', label: 'Green' },
  { hex: '#ffe000', label: 'Yellow' },
  { hex: '#ff7700', label: 'Orange' },
  { hex: '#9400d3', label: 'Purple' },
  { hex: '#ff1cce', label: 'Pink' },
  { hex: '#00c8c8', label: 'Cyan' },
  { hex: '#1a1a1a', label: 'Black' },
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
function IntroScreen({
  onStart,
  onCustomDraw,
}: {
  onStart: (name: string, traceMode: boolean) => void;
  onCustomDraw: (name: string) => void;
}) {
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
        src={asset("/characters/map-casey.png")}
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
          description="Type any object & draw it!"
          badge="Ages 4+"
          accent="#e87fa3"
          onClick={() => onCustomDraw(name.trim() || 'Friend')}
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

      {/* ── Gallery link ── */}
      <Link
        to="/casey-gallery"
        className="text-xs font-semibold text-ink/40 underline underline-offset-2 hover:text-ink/60"
      >
        🖼️ View Best Of Gallery
      </Link>
    </motion.div>
  );
}

// ── Custom object input screen ────────────────────────────────────
function CustomInputScreen({
  playerName,
  onStart,
  onBack,
}: {
  playerName: string;
  onStart: (objectName: string) => void;
  onBack: () => void;
}) {
  const [objectName, setObjectName] = useState('');

  const handleSubmit = () => {
    const trimmed = objectName.trim();
    if (!trimmed) return;
    onStart(trimmed);
  };

  const handleRandom = () => {
    const pick = WORDS[Math.floor(Math.random() * WORDS.length)];
    onStart(pick.word);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full w-full flex-col items-center justify-evenly px-5 py-3"
      style={{ maxWidth: 480, margin: '0 auto' }}
    >
      {/* ── Casey image ── */}
      <motion.img
        src={asset("/characters/map-casey.png")}
        alt="Casey Bea Jangles"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
        className="w-32 sm:w-40"
        style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.10))' }}
      />

      {/* ── Casey bubble ── */}
      <CaseyBubble text={`Ooh, ${playerName}! What do you want to draw today? Type it in — or let me surprise you! 🖊️`} />

      {/* ── Object input ── */}
      <div className="flex w-full flex-col items-center gap-3">
        <label className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-ink/40">
          What are you drawing?
        </label>
        <input
          type="text"
          maxLength={30}
          placeholder="e.g. dragon, rocket, pizza…"
          value={objectName}
          autoFocus
          onChange={e => setObjectName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          className="w-full max-w-xs rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-center text-lg font-bold text-ink outline-none transition-colors focus:border-[#e87fa3]"
          style={{ borderBottomWidth: 4 }}
        />
        <div className="flex items-center gap-3">
          <PillBtn
            onClick={handleSubmit}
            accent={objectName.trim() ? '#e87fa3' : '#ccc'}
            size="lg"
            className={objectName.trim() ? '' : 'pointer-events-none'}
          >
            Let's draw it! 🎨
          </PillBtn>
          <PillBtn onClick={handleRandom} accent="#f5c842" dark size="lg">
            🎲 Surprise me!
          </PillBtn>
        </div>
      </div>

      {/* ── Back link ── */}
      <button
        onClick={onBack}
        className="text-xs font-semibold text-ink/40 underline underline-offset-2 hover:text-ink/60"
      >
        ← back to menu
      </button>
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
  customMode,
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
  customMode: boolean;
}) {
  const { drawRef, tool, setTool, brushSize, setBrushSize, color, setColor, clearCanvas, undo, canUndo } = canvas;
  const hasTrace = !!GHOST_PATHS[word.word];
  const [palette, setPalette] = useState<'pastel' | 'bold'>('pastel');
  const activeColors = palette === 'pastel' ? CHALK_COLORS : BOLD_COLORS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full flex-col gap-1.5 px-2 py-2"
    >
      {/* ── Header: word + actions ── */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{word.emoji}</span>
          <div>
            <div className="text-[8px] font-extrabold uppercase tracking-widest text-ink/35">Draw this!</div>
            <div className="text-lg font-extrabold leading-tight text-ink">{word.word}</div>
          </div>
          {stamps.length > 0 && (
            <div className="rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-extrabold text-ink"
              style={{ background: '#f5c842' }}>
              ⭐ {stamps.length}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <PillBtn onClick={onPrint} accent="#fff" dark size="sm">🖨️</PillBtn>
          <PillBtn onClick={onDone} accent="#f5c842" dark size="sm">Done! 🎉</PillBtn>
          <PillBtn onClick={onSkip} accent="#e87fa3" size="sm">
            {customMode ? 'New 🔀' : 'Skip 🔀'}
          </PillBtn>
        </div>
      </div>

      {/* ── Chalkboard — grows to fill remaining space ── */}
      <div
        className="relative min-h-0 flex-1 w-full"
        style={{
          background: '#1c3d1e',
          border: '8px solid #5c3a1e',
          borderTop: '11px solid #6b4a28',
          borderRadius: 6,
          boxShadow: '0 0 0 2px #3a2210, 0 6px 20px rgba(0,0,0,0.2), inset 0 0 40px rgba(0,0,0,0.3)',
        }}
      >
        <canvas
          ref={traceRef}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
            opacity: traceVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
        <canvas
          ref={drawRef}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
            touchAction: 'none',
          }}
        />
      </div>

      {/* ── Tools row ── */}
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5">
        {([
          { id: 'brush',  label: '🖌️ Chalk',  active: '#4ecdc4' },
          { id: 'pencil', label: '✏️ Pencil', active: '#74b9ff' },
          { id: 'spray',  label: '🎨 Spray',  active: '#c39bd3' },
          { id: 'eraser', label: '🧹 Erase',  active: '#e87fa3' },
        ] as const).map(({ id, label, active }) => (
          <button key={id} onClick={() => setTool(id)}
            className="rounded-full border-[2px] border-ink px-2.5 py-1 text-[11px] font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: tool === id ? active : '#fff', color: tool === id ? '#fff' : '#1a1a1a', borderBottomWidth: 3 }}
          >{label}</button>
        ))}

        <div className="mx-1 h-4 w-px bg-ink/20" />

        {/* Size dots */}
        {([8, 16, 28] as const).map(s => (
          <button key={s} onClick={() => setBrushSize(s)} title={`Size ${s}`}
            className="flex items-center justify-center rounded-full border-[2px] border-ink transition-transform hover:-translate-y-0.5"
            style={{ width: 28, height: 28, background: brushSize === s ? '#f5c842' : '#fff', borderBottomWidth: 3 }}
          >
            <span style={{ display: 'block', width: s === 8 ? 5 : s === 16 ? 9 : 14, height: s === 8 ? 5 : s === 16 ? 9 : 14, borderRadius: '50%', background: '#1a1a1a' }} />
          </button>
        ))}

        <div className="mx-1 h-4 w-px bg-ink/20" />

        <button onClick={undo} disabled={!canUndo}
          className="rounded-full border-[2px] border-ink bg-white px-2.5 py-1 text-[11px] font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:pointer-events-none"
          style={{ borderBottomWidth: 3 }}>↩ Undo</button>

        <button onClick={clearCanvas}
          className="rounded-full border-[2px] border-ink bg-white px-2.5 py-1 text-[11px] font-extrabold text-ink transition-transform hover:-translate-y-0.5"
          style={{ borderBottomWidth: 3 }}>🗑️ Clear</button>

        {hasTrace && (
          <button onClick={onToggleTrace}
            className="rounded-full border-[2px] border-ink px-2.5 py-1 text-[11px] font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: traceVisible ? '#a8d8a8' : '#fff', borderBottomWidth: 3 }}>
            {traceVisible ? '✖ Trace' : '👁 Trace'}
          </button>
        )}
      </div>

      {/* ── Colour palette ── */}
      <div className="flex shrink-0 items-center justify-center gap-2">
        {/* Pastel / Bold toggle */}
        <div className="flex overflow-hidden rounded-full border-[2px] border-ink" style={{ borderBottomWidth: 3 }}>
          {(['pastel', 'bold'] as const).map(p => (
            <button key={p} onClick={() => setPalette(p)}
              className="px-3 py-0.5 text-[10px] font-extrabold transition-colors"
              style={{ background: palette === p ? '#f5c842' : '#fff', color: '#1a1a1a' }}>
              {p === 'pastel' ? '🌸' : '🎨'}
            </button>
          ))}
        </div>
        {/* Swatches */}
        {activeColors.map(({ hex, label }) => (
          <button key={hex} title={label} onClick={() => setColor(hex)}
            className="rounded-full border-[2px] transition-all hover:scale-110"
            style={{
              width: 24, height: 24,
              background: hex,
              borderColor: color === hex ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
              transform: color === hex ? 'scale(1.3)' : undefined,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Pass screen ───────────────────────────────────────────────────
function PassScreen({
  word,
  playerName,
  onNext,
  onSaveToGallery,
  isLoggedIn,
  onSignIn,
}: {
  word: Word;
  playerName: string;
  onNext: () => void;
  onSaveToGallery?: () => Promise<{ success: boolean }>;
  isLoggedIn: boolean;
  onSignIn: () => void;
}) {
  const line = word.caseyPass[Math.floor(Math.random() * word.caseyPass.length)];
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    if (!onSaveToGallery) return;
    setSaveState('saving');
    const result = await onSaveToGallery();
    setSaveState(result.success ? 'saved' : 'error');
  };

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
          src={asset("/characters/map-casey.png")}
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

      {/* ── Gallery save area ── */}
      {isSupabaseConfigured && (
        <div className="flex flex-col items-center gap-2">
          {!isLoggedIn ? (
            <button
              onClick={onSignIn}
              className="text-sm font-semibold text-ink/50 underline underline-offset-2 hover:text-ink/70"
            >
              Sign in to save to the Best Of gallery 🖼️
            </button>
          ) : saveState === 'saved' ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-extrabold text-[#4ecdc4]">Saved to gallery! 🎉</span>
              <Link
                to="/casey-gallery"
                className="text-xs font-semibold text-ink/50 underline underline-offset-2 hover:text-ink/70"
              >
                View Best Of →
              </Link>
            </div>
          ) : saveState === 'error' ? (
            <span className="text-sm font-semibold text-red-500">Couldn't save — try again?</span>
          ) : (
            <PillBtn
              onClick={handleSave}
              accent="#e87fa3"
              size="sm"
              className={saveState === 'saving' ? 'pointer-events-none opacity-60' : ''}
            >
              {saveState === 'saving' ? 'Saving…' : 'Save to Best Of 🖼️'}
            </PillBtn>
          )}
        </div>
      )}

      <PillBtn onClick={onNext} accent="#4ecdc4" size="lg">
        Draw Another! 🎨
      </PillBtn>
    </motion.div>
  );
}

// ── Build a synthetic Word from a user-typed object name ─────────
function makeCustomWord(objectName: string): Word {
  const name = objectName.trim() || 'something';
  return {
    word: name,
    emoji: '🎨',
    caseyIntro: `Yes! Let's draw a ${name}! Your chalkboard is ready — go for it! 🖊️`,
    caseyPass: [
      `WOW! Look at that amazing ${name}! You are so talented!`,
      `A ${name}! I love it! You drew that all by yourself!`,
      `That's the best ${name} I've ever seen! You're a real artist!`,
    ],
    caseyHint: `Keep going! Your ${name} is looking great!`,
    hint: `Free draw: ${name}`,
  };
}

// ── Resize + upload a drawing to Supabase Storage ─────────────────
async function uploadDrawing(
  dataUrl: string,
  userId: string,
): Promise<string | null> {
  // Downscale to max 640px wide before uploading
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = dataUrl;
  });
  const maxW = 640;
  const scale = img.width > maxW ? maxW / img.width : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const tc = tmp.getContext('2d')!;
  tc.drawImage(img, 0, 0, w, h);

  const blob: Blob = await new Promise(res =>
    tmp.toBlob(b => res(b!), 'image/jpeg', 0.82),
  );

  const filename = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('casey-gallery')
    .upload(filename, blob, { contentType: 'image/jpeg' });
  if (error) {
    console.error('[casey-gallery] storage upload failed:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('casey-gallery')
    .getPublicUrl(filename);
  return publicUrl;
}

// ── Main orchestrator ─────────────────────────────────────────────
type Phase = 'intro' | 'custom-input' | 'drawing' | 'pass';

export function DrawWithCaseyGame({ onComplete }: { onComplete?: () => void } = {}) {
  const { user, openAuthModal } = useAuth();

  const [phase, setPhase]           = useState<Phase>('intro');
  const [playerName, setPlayerName] = useState('Friend');
  const [traceMode, setTraceMode]   = useState(false);   // true = Trace It mode
  const [customMode, setCustomMode] = useState(false);   // true = user typed their own object
  const [wordOrder, setWordOrder]   = useState<Word[]>([]);
  const [wordIdx, setWordIdx]       = useState(0);
  const [stamps, setStamps]         = useState<Word[]>([]);
  const [caseyText, setCaseyText]   = useState('');
  const [traceVisible, setTraceVisible] = useState(false);
  // Snapshot of the drawing captured just before the canvas unmounts
  const [pendingImageUrl, setPendingImageUrl] = useState<string>('');

  const canvas = useChalkCanvas();

  // Callback ref for the trace canvas — fires when the canvas element mounts
  // or unmounts. Using state (not useRef) so the draw-trace effect re-runs
  // automatically whenever the canvas re-mounts after a phase transition.
  const [traceEl, setTraceEl] = useState<HTMLCanvasElement | null>(null);
  const traceRef = useCallback((el: HTMLCanvasElement | null) => setTraceEl(el), []);

  const currentWord = wordOrder[wordIdx % Math.max(wordOrder.length, 1)];

  // ── Start (traced/guided mode) ────────────────────────────────
  const handleStart = useCallback((name: string, trace: boolean) => {
    setPlayerName(name);
    setTraceMode(trace);
    setCustomMode(false);
    setWordOrder(shuffle(WORDS));
    setWordIdx(0);
    setStamps([]);
    setPhase('drawing');
  }, []);

  // ── Custom draw — go to the input screen ──────────────────────
  const handleCustomDraw = useCallback((name: string) => {
    setPlayerName(name);
    setPhase('custom-input');
  }, []);

  // ── Custom start — user submitted their object name ───────────
  const handleCustomStart = useCallback((objectName: string) => {
    setTraceMode(false);
    setCustomMode(true);
    setWordOrder([makeCustomWord(objectName)]);
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
    // Snapshot the drawing NOW — before the canvas unmounts on phase change
    setPendingImageUrl(canvas.getImageDataUrl());
    setStamps(prev => [...prev, currentWord]);
    setPhase('pass');
    onComplete?.();
    burstCorrect();
    setTimeout(burstFinale, 300);
  }, [currentWord, canvas]);

  // ── Skip ─────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (customMode) { setPhase('custom-input'); return; }
    setWordIdx(i => i + 1);
  }, [customMode]);

  // ── Next (from pass screen) ───────────────────────────────────
  const handleNext = useCallback(() => {
    if (customMode) { setPhase('custom-input'); return; }
    setWordIdx(i => i + 1);
    setPhase('drawing');
  }, [customMode]);

  // ── Toggle trace ──────────────────────────────────────────────
  const handleToggleTrace = useCallback(() => {
    setTraceVisible(v => !v);
  }, []);

  // ── Save to gallery ───────────────────────────────────────────
  const handleSaveToGallery = useCallback(async (): Promise<{ success: boolean }> => {
    if (!user || !currentWord || !isSupabaseConfigured) {
      console.error('[casey-gallery] blocked: user=%o word=%o configured=%o', user, currentWord, isSupabaseConfigured);
      return { success: false };
    }
    if (!pendingImageUrl) {
      console.error('[casey-gallery] no image snapshot available');
      return { success: false };
    }
    const imageUrl = await uploadDrawing(pendingImageUrl, user.id);
    if (!imageUrl) return { success: false };
    const { error } = await supabase.from('casey_gallery').insert({
      user_id: user.id,
      image_url: imageUrl,
      word: currentWord.word,
      emoji: currentWord.emoji,
    });
    if (error) console.error('[casey-gallery] insert failed:', error);
    return { success: !error };
  }, [user, currentWord, pendingImageUrl]);

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
            <IntroScreen onStart={handleStart} onCustomDraw={handleCustomDraw} />
          </motion.div>
        )}

        {phase === 'custom-input' && (
          <motion.div key="custom-input" className="h-full w-full">
            <CustomInputScreen
              playerName={playerName}
              onStart={handleCustomStart}
              onBack={() => setPhase('intro')}
            />
          </motion.div>
        )}

        {phase === 'drawing' && currentWord && (
          <motion.div key={`drawing-${wordIdx}`} className="flex h-full w-full flex-col">
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
              customMode={customMode}
            />
          </motion.div>
        )}

        {phase === 'pass' && currentWord && (
          <motion.div key={`pass-${wordIdx}`} className="w-full overflow-y-auto">
            <PassScreen
              word={currentWord}
              playerName={playerName}
              onNext={handleNext}
              onSaveToGallery={handleSaveToGallery}
              isLoggedIn={!!user}
              onSignIn={() => openAuthModal('sign-in')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
