import { useCallback, useEffect, useRef, useState } from 'react';

export type Tool = 'brush' | 'eraser';

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

export function useChalkCanvas() {
  // Callback ref: fires whenever the canvas element mounts or unmounts.
  // This is the key fix — useRef won't re-trigger effects when the canvas
  // re-mounts (e.g. after a phase change). Storing the element in state does.
  const [drawEl, setDrawEl] = useState<HTMLCanvasElement | null>(null);
  const drawRef = useCallback((el: HTMLCanvasElement | null) => setDrawEl(el), []);

  // Mutable drawing state lives in a ref so event handlers always read
  // current values without needing to be re-attached on every render.
  const drawState = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    tool: 'brush' as Tool,
    brushSize: 16,
    color: '#ffffff',
  });

  // React state — drives toolbar UI only
  const [tool, setToolState]           = useState<Tool>('brush');
  const [brushSize, setBrushSizeState] = useState(16);
  const [color, setColorState]         = useState('#ffffff');

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

  // ── Event listeners — re-attaches whenever drawEl changes ─────
  useEffect(() => {
    if (!drawEl) return;

    const doStroke = (x1: number, y1: number, x2: number, y2: number) => {
      const ctx = drawEl.getContext('2d')!;
      const { tool: t, brushSize: bs, color: col } = drawState.current;

      if (t === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = bs * 2.6;
        ctx.lineCap   = 'round';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        return;
      }

      const dist  = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / (bs * 0.28)));
      for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        chalkDot(
          ctx,
          x1 + (x2 - x1) * t2,
          y1 + (y2 - y1) * t2,
          bs,
          col,
          0.72 + Math.random() * 0.24,
        );
      }
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) e.preventDefault();
      drawState.current.isDrawing = true;
      const p = getEventPos(e, drawEl);
      drawState.current.lastX = p.x;
      drawState.current.lastY = p.y;
      const { brushSize: bs, color: col, tool: t } = drawState.current;
      if (t !== 'eraser') {
        chalkDot(drawEl.getContext('2d')!, p.x, p.y, bs, col, 0.85);
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawState.current.isDrawing) return;
      if ('touches' in e) e.preventDefault();
      const p = getEventPos(e, drawEl);
      doStroke(drawState.current.lastX, drawState.current.lastY, p.x, p.y);
      drawState.current.lastX = p.x;
      drawState.current.lastY = p.y;
    };

    const onUp = () => { drawState.current.isDrawing = false; };

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
    drawState.current.tool = 'brush';
    setToolState('brush');
  }, []);

  const clearCanvas = useCallback(() => {
    if (!drawEl) return;
    drawEl.getContext('2d')!.clearRect(0, 0, drawEl.width, drawEl.height);
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
    clearCanvas, isBlank, getImageDataUrl,
  };
}
