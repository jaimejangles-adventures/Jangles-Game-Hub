import { useCallback, useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';

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

function buildFilterCss(filterCss: string, brightness: number, contrast: number, saturation: number) {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filterCss}`.trim();
}

export function PhotoLabGame() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLabel, setImageLabel] = useState<string>('');
  const [filterId, setFilterId] = useState('original');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [cropAspect, setCropAspect] = useState<CropAspect>('original');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0];
  const combinedFilterCss = buildFilterCss(filter.css, brightness, contrast, saturation);
  const cropOption = CROP_OPTIONS.find((c) => c.id === cropAspect) ?? CROP_OPTIONS[0];

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  function resetEdits() {
    setFilterId('original');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipH(false);
    setCropAspect('original');
    setDownloadUrl(null);
  }

  function loadImage(src: string, label: string) {
    resetEdits();
    setImageSrc(src);
    setImageLabel(label);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') loadImage(reader.result, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const handleDownload = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const swapped = rotation === 90 || rotation === 270;
    const effW = swapped ? ih : iw;
    const effH = swapped ? iw : ih;

    const oriented = document.createElement('canvas');
    oriented.width = effW;
    oriented.height = effH;
    const octx = oriented.getContext('2d');
    if (!octx) return;
    octx.save();
    octx.translate(effW / 2, effH / 2);
    octx.rotate((rotation * Math.PI) / 180);
    octx.scale(flipH ? -1 : 1, 1);
    octx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
    octx.restore();

    const targetRatio = cropOption.ratio ?? effW / effH;
    let cw = effW;
    let ch = effH;
    if (effW / effH > targetRatio) {
      cw = effH * targetRatio;
    } else {
      ch = effW / targetRatio;
    }
    const cx = (effW - cw) / 2;
    const cy = (effH - ch) / 2;

    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    const octx2 = out.getContext('2d');
    if (!octx2) return;
    octx2.filter = combinedFilterCss;
    octx2.drawImage(oriented, cx, cy, cw, ch, 0, 0, cw, ch);

    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setDownloadUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jangles-photo-lab.png';
      a.click();
    }, 'image/png');
  }, [rotation, flipH, cropOption, combinedFilterCss]);

  return (
    <div className="flex flex-col gap-5">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* Header card */}
      <div
        className="rounded-[2rem] border-[3px] border-ink bg-white px-5 py-4 sm:px-7 sm:py-5"
        style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎞️</span>
          <div>
            <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">Jaime's Photo Lab</h1>
            <p className="text-sm font-bold text-ink/55">Pick a picture, add a filter, and make it your own!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Canvas / preview */}
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border-[3px] border-ink bg-white p-5"
          style={{ borderBottomWidth: 6, borderRightWidth: 5, minHeight: 380 }}
        >
          {imageSrc ? (
            <>
              <div
                className="overflow-hidden rounded-2xl border-[3px] border-ink bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]"
                style={{
                  borderBottomWidth: 5,
                  borderRightWidth: 4,
                  aspectRatio: cropOption.ratio ?? undefined,
                  maxWidth: '100%',
                  maxHeight: 460,
                  width: cropOption.ratio ? undefined : 'auto',
                }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt={imageLabel || 'Your photo'}
                  crossOrigin="anonymous"
                  className="block"
                  style={{
                    width: cropOption.ratio ? '100%' : 'auto',
                    height: cropOption.ratio ? '100%' : 'auto',
                    maxHeight: cropOption.ratio ? undefined : 460,
                    maxWidth: cropOption.ratio ? undefined : '100%',
                    objectFit: cropOption.ratio ? 'cover' : 'contain',
                    filter: combinedFilterCss,
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                    transition: 'filter 0.15s ease, transform 0.2s ease',
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border-[2.5px] border-ink bg-white px-4 py-1.5 text-xs font-extrabold"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  🔄 Change Photo
                </button>
                <button
                  onClick={resetEdits}
                  className="rounded-full border-[2.5px] border-ink bg-white px-4 py-1.5 text-xs font-extrabold"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  ↩️ Reset Edits
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-full border-[2.5px] border-ink bg-yellow-400 px-4 py-1.5 text-xs font-extrabold"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  ⬇️ Download
                </button>
              </div>
            </>
          ) : (
            <ImageSourcePicker
              onUploadClick={() => fileInputRef.current?.click()}
              onPickCharacter={(file, label) => loadImage(asset(`/characters/${file}`), label)}
            />
          )}
        </div>

        {/* Tools panel */}
        {imageSrc && (
          <div className="flex flex-col gap-4">
            <ToolCard title="🎨 Filters">
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterId(f.id)}
                    className="flex items-center gap-1.5 rounded-xl border-[2px] border-ink px-2 py-1.5 text-left text-xs font-extrabold"
                    style={{
                      background: filterId === f.id ? '#FEF08A' : '#fff',
                      borderBottomWidth: 3,
                      borderRightWidth: 2.5,
                    }}
                  >
                    <span>{f.emoji}</span>
                    <span className="leading-tight">{f.label}</span>
                  </button>
                ))}
              </div>
            </ToolCard>

            <ToolCard title="🎚️ Adjust">
              <SliderRow label="Brightness" value={brightness} onChange={setBrightness} accent="#FBBF24" />
              <SliderRow label="Contrast" value={contrast} onChange={setContrast} accent="#3B82F6" />
              <SliderRow label="Saturation" value={saturation} onChange={setSaturation} accent="#EC4899" />
            </ToolCard>

            <ToolCard title="🔧 Transform">
              <div className="flex flex-wrap gap-2">
                <ToolButton onClick={() => setRotation((r) => (r + 270) % 360)} label="↺ Rotate" />
                <ToolButton onClick={() => setRotation((r) => (r + 90) % 360)} label="↻ Rotate" />
                <ToolButton onClick={() => setFlipH((f) => !f)} label="↔️ Flip" active={flipH} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {CROP_OPTIONS.map((c) => (
                  <ToolButton
                    key={c.id}
                    onClick={() => setCropAspect(c.id)}
                    label={c.label}
                    active={cropAspect === c.id}
                  />
                ))}
              </div>
            </ToolCard>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageSourcePicker({
  onUploadClick,
  onPickCharacter,
}: {
  onUploadClick: () => void;
  onPickCharacter: (file: string, label: string) => void;
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
            onClick={() => onPickCharacter(c.file, c.label)}
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

function ToolCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border-[3px] border-ink bg-white p-4"
      style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
    >
      <div className="mb-2.5 text-sm font-extrabold">{title}</div>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 last:mb-0">
      <span className="w-20 shrink-0 text-xs font-bold text-ink/70">{label}</span>
      <input
        type="range"
        min={50}
        max={150}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full"
        style={{ accentColor: accent }}
      />
      <span className="w-9 shrink-0 text-right text-xs font-bold text-ink/50">{value}%</span>
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
