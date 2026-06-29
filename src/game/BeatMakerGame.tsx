import { useRef, useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = 32; // 2 bars × 16th notes
const LOOKAHEAD = 0.15;
const SCHEDULE_MS = 25;

// ─── C Minor frequencies ──────────────────────────────────────────────────────
const C2 = 65.41, Eb2 = 77.78, F2 = 87.31, G2 = 98.0, Bb2 = 116.54, C3 = 130.81, D2 = 73.42;
const C4 = 261.63, D4 = 293.66, Eb4 = 311.13, F4 = 349.23, G4 = 392.0, Ab4 = 415.3, Bb4 = 466.16, C5 = 523.25, D5 = 587.33, Eb5 = 622.25;

// ─── Synthesis ────────────────────────────────────────────────────────────────
function synthKick(ctx: AudioContext, t: number, dest: AudioNode, vel = 1) {
  const click = ctx.createOscillator(); const cg = ctx.createGain();
  click.type = "square"; click.frequency.setValueAtTime(600, t);
  cg.gain.setValueAtTime(vel * 0.35, t); cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  click.connect(cg); cg.connect(dest); click.start(t); click.stop(t + 0.018);

  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = "sine"; osc.frequency.setValueAtTime(155, t); osc.frequency.exponentialRampToValueAtTime(40, t + 0.42);
  g.gain.setValueAtTime(vel * 1.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + 0.5);
}

function synthSnare(ctx: AudioContext, t: number, dest: AudioNode) {
  const osc = ctx.createOscillator(); const og = ctx.createGain();
  osc.frequency.setValueAtTime(220, t); osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
  og.gain.setValueAtTime(0.65, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(og); og.connect(dest); osc.start(t); osc.stop(t + 0.14);

  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource(); ns.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2800; f.Q.value = 0.7;
  const ng = ctx.createGain(); ng.gain.setValueAtTime(0.85, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  ns.connect(f); f.connect(ng); ng.connect(dest); ns.start(t); ns.stop(t + 0.22);
}

function synthHihat(ctx: AudioContext, t: number, dest: AudioNode, open = false, vel = 0.3) {
  const dur = open ? 0.22 : 0.04;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource(); ns.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 8000;
  const g = ctx.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  ns.connect(f); f.connect(g); g.connect(dest); ns.start(t); ns.stop(t + dur);
}

function synthClap(ctx: AudioContext, t: number, dest: AudioNode) {
  for (let i = 0; i < 3; i++) {
    const ti = t + i * 0.009;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.07), ctx.sampleRate);
    const d = buf.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 0.5;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.65, ti); g.gain.exponentialRampToValueAtTime(0.0001, ti + 0.07);
    ns.connect(f); f.connect(g); g.connect(dest); ns.start(ti); ns.stop(ti + 0.07);
  }
}

function synthRimshot(ctx: AudioContext, t: number, dest: AudioNode) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = "triangle"; osc.frequency.setValueAtTime(380, t); osc.frequency.exponentialRampToValueAtTime(190, t + 0.06);
  g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + 0.08);
}

function synthBass(ctx: AudioContext, t: number, dest: AudioNode, freq: number, dur = 0.28, vel = 0.7) {
  const osc = ctx.createOscillator(); const filt = ctx.createBiquadFilter(); const g = ctx.createGain();
  osc.type = "sawtooth"; filt.type = "lowpass"; filt.frequency.value = 700; filt.Q.value = 1.5;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vel, t); g.gain.setValueAtTime(vel * 0.5, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(filt); filt.connect(g); g.connect(dest); osc.start(t); osc.stop(t + dur);
  const sub = ctx.createOscillator(); const sg = ctx.createGain();
  sub.type = "sine"; sub.frequency.setValueAtTime(freq / 2, t);
  sg.gain.setValueAtTime(vel * 0.45, t); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  sub.connect(sg); sg.connect(dest); sub.start(t); sub.stop(t + dur);
}

function synthNote(ctx: AudioContext, t: number, dest: AudioNode, freq: number, dur = 0.14, vel = 0.32, type: OscillatorType = "square") {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + dur);
}

function synthPluck(ctx: AudioContext, t: number, dest: AudioNode, freq: number, vel = 0.35) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = "triangle"; osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + 0.3);
}

function synthPad(ctx: AudioContext, t: number, dest: AudioNode, freq: number, dur = 1.5, vel = 0.18) {
  const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const g = ctx.createGain();
  osc1.type = "sine"; osc1.frequency.setValueAtTime(freq, t);
  osc2.type = "sine"; osc2.frequency.setValueAtTime(freq * 1.0015, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.12);
  g.gain.setValueAtTime(vel, t + dur - 0.15); g.gain.linearRampToValueAtTime(0, t + dur);
  osc1.connect(g); osc2.connect(g); g.connect(dest);
  osc1.start(t); osc1.stop(t + dur); osc2.start(t); osc2.stop(t + dur);
}

function synthNoise(ctx: AudioContext, t: number, dest: AudioNode, dur = 0.25, ffreq = 2000, vel = 0.18) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource(); ns.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = ffreq; f.Q.value = 1.2;
  const g = ctx.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  ns.connect(f); f.connect(g); g.connect(dest); ns.start(t); ns.stop(t + dur);
}

function synthRiser(ctx: AudioContext, t: number, dest: AudioNode, startF: number, endF: number, dur: number, vel = 0.22) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(startF, t); osc.frequency.linearRampToValueAtTime(endF, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + dur * 0.8);
  g.gain.linearRampToValueAtTime(0, t + dur);
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 4;
  f.frequency.setValueAtTime(startF, t); f.frequency.linearRampToValueAtTime(endF, t + dur);
  osc.connect(f); f.connect(g); g.connect(dest); osc.start(t); osc.stop(t + dur);
}

function synthShimmer(ctx: AudioContext, t: number, dest: AudioNode, freq: number) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = "sine"; osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + 0.4);
}

// ─── Pad definitions ──────────────────────────────────────────────────────────
// Each pad receives: (ctx, step 0-31, webAudioTime, outputGainNode, stepDur)
type OnStepFn = (ctx: AudioContext, step: number, t: number, dest: AudioNode, sd: number) => void;

interface PadDef { id: string; label: string; onStep: OnStepFn; }
interface RowDef { id: string; label: string; emoji: string; color: string; pads: PadDef[]; }

const ROWS: RowDef[] = [
  {
    id: "drums", label: "DRUMS", emoji: "🥁", color: "#f97316",
    pads: [
      {
        id: "d-kick", label: "Kick",
        onStep: (ctx, s, t, dest) => {
          if (s === 0 || s === 16) synthKick(ctx, t, dest);
        },
      },
      {
        id: "d-rock", label: "K+S",
        onStep: (ctx, s, t, dest) => {
          if (s === 0 || s === 16) synthKick(ctx, t, dest);
          if (s === 8 || s === 24) synthSnare(ctx, t, dest);
        },
      },
      {
        id: "d-4floor", label: "4/4",
        onStep: (ctx, s, t, dest) => {
          if (s % 8 === 0) synthKick(ctx, t, dest);
          if ([4,12,20,28].includes(s)) synthHihat(ctx, t, dest, false, 0.28);
        },
      },
      {
        id: "d-hh", label: "Hats",
        onStep: (ctx, s, t, dest) => {
          if (s % 4 === 0) synthHihat(ctx, t, dest, false, 0.3);
          if ([8, 24].includes(s)) synthSnare(ctx, t, dest);
        },
      },
      {
        id: "d-openhat", label: "Open",
        onStep: (ctx, s, t, dest) => {
          if (s === 0 || s === 16) synthKick(ctx, t, dest);
          if ([4,12,20,28].includes(s)) synthHihat(ctx, t, dest, true, 0.3);
        },
      },
      {
        id: "d-clap", label: "Clap",
        onStep: (ctx, s, t, dest) => {
          if (s === 0 || s === 16) synthKick(ctx, t, dest);
          if ([8, 24].includes(s)) synthClap(ctx, t, dest);
          if (s % 4 === 0) synthHihat(ctx, t, dest, false, 0.2);
        },
      },
      {
        id: "d-rim", label: "Trap",
        onStep: (ctx, s, t, dest) => {
          if ([0, 10, 16, 26].includes(s)) synthKick(ctx, t, dest);
          if ([8, 24].includes(s)) synthSnare(ctx, t, dest);
          if (s % 2 === 0) synthHihat(ctx, t, dest, false, 0.18);
          if ([6, 22].includes(s)) synthRimshot(ctx, t, dest);
        },
      },
      {
        id: "d-break", label: "Break",
        onStep: (ctx, s, t, dest) => {
          const kickSteps = [0, 3, 10, 16, 18, 26];
          const snareSteps = [4, 12, 20, 28];
          const hatSteps = [2, 6, 8, 14, 18, 22, 24, 30];
          if (kickSteps.includes(s)) synthKick(ctx, t, dest, 0.85);
          if (snareSteps.includes(s)) synthSnare(ctx, t, dest);
          if (hatSteps.includes(s)) synthHihat(ctx, t, dest, false, 0.25);
        },
      },
    ],
  },
  {
    id: "bass", label: "BASS", emoji: "🎸", color: "#a855f7",
    pads: [
      {
        id: "b-root", label: "Root",
        onStep: (ctx, s, t, dest, sd) => {
          if (s === 0 || s === 16) synthBass(ctx, t, dest, C2, sd * 7);
        },
      },
      {
        id: "b-bounce", label: "Bounce",
        onStep: (ctx, s, t, dest, sd) => {
          if ([0, 16].includes(s)) synthBass(ctx, t, dest, C2, sd * 3.5);
          if ([8, 24].includes(s)) synthBass(ctx, t, dest, G2, sd * 3.5);
        },
      },
      {
        id: "b-funk", label: "Funk",
        onStep: (ctx, s, t, dest, sd) => {
          const pat: [number, number][] = [[0,C2],[4,C2],[6,G2],[10,Bb2],[16,C3],[20,Bb2],[22,G2],[26,Eb2]];
          for (const [step, freq] of pat) if (s === step) synthBass(ctx, t, dest, freq, sd * 3.5);
        },
      },
      {
        id: "b-offbeat", label: "Skank",
        onStep: (ctx, s, t, dest, sd) => {
          if ([4, 12, 20, 28].includes(s)) synthBass(ctx, t, dest, Eb2, sd * 3);
        },
      },
      {
        id: "b-pulse", label: "Pulse",
        onStep: (ctx, s, t, dest, sd) => {
          if (s % 8 === 0) synthBass(ctx, t, dest, C2, sd * 6.5, 0.8);
        },
      },
      {
        id: "b-walk", label: "Walk",
        onStep: (ctx, s, t, dest, sd) => {
          const steps: [number, number][] = [[0,C2],[4,D2],[8,Eb2],[12,F2],[16,G2],[20,F2],[24,Eb2],[28,D2]];
          for (const [step, freq] of steps) if (s === step) synthBass(ctx, t, dest, freq, sd * 3.5);
        },
      },
      {
        id: "b-arp", label: "Arp",
        onStep: (ctx, s, t, dest, sd) => {
          const steps: [number, number][] = [[0,C2],[4,Eb2],[8,G2],[12,Bb2],[16,C3],[20,Bb2],[24,G2],[28,Eb2]];
          for (const [step, freq] of steps) if (s === step) synthBass(ctx, t, dest, freq, sd * 3.5);
        },
      },
      {
        id: "b-staccato", label: "Stabs",
        onStep: (ctx, s, t, dest, sd) => {
          const stabs: [number, number][] = [[0,C2],[2,C2],[8,Eb2],[10,Eb2],[16,G2],[18,C2],[24,Bb2],[26,G2]];
          for (const [step, freq] of stabs) if (s === step) synthBass(ctx, t, dest, freq, sd * 1.5, 0.8);
        },
      },
    ],
  },
  {
    id: "melody", label: "MELODY", emoji: "🎹", color: "#06b6d4",
    pads: [
      {
        id: "m-hook", label: "Hook",
        onStep: (ctx, s, t, dest, sd) => {
          const pat: [number, number][] = [[0,C4],[4,Eb4],[8,G4],[12,Bb4],[16,C5],[20,Bb4],[24,G4],[28,Eb4]];
          for (const [step, freq] of pat) if (s === step) synthNote(ctx, t, dest, freq, sd * 3, 0.3, "square");
        },
      },
      {
        id: "m-lead", label: "Lead",
        onStep: (ctx, s, t, dest, sd) => {
          const pat: [number, number][] = [[0,G4],[3,Bb4],[6,C5],[9,Bb4],[12,G4],[16,F4],[19,Eb4],[22,C4],[25,D4],[28,Eb4],[30,F4]];
          for (const [step, freq] of pat) if (s === step) synthNote(ctx, t, dest, freq, sd * 2.5, 0.28, "sawtooth");
        },
      },
      {
        id: "m-pluck", label: "Pluck",
        onStep: (ctx, s, t, dest) => {
          const pat: [number, number][] = [[0,C4],[4,Eb4],[8,G4],[12,C5],[16,Bb4],[20,G4],[24,Eb4],[28,C4]];
          for (const [step, freq] of pat) if (s === step) synthPluck(ctx, t, dest, freq, 0.32);
        },
      },
      {
        id: "m-stab", label: "Stab",
        onStep: (ctx, s, t, dest, sd) => {
          if ([0, 12, 16, 28].includes(s)) {
            synthNote(ctx, t, dest, C4, sd * 1.5, 0.25, "square");
            synthNote(ctx, t, dest, Eb4, sd * 1.5, 0.22, "square");
            synthNote(ctx, t, dest, G4, sd * 1.5, 0.2, "square");
          }
        },
      },
      {
        id: "m-arp", label: "Arp",
        onStep: (ctx, s, t, dest) => {
          if (s % 2 === 0) {
            const notes = [C4, Eb4, G4, Bb4, C5, Bb4, G4, Eb4, C4, Eb4, G4, Bb4, C5, Bb4, G4, Eb4];
            const idx = (s / 2) % notes.length;
            synthPluck(ctx, t, dest, notes[idx], 0.28);
          }
        },
      },
      {
        id: "m-bell", label: "Bell",
        onStep: (ctx, s, t, dest, sd) => {
          const pat: [number, number][] = [[0,C5],[6,Eb5],[12,G4],[18,F4],[24,Ab4],[30,Eb5]];
          for (const [step, freq] of pat) if (s === step) {
            synthNote(ctx, t, dest, freq, sd * 4, 0.25, "sine");
            synthNote(ctx, t, dest, freq * 2, sd * 3, 0.1, "sine");
          }
        },
      },
      {
        id: "m-pad", label: "Pad",
        onStep: (ctx, s, t, dest, sd) => {
          if (s === 0) {
            synthPad(ctx, t, dest, C4, sd * 14, 0.18);
            synthPad(ctx, t, dest, Eb4, sd * 14, 0.15);
            synthPad(ctx, t, dest, G4, sd * 14, 0.14);
          }
        },
      },
      {
        id: "m-counter", label: "Riff",
        onStep: (ctx, s, t, dest, sd) => {
          const pat: [number, number][] = [[0,Eb4],[2,F4],[4,G4],[8,Bb4],[10,C5],[14,Bb4],[16,Ab4],[20,G4],[22,F4],[26,Eb4],[28,G4]];
          for (const [step, freq] of pat) if (s === step) synthNote(ctx, t, dest, freq, sd * 1.8, 0.26, "triangle");
        },
      },
    ],
  },
  {
    id: "effects", label: "EFFECTS", emoji: "✨", color: "#ec4899",
    pads: [
      {
        id: "fx-crackle", label: "Vinyl",
        onStep: (ctx, s, t, dest) => {
          if (Math.random() < 0.5) synthNoise(ctx, t, dest, 0.08, 800 + Math.random() * 2000, 0.07);
        },
      },
      {
        id: "fx-sweep", label: "Sweep",
        onStep: (ctx, s, t, dest, sd) => {
          if (s === 0) synthRiser(ctx, t, dest, 200, 3200, sd * 16, 0.28);
        },
      },
      {
        id: "fx-riser", label: "Riser",
        onStep: (ctx, s, t, dest, sd) => {
          if (s === 0) synthRiser(ctx, t, dest, 80, 800, sd * 16, 0.35);
        },
      },
      {
        id: "fx-zap", label: "Zap",
        onStep: (ctx, s, t, dest, sd) => {
          if ([0, 16].includes(s)) {
            synthNote(ctx, t, dest, 1800, sd * 1.2, 0.25, "sawtooth");
            synthNote(ctx, t + 0.03, dest, 900, sd, 0.2, "sawtooth");
          }
        },
      },
      {
        id: "fx-whoosh", label: "Whoosh",
        onStep: (ctx, s, t, dest, sd) => {
          if ([0, 16].includes(s)) {
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sd * 7), ctx.sampleRate);
            const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            const ns = ctx.createBufferSource(); ns.buffer = buf;
            const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 3;
            f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4000, t + sd * 7);
            const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + sd * 3);
            g.gain.exponentialRampToValueAtTime(0.0001, t + sd * 7);
            ns.connect(f); f.connect(g); g.connect(dest); ns.start(t); ns.stop(t + sd * 7);
          }
        },
      },
      {
        id: "fx-shimmer", label: "Shimmer",
        onStep: (ctx, s, t, dest) => {
          if (s % 4 === 0) {
            const freqs = [C5, Eb5, G4 * 4, D5];
            synthShimmer(ctx, t, dest, freqs[Math.floor(Math.random() * freqs.length)] * (1 + (Math.random() - 0.5) * 0.02));
          }
        },
      },
      {
        id: "fx-tension", label: "Drone",
        onStep: (ctx, s, t, dest, sd) => {
          if (s === 0 || s === 16) {
            const osc = ctx.createOscillator(); const g = ctx.createGain();
            osc.type = "sawtooth"; osc.frequency.setValueAtTime(C2 / 2, t);
            const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 120;
            g.gain.setValueAtTime(0.35, t); g.gain.setValueAtTime(0.35, t + sd * 15); g.gain.linearRampToValueAtTime(0, t + sd * 16);
            osc.connect(f); f.connect(g); g.connect(dest); osc.start(t); osc.stop(t + sd * 16);
          }
        },
      },
      {
        id: "fx-glitch", label: "Glitch",
        onStep: (ctx, s, t, dest) => {
          if (Math.random() < 0.25) {
            const f = [C4, G4, Eb4, Bb4, C5][Math.floor(Math.random() * 5)];
            synthNote(ctx, t, dest, f * (1 + (Math.random() - 0.5) * 0.3), 0.04 + Math.random() * 0.08, 0.2, "sawtooth");
          }
        },
      },
    ],
  },
];

// ─── Scheduler state ──────────────────────────────────────────────────────────
interface SchedulerState {
  ctx: AudioContext;
  masterGain: GainNode;
  nextStepTime: number;
  currentStep: number;
  bpm: number;
  activePads: Set<string>;
  pendingOn: Set<string>;
  pendingOff: Set<string>;
}

function stepDur(bpm: number) { return (60 / bpm) / 4; }

// ─── Component ────────────────────────────────────────────────────────────────
export function BeatMakerGame() {
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [pendingPads, setPendingPads] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(0.8);
  const [isRunning, setIsRunning] = useState(false);
  const schedRef = useRef<SchedulerState | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef(0.8);
  const bpmRef = useRef(120);

  // Keep refs in sync
  useEffect(() => { volumeRef.current = volume; if (schedRef.current) schedRef.current.masterGain.gain.setTargetAtTime(volume, schedRef.current.ctx.currentTime, 0.01); }, [volume]);
  useEffect(() => { bpmRef.current = bpm; if (schedRef.current) schedRef.current.bpm = bpm; }, [bpm]);

  const startEngine = useCallback(() => {
    if (schedRef.current) return;
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volumeRef.current, ctx.currentTime);
    masterGain.connect(ctx.destination);
    schedRef.current = {
      ctx, masterGain,
      nextStepTime: ctx.currentTime + 0.05,
      currentStep: 0,
      bpm: bpmRef.current,
      activePads: new Set(),
      pendingOn: new Set(),
      pendingOff: new Set(),
    };
  }, []);

  const togglePad = useCallback((padId: string) => {
    if (!schedRef.current) startEngine();
    const sched = schedRef.current!;

    setActivePads(prev => {
      const next = new Set(prev);
      if (next.has(padId)) {
        next.delete(padId);
        sched.pendingOff.add(padId);
        sched.pendingOn.delete(padId);
      } else {
        next.add(padId);
        sched.pendingOn.add(padId);
        sched.pendingOff.delete(padId);
      }
      return next;
    });

    setPendingPads(prev => {
      const next = new Set(prev);
      next.add(padId);
      return next;
    });
  }, [startEngine]);

  // Scheduler loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (!schedRef.current) startEngine();

    timerRef.current = setInterval(() => {
      const sched = schedRef.current;
      if (!sched) return;
      const { ctx, masterGain } = sched;
      const sd = stepDur(sched.bpm);

      while (sched.nextStepTime < ctx.currentTime + LOOKAHEAD) {
        const step = sched.currentStep;

        // Apply pending activations at bar start
        if (step === 0) {
          sched.pendingOff.forEach(id => { sched.activePads.delete(id); });
          sched.pendingOn.forEach(id => { sched.activePads.add(id); });
          sched.pendingOff.clear();
          sched.pendingOn.clear();
          setPendingPads(new Set());
        }

        // Fire each active pad's step
        sched.activePads.forEach(padId => {
          const row = ROWS.find(r => r.pads.some(p => p.id === padId));
          const pad = row?.pads.find(p => p.id === padId);
          pad?.onStep(ctx, step, sched.nextStepTime, masterGain, sd);
        });

        setCurrentStep(step);
        sched.currentStep = (step + 1) % STEPS;
        sched.nextStepTime += sd;
      }
    }, SCHEDULE_MS);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, startEngine]);

  const handlePlayStop = () => {
    if (!isRunning) {
      startEngine();
      schedRef.current!.nextStepTime = schedRef.current!.ctx.currentTime + 0.05;
      schedRef.current!.currentStep = 0;
    } else {
      setCurrentStep(-1);
    }
    setIsRunning(r => !r);
  };

  const clearAll = () => {
    setActivePads(new Set());
    setPendingPads(new Set());
    if (schedRef.current) {
      schedRef.current.activePads.clear();
      schedRef.current.pendingOn.clear();
      schedRef.current.pendingOff.clear();
    }
  };

  // Beat column indicator: 32 steps → 8 columns (4 steps each)
  const beatCol = currentStep >= 0 ? Math.floor(currentStep / 4) : -1;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start py-6 px-4"
      style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d22 100%)" }}
    >
      {/* Header */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#ffffff", textShadow: "0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.4)", fontFamily: "var(--font-display)" }}>
            🎛️ Beat Maker
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Mix loops — everything plays in tune at {bpm} BPM</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* BPM */}
          <div className="flex flex-col items-center gap-1">
            <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>BPM: {bpm}</label>
            <input type="range" min={70} max={180} value={bpm} onChange={e => setBpm(Number(e.target.value))}
              className="w-24 accent-purple-500" style={{ accentColor: "#a855f7" }} />
          </div>
          {/* Volume */}
          <div className="flex flex-col items-center gap-1">
            <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Vol: {Math.round(volume * 100)}%</label>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))}
              className="w-24" style={{ accentColor: "#06b6d4" }} />
          </div>
          {/* Clear */}
          <button onClick={clearAll}
            className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            Clear
          </button>
          {/* Play/Stop */}
          <button onClick={handlePlayStop}
            className="px-5 py-2 rounded-xl text-base font-bold transition-all"
            style={{
              background: isRunning ? "rgba(239,68,68,0.9)" : "rgba(168,85,247,0.9)",
              color: "#fff",
              border: isRunning ? "2px solid #ef4444" : "2px solid #a855f7",
              boxShadow: isRunning ? "0 0 18px rgba(239,68,68,0.6)" : "0 0 18px rgba(168,85,247,0.6)",
              minWidth: 80,
            }}>
            {isRunning ? "⏹ Stop" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* Beat indicator bar */}
      <div className="w-full max-w-4xl mb-4 flex gap-1">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-2 flex-1 rounded-full transition-all duration-75"
            style={{
              background: isRunning && beatCol === i ? "#ffffff" : "rgba(255,255,255,0.08)",
              boxShadow: isRunning && beatCol === i ? "0 0 12px rgba(255,255,255,0.9)" : "none",
            }} />
        ))}
      </div>

      {/* Rows */}
      <div className="w-full max-w-4xl flex flex-col gap-3">
        {ROWS.map(row => (
          <div key={row.id}
            className="rounded-2xl p-3 sm:p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${row.color}22` }}>
            {/* Row label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{row.emoji}</span>
              <span className="text-xs font-bold tracking-widest" style={{ color: row.color, textShadow: `0 0 8px ${row.color}88` }}>
                {row.label}
              </span>
            </div>
            {/* Pads grid */}
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
              {row.pads.map((pad, i) => {
                const active = activePads.has(pad.id);
                const pending = pendingPads.has(pad.id);
                const isBeat = isRunning && beatCol === i;
                return (
                  <button
                    key={pad.id}
                    onClick={() => togglePad(pad.id)}
                    className="relative flex flex-col items-center justify-center rounded-xl font-bold transition-all select-none"
                    style={{
                      aspectRatio: "1",
                      fontSize: "clamp(8px, 1.5vw, 11px)",
                      background: active
                        ? `linear-gradient(135deg, ${row.color}cc, ${row.color}88)`
                        : "rgba(255,255,255,0.05)",
                      border: active
                        ? `2px solid ${row.color}`
                        : `2px solid rgba(255,255,255,0.1)`,
                      color: active ? "#fff" : "rgba(255,255,255,0.4)",
                      boxShadow: active
                        ? `0 0 14px ${row.color}88, 0 0 28px ${row.color}44, inset 0 0 10px ${row.color}22`
                        : isBeat
                        ? `0 0 8px rgba(255,255,255,0.25)`
                        : "none",
                      transform: active ? "scale(0.97)" : "scale(1)",
                      outline: "none",
                      opacity: pending && !active ? 0.7 : 1,
                    }}>
                    {/* Pulse dot when active */}
                    {active && isRunning && isBeat && (
                      <span className="absolute inset-0 rounded-xl animate-ping"
                        style={{ background: `${row.color}33`, animationDuration: "0.3s" }} />
                    )}
                    <span className="relative z-10 px-1 text-center leading-tight">{pad.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <p className="mt-6 text-xs text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
        Tap pads to toggle loops — new loops snap to the next bar
      </p>
    </div>
  );
}
