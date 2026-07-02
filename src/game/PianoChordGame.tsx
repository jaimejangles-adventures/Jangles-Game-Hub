import { useRef, useState, useCallback } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const CHORD_TYPES: { key: string; label: string; intervals: number[]; color: string; shadow: string }[] = [
  { key: "major",   label: "Maj",  intervals: [0,4,7],     color: "#FFD93D", shadow: "#C8A800" },
  { key: "minor",   label: "Min",  intervals: [0,3,7],     color: "#C77DFF", shadow: "#8B3FD9" },
  { key: "dom7",    label: "7",    intervals: [0,4,7,10],  color: "#FF9F43", shadow: "#C96A00" },
  { key: "maj7",    label: "Maj7", intervals: [0,4,7,11],  color: "#48DBFB", shadow: "#009DC4" },
  { key: "min7",    label: "Min7", intervals: [0,3,7,10],  color: "#FF6B9D", shadow: "#C4245E" },
  { key: "dim",     label: "Dim",  intervals: [0,3,6],     color: "#74B9FF", shadow: "#2970C9" },
  { key: "aug",     label: "Aug",  intervals: [0,4,8],     color: "#FF7675", shadow: "#C42020" },
  { key: "sus2",    label: "Sus2", intervals: [0,2,7],     color: "#55EFC4", shadow: "#00A87A" },
  { key: "sus4",    label: "Sus4", intervals: [0,5,7],     color: "#00CEC9", shadow: "#008A86" },
  { key: "dim7",    label: "Dim7", intervals: [0,3,6,9],   color: "#A29BFE", shadow: "#5145CC" },
  { key: "halfdim", label: "ø7",   intervals: [0,3,6,10],  color: "#FD79A8", shadow: "#C2245E" },
  { key: "minmaj7", label: "mM7",  intervals: [0,3,7,11],  color: "#FDCB6E", shadow: "#C8900A" },
];

const ROOT_COLORS = [
  "#FF6B6B","#FF9F43","#FFD93D","#6BCB77","#48DBFB","#4D96FF",
  "#C77DFF","#FF6B9D","#FF7675","#55EFC4","#FD79A8","#A29BFE",
];

const POSITION_LABELS = ["Root", "1st", "2nd"];
const POSITION_DESC   = ["Root position", "1st inversion — 3rd on bottom", "2nd inversion — 5th on bottom"];

type Instrument = "piano" | "rhodes" | "guitar";
const INSTRUMENTS: { key: Instrument; label: string; emoji: string }[] = [
  { key: "piano",  label: "Piano",  emoji: "🎹" },
  { key: "rhodes", label: "Rhodes", emoji: "🎵" },
  { key: "guitar", label: "Guitar", emoji: "🎸" },
];

// ─── Audio ───────────────────────────────────────────────────────────────────

function midiToFreq(m: number) { return 440 * Math.pow(2, (m - 69) / 12); }

function getInversions(rootMidi: number, intervals: number[]): number[][] {
  const root = intervals.map(i => rootMidi + i);
  return [root, [...root.slice(1), root[0]+12], [...root.slice(2), root[0]+12, root[1]+12]];
}

function synthPiano(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const dur = 2.2;
  [1,2,3,4,5,6].forEach((h,i) => {
    const g = [1,.5,.25,.12,.06,.03][i];
    const osc = ctx.createOscillator(), gn = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = freq * h;
    gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(.55*g,t+.01);
    gn.gain.exponentialRampToValueAtTime(.55*g*.4,t+.1); gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(gn); gn.connect(dest); osc.start(t); osc.stop(t+dur+.05);
  });
  const c=ctx.createOscillator(), cg=ctx.createGain();
  c.type="square"; c.frequency.value=freq*8;
  cg.gain.setValueAtTime(.022,t); cg.gain.exponentialRampToValueAtTime(.0001,t+.012);
  c.connect(cg); cg.connect(dest); c.start(t); c.stop(t+.015);
}

function synthRhodes(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const dur = 2.8;
  const mod=ctx.createOscillator(), mg=ctx.createGain();
  const car=ctx.createOscillator(), cg=ctx.createGain();
  mod.type="sine"; mod.frequency.value=freq;
  mg.gain.setValueAtTime(freq*1.2,t); mg.gain.exponentialRampToValueAtTime(freq*.1,t+.6); mg.gain.exponentialRampToValueAtTime(.001,t+dur);
  mod.connect(mg); mg.connect(car.frequency);
  car.type="sine"; car.frequency.value=freq;
  cg.gain.setValueAtTime(0,t); cg.gain.linearRampToValueAtTime(.5,t+.006);
  cg.gain.exponentialRampToValueAtTime(.28,t+.12); cg.gain.exponentialRampToValueAtTime(.0001,t+dur);
  car.connect(cg); cg.connect(dest);
  mod.start(t); mod.stop(t+dur+.05); car.start(t); car.stop(t+dur+.05);
  const b=ctx.createOscillator(), bg=ctx.createGain();
  b.type="sine"; b.frequency.value=freq*2;
  bg.gain.setValueAtTime(.08,t); bg.gain.exponentialRampToValueAtTime(.0001,t+1.2);
  b.connect(bg); bg.connect(dest); b.start(t); b.stop(t+1.25);
}

// ─── Real guitar samples via MIDI.js soundfonts CDN ─────────────────────────

const FLAT_NAMES = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const guitarCache = new Map<number, AudioBuffer>();

function midiToSampleName(midi: number): string {
  return `${FLAT_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

async function loadGuitarNote(ctx: AudioContext, midi: number): Promise<AudioBuffer | null> {
  if (guitarCache.has(midi)) return guitarCache.get(midi)!;
  const name = midiToSampleName(midi);
  const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_clean-mp3/${name}.mp3`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await ctx.decodeAudioData(await res.arrayBuffer());
    guitarCache.set(midi, buf);
    return buf;
  } catch {
    return null;
  }
}

async function playGuitarChord(ctx: AudioContext, midiNotes: number[]): Promise<void> {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 4;
  comp.attack.value = 0.003; comp.release.value = 0.2;
  comp.connect(ctx.destination);

  const buffers = await Promise.all(midiNotes.map(m => loadGuitarNote(ctx, m)));
  const t = ctx.currentTime + 0.05;
  buffers.forEach((buf, i) => {
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.8;
    src.connect(g); g.connect(comp);
    src.start(t + i * 0.05); // strum
  });
}

function playChordNow(ctx: AudioContext, midiNotes: number[], inst: Instrument) {
  const comp=ctx.createDynamicsCompressor();
  comp.threshold.value=-12; comp.knee.value=8; comp.ratio.value=4; comp.attack.value=.003; comp.release.value=.2;
  comp.connect(ctx.destination);
  const t=ctx.currentTime+.03;
  const fn = inst==="piano" ? synthPiano : synthRhodes;
  midiNotes.forEach(m => fn(ctx, comp, midiToFreq(m), t));
}

// ─── Guitar diagram ───────────────────────────────────────────────────────────

const STRING_TUNING = [40,45,50,55,59,64];

function findGuitarVoicing(midiNotes: number[]): (number|null)[] {
  const pcs = new Set(midiNotes.map(m => ((m%12)+12)%12));
  const opts = STRING_TUNING.map(open => {
    const v: number[]=[];
    for(let f=0;f<=15;f++) if(pcs.has(((open+f)%12+12)%12)) v.push(f);
    return v;
  });
  for(let lo=0;lo<=12;lo++) {
    const hi=lo+4;
    const v: (number|null)[] = opts.map(frets => {
      if(lo<=1 && frets.includes(0)) return 0;
      const w=frets.filter(f=>f>=Math.max(1,lo)&&f<=hi);
      if(w.length>0) return w[0];
      if(frets.includes(0)) return 0;
      return null;
    });
    const cov=new Set(v.map((f,s)=>f!==null?((STRING_TUNING[s]+f)%12+12)%12:-1).filter(x=>x>=0));
    if([...pcs].every(pc=>cov.has(pc))) return v;
  }
  return opts.map(f=>f[0]??null);
}

function GuitarDiagram({ midiNotes, color }: { midiNotes: number[]; color: string }) {
  const voicing = findGuitarVoicing(midiNotes);
  const fretted = voicing.filter(f=>f!==null&&f>0) as number[];
  const startFret = fretted.length>0 ? Math.max(0,Math.min(...fretted)-1) : 0;
  const NUM_FRETS=4, W=110, padL=18, padR=10, padT=22, padB=14;
  const strW=(W-padL-padR)/5, fretH=70/NUM_FRETS, H=70;

  return (
    <svg width={W} height={H+padT+padB} style={{overflow:"visible",flexShrink:0}}>
      {startFret===0
        ? <rect x={padL} y={padT} width={W-padL-padR} height={4} rx={2} fill="rgba(255,255,255,0.6)"/>
        : <text x={2} y={padT+fretH*.7} fontSize={8} fill="rgba(255,255,255,0.5)" fontFamily="Nunito,sans-serif">{startFret+1}fr</text>
      }
      {Array.from({length:NUM_FRETS+1},(_,fi)=>(
        <line key={fi} x1={padL} y1={padT+fi*fretH} x2={W-padR} y2={padT+fi*fretH}
          stroke="rgba(255,255,255,0.15)" strokeWidth={1}/>
      ))}
      {Array.from({length:6},(_,si)=>(
        <line key={si} x1={padL+si*strW} y1={padT} x2={padL+si*strW} y2={padT+NUM_FRETS*fretH}
          stroke="rgba(255,255,255,0.35)" strokeWidth={.8+si*.2}/>
      ))}
      {voicing.map((fret,si)=>{
        const x=padL+si*strW;
        if(fret===null) return <text key={si} x={x} y={padT-7} fontSize={9} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontFamily="sans-serif">✕</text>;
        if(fret===0) return <circle key={si} cx={x} cy={padT-8} r={5} fill="none" stroke={color} strokeWidth={2}/>;
        const y=padT+(fret-startFret-.5)*fretH;
        return <g key={si}>
          <circle cx={x} cy={y} r={7} fill={color} style={{filter:`drop-shadow(0 0 5px ${color})`}}/>
          <circle cx={x-2} cy={y-2} r={2.5} fill="rgba(255,255,255,0.5)"/>
        </g>;
      })}
      {["E","A","D","G","B","e"].map((n,si)=>(
        <text key={si} x={padL+si*strW} y={padT+NUM_FRETS*fretH+12} fontSize={8}
          textAnchor="middle" fill="rgba(255,255,255,0.45)" fontFamily="Nunito,sans-serif">{n}</text>
      ))}
    </svg>
  );
}

// ─── Piano Keys Visual ────────────────────────────────────────────────────────

const WHITE_SEMITONES = [0,2,4,5,7,9,11];
const BLACK_KEYS: [number,number][] = [[19,1],[47,3],[111,6],[139,8],[167,10]];

function PianoKeys({ midiNotes, color }: { midiNotes: number[]; color: string }) {
  const lit = new Set(midiNotes.map(m=>((m%12)+12)%12));
  const W=26, H=78, BW=16, BH=48;
  return (
    <div style={{position:"relative",display:"flex",height:H,userSelect:"none",flexShrink:0}}>
      {WHITE_SEMITONES.map((s,i)=>(
        <div key={i} style={{
          width:W, height:H, marginRight:1, borderRadius:"0 0 8px 8px",
          border: lit.has(s) ? `2px solid ${color}` : "1px solid rgba(255,255,255,0.2)",
          background: lit.has(s)
            ? `linear-gradient(180deg, ${color}ff 0%, ${color}cc 100%)`
            : "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,235,255,0.85) 100%)",
          boxShadow: lit.has(s)
            ? `0 0 18px 5px ${color}88, inset 0 1px 0 rgba(255,255,255,0.8)`
            : "inset 0 -3px 6px rgba(0,0,0,0.1)",
          transition:"all 0.12s", position:"relative", zIndex:1,
        }}/>
      ))}
      {BLACK_KEYS.map(([left,s])=>(
        <div key={s} style={{
          position:"absolute", top:0, left, width:BW, height:BH,
          borderRadius:"0 0 5px 5px",
          background: lit.has(s)
            ? `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`
            : "linear-gradient(180deg, #2d1b69 0%, #1a0533 100%)",
          border: lit.has(s) ? `2px solid ${color}` : "none",
          boxShadow: lit.has(s) ? `0 0 14px 4px ${color}bb` : "0 3px 8px rgba(0,0,0,0.5)",
          transition:"all 0.12s", zIndex:2,
        }}/>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PianoChordGame() {
  const ctxRef = useRef<AudioContext|null>(null);
  const [selected, setSelected] = useState({root:0, chordKey:"major"});
  const [position, setPosition] = useState(0);
  const [instrument, setInstrument] = useState<Instrument>("piano");
  const [guitarLoading, setGuitarLoading] = useState(false);

  function getCtx() {
    if(!ctxRef.current||ctxRef.current.state==="closed") ctxRef.current=new AudioContext();
    if(ctxRef.current.state==="suspended") ctxRef.current.resume();
    return ctxRef.current;
  }

  const trigger = useCallback((root=selected.root, ck=selected.chordKey, pos=position, inst=instrument) => {
    const ct = CHORD_TYPES.find(c=>c.key===ck)!;
    const notes = getInversions(48+root, ct.intervals)[pos];
    const ctx = getCtx();
    if (inst === "guitar") {
      setGuitarLoading(true);
      playGuitarChord(ctx, notes).finally(() => setGuitarLoading(false));
    } else {
      playChordNow(ctx, notes, inst);
    }
  }, [selected, position, instrument]);

  const handleSelect = useCallback((root:number, chordKey:string) => {
    setSelected({root,chordKey}); trigger(root,chordKey,position,instrument);
  }, [position, instrument, trigger]);

  const handlePosition = useCallback((pos:number) => {
    setPosition(pos); trigger(selected.root, selected.chordKey, pos, instrument);
  }, [selected, instrument, trigger]);

  const handleInstrument = useCallback((inst:Instrument) => {
    setInstrument(inst); trigger(selected.root, selected.chordKey, position, inst);
  }, [selected, position, trigger]);

  const activeChord = CHORD_TYPES.find(c=>c.key===selected.chordKey)!;
  const currentNotes = getInversions(48+selected.root, activeChord.intervals)[position];
  const noteNames = currentNotes.map(m=>NOTE_NAMES[((m%12)+12)%12]);
  const chordName = `${NOTE_NAMES[selected.root]} ${activeChord.label}`;
  const rootColor = ROOT_COLORS[selected.root];

  return (
    <div style={{
      minHeight:"100dvh",
      background:"linear-gradient(160deg, #0d0221 0%, #1a0a3e 35%, #0d2060 70%, #0a1a4a 100%)",
      display:"flex", flexDirection:"column",
      fontFamily:"'Nunito','Segoe UI',sans-serif",
      color:"white", boxSizing:"border-box",
      position:"relative", overflow:"hidden",
    }}>

      {/* Stars background */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`
          radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px),
          radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px),
          radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)
        `,
        backgroundSize:"120px 120px, 80px 80px, 50px 50px",
        backgroundPosition:"0 0, 40px 40px, 20px 60px",
        opacity:0.25,
      }}/>

      {/* ── Header ── */}
      <div style={{
        position:"relative", zIndex:1,
        background:"rgba(255,255,255,0.06)",
        backdropFilter:"blur(12px)",
        borderBottom:"1.5px solid rgba(255,255,255,0.12)",
        padding:"10px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
      }}>
        {/* Title */}
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span style={{fontSize:"1.6rem"}}>🎹</span>
          <div>
            <div style={{
              fontSize:"1.25rem", fontWeight:900, letterSpacing:"-0.01em",
              background:"linear-gradient(90deg, #FFD93D, #FF9F43, #FF6B9D, #C77DFF, #48DBFB)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}>Chord Explorer</div>
            <div style={{fontSize:"0.65rem", opacity:0.5, fontWeight:700, letterSpacing:"0.08em", marginTop:-2}}>
              TAP ANY CHORD TO PLAY IT ✨
            </div>
          </div>
        </div>

        {/* Instrument switcher */}
        <div style={{
          display:"flex", gap:4,
          background:"rgba(0,0,0,0.3)", borderRadius:999, padding:"4px 6px",
          border:"1.5px solid rgba(255,255,255,0.1)",
        }}>
          {INSTRUMENTS.map(inst=>{
            const on = instrument===inst.key;
            return (
              <button key={inst.key} onClick={()=>handleInstrument(inst.key)} style={{
                padding:"5px 12px", borderRadius:999,
                border:"none", cursor:"pointer",
                fontFamily:"inherit", fontWeight:800, fontSize:"0.78rem",
                background: on ? "linear-gradient(135deg,rgba(255,255,255,0.25),rgba(255,255,255,0.1))" : "transparent",
                color: on ? "white" : "rgba(255,255,255,0.4)",
                boxShadow: on ? "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
                transition:"all 0.15s",
              }}>
                {inst.emoji} {inst.label}{inst.key==="guitar" && guitarLoading ? " ⏳" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chord grid ── */}
      <div style={{position:"relative", zIndex:1, overflowX:"auto"}}>

        {/* Sticky column headers */}
        <div style={{
          position:"sticky", top:0, zIndex:10,
          background:"rgba(13,2,33,0.92)", backdropFilter:"blur(10px)",
          borderBottom:"1px solid rgba(255,255,255,0.08)",
          padding:"6px 10px 5px",
        }}>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px 0",tableLayout:"fixed"}}>
            <thead>
              <tr>
                <th style={{width:32}}/>
                {CHORD_TYPES.map(ct=>(
                  <th key={ct.key} style={{
                    textAlign:"center", padding:"0 1px",
                    fontSize:"0.65rem", fontWeight:900,
                    color:ct.color, letterSpacing:"0.04em",
                    textShadow:`0 0 12px ${ct.color}`,
                  }}>{ct.label}</th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {/* Rows */}
        <div style={{padding:"6px 10px 8px"}}>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px 4px",tableLayout:"fixed"}}>
            <tbody>
              {NOTE_NAMES.map((note,ri)=>{
                const isSharp = note.includes("#");
                const rColor = ROOT_COLORS[ri];
                return (
                  <tr key={note}>
                    {/* Root label */}
                    <td style={{width:32, verticalAlign:"middle", paddingRight:4}}>
                      <div style={{
                        width:28, height:28, borderRadius:"50%",
                        background: selected.root===ri
                          ? `radial-gradient(circle at 35% 30%, ${rColor}ff, ${rColor}99)`
                          : isSharp ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
                        border: selected.root===ri ? `2px solid ${rColor}` : "1.5px solid rgba(255,255,255,0.12)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize: isSharp ? "0.55rem" : "0.72rem",
                        fontWeight:900,
                        color: selected.root===ri ? "#fff" : isSharp ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)",
                        boxShadow: selected.root===ri ? `0 0 14px ${rColor}88` : "none",
                        transition:"all 0.15s",
                        cursor:"default", userSelect:"none",
                      }}>{note}</div>
                    </td>

                    {/* Chord buttons */}
                    {CHORD_TYPES.map(ct=>{
                      const isActive = selected.root===ri && selected.chordKey===ct.key;
                      return (
                        <td key={ct.key} style={{padding:"0 1px", verticalAlign:"middle"}}>
                          <button onClick={()=>handleSelect(ri,ct.key)} style={{
                            width:"100%", padding:"7px 2px",
                            borderRadius:999,
                            border:"none", cursor:"pointer",
                            fontFamily:"inherit", fontWeight:800,
                            fontSize:"0.63rem", letterSpacing:"0.01em",
                            transition:"all 0.1s",
                            whiteSpace:"nowrap",
                            background: isActive
                              ? `linear-gradient(180deg, ${ct.color}ff 0%, ${ct.color}cc 100%)`
                              : isSharp
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(255,255,255,0.08)",
                            color: isActive ? "#1a0033" : isSharp ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)",
                            boxShadow: isActive
                              ? `0 4px 0 ${ct.shadow}, 0 6px 20px ${ct.color}55, inset 0 1px 0 rgba(255,255,255,0.5)`
                              : "0 2px 0 rgba(0,0,0,0.2)",
                            transform: isActive ? "translateY(-1px)" : "translateY(0)",
                          }}>
                            {note}{ct.label}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom panel ── */}
      <div style={{
        position:"relative", zIndex:1,
        background:"rgba(255,255,255,0.07)",
        backdropFilter:"blur(16px)",
        borderTop:"1.5px solid rgba(255,255,255,0.12)",
        padding:"12px 16px 16px",
        display:"flex", gap:16, alignItems:"center",
      }}>

        {/* Diagram */}
        <div style={{
          background:"rgba(0,0,0,0.35)",
          border:`2px solid ${activeChord.color}44`,
          borderRadius:16,
          padding: instrument==="guitar" ? "8px 10px 4px" : "10px 12px 8px",
          boxShadow:`0 0 20px ${activeChord.color}22`,
          flexShrink:0,
        }}>
          {instrument==="guitar"
            ? <GuitarDiagram midiNotes={currentNotes} color={activeChord.color}/>
            : <PianoKeys midiNotes={currentNotes} color={activeChord.color}/>
          }
        </div>

        {/* Right side */}
        <div style={{display:"flex",flexDirection:"column",gap:10,flex:1,minWidth:0}}>

          {/* Chord name */}
          <div>
            <div style={{
              fontSize:"1.4rem", fontWeight:900, lineHeight:1,
              color:activeChord.color,
              textShadow:`0 0 20px ${activeChord.color}cc`,
              letterSpacing:"-0.01em",
            }}>{chordName}</div>

            {/* Note pills */}
            <div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}>
              {noteNames.map((n,i)=>(
                <div key={i} style={{
                  background:`linear-gradient(160deg, ${activeChord.color}ff, ${activeChord.color}cc)`,
                  borderRadius:999,
                  padding:"6px 18px",
                  fontWeight:900, fontSize:"1rem", color:"#1a0033",
                  boxShadow:`0 4px 0 ${activeChord.shadow}, 0 6px 16px ${activeChord.color}55, inset 0 1px 0 rgba(255,255,255,0.5)`,
                  letterSpacing:"0.04em",
                  userSelect:"none",
                }}>{n}</div>
              ))}
            </div>
          </div>

          {/* Inversion buttons */}
          <div>
            <div style={{fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.15em",
              textTransform:"uppercase",opacity:0.45,marginBottom:6}}>
              Inversion
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {POSITION_LABELS.map((label,i)=>{
                const on=position===i;
                return (
                  <button key={i} onClick={()=>handlePosition(i)} style={{
                    padding:"6px 18px", borderRadius:999,
                    border:"none", cursor:"pointer",
                    fontFamily:"inherit", fontWeight:800, fontSize:"0.8rem",
                    transition:"all 0.12s",
                    background: on
                      ? `linear-gradient(160deg, ${activeChord.color}ff, ${activeChord.color}cc)`
                      : "rgba(255,255,255,0.1)",
                    color: on ? "#1a0033" : "rgba(255,255,255,0.5)",
                    boxShadow: on
                      ? `0 4px 0 ${activeChord.shadow}, 0 6px 14px ${activeChord.color}44, inset 0 1px 0 rgba(255,255,255,0.4)`
                      : "0 2px 0 rgba(0,0,0,0.3)",
                    transform: on ? "translateY(-1px)" : "none",
                  }}>{label}</button>
                );
              })}
            </div>
            <div style={{fontSize:"0.65rem",opacity:0.4,marginTop:5,fontStyle:"italic"}}>
              {POSITION_DESC[position]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
