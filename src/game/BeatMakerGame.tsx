import { useRef, useState, useEffect, useCallback } from "react";

// ─── Note frequencies ─────────────────────────────────────────────────────────
const NF: Record<string, number> = {
  E2:82.41,F2:87.31,Gb2:92.50,G2:98.00,Ab2:103.83,A2:110.00,Bb2:116.54,B2:123.47,
  C1:32.70,D1:36.71,Eb1:38.89,F1:43.65,G1:49.00,Bb1:58.27,
  C2:65.41,D2:73.42,Eb2:77.78,
  C3:130.81,D3:146.83,Eb3:155.56,F3:174.61,G3:196.00,Ab3:207.65,Bb3:233.08,B3:246.94,
  C4:261.63,D4:293.66,Eb4:311.13,F4:349.23,G4:392.00,Ab4:415.30,Bb4:466.16,B4:493.88,
  C5:523.25,D5:587.33,Eb5:622.25,F5:698.46,G5:784.00,A5:880.00,Bb5:932.33,
};

// ─── Synthesis helpers ────────────────────────────────────────────────────────
function osc(ctx: AudioContext, t: number, dest: AudioNode, type: OscillatorType, freq: number, dur: number, vel: number) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
}

function noise(ctx: AudioContext, t: number, dest: AudioNode, dur: number, ffreq: number, ftype: BiquadFilterType, fQ: number, vel: number) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource(); ns.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = ffreq; f.Q.value = fQ;
  const g = ctx.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  ns.connect(f); f.connect(g); g.connect(dest); ns.start(t); ns.stop(t + dur);
}

// step is passed to every PlayFn; loop instruments use it, others ignore it
type PlayFn = (ctx: AudioContext, t: number, dest: AudioNode, sd: number, step: number) => void;

// ─── Drums ────────────────────────────────────────────────────────────────────
function mkKick(bodyFreq = 155, click = true): PlayFn {
  return (ctx, t, dest) => {
    if (click) osc(ctx, t, dest, "square", 700, 0.018, 0.3);
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(bodyFreq, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.45);
    g.gain.setValueAtTime(1.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.5);
  };
}
function mkKick808(): PlayFn {
  return (ctx, t, dest) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.7);
    g.gain.setValueAtTime(1.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.75);
    osc(ctx, t, dest, "square", 400, 0.02, 0.25);
  };
}
function mkSnare(noiseFreq = 2500, vel = 0.9): PlayFn {
  return (ctx, t, dest) => {
    osc(ctx, t, dest, "triangle", 200, 0.14, 0.65);
    noise(ctx, t, dest, 0.22, noiseFreq, "bandpass", 0.8, vel);
  };
}
function mkSnareRim(): PlayFn {
  return (ctx, t, dest) => {
    osc(ctx, t, dest, "triangle", 380, 0.07, 0.7);
    noise(ctx, t, dest, 0.06, 3000, "bandpass", 1.5, 0.6);
  };
}
function mkHihat(open = false, vel = 0.35): PlayFn {
  return (ctx, t, dest) => { noise(ctx, t, dest, open ? 0.22 : 0.04, 8000, "highpass", 1, vel); };
}
function mkClap(tight = false): PlayFn {
  return (ctx, t, dest) => {
    for (let i = 0; i < (tight ? 2 : 3); i++) noise(ctx, t + i * (tight ? 0.007 : 0.01), dest, tight ? 0.05 : 0.07, 1200, "bandpass", 0.5, 0.65);
  };
}
function mkCowbell(): PlayFn {
  return (ctx, t, dest) => { osc(ctx, t, dest, "square", 562, 0.35, 0.45); osc(ctx, t, dest, "square", 845, 0.25, 0.3); };
}
function mkRimshot(): PlayFn {
  return (ctx, t, dest) => { osc(ctx, t, dest, "triangle", 400, 0.065, 0.75); noise(ctx, t, dest, 0.05, 2500, "bandpass", 1.5, 0.5); };
}
function mkShaker(): PlayFn { return (ctx, t, dest) => { noise(ctx, t, dest, 0.06, 9000, "highpass", 0.5, 0.22); }; }
function mkTambourine(): PlayFn {
  return (ctx, t, dest) => { for (let i = 0; i < 4; i++) noise(ctx, t + i * 0.015, dest, 0.04, 7000, "highpass", 1, 0.2); };
}
function mkWoodblock(): PlayFn {
  return (ctx, t, dest) => { osc(ctx, t, dest, "square", 1200, 0.06, 0.6); osc(ctx, t, dest, "square", 1500, 0.04, 0.35); };
}
function mkTom(freq = 200): PlayFn {
  return (ctx, t, dest) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.25);
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.28);
    noise(ctx, t, dest, 0.04, 800, "bandpass", 1, 0.3);
  };
}

// ─── Bass (5 timbres × notes) ─────────────────────────────────────────────────
function mkSubBass(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 65.41; const dur = sd * 0.9;
    osc(ctx, t, dest, "sine", f, dur, 0.95);
    osc(ctx, t, dest, "sine", f * 2, dur * 0.4, 0.12);
  };
}
function mkSawBass(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 65.41; const dur = sd * 0.85;
    const o = ctx.createOscillator(); const filt = ctx.createBiquadFilter(); const g = ctx.createGain();
    o.type = "sawtooth"; filt.type = "lowpass"; filt.frequency.value = 700; filt.Q.value = 1.5;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.75, t); g.gain.setValueAtTime(0.5, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(filt); filt.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
    osc(ctx, t, dest, "sine", f / 2, dur, 0.4);
  };
}
function mkMoogBass(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 65.41; const dur = sd * 0.85;
    const o = ctx.createOscillator(); const filt = ctx.createBiquadFilter(); const g = ctx.createGain();
    o.type = "sawtooth"; filt.type = "lowpass"; filt.Q.value = 9;
    filt.frequency.setValueAtTime(f * 9, t); filt.frequency.exponentialRampToValueAtTime(f * 1.4, t + 0.1);
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.8, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(filt); filt.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
  };
}
function mkSlapBass(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 65.41;
    // Thumb slap transient
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(f * 4, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.025);
    g.gain.setValueAtTime(1.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.09);
    noise(ctx, t, dest, 0.012, f * 6, "highpass", 1, 0.4);
    // Body note
    osc(ctx, t + 0.015, dest, "sine", f, sd * 0.65, 0.6);
    osc(ctx, t + 0.015, dest, "sine", f * 2, sd * 0.4, 0.18);
  };
}
function mkPickedBass(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 65.41; const dur = Math.min(sd * 0.55, 0.22);
    // Pick click
    noise(ctx, t, dest, 0.008, f * 5, "bandpass", 2, 0.28);
    osc(ctx, t, dest, "triangle", f, dur, 0.65);
    osc(ctx, t, dest, "triangle", f * 2, dur * 0.5, 0.18);
    osc(ctx, t, dest, "sine", f / 2, dur * 0.8, 0.3);
  };
}
function mkFuzzBass(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 65.41; const dur = sd * 0.8;
    osc(ctx, t, dest, "square", f, dur, 0.32);
    osc(ctx, t, dest, "sawtooth", f, dur, 0.22);
    osc(ctx, t, dest, "sawtooth", f * 1.01, dur, 0.18); // detune for grit
    osc(ctx, t, dest, "sine", f / 2, dur, 0.28);
  };
}

// ─── Guitar ───────────────────────────────────────────────────────────────────
function mkGuitarClean(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 196.0; const dur = sd * 1.8;
    // Pick transient
    noise(ctx, t, dest, 0.012, f * 3, "bandpass", 2, 0.22);
    // Fundamental + harmonics (simulate string)
    osc(ctx, t, dest, "triangle", f, dur, 0.38);
    osc(ctx, t, dest, "triangle", f * 2, dur * 0.65, 0.16);
    osc(ctx, t, dest, "sine", f * 3, dur * 0.45, 0.07);
    osc(ctx, t, dest, "sine", f * 4, dur * 0.3, 0.04);
  };
}
function mkGuitarMuted(note: string): PlayFn {
  return (ctx, t, dest) => {
    const f = NF[note] ?? 196.0; const dur = 0.08;
    noise(ctx, t, dest, 0.015, f * 2, "bandpass", 1.5, 0.35);
    osc(ctx, t, dest, "triangle", f, dur, 0.5);
    osc(ctx, t, dest, "triangle", f * 2, dur * 0.5, 0.2);
  };
}
function mkGuitarPowerChord(note: string): PlayFn {
  // Root + perfect 5th + octave, slight strum delay
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 98.0; const dur = sd * 1.5;
    [[f, 0], [f * 1.5, 0.01], [f * 2, 0.02]].forEach(([freq, delay]) => {
      noise(ctx, t + delay, dest, 0.01, freq * 2, "bandpass", 2, 0.18);
      osc(ctx, t + delay, dest, "sawtooth", freq as number, dur, 0.22);
    });
  };
}
function mkGuitarWah(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 196.0; const dur = sd * 1.2;
    const o = ctx.createOscillator(); const filt = ctx.createBiquadFilter(); const g = ctx.createGain();
    o.type = "sawtooth"; filt.type = "bandpass"; filt.Q.value = 6;
    o.frequency.setValueAtTime(f, t);
    filt.frequency.setValueAtTime(300, t); filt.frequency.linearRampToValueAtTime(2400, t + dur * 0.6); filt.frequency.linearRampToValueAtTime(400, t + dur);
    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(filt); filt.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
  };
}
function mkGuitarHarmonic(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 392.0; const dur = sd * 2.5;
    // Natural harmonic — pure sine, bell-like
    osc(ctx, t, dest, "sine", f * 2, dur, 0.28);
    osc(ctx, t, dest, "sine", f * 4, dur * 0.6, 0.08);
  };
}
function mkGuitarSlide(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 196.0; const dur = sd * 1.5;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(f * 0.75, t); o.frequency.linearRampToValueAtTime(f, t + 0.06);
    g.gain.setValueAtTime(0.42, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
    osc(ctx, t, dest, "triangle", f * 2, dur * 0.7, 0.12);
  };
}

// ─── Synth ────────────────────────────────────────────────────────────────────
function mkSynthNote(note: string, type: OscillatorType = "square"): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 261.63; const dur = sd * 0.75;
    osc(ctx, t, dest, type, f, dur, 0.3);
    osc(ctx, t, dest, type, f * 1.005, dur * 0.9, 0.15);
  };
}
function mkSynthPad(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const f = NF[note] ?? 261.63; const dur = sd * 3;
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain();
    o1.type = "sine"; o1.frequency.setValueAtTime(f, t);
    o2.type = "sine"; o2.frequency.setValueAtTime(f * 1.002, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.12);
    g.gain.setValueAtTime(0.18, t + dur - 0.15); g.gain.linearRampToValueAtTime(0, t + dur);
    o1.connect(g); o2.connect(g); g.connect(dest);
    o1.start(t); o1.stop(t + dur); o2.start(t); o2.stop(t + dur);
  };
}
function mkChordStab(note: string): PlayFn {
  return (ctx, t, dest, sd) => {
    const root = NF[note] ?? 261.63; const dur = sd * 0.5;
    [[root, 0.28], [root * 1.189, 0.22], [root * 1.498, 0.2]].forEach(([f, v]) => osc(ctx, t, dest, "square", f as number, dur, v as number));
  };
}

// ─── Percussion ───────────────────────────────────────────────────────────────
function mkPercNote(note: string, type: OscillatorType): PlayFn {
  return (ctx, t, dest) => { osc(ctx, t, dest, type, NF[note] ?? 200, 0.15, 0.6); noise(ctx, t, dest, 0.06, 1000, "bandpass", 1, 0.3); };
}

// ─── Effects ──────────────────────────────────────────────────────────────────
function mkSweepUp(): PlayFn {
  return (ctx, t, dest, sd) => {
    const dur = sd * 4;
    const o = ctx.createOscillator(); const f = ctx.createBiquadFilter(); const g = ctx.createGain();
    o.type = "sawtooth"; f.type = "bandpass"; f.Q.value = 5;
    o.frequency.setValueAtTime(100, t); o.frequency.linearRampToValueAtTime(4000, t + dur);
    f.frequency.setValueAtTime(100, t); f.frequency.linearRampToValueAtTime(4000, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28, t + dur * 0.8); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
  };
}
function mkSweepDown(): PlayFn {
  return (ctx, t, dest, sd) => {
    const dur = sd * 4;
    const o = ctx.createOscillator(); const f = ctx.createBiquadFilter(); const g = ctx.createGain();
    o.type = "sawtooth"; f.type = "bandpass"; f.Q.value = 5;
    o.frequency.setValueAtTime(4000, t); o.frequency.linearRampToValueAtTime(100, t + dur);
    f.frequency.setValueAtTime(4000, t); f.frequency.linearRampToValueAtTime(100, t + dur);
    g.gain.setValueAtTime(0.28, t); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
  };
}
function mkRiser(): PlayFn {
  return (ctx, t, dest, sd) => {
    const dur = sd * 8;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(80, t); o.frequency.linearRampToValueAtTime(1200, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35, t + dur * 0.9); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
  };
}
function mkZap(): PlayFn {
  return (ctx, t, dest) => { osc(ctx, t, dest, "sawtooth", 1800, 0.12, 0.25); osc(ctx, t + 0.03, dest, "sawtooth", 900, 0.08, 0.18); };
}
function mkWhoosh(): PlayFn {
  return (ctx, t, dest, sd) => {
    const dur = sd * 2;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 3;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4000, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    ns.connect(f); f.connect(g); g.connect(dest); ns.start(t); ns.stop(t + dur);
  };
}
function mkShimmer(): PlayFn {
  return (ctx, t, dest) => {
    [NF.C5, NF.Eb5, NF.G5].forEach(f => osc(ctx, t, dest, "sine", f * (1 + (Math.random() - 0.5) * 0.02), 0.4, 0.1));
  };
}
function mkDrone(): PlayFn {
  return (ctx, t, dest, sd) => { osc(ctx, t, dest, "sawtooth", 32, sd * 4, 0.3); osc(ctx, t, dest, "sine", 16, sd * 4, 0.2); };
}
function mkCrackle(): PlayFn {
  return (ctx, t, dest) => { if (Math.random() < 0.6) noise(ctx, t, dest, 0.06 + Math.random() * 0.06, 1000 + Math.random() * 3000, "bandpass", 1, 0.06); };
}
function mkReverbWash(): PlayFn {
  return (ctx, t, dest, sd) => { noise(ctx, t, dest, sd * 3, 2000, "bandpass", 0.5, 0.15); osc(ctx, t, dest, "sine", NF.C4, sd * 3, 0.08); };
}

// ─── LOOPS: each step plays a different note from a sequence ──────────────────
// The step index determines which note in the melody fires
function mkLoop(sequence: (string | null)[], type: OscillatorType = "square", vel = 0.28): PlayFn {
  return (ctx, t, dest, sd, step) => {
    const note = sequence[step % sequence.length];
    if (!note) return;
    const f = NF[note] ?? 261.63;
    const dur = sd * 0.72;
    osc(ctx, t, dest, type, f, dur, vel);
    osc(ctx, t, dest, type, f * 1.005, dur * 0.85, vel * 0.5);
  };
}
function mkLoopPluck(sequence: (string | null)[]): PlayFn {
  return (ctx, t, dest, sd, step) => {
    const note = sequence[step % sequence.length];
    if (!note) return;
    const f = NF[note] ?? 261.63;
    const dur = sd * 1.4;
    noise(ctx, t, dest, 0.01, f * 3, "bandpass", 2, 0.2);
    osc(ctx, t, dest, "triangle", f, dur, 0.35);
    osc(ctx, t, dest, "triangle", f * 2, dur * 0.6, 0.14);
    osc(ctx, t, dest, "sine", f * 3, dur * 0.35, 0.06);
  };
}
function mkLoopBass(sequence: (string | null)[]): PlayFn {
  return (ctx, t, dest, sd, step) => {
    const note = sequence[step % sequence.length];
    if (!note) return;
    const f = NF[note] ?? 65.41;
    const dur = sd * 0.82;
    const o = ctx.createOscillator(); const filt = ctx.createBiquadFilter(); const g = ctx.createGain();
    o.type = "sawtooth"; filt.type = "lowpass"; filt.frequency.value = 600; filt.Q.value = 2;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(filt); filt.connect(g); g.connect(dest); o.start(t); o.stop(t + dur);
    osc(ctx, t, dest, "sine", f / 2, dur, 0.38);
  };
}
function mkLoopPad(sequence: (string | null)[]): PlayFn {
  return (ctx, t, dest, sd, step) => {
    const note = sequence[step % sequence.length];
    if (!note) return;
    const f = NF[note] ?? 261.63; const dur = sd * 3.5;
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain();
    o1.type = "sine"; o1.frequency.setValueAtTime(f, t);
    o2.type = "sine"; o2.frequency.setValueAtTime(f * 1.002, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + 0.1);
    g.gain.setValueAtTime(0.15, t + dur - 0.15); g.gain.linearRampToValueAtTime(0, t + dur);
    o1.connect(g); o2.connect(g); g.connect(dest);
    o1.start(t); o1.stop(t + dur); o2.start(t); o2.stop(t + dur);
  };
}

// ─── Instrument catalog ───────────────────────────────────────────────────────
interface Instrument { id: string; label: string; group?: string; play: PlayFn; }

const DRUMS_CATALOG: Instrument[] = [
  { id:"kick1",     label:"Kick 1",        play:mkKick(155) },
  { id:"kick808",   label:"Kick 808",       play:mkKick808() },
  { id:"kick3",     label:"Kick Punchy",    play:mkKick(200, false) },
  { id:"snare1",    label:"Snare",          play:mkSnare() },
  { id:"snare2",    label:"Snare Snappy",   play:mkSnare(4000, 0.7) },
  { id:"snare_rim", label:"Snare Rim",      play:mkSnareRim() },
  { id:"hihat_c",   label:"Hi-Hat Closed",  play:mkHihat(false, 0.32) },
  { id:"hihat_o",   label:"Hi-Hat Open",    play:mkHihat(true, 0.3) },
  { id:"clap1",     label:"Clap",           play:mkClap() },
  { id:"clap2",     label:"Clap Tight",     play:mkClap(true) },
  { id:"rimshot",   label:"Rimshot",        play:mkRimshot() },
  { id:"cowbell",   label:"Cowbell",        play:mkCowbell() },
  { id:"shaker",    label:"Shaker",         play:mkShaker() },
  { id:"tambourine",label:"Tambourine",     play:mkTambourine() },
  { id:"woodblock", label:"Woodblock",      play:mkWoodblock() },
  { id:"tom_hi",    label:"Tom High",       play:mkTom(280) },
  { id:"tom_lo",    label:"Tom Low",        play:mkTom(130) },
];

// Bass: 6 timbres × 14 notes
const BASS_NOTES = ["C1","D1","Eb1","F1","G1","Bb1","C2","D2","Eb2","F2","G2","Ab2","Bb2","C3","Eb3","G3"];
const BASS_CATALOG: Instrument[] = [
  ...BASS_NOTES.map(n => ({ id:`sub_${n}`,    label:n, group:"Sub Bass",    play:mkSubBass(n) })),
  ...BASS_NOTES.map(n => ({ id:`saw_${n}`,    label:n, group:"Saw Bass",    play:mkSawBass(n) })),
  ...BASS_NOTES.map(n => ({ id:`moog_${n}`,   label:n, group:"Moog Bass",   play:mkMoogBass(n) })),
  ...BASS_NOTES.map(n => ({ id:`slap_${n}`,   label:n, group:"Slap Bass",   play:mkSlapBass(n) })),
  ...BASS_NOTES.map(n => ({ id:`pick_${n}`,   label:n, group:"Picked Bass", play:mkPickedBass(n) })),
  ...BASS_NOTES.map(n => ({ id:`fuzz_${n}`,   label:n, group:"Fuzz Bass",   play:mkFuzzBass(n) })),
];

// Guitar: notes across fretboard + sound types
const GTR_NOTES = ["E2","F2","G2","Ab2","A2","Bb2","B2","C3","D3","Eb3","E3","F3","G3","A3","B3","C4","D4","E4","G4"];
const GTR_CHORD_ROOTS = ["E2","A2","D3","G3","C3","F3","G2","C3","Eb3"];
const GUITAR_CATALOG: Instrument[] = [
  ...GTR_NOTES.map(n => ({ id:`gclean_${n}`,  label:n, group:"Clean",       play:mkGuitarClean(n) })),
  ...GTR_NOTES.map(n => ({ id:`gmute_${n}`,   label:n, group:"Muted",       play:mkGuitarMuted(n) })),
  ...GTR_NOTES.map(n => ({ id:`gwah_${n}`,    label:n, group:"Wah",         play:mkGuitarWah(n) })),
  ...GTR_NOTES.map(n => ({ id:`gslide_${n}`,  label:n, group:"Slide",       play:mkGuitarSlide(n) })),
  ...GTR_NOTES.map(n => ({ id:`gharm_${n}`,   label:n, group:"Harmonic",    play:mkGuitarHarmonic(n) })),
  ...GTR_CHORD_ROOTS.map(n => ({ id:`gpow_${n}`, label:n, group:"Power Chord", play:mkGuitarPowerChord(n) })),
];

// Synth catalog
const SYNTH_NOTES_SQ  = ["C3","Eb3","G3","Bb3","C4","D4","Eb4","F4","G4","Ab4","Bb4","C5","Eb5","G5"];
const SYNTH_NOTES_SAW = ["C3","Eb3","G3","C4","Eb4","G4","Bb4","C5"];
const SYNTH_NOTES_TRI = ["C4","Eb4","G4","Bb4","C5","Eb5"];
const SYNTH_CHORD     = ["C4","Eb4","F4","G4","Bb4","C5"];
const SYNTH_PAD_NOTES = ["C3","Eb3","G3","Bb3","C4","Eb4","G4"];
const SYNTH_CATALOG: Instrument[] = [
  ...SYNTH_NOTES_SQ.map(n  => ({ id:`sq_${n}`,   label:n, group:"Square",   play:mkSynthNote(n,"square") })),
  ...SYNTH_NOTES_SAW.map(n => ({ id:`saw_${n}`,  label:n, group:"Saw",      play:mkSynthNote(n,"sawtooth") })),
  ...SYNTH_NOTES_TRI.map(n => ({ id:`tri_${n}`,  label:n, group:"Triangle", play:mkSynthNote(n,"triangle") })),
  ...SYNTH_CHORD.map(n     => ({ id:`chd_${n}`,  label:n, group:"Stab",     play:mkChordStab(n) })),
  ...SYNTH_PAD_NOTES.map(n => ({ id:`pad_${n}`,  label:n, group:"Pad",      play:mkSynthPad(n) })),
];

// Loops catalog — melodic sequences; each step plays the note at that position
const LOOP_SEQS: Record<string, { label: string; notes: (string|null)[]; mkFn: (s:(string|null)[]) => PlayFn }> = {
  cm_arp:     { label:"Cm Arpeggio",      notes:["C4","Eb4","G4","Bb4","C5","Bb4","G4","Eb4","C4","Eb4","G4","Bb4","C5","Bb4","G4","Eb4"], mkFn:s=>mkLoop(s) },
  cm_scale:   { label:"Cm Scale",         notes:["C4","D4","Eb4","F4","G4","Ab4","Bb4","C5","Bb4","Ab4","G4","F4","Eb4","D4","C4",null], mkFn:s=>mkLoop(s,"triangle") },
  penta:      { label:"Pentatonic",       notes:["C4","Eb4","F4","G4","Bb4","C5","Bb4","G4","F4","Eb4","C4",null,"C4","Eb4","G4",null], mkFn:s=>mkLoop(s) },
  funk_hook:  { label:"Funk Hook",        notes:["C4","C4","Eb4","G4","Bb4","G4","Eb4","Bb3","C4","C4","Eb4","G4","Bb4","G4","F4","Eb4"], mkFn:s=>mkLoop(s,"sawtooth",0.22) },
  jazz_phrase:{ label:"Jazz Phrase",      notes:["C4","D4","Eb4","F4","G4","Bb4","C5","Bb4","G4","F4","Eb4","D4","C4","Bb3","G3","C4"], mkFn:s=>mkLoop(s,"triangle",0.25) },
  modal:      { label:"Modal Phrase",     notes:["C4","Eb4","F4","G4","Bb4","C5","Bb4","G4","C4","Eb4","F4","G4","Bb4","G4","Eb4","C4"], mkFn:s=>mkLoop(s) },
  disco:      { label:"Disco Hook",       notes:["G4","Bb4","C5","Bb4","G4","F4","Eb4","F4","G4","Bb4","C5","Bb4","G4","Eb4","F4","G4"], mkFn:s=>mkLoop(s) },
  pluck_arp:  { label:"Pluck Arpeggio",   notes:["C4","Eb4","G4","Bb4","C5","Bb4","G4","Eb4","C4","Eb4","G4","Bb4","C5","Bb4","G4","Eb4"], mkFn:s=>mkLoopPluck(s) },
  pluck_riff: { label:"Pluck Riff",       notes:["C4","Eb4","F4","G4","F4","Eb4","C4","Bb3","C4","Eb4","G4","Ab4","G4","F4","Eb4","C4"], mkFn:s=>mkLoopPluck(s) },
  bass_walk:  { label:"Bass Walk",        notes:["C2","D2","Eb2","F2","G2","Ab2","Bb2","C3","Bb2","Ab2","G2","F2","Eb2","D2","C2",null], mkFn:s=>mkLoopBass(s) },
  bass_funk:  { label:"Bass Funk",        notes:["C2","C2","Eb2","G2","Bb2","G2","Eb2","Bb1","C2","C2","Eb2","G2","Bb2","G2","F2","Eb2"], mkFn:s=>mkLoopBass(s) },
  bass_jump:  { label:"Bass Jump",        notes:["C2","C3","Eb2","G2","C3","G2","Eb2","C2","C2","C3","G2","Bb2","C3","Bb2","G2","Eb2"], mkFn:s=>mkLoopBass(s) },
  pad_flow:   { label:"Pad Flow",         notes:["C4","G4","Eb4","Bb4","C5","Bb4","G4","Eb4","C4","G4","Eb4","Bb4","C5","G4","Eb4","C4"], mkFn:s=>mkLoopPad(s) },
  gtr_riff:   { label:"Guitar Riff",      notes:["G3","Bb3","C4","Bb3","G3","F3","Eb3","F3","G3","Bb3","C4","D4","C4","Bb3","G3",null], mkFn:s=>mkLoopPluck(s) },
  gtr_minor:  { label:"Guitar Minor Run", notes:["E3","G3","A3","Bb3","A3","G3","E3","D3","E3","G3","A3","C4","A3","G3","E3",null], mkFn:s=>mkLoopPluck(s) },
};
const LOOPS_CATALOG: Instrument[] = Object.entries(LOOP_SEQS).map(([id, def]) => ({
  id, label: def.label, play: def.mkFn(def.notes),
}));

const PERC_CATALOG: Instrument[] = [
  { id:"p_rim",  label:"Rimshot",    play:mkRimshot() },
  { id:"p_cow",  label:"Cowbell",    play:mkCowbell() },
  { id:"p_wood", label:"Woodblock",  play:mkWoodblock() },
  { id:"p_shk",  label:"Shaker",     play:mkShaker() },
  { id:"p_tam",  label:"Tambourine", play:mkTambourine() },
  { id:"p_thi",  label:"Tom High",   play:mkTom(280) },
  { id:"p_tlo",  label:"Tom Low",    play:mkTom(130) },
  { id:"p_cga",  label:"Conga Hi",   play:mkPercNote("G3","triangle") },
  { id:"p_cgb",  label:"Conga Lo",   play:mkPercNote("D3","triangle") },
];
const FX_CATALOG: Instrument[] = [
  { id:"fx_sup", label:"Sweep ↑",     play:mkSweepUp() },
  { id:"fx_sdn", label:"Sweep ↓",     play:mkSweepDown() },
  { id:"fx_rsr", label:"Riser",       play:mkRiser() },
  { id:"fx_zap", label:"Zap",         play:mkZap() },
  { id:"fx_wsh", label:"Whoosh",      play:mkWhoosh() },
  { id:"fx_shm", label:"Shimmer",     play:mkShimmer() },
  { id:"fx_drn", label:"Sub Drone",   play:mkDrone() },
  { id:"fx_crk", label:"Crackle",     play:mkCrackle() },
  { id:"fx_rev", label:"Reverb Wash", play:mkReverbWash() },
];

const CATALOGS: Record<string, Instrument[]> = {
  drums: DRUMS_CATALOG,
  bass:  BASS_CATALOG,
  guitar:GUITAR_CATALOG,
  synth: SYNTH_CATALOG,
  loops: LOOPS_CATALOG,
  perc:  PERC_CATALOG,
  fx:    FX_CATALOG,
};

// ─── Sections ─────────────────────────────────────────────────────────────────
interface Section { id: string; label: string; emoji: string; color: string; }
const SECTIONS: Section[] = [
  { id:"drums",  label:"DRUMS",      emoji:"🥁", color:"#f97316" },
  { id:"bass",   label:"BASS",       emoji:"🎸", color:"#a855f7" },
  { id:"guitar", label:"GUITAR",     emoji:"🎸", color:"#f59e0b" },
  { id:"synth",  label:"SYNTH",      emoji:"🎹", color:"#06b6d4" },
  { id:"loops",  label:"LOOPS",      emoji:"🔄", color:"#22d3ee" },
  { id:"perc",   label:"PERCUSSION", emoji:"🪘", color:"#22c55e" },
  { id:"fx",     label:"EFFECTS",    emoji:"✨", color:"#ec4899" },
];

interface TrackRow { id: string; sectionId: string; instrumentId: string; steps: boolean[]; muted: boolean; solo: boolean; volume: number; }
let _rowId = 0;
function mkRow(sectionId: string, instrumentId: string, steps?: boolean[]): TrackRow {
  return { id:`row_${_rowId++}`, sectionId, instrumentId, steps: steps ?? Array(16).fill(false), muted: false, solo: false, volume: 1 };
}

const B = (n: number[]) => Array(16).fill(false).map((_,i) => n.includes(i));
const DEFAULT_ROWS: TrackRow[] = [
  // Drums
  mkRow("drums","kick1",      B([0,8])),
  mkRow("drums","snare1",     B([4,12])),
  mkRow("drums","hihat_c",    B([0,2,4,6,8,10,12,14])),
  mkRow("drums","hihat_o",    B([6,14])),
  mkRow("drums","clap1",      B([4,12])),
  // Bass
  mkRow("bass","sub_C2",      B([0])),
  mkRow("bass","sub_G2",      B([8])),
  mkRow("bass","moog_Eb2"),
  // Guitar
  mkRow("guitar","gclean_G3"),
  mkRow("guitar","gmute_E2"),
  // Synth
  mkRow("synth","sq_C4",      B([0,6,14])),
  mkRow("synth","sq_Eb4",     B([4,12])),
  mkRow("synth","sq_G4"),
  // Loops - all 16 steps on so you hear the full melody
  mkRow("loops","cm_arp",     Array(16).fill(true)),
  mkRow("loops","bass_walk"),
  // Perc
  mkRow("perc","p_rim"),
  mkRow("perc","p_cow"),
  // FX
  mkRow("fx","fx_zap"),
  mkRow("fx","fx_shm"),
];

// ─── Scheduler ────────────────────────────────────────────────────────────────
const STEPS = 16;
const LOOKAHEAD = 0.12;
const SCHED_MS = 25;
function stepDur(bpm: number) { return (60 / bpm) / 4; }
interface EngineState { ctx: AudioContext; masterGain: GainNode; nextStepTime: number; currentStep: number; bpm: number; }

// ─── Quick patterns ───────────────────────────────────────────────────────────
const QUICK_PATTERNS: Record<string, {label:string; pattern:number[]}[]> = {
  drums: [
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {label:"8th notes",   pattern:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {label:"16th notes",  pattern:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {label:"Backbeat 2+4",pattern:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    {label:"Beats 1+3",   pattern:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
    {label:"Offbeat 8ths",pattern:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
    {label:"Shuffle",     pattern:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]},
  ],
  bass:  [
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {label:"Beats 1+3",   pattern:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
    {label:"Backbeat",    pattern:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    {label:"Walking 8ths",pattern:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {label:"Reggae",      pattern:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0]},
  ],
  guitar:[
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {label:"8th notes",   pattern:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {label:"Backbeat",    pattern:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    {label:"Strum down",  pattern:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]},
    {label:"Syncopated",  pattern:[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0]},
  ],
  synth: [
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {label:"Syncopated",  pattern:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
    {label:"Offbeat",     pattern:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
    {label:"Sparse",      pattern:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]},
  ],
  loops: [
    {label:"All steps",   pattern:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {label:"8th notes",   pattern:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {label:"Syncopated",  pattern:[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0]},
    {label:"Sparse",      pattern:[1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0]},
  ],
  perc:  [
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {label:"8th notes",   pattern:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
    {label:"Offbeat",     pattern:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
  ],
  fx:    [
    {label:"Bar start",   pattern:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
    {label:"Half bars",   pattern:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
    {label:"Every beat",  pattern:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
  ],
};

// ─── Main component ───────────────────────────────────────────────────────────
export function BeatMakerGame() {
  const [rows, setRows] = useState<TrackRow[]>(DEFAULT_ROWS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(0.8);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    perc: true, fx: true,
  });

  const engineRef = useRef<EngineState | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const rowsRef   = useRef(rows);
  const volRef    = useRef(volume);
  const bpmRef    = useRef(bpm);

  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { volRef.current = volume; if (engineRef.current) engineRef.current.masterGain.gain.setTargetAtTime(volume, engineRef.current.ctx.currentTime, 0.01); }, [volume]);
  useEffect(() => { bpmRef.current = bpm; if (engineRef.current) engineRef.current.bpm = bpm; }, [bpm]);

  const startEngine = useCallback(() => {
    if (engineRef.current) return;
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volRef.current, ctx.currentTime);
    masterGain.connect(ctx.destination);
    engineRef.current = { ctx, masterGain, nextStepTime: ctx.currentTime + 0.05, currentStep: 0, bpm: bpmRef.current };
  }, []);

  useEffect(() => {
    if (!isRunning) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; return; }
    startEngine();
    timerRef.current = setInterval(() => {
      const eng = engineRef.current; if (!eng) return;
      const sd = stepDur(eng.bpm);
      while (eng.nextStepTime < eng.ctx.currentTime + LOOKAHEAD) {
        const step = eng.currentStep;
        const anySolo = rowsRef.current.some(r => r.solo);
        rowsRef.current.forEach(row => {
          if (row.muted || !row.steps[step]) return;
          if (anySolo && !row.solo) return;
          const instr = CATALOGS[row.sectionId]?.find(i => i.id === row.instrumentId);
          // Per-track gain: insert a transient GainNode so PlayFns need no changes
          const tg = eng.ctx.createGain();
          tg.gain.value = row.volume;
          tg.connect(eng.masterGain);
          instr?.play(eng.ctx, eng.nextStepTime, tg, sd, step);
        });
        setCurrentStep(step);
        eng.currentStep = (step + 1) % STEPS;
        eng.nextStepTime += sd;
      }
    }, SCHED_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, startEngine]);

  const handlePlayStop = () => {
    if (!isRunning) {
      startEngine();
      const eng = engineRef.current!;
      eng.nextStepTime = eng.ctx.currentTime + 0.05;
      eng.currentStep = 0;
    } else { setCurrentStep(-1); }
    setIsRunning(r => !r);
  };

  const toggleStep     = (id: string, s: number) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, steps: r.steps.map((v,i) => i===s ? !v : v) }));
  const setInstrument  = (id: string, iid: string) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, instrumentId: iid }));
  const toggleMute     = (id: string) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, muted: !r.muted }));
  const toggleSolo     = (id: string) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, solo: !r.solo }));
  const setRowVolume   = (id: string, v: number) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, volume: v }));
  const clearRow       = (id: string) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, steps: Array(16).fill(false) }));
  const previewInstrument = useCallback((sectionId: string, instrumentId: string) => {
    if (!engineRef.current) startEngine();
    const eng = engineRef.current!;
    const instr = CATALOGS[sectionId]?.find(i => i.id === instrumentId);
    if (!instr) return;
    const tNow = eng.ctx.currentTime + 0.01;
    if (sectionId === "loops") {
      // Play 4 steps at real tempo so you hear the melody shape
      const sd = stepDur(eng.bpm);
      for (let s = 0; s < 4; s++) {
        const tg = eng.ctx.createGain(); tg.gain.value = 0.7; tg.connect(eng.masterGain);
        instr.play(eng.ctx, tNow + s * sd, tg, sd, s);
      }
    } else {
      // Use a fixed 0.5s sd so sustained notes (bass, synth, guitar) ring out clearly
      const tg = eng.ctx.createGain(); tg.gain.value = 0.7; tg.connect(eng.masterGain);
      instr.play(eng.ctx, tNow, tg, 0.5, 0);
    }
  }, [startEngine]);
  const removeRow      = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const fillRow        = (id: string, p: number[]) => setRows(prev => prev.map(r => r.id !== id ? r : { ...r, steps: p.map(Boolean) }));
  const addRow         = (sectionId: string) => {
    const first = CATALOGS[sectionId]?.[0]?.id ?? "";
    setRows(prev => {
      const lastIdx = prev.map((r,i) => r.sectionId===sectionId ? i : -1).filter(i=>i>=0).pop() ?? prev.length-1;
      const next = [...prev]; next.splice(lastIdx+1, 0, mkRow(sectionId, first)); return next;
    });
  };
  const clearAll = () => setRows(prev => prev.map(r => ({ ...r, steps: Array(16).fill(false) })));

  const sectionRows = (id: string) => rows.filter(r => r.sectionId === id);

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-5 px-3"
      style={{ background:"linear-gradient(180deg,#12111f 0%,#16142e 100%)", fontFamily:"var(--font-display)" }}>

      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color:"#fff", textShadow:"0 0 24px #a855f788,0 0 48px #a855f744" }}>
            🎛️ Beat Maker
          </h1>
          <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>
            Step sequencer · C minor · {bpm} BPM · Loops play a different note per step
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.45)" }}>BPM {bpm}</span>
            <input type="range" min={60} max={200} value={bpm} onChange={e=>setBpm(+e.target.value)} className="w-20" style={{ accentColor:"#a855f7" }} />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.45)" }}>VOL {Math.round(volume*100)}%</span>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e=>setVolume(+e.target.value)} className="w-20" style={{ accentColor:"#06b6d4" }} />
          </div>
          <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.12)" }}>
            Clear All
          </button>
          <button onClick={handlePlayStop} className="px-5 py-2 rounded-xl text-sm font-black"
            style={{ background:isRunning?"#ef4444":"#a855f7", color:"#fff", minWidth:80, boxShadow:isRunning?"0 0 20px #ef444488":"0 0 20px #a855f788", border:`2px solid ${isRunning?"#ef4444":"#a855f7"}` }}>
            {isRunning ? "⏹ Stop" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="w-full max-w-5xl flex flex-col gap-4">
        {SECTIONS.map(section => {
          const secRows = sectionRows(section.id);
          const isCollapsed = collapsed[section.id];
          return (
            <div key={section.id} className="rounded-2xl overflow-hidden"
              style={{ border:`1px solid ${section.color}22`, background:"rgba(255,255,255,0.025)" }}>
              <button onClick={() => setCollapsed(c => ({...c,[section.id]:!c[section.id]}))}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                style={{ background:`${section.color}18` }}>
                <span className="flex items-center gap-2">
                  <span className="text-base">{section.emoji}</span>
                  <span className="text-xs font-black tracking-widest" style={{ color:section.color, textShadow:`0 0 8px ${section.color}88` }}>
                    {section.label}
                  </span>
                  {section.id === "loops" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background:`${section.color}33`, color:section.color }}>
                      each step = different note
                    </span>
                  )}
                  <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>
                    {secRows.length} track{secRows.length !== 1 ? "s" : ""}
                  </span>
                </span>
                <span className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{isCollapsed ? "▶" : "▼"}</span>
              </button>

              {!isCollapsed && (
                <div className="px-3 pb-3 pt-2">
                  {/* Beat numbers */}
                  <div className="flex items-center gap-1 mb-2 pl-[234px]">
                    {Array.from({length:16},(_,i)=>i).map(i => (
                      <div key={i} className="flex-1 text-center text-[9px] font-bold select-none"
                        style={{
                          color: isRunning && currentStep===i ? "#fff" : (i+1)%4===1 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)",
                          textShadow: isRunning && currentStep===i ? "0 0 8px #fff" : "none",
                        }}>
                        {i+1}
                      </div>
                    ))}
                    <div className="w-[44px] sm:w-[52px]" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {secRows.map(row => (
                      <TrackRowView key={row.id} row={row}
                        catalog={CATALOGS[section.id] ?? []}
                        currentStep={currentStep} isRunning={isRunning}
                        sectionColor={section.color} sectionId={section.id}
                        onToggleStep={toggleStep} onSetInstrument={setInstrument}
                        onToggleMute={toggleMute} onToggleSolo={toggleSolo} onClear={clearRow}
                        onRemove={removeRow} onFill={fillRow} onSetVolume={setRowVolume}
                        onPreview={previewInstrument} />
                    ))}
                  </div>

                  <button onClick={() => addRow(section.id)}
                    className="mt-2 ml-[234px] px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.35)", border:"1px dashed rgba(255,255,255,0.15)" }}>
                    ＋ Add track
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[10px]" style={{ color:"rgba(255,255,255,0.2)" }}>
        Loops section: enable step buttons to choose which beats play — the pitch changes each step based on the melody
      </p>
    </div>
  );
}

// ─── Track row view ───────────────────────────────────────────────────────────
interface TrackRowViewProps {
  row: TrackRow; catalog: Instrument[]; currentStep: number; isRunning: boolean;
  sectionColor: string; sectionId: string;
  onToggleStep:(id:string,s:number)=>void; onSetInstrument:(id:string,iid:string)=>void;
  onToggleMute:(id:string)=>void; onToggleSolo:(id:string)=>void; onClear:(id:string)=>void;
  onRemove:(id:string)=>void; onFill:(id:string,p:number[])=>void;
  onSetVolume:(id:string,v:number)=>void;
  onPreview:(sectionId:string,instrumentId:string)=>void;
}

function TrackRowView({ row, catalog, currentStep, isRunning, sectionColor, sectionId, onToggleStep, onSetInstrument, onToggleMute, onToggleSolo, onClear, onRemove, onFill, onSetVolume, onPreview }: TrackRowViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const patterns = QUICK_PATTERNS[sectionId] ?? [];

  useEffect(() => {
    if (!showMenu) return;
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showMenu]);

  return (
    <div className="flex items-center gap-1">
      {/* Left controls */}
      <div className="flex items-center gap-1 shrink-0" style={{ width:232, minWidth:232 }}>
        {/* Mute */}
        <button onClick={() => onToggleMute(row.id)}
          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
          title={row.muted ? "Unmute" : "Mute"}
          style={{ background:row.muted ? "rgba(255,255,255,0.08)" : sectionColor, border:`1px solid ${row.muted?"rgba(255,255,255,0.15)":sectionColor}`, boxShadow:row.muted?"none":`0 0 6px ${sectionColor}88` }}>
          <span style={{ fontSize:8, color:row.muted?"rgba(255,255,255,0.3)":"#fff" }}>{row.muted?"M":"●"}</span>
        </button>
        {/* Solo */}
        <button onClick={() => onToggleSolo(row.id)}
          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
          title={row.solo ? "Unsolo" : "Solo"}
          style={{ background: row.solo ? "#facc15" : "rgba(255,255,255,0.06)", border:`1px solid ${row.solo?"#facc15":"rgba(255,255,255,0.12)"}`, boxShadow: row.solo ? "0 0 6px #facc1588" : "none" }}>
          <span style={{ fontSize:8, fontWeight:"bold", color: row.solo ? "#000" : "rgba(255,255,255,0.35)" }}>S</span>
        </button>
        {/* Volume fader */}
        <div className="flex flex-col items-center shrink-0" style={{ width:52 }}>
          <span className="text-[8px] font-bold leading-none mb-0.5" style={{ color: row.muted ? "rgba(255,255,255,0.2)" : `${sectionColor}cc` }}>
            {Math.round(row.volume * 100)}
          </span>
          <input
            type="range" min={0} max={1} step={0.01}
            value={row.volume}
            onChange={e => onSetVolume(row.id, +e.target.value)}
            disabled={row.muted}
            title={`Volume: ${Math.round(row.volume * 100)}%`}
            style={{
              width: 50, accentColor: sectionColor,
              opacity: row.muted ? 0.3 : 1,
              cursor: row.muted ? "not-allowed" : "pointer",
            }}
          />
        </div>
        {/* Instrument dropdown + preview */}
        <div className="flex flex-1 min-w-0 items-center gap-0.5">
          <select value={row.instrumentId} onChange={e => onSetInstrument(row.id, e.target.value)}
            className="flex-1 min-w-0 rounded-lg px-1.5 py-1 text-[10px] font-bold truncate"
            style={{ background:"rgba(255,255,255,0.07)", color:row.muted?"rgba(255,255,255,0.3)":"#fff", border:`1px solid ${sectionColor}44`, outline:"none", cursor:"pointer" }}>
            {catalog.some(i => i.group)
              ? (() => {
                  const groups: {g:string; items:Instrument[]}[] = [];
                  catalog.forEach(i => {
                    const g = i.group ?? "";
                    const last = groups[groups.length-1];
                    if (last && last.g === g) last.items.push(i);
                    else groups.push({g, items:[i]});
                  });
                  return groups.map(({g, items}) => (
                    <optgroup key={g} label={g}>
                      {items.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                    </optgroup>
                  ));
                })()
              : catalog.map(i => <option key={i.id} value={i.id}>{i.label}</option>)
            }
          </select>
          <button
            onClick={() => onPreview(sectionId, row.instrumentId)}
            title="Preview sound"
            className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background:`${sectionColor}22`, border:`1px solid ${sectionColor}44`, color: sectionColor }}>
            <span style={{ fontSize:7, lineHeight:1 }}>▶</span>
          </button>
        </div>
      </div>

      {/* Steps */}
      {row.steps.map((active, step) => {
        const isCurrent = isRunning && currentStep === step;
        const groupEven = Math.floor(step/4) % 2 === 0;
        return (
          <button key={step} onClick={() => onToggleStep(row.id, step)}
            className="flex-1 rounded-md transition-all select-none"
            style={{
              aspectRatio:"1", minWidth:0,
              background: active ? `linear-gradient(135deg,${sectionColor}dd,${sectionColor}88)` : isCurrent ? "rgba(255,255,255,0.18)" : groupEven ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.035)",
              border: active ? `1.5px solid ${sectionColor}` : isCurrent ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid rgba(255,255,255,0.07)",
              boxShadow: active ? `0 0 10px ${sectionColor}77, inset 0 0 6px ${sectionColor}44` : isCurrent && !active ? "0 0 6px rgba(255,255,255,0.3)" : "none",
              opacity: row.muted ? 0.3 : 1,
            }} />
        );
      })}

      {/* Menu */}
      <div className="relative shrink-0 ml-0.5" ref={menuRef}>
        <button onClick={() => setShowMenu(s=>!s)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>⋮</button>
        {showMenu && (
          <div className="absolute right-0 top-7 z-50 rounded-xl py-1 min-w-[145px]"
            style={{ background:"#1a1a2e", border:"1px solid rgba(255,255,255,0.12)", boxShadow:"0 8px 32px #0008" }}>
            {patterns.map(p => (
              <button key={p.label} onClick={() => { onFill(row.id, p.pattern); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5" style={{ color:"rgba(255,255,255,0.7)" }}>
                {p.label}
              </button>
            ))}
            <div className="border-t border-white/10 my-1" />
            <button onClick={() => { onClear(row.id); setShowMenu(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5" style={{ color:"rgba(255,100,100,0.7)" }}>
              Clear row
            </button>
            <button onClick={() => { onRemove(row.id); setShowMenu(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5" style={{ color:"rgba(255,100,100,0.7)" }}>
              Remove track
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
