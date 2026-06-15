import { useCallback, useEffect, useRef, useState } from 'react';

export type Tool = 'brush' | 'eraser' | 'spray' | 'pencil';

const BOARD_BG = '#1c3d1e';

function getEventPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = 'touches' in e ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

function chalkDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
) {
  const jitter = size * 0.42;
  const steps = Math.max(2, Math.ceil(size / 7));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < steps; i++) {
    const rx = x + (Math.random() - 0.5) * jitter;
    const ry = y + (Math.random() - 0.5) * jitter;
    const r = size * (0.38 + Math.random() * 0.58);
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function sprayDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const radius = size * 1.8;
  const count  = Math.ceil(size * 1.5);
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Gaussian-ish: cluster more dots near centre
    const r = radius * Math.pow(Math.random(), 0.6);
    ctx.globalAlpha = Math.random() * 0.35 + 0.05;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * r,
      y + Math.sin(angle) * r,
      Math.random() * 1.4 + 0.4,
      0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const MAX_HISTORY = 30;

export function useChalkCanvas() {
  const [drawEl, setDrawEl] = useState<HTMLCanvasElement | null>(null);
  const drawRef = useCallback((el: HTMLCanvasElement | null) => setDrawEl(el), []);

  // Undo history
  const history = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // Spray interval — fires while mouse/finger held down
  const sprayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const drawState = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    tool: 'brush' as Tool,
    brushSize: 16,
    color: '#ffffff',
  });

  const [tool, setToolState]       = useState<Tool>('brush');
  const [brushSize, setBrushSizeState] = useState(16);
  const [color, setColorState]     = useState('#ffffff');

  // ── Resize observer ────────────────────────────────────────────
  useEffect(() => {
    if (!drawEl) return;
    const resize = () => {
      const parent = drawEl.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const w = Math.round(width);
      const h = Math.round(height);
      if (drawEl.width === w && drawEl.height === h) return;
      drawEl.width  = w;
      drawEl.height = h;
    };
    const ro = new ResizeObserver(resize);
    if (drawEl.parentElement) ro.observe(drawEl.parentElement);
    resize();
    return () => ro.disconnect();
  }, [drawEl]);

  // ── Event listeners ────────────────────────────────────────────
  useEffect(() => {
    if (!drawEl) return;

    const ctx = () => drawEl.getContext('2d')!;

    const doStroke = (x1: number, y1: number, x2: number, y2: number) => {
      const { tool: t, brushSize: bs, color: col } = drawState.current;
      const c = ctx();

      if (t === 'eraser') {
        c.globalCompositeOperation = 'destination-out';
        c.lineWidth   = bs * 2.6;
        c.lineCap     = 'round';
        c.globalAlpha = 1;
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.globalCompositeOperation = 'source-over';
        return;
      }

      if (t === 'pencil') {
        c.globalCompositeOperation = 'source-over';
        c.strokeStyle = col;
        c.lineWidth   = Math.max(1, bs * 0.18);
        c.lineCap     = 'round';
        c.lineJoin    = 'round';
        c.globalAlpha = 0.9;
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.globalAlpha = 1;
        return;
      }

      if (t === 'spray') {
        // Spray on move handled by interval; just update position here
        return;
      }

      // brush (chalk)
      const dist  = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / (bs * 0.28)));
      for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        chalkDot(c, x1 + (x2 - x1) * t2, y1 + (y2 - y1) * t2, bs, col, 0.72 + Math.random() * 0.24);
      }
    };

    const saveSnapshot = () => {
      const snap = ctx().getImageData(0, 0, drawEl.width, drawEl.height);
      history.current.push(snap);
      if (history.current.length > MAX_HISTORY) history.current.shift();
      setCanUndo(true);
    };

    const stopSpray = () => {
      if (sprayTimer.current) { clearInterval(sprayTimer.current); sprayTimer.current = null; }
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) e.preventDefault();
      saveSnapshot();
      drawState.current.isDrawing = true;
      const p = getEventPos(e, drawEl);
      drawState.current.lastX = p.x;
      drawState.current.lastY = p.y;

      const { tool: t, brushSize: bs, color: col } = drawState.current;

      if (t === 'spray') {
        // Continuous spray while held down
        sprayDot(ctx(), p.x, p.y, bs, col);
        sprayTimer.current = setInterval(() => {
          if (!drawState.current.isDrawing) { stopSpray(); return; }
          sprayDot(ctx(), drawState.current.lastX, drawState.current.lastY, bs, col);
        }, 30);
        return;
      }

      if (t === 'pencil') {
        // First dot on click
        const c = ctx();
        c.fillStyle   = col;
        c.globalAlpha = 0.9;
        c.beginPath();
        c.arc(p.x, p.y, Math.max(0.5, bs * 0.09), 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
        return;
      }

      if (t !== 'eraser') {
        chalkDot(ctx(), p.x, p.y, bs, col, 0.85);
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawState.current.isDrawing) return;
      if ('touches' in e) e.preventDefault();
      const p = getEventPos(e, drawEl);
      const { tool: t } = drawState.current;
      if (t === 'spray') {
        // Interval already running; just update position
        drawState.current.lastX = p.x;
        drawState.current.lastY = p.y;
      } else {
        doStroke(drawState.current.lastX, drawState.current.lastY, p.x, p.y);
        drawState.current.lastX = p.x;
        drawState.current.lastY = p.y;
      }
    };

    const onUp = () => {
      drawState.current.isDrawing = false;
      stopSpray();
    };

    drawEl.addEventListener('mousedown',  onDown as EventListener);
    drawEl.addEventListener('mousemove',  onMove as EventListener);
    drawEl.addEventListener('mouseup',    onUp);
    drawEl.addEventListener('mouseleave', onUp);
    drawEl.addEventListener('touchstart', onDown as EventListener, { passive: false });
    drawEl.addEventListener('touchmove',  onMove as EventListener, { passive: false });
    drawEl.addEventListener('touchend',   onUp);

    return () => {
      drawEl.removeEventListener('mousedown',  onDown as EventListener);
      drawEl.removeEventListener('mousemove',  onMove as EventListener);
      drawEl.removeEventListener('mouseup',    onUp);
      drawEl.removeEventListener('mouseleave', onUp);
      drawEl.removeEventListener('touchstart', onDown as EventListener);
      drawEl.removeEventListener('touchmove',  onMove as EventListener);
      drawEl.removeEventListener('touchend',   onUp);
      if (sprayTimer.current) clearInterval(sprayTimer.current);
    };
  }, [drawEl]);

  // ── Public API ─────────────────────────────────────────────────
  const setTool = useCallback((t: Tool) => {
    drawState.current.tool = t;
    setToolState(t);
  }, []);

  const setBrushSize = useCallback((s: number) => {
    drawState.current.brushSize = s;
    setBrushSizeState(s);
  }, []);

  const setColor = useCallback((c: string) => {
    drawState.current.color = c;
    setColorState(c);
    // Don't reset tool — let user stay on pencil/spray when picking a colour
  }, []);

  const clearCanvas = useCallback(() => {
    if (!drawEl) return;
    drawEl.getContext('2d')!.clearRect(0, 0, drawEl.width, drawEl.height);
    history.current = [];
    setCanUndo(false);
  }, [drawEl]);

  const undo = useCallback(() => {
    if (!drawEl || history.current.length === 0) return;
    const snap = history.current.pop()!;
    drawEl.getContext('2d')!.putImageData(snap, 0, 0);
    setCanUndo(history.current.length > 0);
  }, [drawEl]);

  const isBlank = useCallback(() => {
    if (!drawEl) return true;
    const data = drawEl.getContext('2d')!.getImageData(0, 0, drawEl.width, drawEl.height).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 10) return false;
    return true;
  }, [drawEl]);

  const getImageDataUrl = useCallback((): string => {
    if (!drawEl) return '';
    const tmp = document.createElement('canvas');
    tmp.width  = drawEl.width;
    tmp.height = drawEl.height;
    const tc = tmp.getContext('2d')!;
    tc.fillStyle = BOARD_BG;
    tc.fillRect(0, 0, tmp.width, tmp.height);
    tc.drawImage(drawEl, 0, 0);
    return tmp.toDataURL('image/jpeg', 0.82);
  }, [drawEl]);

  return {
    drawRef, drawEl,
    tool, setTool,
    brushSize, setBrushSize,
    color, setColor,
    clearCanvas, undo, canUndo,
    isBlank, getImageDataUrl,
  };
}
