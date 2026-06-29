import { useRef, useState, useCallback } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const CHORD_TYPES: { key: string; label: string; intervals: number[]; color: string }[] = [
  { key: "major",   label: "Maj",      intervals: [0, 4, 7],       color: "#4F8EF7" },
  { key: "minor",   label: "Min",      intervals: [0, 3, 7],       color: "#9B59B6" },
  { key: "dom7",    label: "7",        intervals: [0, 4, 7, 10],   color: "#E67E22" },
  { key: "maj7",    label: "Maj7",     intervals: [0, 4, 7, 11],   color: "#1ABC9C" },
  { key: "min7",    label: "Min7",     intervals: [0, 3, 7, 10],   color: "#E74C3C" },
  { key: "dim",     label: "Dim",      intervals: [0, 3, 6],       color: "#7F8C8D" },
  { key: "aug",     label: "Aug",      intervals: [0, 4, 8],       color: "#F39C12" },
  { key: "sus2",    label: "Sus2",     intervals: [0, 2, 7],       color: "#27AE60" },
  { key: "sus4",    label: "Sus4",     intervals: [0, 5, 7],       color: "#2ECC71" },
  { key: "dim7",    label: "Dim7",     intervals: [0, 3, 6, 9],    color: "#95A5A6" },
  { key: "halfdim", label: "ø7",       intervals: [0, 3, 6, 10],   color: "#C0392B" },
  { key: "minmaj7", label: "mM7",      intervals: [0, 3, 7, 11],   color: "#8E44AD" },
];

const POSITION_LABELS = ["Root", "1st", "2nd"];
const POSITION_DESC   = ["Root position", "1st inversion", "2nd inversion"];

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getInversions(rootMidi: number, intervals: number[]): number[][] {
  const root = intervals.map((i) => rootMidi + i);
  const inv1 = [...root.slice(1), root[0] + 12];
  const inv2 = [...root.slice(2), root[0] + 12, root[1] + 12];
  return [root, inv1, inv2];
}

function synthPianoNote(ctx: AudioContext, dest: AudioNode, freq: number, t: number, vel = 0.55) {
  const dur = 2.2;
  [1, 2, 3, 4, 5, 6].forEach((h, i) => {
    const gains = [1, 0.5, 0.25, 0.12, 0.06, 0.03];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * h;
    const peak = vel * gains[i];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(peak * 0.4, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.05);
  });
  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = "square"; click.frequency.value = freq * 8;
  cg.gain.setValueAtTime(vel * 0.04, t);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
  click.connect(cg); cg.connect(dest);
  click.start(t); click.stop(t + 0.015);
}

function playChordNow(ctx: AudioContext, midiNotes: number[]) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8;
  comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
  comp.connect(ctx.destination);
  const t = ctx.currentTime + 0.03;
  midiNotes.forEach((m) => synthPianoNote(ctx, comp, midiToFreq(m), t));
}

// ─── Piano Keys ───────────────────────────────────────────────────────────────

const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEYS: [number, number][] = [[19, 1], [47, 3], [111, 6], [139, 8], [167, 10]];

function PianoKeys({ highlightedMidi, color }: { highlightedMidi: number[]; color: string }) {
  const lit = new Set(highlightedMidi.map((m) => ((m % 12) + 12) % 12));
  const W = 26, H = 72, BW = 16, BH = 44;

  return (
    <div style={{ position: "relative", display: "flex", height: H, userSelect: "none", flexShrink: 0 }}>
      {WHITE_SEMITONES.map((s, i) => (
        <div key={i} style={{
          width: W, height: H, marginRight: 1,
          borderRadius: "0 0 4px 4px",
          border: "1.5px solid #bbb",
          background: lit.has(s) ? color : "white",
          boxShadow: lit.has(s) ? `0 0 8px 2px ${color}99` : "inset 0 -3px 6px rgba(0,0,0,0.07)",
          transition: "background 0.12s",
          position: "relative", zIndex: 1,
        }} />
      ))}
      {BLACK_KEYS.map(([left, s]) => (
        <div key={s} style={{
          position: "absolute", top: 0, left,
          width: BW, height: BH,
          borderRadius: "0 0 3px 3px",
          background: lit.has(s) ? color : "#1a1a1a",
          border: lit.has(s) ? `2px solid ${color}` : "1.5px solid #000",
          boxShadow: lit.has(s) ? `0 0 8px 2px ${color}bb` : "2px 3px 5px rgba(0,0,0,0.5)",
          transition: "background 0.12s",
          zIndex: 2,
        }} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PianoChordGame() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [selected, setSelected] = useState<{ root: number; chordKey: string }>({ root: 0, chordKey: "major" });
  const [position, setPosition] = useState(0);

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }

  const handleSelect = useCallback((root: number, chordKey: string) => {
    setSelected({ root, chordKey });
    const ct = CHORD_TYPES.find(c => c.key === chordKey)!;
    const notes = getInversions(48 + root, ct.intervals)[position];
    playChordNow(getCtx(), notes);
  }, [position]);

  const handlePosition = useCallback((pos: number) => {
    setPosition(pos);
    const ct = CHORD_TYPES.find(c => c.key === selected.chordKey)!;
    const notes = getInversions(48 + selected.root, ct.intervals)[pos];
    playChordNow(getCtx(), notes);
  }, [selected]);

  const activeChord = CHORD_TYPES.find(c => c.key === selected.chordKey)!;
  const currentNotes = getInversions(48 + selected.root, activeChord.intervals)[position];
  const noteNames = currentNotes.map((m) => NOTE_NAMES[((m % 12) + 12) % 12]);
  const chordName = `${NOTE_NAMES[selected.root]} ${activeChord.label}`;

  return (
    <div style={{
      height: "100dvh",
      overflow: "hidden",
      background: "linear-gradient(160deg, #0F0C29, #302B63, #24243E)",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      color: "white",
      boxSizing: "border-box",
    }}>

      {/* Header */}
      <div style={{ padding: "8px 14px 4px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
          🎹 Chord Explorer
        </h1>
      </div>

      {/* Chord grid — scrollable */}
      <div style={{ overflow: "auto", padding: "0 10px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "3px 3px" }}>
          <thead>
            <tr>
              <th style={{ width: 32, fontSize: "0.58rem", opacity: 0.4, fontWeight: 700, textAlign: "right", paddingRight: 6, letterSpacing: "0.05em" }}></th>
              {CHORD_TYPES.map(ct => (
                <th key={ct.key} style={{
                  fontSize: "0.6rem", fontWeight: 800, opacity: 0.55,
                  textAlign: "center", paddingBottom: 2, letterSpacing: "0.04em",
                  color: ct.color,
                }}>{ct.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTE_NAMES.map((note, ri) => (
              <tr key={note}>
                {/* Root label */}
                <td style={{
                  fontSize: "0.82rem", fontWeight: 900, textAlign: "right",
                  paddingRight: 6, opacity: 0.9, whiteSpace: "nowrap",
                  color: selected.root === ri ? activeChord.color : "white",
                }}>
                  {note}
                </td>
                {/* Chord buttons */}
                {CHORD_TYPES.map(ct => {
                  const isActive = selected.root === ri && selected.chordKey === ct.key;
                  return (
                    <td key={ct.key} style={{ padding: 0 }}>
                      <button
                        onClick={() => handleSelect(ri, ct.key)}
                        style={{
                          width: "100%",
                          padding: "5px 2px",
                          borderRadius: 6,
                          border: isActive ? `2px solid ${ct.color}` : "2px solid rgba(255,255,255,0.06)",
                          background: isActive ? ct.color + "55" : "rgba(255,255,255,0.04)",
                          color: isActive ? "white" : "rgba(255,255,255,0.55)",
                          fontWeight: isActive ? 800 : 600,
                          fontSize: "0.68rem",
                          cursor: "pointer",
                          transition: "all 0.1s",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                          boxShadow: isActive ? `0 0 8px 1px ${ct.color}66` : "none",
                        }}
                      >
                        {note}{ct.label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom panel */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "8px 14px 10px",
        display: "flex",
        gap: 14,
        alignItems: "center",
      }}>
        {/* Piano */}
        <PianoKeys highlightedMidi={currentNotes} color={activeChord.color} />

        {/* Info + position */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: activeChord.color, lineHeight: 1 }}>
              {chordName}
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
              {noteNames.map((n, i) => (
                <span key={i} style={{
                  background: activeChord.color + "33",
                  border: `1.5px solid ${activeChord.color}66`,
                  borderRadius: 5, padding: "2px 8px",
                  fontWeight: 800, fontSize: "0.8rem",
                }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Position buttons */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: "0.58rem", opacity: 0.4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Inv</span>
            {POSITION_LABELS.map((label, i) => (
              <button key={i} onClick={() => handlePosition(i)} style={{
                padding: "3px 10px",
                borderRadius: 6,
                border: position === i ? `2px solid ${activeChord.color}` : "2px solid rgba(255,255,255,0.1)",
                background: position === i ? activeChord.color + "44" : "rgba(255,255,255,0.05)",
                color: "white", fontWeight: 700, fontSize: "0.72rem",
                cursor: "pointer", transition: "all 0.1s", fontFamily: "inherit",
              }}>{label}</button>
            ))}
            <span style={{ fontSize: "0.65rem", opacity: 0.4 }}>{POSITION_DESC[position]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
