import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { asset } from '@/lib/asset';
import { useAuth } from '@/lib/auth-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { burstCorrect } from '@/game/confetti';

type FilterDef = {
  id: string;
  label: string;
  emoji: string;
  css: string;
};

const FILTERS: FilterDef[] = [
  { id: 'original', label: 'Original',    emoji: '🖼️', css: '' },
  { id: 'bw',       label: 'Black & White', emoji: '⚫', css: 'grayscale(100%)' },
  { id: 'sepia',    label: 'Sepia',        emoji: '🍂', css: 'sepia(80%) saturate(140%)' },
  { id: 'vintage',  label: 'Vintage',      emoji: '📻', css: 'sepia(35%) contrast(112%) saturate(115%) brightness(102%)' },
  { id: 'invert',   label: 'Invert Magic', emoji: '🌀', css: 'invert(100%)' },
  { id: 'cool',     label: 'Cool Breeze',  emoji: '❄️', css: 'hue-rotate(170deg) saturate(120%)' },
  { id: 'warm',     label: 'Warm Glow',    emoji: '🔥', css: 'hue-rotate(-18deg) saturate(140%) brightness(105%)' },
  { id: 'dreamy',   label: 'Dreamy Blur',  emoji: '💭', css: 'blur(2px) brightness(106%)' },
  { id: 'comic',    label: 'Comic Pop',    emoji: '💥', css: 'contrast(150%) saturate(180%)' },
  { id: 'rainbow',  label: 'Rainbow',      emoji: '🌈', css: 'hue-rotate(90deg) saturate(200%)' },
];

const CHARACTER_PICKS: { file: string; label: string }[] = [
  { file: 'casey-pointing.png', label: 'Casey' },
  { file: 'jeff-8bit.png', label: 'Jeff' },
  { file: 'jaime-8bit.png', label: 'Jaime' },
  { file: 'casey-8bit.png', label: 'Casey 8-bit' },
  { file: 'FOX 3.png', label: 'Foxy' },
  { file: 'FOX 1.png', label: 'Foxy 2' },
  { file: 'air-fante-plane.png', label: 'Air Fante' },
  { file: 'spaceship-jaime-jeff.png', label: 'Spaceship' },
  { file: 'guitar-jaime-jeff.png', label: 'Guitar' },
  { file: 'guitar2-jaime-jeff.png', label: 'Guitar 2' },
  { file: 'horns-jaime-jeff.png', label: 'Horns' },
  { file: 'map-casey.png', label: 'Map' },
];

type CropAspect = 'original' | 'square' | 'portrait' | 'landscape';

const CROP_OPTIONS: { id: CropAspect; label: string; ratio: number | null }[] = [
  { id: 'original', label: 'Full Photo', ratio: null },
  { id: 'square', label: 'Square', ratio: 1 },
  { id: 'portrait', label: 'Portrait', ratio: 3 / 4 },
  { id: 'landscape', label: 'Landscape', ratio: 4 / 3 },
];

const STICKER_EMOJIS = ['🌟', '✨', '🎉', '❤️', '😂', '🔥', '🌈', '🎵', '🦊', '🐘', '🚀', '👑', '🕶️', '🍕', '⚡', '🐾'];

const DOODLE_COLORS = ['#EF4444', '#F97316', '#FBBF24', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#1a1a1a'];
const DOODLE_SIZES: { id: string; label: string; size: number }[] = [
  { id: 'small', label: 'Thin', size: 4 },
  { id: 'medium', label: 'Medium', size: 9 },
  { id: 'large', label: 'Thick', size: 16 },
];

const CAPTION_COLORS = ['#1a1a1a', '#EF4444', '#F97316', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'];

type FrameId = 'none' | 'polaroid' | 'filmstrip' | 'stars' | 'torn';
const FRAMES: { id: FrameId; label: string; emoji: string }[] = [
  { id: 'none', label: 'None', emoji: '🚫' },
  { id: 'polaroid', label: 'Polaroid', emoji: '📷' },
  { id: 'filmstrip', label: 'Filmstrip', emoji: '🎞️' },
  { id: 'stars', label: 'Stars', emoji: '⭐' },
  { id: 'torn', label: 'Torn Paper', emoji: '📄' },
];

// Deterministic jagged edge — shared between the CSS preview clip-path and the canvas export path.
const TORN_POINTS: [number, number][] = (() => {
  const jitter = (i: number) => 0.015 + 0.025 * Math.abs(Math.sin(i * 12.9898) % 1);
  const pts: [number, number][] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) pts.push([i / n, jitter(i)]);
  for (let i = 1; i <= n; i++) pts.push([1 - jitter(i + 50), i / n]);
  for (let i = 1; i <= n; i++) pts.push([1 - i / n, 1 - jitter(i + 100)]);
  for (let i = 1; i < n; i++) pts.push([jitter(i + 150), 1 - i / n]);
  return pts;
})();
const TORN_CLIP_PATH = `polygon(${TORN_POINTS.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(', ')})`;

type ToolTab = 'filters' | 'adjust' | 'transform' | 'stickers' | 'doodle' | 'erase' | 'text' | 'frame';
const TOOL_TABS: { id: ToolTab; label: string; emoji: string }[] = [
  { id: 'filters', label: 'Filters', emoji: '🎨' },
  { id: 'adjust', label: 'Adjust', emoji: '🎚️' },
  { id: 'transform', label: 'Crop', emoji: '🔧' },
  { id: 'stickers', label: 'Stickers', emoji: '🎉' },
  { id: 'doodle', label: 'Doodle', emoji: '✏️' },
  { id: 'erase', label: 'Erase', emoji: '✂️' },
  { id: 'text', label: 'Text', emoji: '💬' },
  { id: 'frame', label: 'Frame', emoji: '🖼️' },
];

type StickerItem = { id: string; emoji: string; x: number; y: number };
type CaptionItem = { id: string; text: string; x: number; y: number; color: string };
type DoodleStroke = { color: string; size: number; points: { x: number; y: number }[] };
type EraseMask = { points: { x: number; y: number }[] };
type PhotoRow = { id: string; image_url: string; created_at: string };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildFilterCss(filterCss: string, brightness: number, contrast: number, saturation: number, warmth: number) {
  const warmPart = warmth === 0 ? '' : `hue-rotate(${(-warmth * 0.6).toFixed(1)}deg) saturate(${100 + Math.abs(warmth) * 0.3}%)`;
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${warmPart} ${filterCss}`.trim();
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ── Shared cover-fit geometry (drag zoom/pan lives here so preview & export always agree) ──
function coverGeometry(boxW: number, boxH: number, effW: number, effH: number, zoom: number, panX: number, panY: number) {
  const coverScale = Math.max(boxW / effW, boxH / effH);
  const totalScale = coverScale * zoom;
  const dispW = effW * totalScale;
  const dispH = effH * totalScale;
  const offsetX = (boxW - dispW) * (panX / 100);
  const offsetY = (boxH - dispH) * (panY / 100);
  return { totalScale, dispW, dispH, offsetX, offsetY };
}

type BaseLayerOpts = {
  iw: number;
  ih: number;
  rotation: number;
  flipH: boolean;
  zoom: number;
  panX: number;
  panY: number;
  filterCss: string;
  eraseMasks: EraseMask[];
  vignette: number;
};

function drawBaseLayer(ctx: CanvasRenderingContext2D, img: HTMLImageElement, boxW: number, boxH: number, opts: BaseLayerOpts) {
  const { iw, ih, rotation, flipH, zoom, panX, panY, filterCss, eraseMasks, vignette } = opts;
  const swapped = rotation === 90 || rotation === 270;
  const effW = swapped ? ih : iw;
  const effH = swapped ? iw : ih;
  const { totalScale, dispW, dispH, offsetX, offsetY } = coverGeometry(boxW, boxH, effW, effH, zoom, panX, panY);

  ctx.clearRect(0, 0, boxW, boxH);
  ctx.save();
  ctx.filter = filterCss;
  ctx.translate(offsetX + dispW / 2, offsetY + dispH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, 1);
  ctx.scale(totalScale, totalScale);
  ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
  ctx.restore();
  ctx.filter = 'none';

  eraseMasks.forEach((mask) => {
    if (mask.points.length < 3) return;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    mask.points.forEach((p, i) => {
      const x = p.x * boxW;
      const y = p.y * boxH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  if (vignette > 0) {
    const grad = ctx.createRadialGradient(boxW / 2, boxH / 2, Math.min(boxW, boxH) * 0.25, boxW / 2, boxH / 2, Math.max(boxW, boxH) * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.75})`);
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, boxW, boxH);
    ctx.restore();
  }
}

function drawMemeBar(ctx: CanvasRenderingContext2D, text: string, y: number, ow: number, fontSize: number) {
  if (!text.trim()) return;
  ctx.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, fontSize * 0.12);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#fff';
  const upper = text.toUpperCase();
  ctx.strokeText(upper, ow / 2, y);
  ctx.fillText(upper, ow / 2, y);
}

function applyFrame(src: HTMLCanvasElement, frame: FrameId): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;

  if (frame === 'polaroid') {
    const pad = Math.round(w * 0.06);
    const bottomExtra = Math.round(w * 0.14);
    const out = document.createElement('canvas');
    out.width = w + pad * 2;
    out.height = h + pad * 2 + bottomExtra;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, pad, pad);
    return out;
  }

  if (frame === 'filmstrip') {
    const bar = Math.round(w * 0.09);
    const out = document.createElement('canvas');
    out.width = w + bar * 2;
    out.height = h;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, bar, 0);
    const holeR = bar * 0.22;
    const gap = holeR * 3.2;
    ctx.fillStyle = '#fffdf7';
    for (let y = gap / 2; y < h; y += gap) {
      ctx.beginPath();
      ctx.arc(bar / 2, y, holeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(out.width - bar / 2, y, holeR, 0, Math.PI * 2);
      ctx.fill();
    }
    return out;
  }

  if (frame === 'stars') {
    const pad = Math.round(w * 0.08);
    const out = document.createElement('canvas');
    out.width = w + pad * 2;
    out.height = h + pad * 2;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#FFF3B0';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = Math.max(3, w * 0.006);
    ctx.strokeRect(pad * 0.4, pad * 0.4, out.width - pad * 0.8, out.height - pad * 0.8);
    ctx.drawImage(src, pad, pad);
    const starSize = pad * 0.6;
    ctx.font = `${starSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const perSide = 4;
    for (let i = 0; i < perSide; i++) {
      const t = (i + 0.5) / perSide;
      ctx.fillText('⭐', t * out.width, pad * 0.4);
      ctx.fillText('⭐', t * out.width, out.height - pad * 0.4);
      ctx.fillText('⭐', pad * 0.4, t * out.height);
      ctx.fillText('⭐', out.width - pad * 0.4, t * out.height);
    }
    return out;
  }

  if (frame === 'torn') {
    const pad = Math.round(w * 0.05);
    const out = document.createElement('canvas');
    out.width = w + pad * 2;
    out.height = h + pad * 2;
    const ctx = out.getContext('2d')!;
    ctx.save();
    ctx.beginPath();
    TORN_POINTS.forEach(([fx, fy], i) => {
      const x = fx * out.width;
      const y = fy * out.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = pad * 0.4;
    ctx.fillStyle = '#fffdf7';
    ctx.fill();
    ctx.restore();
    ctx.drawImage(src, pad, pad);
    return out;
  }

  return src;
}

export function PhotoLabGame() {
  const { user, openAuthModal } = useAuth();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const [filterId, setFilterId] = useState('original');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [warmth, setWarmth] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [cropAspect, setCropAspect] = useState<CropAspect>('original');
  const [zoom, setZoom] = useState(100);
  const [panX, setPanX] = useState(50);
  const [panY, setPanY] = useState(50);

  const [activeTab, setActiveTab] = useState<ToolTab>('filters');

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [captions, setCaptions] = useState<CaptionItem[]>([]);
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [captionColor, setCaptionColor] = useState(CAPTION_COLORS[0]);

  const [memeTop, setMemeTop] = useState('');
  const [memeBottom, setMemeBottom] = useState('');

  const [doodleStrokes, setDoodleStrokes] = useState<DoodleStroke[]>([]);
  const [doodleColor, setDoodleColor] = useState(DOODLE_COLORS[0]);
  const [doodleSize, setDoodleSize] = useState(DOODLE_SIZES[1].size);

  const [eraseMasks, setEraseMasks] = useState<EraseMask[]>([]);

  const [frameId, setFrameId] = useState<FrameId>('none');

  const [compareMode, setCompareMode] = useState(false);
  const [comparePos, setComparePos] = useState(50);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoRow[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeStrokeRef = useRef<DoodleStroke | null>(null);
  const doodleStrokesRef = useRef<DoodleStroke[]>([]);
  const lassoPointsRef = useRef<{ x: number; y: number }[]>([]);
  const panDragRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0];
  const combinedFilterCss = buildFilterCss(filter.css, brightness, contrast, saturation, warmth);
  const cropOption = CROP_OPTIONS.find((c) => c.id === cropAspect) ?? CROP_OPTIONS[0];

  const swapped = rotation === 90 || rotation === 270;
  const effW = naturalSize ? (swapped ? naturalSize.h : naturalSize.w) : 1;
  const effH = naturalSize ? (swapped ? naturalSize.w : naturalSize.h) : 1;
  const targetRatio = cropOption.ratio ?? effW / effH;

  // Fit the frame's box within the available stage width and a fixed max height,
  // always keeping its exact aspect ratio (CSS aspect-ratio + max-height alone can't
  // reconcile both constraints, which is what caused tall photos to get cropped).
  const MAX_BOX_H = 460;
  // Frame decorations add extra width around the photo itself (sprocket columns, matting, etc.) —
  // reserve room for that so the framed result doesn't overflow the stage.
  const FRAME_HORIZONTAL_PADDING: Record<FrameId, number> = {
    none: 0,
    polaroid: 24,
    filmstrip: 64,
    stars: 48,
    torn: 40,
  };
  let boxW: number | undefined;
  let boxH: number | undefined;
  if (naturalSize && stageWidth > 0) {
    boxW = Math.max(50, stageWidth - FRAME_HORIZONTAL_PADDING[frameId]);
    boxH = boxW / targetRatio;
    if (boxH > MAX_BOX_H) {
      boxH = MAX_BOX_H;
      boxW = boxH * targetRatio;
    }
  }

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageSrc]);

  const panEnabled = activeTab === 'transform' && zoom > 100;
  const interactionActive = (activeTab === 'doodle' || activeTab === 'erase' || panEnabled) && !compareMode;

  useEffect(() => {
    doodleStrokesRef.current = doodleStrokes;
  }, [doodleStrokes]);

  const redrawInk = useCallback(() => {
    const canvas = interactionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    doodleStrokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      stroke.points.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, []);

  const redrawLassoPreview = useCallback(() => {
    redrawInk();
    const canvas = interactionCanvasRef.current;
    if (!canvas || lassoPointsRef.current.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    lassoPointsRef.current.forEach((p, i) => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }, [redrawInk]);

  const redrawBase = useCallback(() => {
    const canvas = baseCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBaseLayer(ctx, img, canvas.width, canvas.height, {
      iw: img.naturalWidth,
      ih: img.naturalHeight,
      rotation,
      flipH,
      zoom: zoom / 100,
      panX,
      panY,
      filterCss: combinedFilterCss,
      eraseMasks,
      vignette,
    });
  }, [rotation, flipH, zoom, panX, panY, combinedFilterCss, eraseMasks, vignette]);

  useEffect(() => {
    const el = frameRef.current;
    const base = baseCanvasRef.current;
    const interaction = interactionCanvasRef.current;
    if (!el || !base || !interaction) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      base.width = w;
      base.height = h;
      interaction.width = w;
      interaction.height = h;
      redrawBase();
      redrawInk();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageSrc, redrawBase, redrawInk]);

  useEffect(() => {
    redrawBase();
  }, [redrawBase]);

  useEffect(() => {
    redrawInk();
  }, [doodleStrokes, redrawInk]);

  useEffect(() => {
    if (!saveNotice) return;
    const t = setTimeout(() => setSaveNotice(''), 2500);
    return () => clearTimeout(t);
  }, [saveNotice]);

  function resetEdits() {
    setFilterId('original');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setVignette(0);
    setRotation(0);
    setFlipH(false);
    setCropAspect('original');
    setZoom(100);
    setPanX(50);
    setPanY(50);
    setStickers([]);
    setSelectedStickerId(null);
    setCaptions([]);
    setSelectedCaptionId(null);
    setCaptionDraft('');
    setMemeTop('');
    setMemeBottom('');
    setDoodleStrokes([]);
    setEraseMasks([]);
    setFrameId('none');
    setCompareMode(false);
    setComparePos(50);
  }

  function loadImage(src: string) {
    resetEdits();
    setNaturalSize(null);
    setImageSrc(src);
    setActiveTab('filters');
  }

  function changePhoto() {
    setImageSrc(null);
    setNaturalSize(null);
    resetEdits();
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') loadImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function surpriseMe() {
    const pool = FILTERS.filter((f) => f.id !== 'original');
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setFilterId(pick.id);
    setBrightness(Math.round(90 + Math.random() * 25));
    setContrast(Math.round(95 + Math.random() * 25));
    setSaturation(Math.round(100 + Math.random() * 40));
    setActiveTab('filters');
    burstCorrect();
  }

  function autoEnhance() {
    setBrightness(108);
    setContrast(112);
    setSaturation(118);
    setWarmth(8);
    setVignette(15);
  }

  // ── Stickers ──────────────────────────────────────────────────────────────
  function addSticker(emoji: string) {
    const id = uid();
    setStickers((s) => [...s, { id, emoji, x: 50, y: 50 }]);
    setSelectedStickerId(id);
  }

  function deleteSticker(id: string) {
    setStickers((s) => s.filter((it) => it.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  }

  // ── Captions ──────────────────────────────────────────────────────────────
  function addOrUpdateCaption() {
    const text = captionDraft.trim();
    if (!text) return;
    if (selectedCaptionId) {
      setCaptions((c) => c.map((it) => (it.id === selectedCaptionId ? { ...it, text, color: captionColor } : it)));
    } else {
      const id = uid();
      setCaptions((c) => [...c, { id, text, x: 50, y: 50, color: captionColor }]);
      setSelectedCaptionId(id);
    }
  }

  function deleteCaption(id: string) {
    setCaptions((c) => c.filter((it) => it.id !== id));
    if (selectedCaptionId === id) {
      setSelectedCaptionId(null);
      setCaptionDraft('');
    }
  }

  function selectCaption(id: string) {
    setSelectedCaptionId(id);
    const c = captions.find((it) => it.id === id);
    if (c) {
      setCaptionDraft(c.text);
      setCaptionColor(c.color);
    }
  }

  // ── Drag handling (stickers + captions share the same math) ────────────────
  function handleItemPointerDown(e: React.PointerEvent, kind: 'sticker' | 'caption', id: string) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    if (kind === 'sticker') setSelectedStickerId(id);
    else selectCaption(id);
  }

  function handleItemPointerMove(e: React.PointerEvent, kind: 'sticker' | 'caption', id: string) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 3, 97);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 3, 97);
    if (kind === 'sticker') setStickers((s) => s.map((it) => (it.id === id ? { ...it, x, y } : it)));
    else setCaptions((c) => c.map((it) => (it.id === id ? { ...it, x, y } : it)));
  }

  // ── Interaction canvas: doodle ink, lasso erase, or pan-drag ───────────────
  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = interactionCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }

  function handleInteractionDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!interactionActive) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (activeTab === 'doodle') {
      const p = pointFromEvent(e);
      activeStrokeRef.current = { color: doodleColor, size: doodleSize, points: [p] };
      const canvas = interactionCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      ctx.beginPath();
      ctx.strokeStyle = doodleColor;
      ctx.lineWidth = doodleSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
    } else if (activeTab === 'erase') {
      lassoPointsRef.current = [pointFromEvent(e)];
      redrawLassoPreview();
    } else if (panEnabled) {
      panDragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: panX, startPanY: panY };
    }
  }

  function handleInteractionMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTab === 'doodle') {
      const stroke = activeStrokeRef.current;
      if (!stroke) return;
      const p = pointFromEvent(e);
      stroke.points.push(p);
      const canvas = interactionCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
      ctx.stroke();
    } else if (activeTab === 'erase') {
      if (!lassoPointsRef.current.length) return;
      lassoPointsRef.current.push(pointFromEvent(e));
      redrawLassoPreview();
    } else if (panEnabled && panDragRef.current) {
      const canvas = interactionCanvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const dxPct = ((e.clientX - panDragRef.current.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - panDragRef.current.startY) / rect.height) * 100;
      setPanX(clamp(panDragRef.current.startPanX - dxPct, 0, 100));
      setPanY(clamp(panDragRef.current.startPanY - dyPct, 0, 100));
    }
  }

  function handleInteractionUp() {
    if (activeTab === 'doodle') {
      const stroke = activeStrokeRef.current;
      if (stroke && stroke.points.length > 1) setDoodleStrokes((s) => [...s, stroke]);
      activeStrokeRef.current = null;
    } else if (activeTab === 'erase') {
      const points = lassoPointsRef.current;
      if (points.length > 2) setEraseMasks((m) => [...m, { points }]);
      lassoPointsRef.current = [];
      redrawInk();
    } else {
      panDragRef.current = null;
    }
  }

  // ── Compare slider drag ─────────────────────────────────────────────────
  function handleCompareDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateComparePos(e);
  }
  function updateComparePos(e: React.PointerEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    setComparePos(clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100));
  }

  // ── Export compositing ──────────────────────────────────────────────────
  const buildExportCanvas = useCallback((): HTMLCanvasElement | null => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const sw = rotation === 90 || rotation === 270;
    const eW = sw ? ih : iw;
    const eH = sw ? iw : ih;

    const ratio = cropOption.ratio ?? eW / eH;
    let cw = eW;
    let ch = eH;
    if (eW / eH > ratio) cw = eH * ratio;
    else ch = eW / ratio;

    const MAX_DIM = 1400;
    const scaleOut = Math.min(MAX_DIM / cw, MAX_DIM / ch, 3);
    const ow = Math.max(1, Math.round(cw * scaleOut));
    const oh = Math.max(1, Math.round(ch * scaleOut));

    // Pass 1: base photo (filter + zoom/pan + erase + vignette) at native crop resolution
    const baseFull = document.createElement('canvas');
    baseFull.width = Math.max(1, Math.round(cw));
    baseFull.height = Math.max(1, Math.round(ch));
    const bctx = baseFull.getContext('2d');
    if (!bctx) return null;
    drawBaseLayer(bctx, img, baseFull.width, baseFull.height, {
      iw, ih, rotation, flipH, zoom: zoom / 100, panX, panY, filterCss: combinedFilterCss, eraseMasks, vignette,
    });

    // Pass 2: resize to output resolution
    const out = document.createElement('canvas');
    out.width = ow;
    out.height = oh;
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(baseFull, 0, 0, baseFull.width, baseFull.height, 0, 0, ow, oh);

    doodleStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * (ow / 500);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      stroke.points.forEach((p, i) => {
        const px = p.x * ow;
        const py = p.y * oh;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });

    stickers.forEach((s) => {
      const size = ow * 0.11;
      ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, (s.x / 100) * ow, (s.y / 100) * oh);
    });

    captions.forEach((c) => {
      const fontSize = Math.max(16, ow * 0.055);
      ctx.font = `800 ${fontSize}px "Baloo 2", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textW = ctx.measureText(c.text).width;
      const padX = fontSize * 0.5;
      const padY = fontSize * 0.35;
      const bx = (c.x / 100) * ow;
      const by = (c.y / 100) * oh;
      roundRectPath(ctx, bx - textW / 2 - padX, by - fontSize / 2 - padY, textW + padX * 2, fontSize + padY * 2, fontSize * 0.4);
      ctx.fillStyle = '#fffbf0';
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = Math.max(2, fontSize * 0.06);
      ctx.stroke();
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, bx, by + fontSize * 0.04);
    });

    const memeFontSize = Math.max(20, ow * 0.09);
    drawMemeBar(ctx, memeTop, memeFontSize * 0.75 + oh * 0.02, ow, memeFontSize);
    drawMemeBar(ctx, memeBottom, oh - memeFontSize * 0.75 - oh * 0.02, ow, memeFontSize);

    if (frameId === 'none') return out;
    return applyFrame(out, frameId);
  }, [rotation, flipH, cropOption, combinedFilterCss, doodleStrokes, stickers, captions, memeTop, memeBottom, frameId, zoom, panX, panY, eraseMasks, vignette]);

  const handleDownload = useCallback(() => {
    const out = buildExportCanvas();
    if (!out) return;
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zany-foto-lab.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  }, [buildExportCanvas]);

  const loadGalleryPhotos = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;
    setGalleryLoading(true);
    const { data } = await supabase
      .from('photo_lab_gallery')
      .select('id, image_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(24);
    setGalleryPhotos(data ?? []);
    setGalleryLoading(false);
  }, [user]);

  function openGallery() {
    if (!user) {
      openAuthModal('sign-up');
      return;
    }
    setGalleryOpen(true);
    loadGalleryPhotos();
  }

  const handlePostToGallery = useCallback(() => {
    if (!user) {
      openAuthModal('sign-up');
      return;
    }
    const out = buildExportCanvas();
    if (!out) return;
    setSaving(true);
    out.toBlob(async (blob) => {
      if (!blob) {
        setSaving(false);
        return;
      }
      const filename = `${user.id}/${Date.now()}.png`;
      const { error: upErr } = await supabase.storage
        .from('photo-lab-gallery')
        .upload(filename, blob, { contentType: 'image/png' });
      if (upErr) {
        console.error('[photo-lab] upload failed:', upErr);
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('photo-lab-gallery').getPublicUrl(filename);
      const { error } = await supabase.from('photo_lab_gallery').insert({ user_id: user.id, image_url: publicUrl });
      setSaving(false);
      if (!error) {
        burstCorrect();
        setSaveNotice('Posted to the gallery! 🎉');
        loadGalleryPhotos();
      } else {
        console.error('[photo-lab] insert failed:', error);
      }
    }, 'image/png');
  }, [user, buildExportCanvas, loadGalleryPhotos, openAuthModal]);

  async function deleteSavedPhoto(photo: PhotoRow) {
    const path = photo.image_url.split('/photo-lab-gallery/')[1];
    if (path) await supabase.storage.from('photo-lab-gallery').remove([path]);
    await supabase.from('photo_lab_gallery').delete().eq('id', photo.id);
    setGalleryPhotos((p) => p.filter((x) => x.id !== photo.id));
  }

  const cursor = activeTab === 'doodle' || activeTab === 'erase' ? 'crosshair' : panEnabled ? 'grab' : 'default';

  return (
    <div className="flex flex-col gap-5">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* Header card */}
      <div
        className="rounded-[2rem] border-[3px] border-ink bg-white px-5 py-4 sm:px-7 sm:py-5"
        style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤪</span>
          <div>
            <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">Zany Foto Lab</h1>
            <p className="text-sm font-bold text-ink/55">Pick a picture, get zany with filters, stickers, doodles &amp; more, then post it!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* Canvas / preview */}
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border-[3px] border-ink bg-white p-5"
          style={{ borderBottomWidth: 6, borderRightWidth: 5, minHeight: 380 }}
        >
          {imageSrc ? (
            <>
              <div ref={stageRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <FrameWrap frameId={frameId}>
                <div
                  ref={frameRef}
                  onClick={() => {
                    setSelectedStickerId(null);
                    setSelectedCaptionId(null);
                  }}
                  className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]"
                  style={{
                    borderBottomWidth: 5,
                    borderRightWidth: 4,
                    width: boxW ? `${boxW}px` : '100%',
                    height: boxH ? `${boxH}px` : undefined,
                    aspectRatio: boxW ? undefined : naturalSize ? targetRatio : undefined,
                    maxWidth: '100%',
                    maxHeight: boxW ? undefined : MAX_BOX_H,
                    touchAction: 'none',
                  }}
                >
                  {/* Hidden source image — feeds naturalSize + is the draw source for both canvases */}
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Your photo"
                    crossOrigin="anonymous"
                    onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                    className={compareMode ? 'absolute inset-0 block' : 'hidden'}
                    style={compareMode ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
                  />

                  {/* Base photo layer (filter + zoom/pan + erase + vignette) */}
                  <canvas
                    ref={baseCanvasRef}
                    className="absolute inset-0"
                    style={{
                      width: '100%',
                      height: '100%',
                      clipPath: compareMode ? `inset(0 0 0 ${comparePos}%)` : undefined,
                      visibility: compareMode === false ? 'visible' : 'visible',
                    }}
                  />

                  {/* Doodle ink / lasso / pan interaction layer */}
                  <canvas
                    ref={interactionCanvasRef}
                    className="absolute inset-0"
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: interactionActive ? 'auto' : 'none',
                      touchAction: 'none',
                      cursor,
                      visibility: compareMode ? 'hidden' : 'visible',
                    }}
                    onPointerDown={handleInteractionDown}
                    onPointerMove={handleInteractionMove}
                    onPointerUp={handleInteractionUp}
                  />

                  {/* Stickers */}
                  {!compareMode && stickers.map((s) => (
                    <div
                      key={s.id}
                      onPointerDown={(e) => handleItemPointerDown(e, 'sticker', s.id)}
                      onPointerMove={(e) => handleItemPointerMove(e, 'sticker', s.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute select-none"
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '2.4rem',
                        lineHeight: 1,
                        cursor: activeTab === 'stickers' ? 'grab' : 'default',
                        filter: selectedStickerId === s.id ? 'drop-shadow(0 0 6px rgba(255,215,0,0.9))' : undefined,
                        touchAction: 'none',
                      }}
                    >
                      {s.emoji}
                      {selectedStickerId === s.id && activeTab === 'stickers' && (
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSticker(s.id);
                          }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-[2px] border-ink bg-white text-[0.6rem] font-extrabold"
                          style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Captions */}
                  {!compareMode && captions.map((c) => (
                    <div
                      key={c.id}
                      onPointerDown={(e) => handleItemPointerDown(e, 'caption', c.id)}
                      onPointerMove={(e) => handleItemPointerMove(e, 'caption', c.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute select-none whitespace-nowrap rounded-full border-[2.5px] border-ink px-3 py-1 text-sm font-extrabold"
                      style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: '#fffbf0',
                        color: c.color,
                        borderBottomWidth: 3.5,
                        borderRightWidth: 3,
                        cursor: activeTab === 'text' ? 'grab' : 'default',
                        outline: selectedCaptionId === c.id && activeTab === 'text' ? '3px solid #FBBF24' : undefined,
                        touchAction: 'none',
                      }}
                    >
                      {c.text}
                      {selectedCaptionId === c.id && activeTab === 'text' && (
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCaption(c.id);
                          }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-[2px] border-ink bg-white text-[0.6rem] font-extrabold"
                          style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Meme bars */}
                  {!compareMode && memeTop && <MemeBar text={memeTop} pos="top" />}
                  {!compareMode && memeBottom && <MemeBar text={memeBottom} pos="bottom" />}

                  {/* Before/After compare overlay chrome */}
                  {compareMode && (
                    <div
                      className="absolute inset-0 cursor-ew-resize"
                      onPointerDown={handleCompareDown}
                      onPointerMove={(e) => {
                        if (e.buttons === 1) updateComparePos(e);
                      }}
                    >
                      <div className="absolute top-0 bottom-0" style={{ left: `${comparePos}%`, width: 3, background: '#fff', boxShadow: '0 0 0 2px #1a1a1a' }} />
                      <div
                        className="absolute flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] border-ink bg-white text-xs font-extrabold"
                        style={{ left: `${comparePos}%`, top: '50%', transform: 'translate(-50%, -50%)', borderBottomWidth: 4, borderRightWidth: 3 }}
                      >
                        ⇔
                      </div>
                      <span className="absolute left-2 top-2 rounded-full border-[2px] border-ink bg-white/90 px-2 py-0.5 text-[0.6rem] font-extrabold" style={{ borderBottomWidth: 3, borderRightWidth: 2 }}>Before</span>
                      <span className="absolute right-2 top-2 rounded-full border-[2px] border-ink bg-white/90 px-2 py-0.5 text-[0.6rem] font-extrabold" style={{ borderBottomWidth: 3, borderRightWidth: 2 }}>After</span>
                    </div>
                  )}
                </div>
              </FrameWrap>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <ToolButton onClick={changePhoto} label="🔄 Change Photo" />
                <ToolButton onClick={resetEdits} label="↩️ Reset Edits" />
                <ToolButton onClick={surpriseMe} label="🎲 Surprise Me!" />
                <ToolButton onClick={() => setCompareMode((v) => !v)} label={compareMode ? '✅ Done Comparing' : '🔍 Before/After'} active={compareMode} />
                <ToolButton onClick={openGallery} label="📁 My Photos" />
                <Link
                  to="/photo-lab-gallery"
                  className="rounded-full border-[2px] border-ink px-3 py-1 text-xs font-extrabold"
                  style={{ background: '#fff', borderBottomWidth: 3, borderRightWidth: 2.5 }}
                >
                  🌍 Community Gallery
                </Link>
                <button
                  onClick={handlePostToGallery}
                  disabled={saving}
                  className="rounded-full border-[2.5px] border-ink bg-white px-4 py-1.5 text-xs font-extrabold disabled:opacity-50"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  {saving ? 'Posting…' : '📮 Post to Gallery'}
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-full border-[2.5px] border-ink bg-yellow-400 px-4 py-1.5 text-xs font-extrabold"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  ⬇️ Download
                </button>
              </div>
              {saveNotice && (
                <div className="rounded-full border-[2px] border-ink bg-green-200 px-3 py-1 text-xs font-extrabold" style={{ borderBottomWidth: 3, borderRightWidth: 2 }}>
                  {saveNotice}
                </div>
              )}
            </>
          ) : (
            <ImageSourcePicker
              onUploadClick={() => fileInputRef.current?.click()}
              onPickCharacter={(file) => loadImage(asset(`/characters/${file}`))}
            />
          )}
        </div>

        {/* Tools panel */}
        {imageSrc && !compareMode && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5 rounded-2xl border-[3px] border-ink bg-white p-2" style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>
              {TOOL_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-1 rounded-full border-[2px] border-ink px-2.5 py-1 text-xs font-extrabold"
                  style={{
                    background: activeTab === t.id ? '#FEF08A' : '#fff',
                    borderBottomWidth: 3,
                    borderRightWidth: 2.5,
                  }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border-[3px] border-ink bg-white p-4" style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>
              {activeTab === 'filters' && (
                <div className="grid grid-cols-2 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterId(f.id)}
                      className="flex flex-col items-center gap-1 rounded-xl border-[2px] border-ink p-1.5 text-center text-[0.65rem] font-extrabold"
                      style={{
                        background: filterId === f.id ? '#FEF08A' : '#fff',
                        borderBottomWidth: 3,
                        borderRightWidth: 2.5,
                      }}
                    >
                      <div className="h-12 w-full overflow-hidden rounded-lg border border-ink/20 bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:10px_10px]">
                        <img
                          src={imageSrc ?? undefined}
                          alt=""
                          className="h-full w-full object-cover"
                          style={{ filter: f.css || 'none' }}
                        />
                      </div>
                      <span className="flex items-center gap-1">
                        <span>{f.emoji}</span>
                        <span>{f.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'adjust' && (
                <div>
                  <button
                    onClick={autoEnhance}
                    className="mb-3 w-full rounded-full border-[2.5px] border-ink bg-[#FDE68A] py-1.5 text-xs font-extrabold"
                    style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                  >
                    ✨ Auto Enhance
                  </button>
                  <SliderRow label="Brightness" value={brightness} min={50} max={150} suffix="%" onChange={setBrightness} accent="#FBBF24" />
                  <SliderRow label="Contrast" value={contrast} min={50} max={150} suffix="%" onChange={setContrast} accent="#3B82F6" />
                  <SliderRow label="Saturation" value={saturation} min={50} max={150} suffix="%" onChange={setSaturation} accent="#EC4899" />
                  <SliderRow label="Warmth" value={warmth} min={-50} max={50} suffix="" onChange={setWarmth} accent="#F97316" />
                  <SliderRow label="Vignette" value={vignette} min={0} max={100} suffix="%" onChange={setVignette} accent="#1a1a1a" />
                </div>
              )}

              {activeTab === 'transform' && (
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <ToolButton onClick={() => setRotation((r) => (r + 270) % 360)} label="↺ Rotate" />
                    <ToolButton onClick={() => setRotation((r) => (r + 90) % 360)} label="↻ Rotate" />
                    <ToolButton onClick={() => setFlipH((f) => !f)} label="↔️ Flip" active={flipH} />
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {CROP_OPTIONS.map((c) => (
                      <ToolButton key={c.id} onClick={() => setCropAspect(c.id)} label={c.label} active={cropAspect === c.id} />
                    ))}
                  </div>
                  <div className="mb-1">
                    <SliderRow label="Zoom" value={zoom} min={100} max={300} suffix="%" onChange={setZoom} accent="#8B5CF6" />
                  </div>
                  {zoom > 100 ? (
                    <p className="text-xs font-bold text-ink/50">Drag the photo to reposition it.</p>
                  ) : (
                    <p className="text-xs font-bold text-ink/50">Zoom in to drag &amp; reposition the photo.</p>
                  )}
                  {(zoom > 100 || panX !== 50 || panY !== 50) && (
                    <button
                      onClick={() => { setZoom(100); setPanX(50); setPanY(50); }}
                      className="mt-2 w-full rounded-full border-[2px] border-ink bg-white py-1.5 text-xs font-extrabold"
                      style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                    >
                      ↩️ Reset Zoom
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'stickers' && (
                <div>
                  <p className="mb-2 text-xs font-bold text-ink/50">Tap to add, drag to move, tap ✕ to remove.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {STICKER_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="flex items-center justify-center rounded-xl border-[2px] border-ink bg-white py-2 text-2xl"
                        style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {stickers.length > 0 && (
                    <button
                      onClick={() => { setStickers([]); setSelectedStickerId(null); }}
                      className="mt-3 w-full rounded-full border-[2px] border-ink bg-white py-1.5 text-xs font-extrabold"
                      style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                    >
                      🗑️ Clear Stickers
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'doodle' && (
                <div>
                  <p className="mb-2 text-xs font-bold text-ink/50">Pick a colour and draw right on the photo!</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {DOODLE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setDoodleColor(c)}
                        className="h-7 w-7 rounded-full border-[2px] border-ink"
                        style={{ background: c, borderBottomWidth: 3, borderRightWidth: 2.5, outline: doodleColor === c ? '2px solid #FBBF24' : undefined }}
                      />
                    ))}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {DOODLE_SIZES.map((s) => (
                      <ToolButton key={s.id} onClick={() => setDoodleSize(s.size)} label={s.label} active={doodleSize === s.size} />
                    ))}
                  </div>
                  {doodleStrokes.length > 0 && (
                    <button
                      onClick={() => setDoodleStrokes([])}
                      className="w-full rounded-full border-[2px] border-ink bg-white py-1.5 text-xs font-extrabold"
                      style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                    >
                      🗑️ Clear Doodles
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'erase' && (
                <div>
                  <p className="mb-3 text-xs font-bold text-ink/50">Draw a circle around something to erase it from the photo!</p>
                  {eraseMasks.length > 0 && (
                    <button
                      onClick={() => setEraseMasks([])}
                      className="w-full rounded-full border-[2px] border-ink bg-white py-1.5 text-xs font-extrabold"
                      style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                    >
                      ↩️ Undo All Erasing
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'text' && (
                <div>
                  <input
                    value={captionDraft}
                    maxLength={24}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    placeholder="Type something fun…"
                    className="mb-2 w-full rounded-xl border-[2px] border-ink px-3 py-1.5 text-sm font-bold"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                  />
                  <div className="mb-2 flex flex-wrap gap-2">
                    {CAPTION_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCaptionColor(c)}
                        className="h-7 w-7 rounded-full border-[2px] border-ink"
                        style={{ background: c, borderBottomWidth: 3, borderRightWidth: 2.5, outline: captionColor === c ? '2px solid #FBBF24' : undefined }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={addOrUpdateCaption}
                    disabled={!captionDraft.trim()}
                    className="w-full rounded-full border-[2.5px] border-ink bg-yellow-400 py-1.5 text-xs font-extrabold disabled:opacity-40"
                    style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                  >
                    {selectedCaptionId ? '✏️ Update Text' : '➕ Add Text'}
                  </button>
                  {captions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {captions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectCaption(c.id)}
                          className="rounded-full border-[2px] border-ink px-2.5 py-1 text-[0.65rem] font-extrabold"
                          style={{ background: selectedCaptionId === c.id ? '#FEF08A' : '#fff', color: c.color, borderBottomWidth: 3, borderRightWidth: 2.5 }}
                        >
                          {c.text}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="my-3 border-t border-ink/10" />
                  <p className="mb-2 text-xs font-extrabold text-ink/60">😂 Meme Mode</p>
                  <input
                    value={memeTop}
                    maxLength={40}
                    onChange={(e) => setMemeTop(e.target.value)}
                    placeholder="TOP TEXT"
                    className="mb-2 w-full rounded-xl border-[2px] border-ink px-3 py-1.5 text-sm font-bold uppercase"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                  />
                  <input
                    value={memeBottom}
                    maxLength={40}
                    onChange={(e) => setMemeBottom(e.target.value)}
                    placeholder="BOTTOM TEXT"
                    className="w-full rounded-xl border-[2px] border-ink px-3 py-1.5 text-sm font-bold uppercase"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                  />
                </div>
              )}

              {activeTab === 'frame' && (
                <div className="grid grid-cols-2 gap-2">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFrameId(f.id)}
                      className="flex flex-col items-center gap-1 rounded-xl border-[2px] border-ink py-2.5 text-xs font-extrabold"
                      style={{ background: frameId === f.id ? '#FEF08A' : '#fff', borderBottomWidth: 3, borderRightWidth: 2.5 }}
                    >
                      <span className="text-xl">{f.emoji}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {galleryOpen && (
        <GalleryModal
          photos={galleryPhotos}
          loading={galleryLoading}
          onClose={() => setGalleryOpen(false)}
          onPick={(p) => { loadImage(p.image_url); setGalleryOpen(false); }}
          onDelete={deleteSavedPhoto}
        />
      )}
    </div>
  );
}

function MemeBar({ text, pos }: { text: string; pos: 'top' | 'bottom' }) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 px-2 text-center"
      style={{ [pos]: '4%' } as React.CSSProperties}
    >
      <span
        style={{
          display: 'inline-block',
          color: '#fff',
          fontWeight: 900,
          textTransform: 'uppercase',
          fontFamily: '"Arial Black", Impact, sans-serif',
          fontSize: 'clamp(1rem, 6cqw, 2.2rem)',
          lineHeight: 1.1,
          textShadow: '2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </span>
    </div>
  );
}

function FrameWrap({ frameId, children }: { frameId: FrameId; children: React.ReactNode }) {
  if (frameId === 'none') return <>{children}</>;

  if (frameId === 'polaroid') {
    return (
      <div className="inline-block rounded-md bg-[#fffdf7] p-3 pb-8 shadow-lg">
        {children}
      </div>
    );
  }

  if (frameId === 'filmstrip') {
    return (
      <div className="rounded-md bg-[#111111]" style={{ display: 'grid', gridTemplateColumns: 'auto auto auto' }}>
        <SprocketColumn />
        <div className="p-1">{children}</div>
        <SprocketColumn />
      </div>
    );
  }

  if (frameId === 'stars') {
    return (
      <div
        className="relative inline-block rounded-md p-6"
        style={{ background: '#FFF3B0', border: '3px solid #1a1a1a' }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={`t${i}`} className="absolute" style={{ left: `${(i + 0.5) * 25}%`, top: 2, transform: 'translateX(-50%)' }}>⭐</span>
        ))}
        {[...Array(4)].map((_, i) => (
          <span key={`b${i}`} className="absolute" style={{ left: `${(i + 0.5) * 25}%`, bottom: 2, transform: 'translateX(-50%)' }}>⭐</span>
        ))}
        {[...Array(4)].map((_, i) => (
          <span key={`l${i}`} className="absolute" style={{ top: `${(i + 0.5) * 25}%`, left: 2, transform: 'translateY(-50%)' }}>⭐</span>
        ))}
        {[...Array(4)].map((_, i) => (
          <span key={`r${i}`} className="absolute" style={{ top: `${(i + 0.5) * 25}%`, right: 2, transform: 'translateY(-50%)' }}>⭐</span>
        ))}
        {children}
      </div>
    );
  }

  if (frameId === 'torn') {
    return (
      <div className="inline-block p-5" style={{ background: '#fffdf7', clipPath: TORN_CLIP_PATH, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

function SprocketColumn() {
  return (
    <div className="flex w-6 flex-col items-center justify-around py-2 sm:w-8">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="h-2 w-2 rounded-full bg-[#fffdf7] sm:h-2.5 sm:w-2.5" />
      ))}
    </div>
  );
}

function ImageSourcePicker({
  onUploadClick,
  onPickCharacter,
}: {
  onUploadClick: () => void;
  onPickCharacter: (file: string) => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-5 py-4">
      <button
        onClick={onUploadClick}
        className="flex flex-col items-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/40 px-10 py-8 text-center transition-colors hover:border-ink/70 hover:bg-ink/5"
      >
        <span className="text-4xl">📤</span>
        <span className="text-sm font-extrabold text-ink">Upload a Photo</span>
        <span className="text-xs font-bold text-ink/50">Choose a picture from your device</span>
      </button>

      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-ink/40">or pick a character</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {CHARACTER_PICKS.map((c) => (
          <button
            key={c.file}
            onClick={() => onPickCharacter(c.file)}
            className="flex flex-col items-center gap-1 rounded-xl border-[2px] border-ink bg-white p-2 transition-transform hover:-translate-y-0.5"
            style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
          >
            <img src={asset(`/characters/${c.file}`)} alt={c.label} className="h-12 w-12 object-contain" />
            <span className="text-[0.6rem] font-bold text-ink/70">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  accent,
  min = 50,
  max = 150,
  suffix = '%',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const display = value > 0 && min < 0 ? `+${value}` : `${value}`;
  return (
    <div className="mb-2 flex items-center gap-2 last:mb-0">
      <span className="w-20 shrink-0 text-xs font-bold text-ink/70">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full"
        style={{ accentColor: accent }}
      />
      <span className="w-10 shrink-0 text-right text-xs font-bold text-ink/50">{display}{suffix}</span>
    </div>
  );
}

function ToolButton({ onClick, label, active }: { onClick: () => void; label: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border-[2px] border-ink px-3 py-1 text-xs font-extrabold"
      style={{
        background: active ? '#FEF08A' : '#fff',
        borderBottomWidth: 3,
        borderRightWidth: 2.5,
      }}
    >
      {label}
    </button>
  );
}

function GalleryModal({
  photos,
  loading,
  onClose,
  onPick,
  onDelete,
}: {
  photos: PhotoRow[];
  loading: boolean;
  onClose: () => void;
  onPick: (p: PhotoRow) => void;
  onDelete: (p: PhotoRow) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-[2rem] border-[3px] border-ink bg-paper p-5"
        style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">📁 My Photos</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink bg-white text-sm font-extrabold" style={{ borderBottomWidth: 3, borderRightWidth: 3 }}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm font-bold text-ink/50">Loading…</p>
          ) : photos.length === 0 ? (
            <p className="text-sm font-bold text-ink/50">No photos yet — edit one and hit Post to Gallery!</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => onPick(p)}
                    className="block aspect-square w-full overflow-hidden rounded-xl border-[2px] border-ink"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                  >
                    <img src={p.image_url} alt="Saved creation" className="h-full w-full object-cover" />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-ink bg-white text-[0.65rem] font-extrabold"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2.5 }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
