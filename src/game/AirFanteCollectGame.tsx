import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { useArcadeSession } from "@/lib/arcade-session-context";

// ── Country data ───────────────────────────────────────────────────────────────
const COUNTRIES = [
  { name: "U.S.A.",         flag: "🇺🇸", music: "Jazz & Blues",   audio: "music/NEW ORLEANS.wav",                    skyTop: "#1a1a4e", skyBot: "#2d3a6e", ground: "#1a2a1a", accent: "#f5c94c", landmark: "none"      },
  { name: "Mexico",         flag: "🇲🇽", music: "Mariachi",        audio: "music/MEXICO.wav",                         skyTop: "#4ac8ff", skyBot: "#ffe8a0", ground: "#d4a055", accent: "#ce1032", landmark: "palms"     },
  { name: "Jamaica",        flag: "🇯🇲", music: "Reggae",          audio: "music/JAMAICA.wav",                        skyTop: "#5abfff", skyBot: "#c5f0ff", ground: "#f5d07a", accent: "#009b3a", landmark: "palms"     },
  { name: "Barbados",       flag: "🇧🇧", music: "Dancehall",       audio: "music/BARBADOS_2.wav",                     skyTop: "#35c6ff", skyBot: "#aae8ff", ground: "#e8c87a", accent: "#003b7a", landmark: "palms"     },
  { name: "Peru",           flag: "🇵🇪", music: "Flutes",          audio: "music/PERU.wav",                           skyTop: "#82c8e8", skyBot: "#c8e8a0", ground: "#b08a50", accent: "#d91023", landmark: "andes"     },
  { name: "Argentina",      flag: "🇦🇷", music: "Tango",           audio: "music/ARGENTINA DRUMS AND HORNS_1.2.wav",  skyTop: "#9ed6f5", skyBot: "#ddf0ff", ground: "#888080", accent: "#75aadb", landmark: "obelisk"   },
  { name: "Antarctica",     flag: "🇦🇶", music: "Ambient",         audio: "",                                         skyTop: "#cce8ff", skyBot: "#e8f5ff", ground: "#d0eaff", accent: "#4a9fd4", landmark: "mountains" },
  { name: "United Kingdom", flag: "🇬🇧", music: "Orchestral",      audio: "music/UK.wav",                             skyTop: "#68b4e8", skyBot: "#c0d8f0", ground: "#8b7a6a", accent: "#c8102e", landmark: "none"      },
  { name: "Spain",          flag: "🇪🇸", music: "Flamenco",        audio: "music/SPAIN1.2.wav",                       skyTop: "#7888d0", skyBot: "#c8b0e0", ground: "#d4a855", accent: "#c60b1e", landmark: "none"      },
  { name: "France",         flag: "🇫🇷", music: "Accordion",       audio: "music/FRANCE.wav",                         skyTop: "#5abfff", skyBot: "#d0f0a0", ground: "#78aa60", accent: "#2d5aa7", landmark: "eiffel"    },
  { name: "Italy",          flag: "🇮🇹", music: "Opera",           audio: "music/ITALY.wav",                          skyTop: "#78c0e8", skyBot: "#fff0c0", ground: "#e8c87a", accent: "#009246", landmark: "none"      },
  { name: "Sri Lanka",      flag: "🇱🇰", music: "Sitar & Tabla",   audio: "music/SRI LANKA_1.1.wav",                  skyTop: "#508088", skyBot: "#a0d0c0", ground: "#a06030", accent: "#8d153a", landmark: "temple"    },
  { name: "Japan",          flag: "🇯🇵", music: "Shakuhachi",      audio: "music/JAPAN.wav",                          skyTop: "#88ccdc", skyBot: "#cceeee", ground: "#306878", accent: "#bc002d", landmark: "fuji"      },
  { name: "Switzerland",    flag: "🇨🇭", music: "Alphorn",         audio: "music/SWISS.wav",                          skyTop: "#88ccf0", skyBot: "#e8f5ff", ground: "#f0f8ff", accent: "#d52b1e", landmark: "alps"      },
  { name: "Kenya",          flag: "🇰🇪", music: "Benga",           audio: "music/KENYA.wav",                          skyTop: "#70c8f0", skyBot: "#c8e888", ground: "#c8a850", accent: "#006600", landmark: "none"      },
  { name: "South Africa",   flag: "🇿🇦", music: "Goema",           audio: "music/SOUTH AFRICA_1.2.wav",               skyTop: "#68c8f0", skyBot: "#d0f0ff", ground: "#e8d080", accent: "#007a4d", landmark: "tableMtn"  },
  { name: "Ghana",          flag: "🇬🇭", music: "Azonto",          audio: "music/GHANA.wav",                          skyTop: "#68b8e8", skyBot: "#e8e0a8", ground: "#d0a040", accent: "#ce1126", landmark: "none"      },
  { name: "South Korea",    flag: "🇰🇷", music: "K-pop",           audio: "music/SOUTH KOREA.wav",                    skyTop: "#8878b0", skyBot: "#c0b0d8", ground: "#7070a0", accent: "#cd2e3a", landmark: "none"      },
  { name: "Nepal",          flag: "🇳🇵", music: "Sarangi",         audio: "music/NEPAL.wav",                          skyTop: "#88c8e8", skyBot: "#e0f0ff", ground: "#d0e8f8", accent: "#dc143c", landmark: "mountains" },
  { name: "Indonesia",      flag: "🇮🇩", music: "Gamelan",         audio: "music/INDONESIA.wav",                      skyTop: "#35c6e8", skyBot: "#a0e8e8", ground: "#c8a878", accent: "#ce1126", landmark: "palms"     },
  { name: "Australia",      flag: "🇦🇺", music: "Orchestral",      audio: "music/Jamie Jangles_Daniel_Australia.wav", skyTop: "#2878d4", skyBot: "#5090e0", ground: "#1c5ca8", accent: "#0f4c81", landmark: "opera"     },
] as const;

type Country = typeof COUNTRIES[number];
type Difficulty = "rookie" | "master";
type Phase = "select" | "playing" | "over";

function shuffledCountryOrder(): number[] {
  const order = COUNTRIES.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const PLANE_W     = 190;
const PLANE_H     = 118;
const COUNTDOWN_S = 3;

// ── Component ──────────────────────────────────────────────────────────────────
export function AirFanteCollectGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef  = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    const prevHref = existing?.href ?? "";
    const link: HTMLLinkElement = existing ?? document.createElement("link");
    link.rel  = "icon";
    link.type = "image/png";
    link.href = asset("/characters/air-fante.png");
    if (!existing) document.head.appendChild(link);
    return () => { link.href = prevHref; };
  }, []);

  const phaseRef      = useRef<Phase>("select");
  const startFnRef    = useRef<() => void>(() => {});
  const countdownRef  = useRef<number>(0);
  const difficultyRef = useRef<Difficulty>("rookie");

  const [phase,       setPhase]       = useState<Phase>("select");
  const [finalScore,  setFinalScore]  = useState(0);
  const [gameWon,     setGameWon]     = useState(false);
  const [hoveredCard, setHoveredCard] = useState<Difficulty | null>(null);

  const { user } = useAuth();
  const { saveScore } = useScore("air-fante-collect");
  const saveScoreRef = useRef(saveScore);
  useEffect(() => { saveScoreRef.current = saveScore; }, [saveScore]);

  const { endSession } = useArcadeSession();
  const endSessionRef = useRef(endSession);
  useEffect(() => { endSessionRef.current = endSession; }, [endSession]);

  useEffect(() => {
    if (phase === "over" && user) {
      saveScoreRef.current(finalScore);
    }
  }, [phase, user, finalScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    const NAV_BOTTOM = document.querySelector("header")?.getBoundingClientRect().bottom ?? 84;

    const GW = 900, GH = 506;
    const gameScale = Math.min(W / GW, H / GH) * 0.50;
    const gx = Math.round((W - GW * gameScale) / 2);
    const gy = Math.round((H - GH * gameScale) / 2);

    // ── Mutable difficulty config (set in startGame) ───────────────────────────
    let cfgMaxLives        = 5;
    let cfgPointsToAdvance = 10;
    let cfgInitSpeed       = 4;
    let cfgSpeedStep       = 0.3;
    let cfgScoreStep       = 20;
    let cfgBaseSpawn       = 75;
    let cfgMinSpawn        = 35;
    let cfgSpawnDecayScore = 10;
    let cfgDotSpeed        = 1.4;
    let cfgDotRadius       = 22;

    const keys: Record<string, boolean> = {};
    let lives        = cfgMaxLives;
    let countryPts   = 0;
    let totalScore   = 0;
    let frame        = 0;
    let speed        = cfgInitSpeed;
    let countryIdx   = 0;
    let countryOrder = shuffledCountryOrder();
    let countryFlash = 0;
    let advanceFlash = 0;
    let rafId        = 0;

    const player = { x: 5, y: GH / 2, vy: 0, vx: 0 };
    const dots: { x: number; y: number; r: number; flag: string; accent: string; collected: boolean; popAlpha: number; popOffY: number }[] = [];

    const clouds: { x: number; y: number; s: number }[] = [];
    const NUM_CLOUDS = 5;
    for (let i = 0; i < NUM_CLOUDS; i++) {
      const laneW = GW / NUM_CLOUDS;
      clouds.push({
        x: i * laneW + Math.random() * laneW * 0.85,
        y: 55 + Math.random() * 220,
        s: 0.3 + Math.random() * 0.8,
      });
    }

    const planeImg = new Image();
    let planeReady = false;
    planeImg.onload = () => { planeReady = true; };
    planeImg.src = asset("/characters/air-fante-plane.png");

    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    function loadCountryAudio(c: Country) {
      if (phaseRef.current === "over") return;
      if (!c.audio) { audio.pause(); return; }
      audio.src = asset("/"  + encodeURI(c.audio));
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    function startGame() {
      const isRookie = difficultyRef.current === "rookie";
      cfgMaxLives        = 5;
      cfgPointsToAdvance = isRookie ? 6   : 15;
      cfgInitSpeed       = isRookie ? 3.5 : 4.5;
      cfgSpeedStep       = isRookie ? 0.2 : 0.4;
      cfgScoreStep       = isRookie ? 25  : 15;
      cfgBaseSpawn       = isRookie ? 52  : 36;
      cfgMinSpawn        = isRookie ? 26  : 18;
      cfgSpawnDecayScore = isRookie ? 12  : 8;
      cfgDotSpeed        = isRookie ? 0.8 : 1.44;
      cfgDotRadius       = isRookie ? 26  : 20;

      lives        = cfgMaxLives;
      countryPts   = 0;
      totalScore   = 0;
      frame        = 0;
      speed        = cfgInitSpeed;
      countryIdx   = 0;
      countryOrder = shuffledCountryOrder();
      countryFlash = 0;
      advanceFlash = 0;
      player.x  = 5;
      player.y  = GH / 2;
      player.vy = 0;
      player.vx = 0;
      dots.length = 0;
      countdownRef.current = COUNTDOWN_S;
      phaseRef.current = "playing";
      setPhase("playing");
      loadCountryAudio(COUNTRIES[countryOrder[0]]);

      const interval = setInterval(() => {
        countdownRef.current -= 1;
        if (countdownRef.current <= 0) {
          countdownRef.current = 0;
          clearInterval(interval);
          countryFlash = 180;
        }
      }, 1000);
    }

    startFnRef.current = startGame;

    function onKeyDown(e: KeyboardEvent) {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " && phaseRef.current === "playing") player.vy = -11;
    }
    function onKeyUp(e: KeyboardEvent) { keys[e.key.toLowerCase()] = false; }
    function onPointerDown() {
      if (phaseRef.current === "playing") player.vy = -11;
    }

    document.addEventListener("keydown",   onKeyDown);
    document.addEventListener("keyup",     onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);

    // ── Draw helpers ───────────────────────────────────────────────────────────
    function drawCloud(x: number, y: number, s: number) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(x,        y,        20 * s, 0, Math.PI * 2);
      ctx.arc(x+22*s,   y-18*s,   30 * s, 0, Math.PI * 2);
      ctx.arc(x+52*s,   y-8*s,    24 * s, 0, Math.PI * 2);
      ctx.arc(x+68*s,   y+4*s,    16 * s, 0, Math.PI * 2);
      ctx.arc(x+12*s,   y+10*s,   18 * s, 0, Math.PI * 2);
      ctx.arc(x+38*s,   y+8*s,    22 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPalm(px: number, py: number, s: number) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(s, s);
      ctx.strokeStyle = "rgba(23,50,77,0.38)";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(18, -70, 0, -135);
      ctx.stroke();
      ctx.fillStyle = "rgba(23,50,77,0.32)";
      for (let i = 0; i < 7; i++) {
        ctx.rotate((Math.PI * 2) / 7);
        ctx.beginPath();
        ctx.ellipse(0, -150, 55, 13, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawLandmark(c: Country) {
      const baseY = GH - 44;
      ctx.save();
      ctx.fillStyle   = "rgba(23,50,77,0.26)";
      ctx.strokeStyle = "rgba(23,50,77,0.30)";
      ctx.lineWidth   = 5;
      switch (c.landmark) {
        case "obelisk":
          ctx.beginPath();
          ctx.moveTo(690, baseY); ctx.lineTo(720, 210); ctx.lineTo(750, baseY);
          ctx.closePath(); ctx.fill(); break;
        case "opera":
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(610 + i*45, baseY);
            ctx.quadraticCurveTo(650 + i*35, 195 - i*5, 705 + i*25, baseY);
            ctx.closePath(); ctx.fill();
          }
          break;
        case "palms":
          drawPalm(650, baseY, 1); drawPalm(770, baseY, 0.85); break;
        case "eiffel":
          ctx.beginPath();
          ctx.moveTo(660, baseY); ctx.lineTo(720, 190); ctx.lineTo(780, baseY);
          ctx.moveTo(690, 300);   ctx.lineTo(750, 300);
          ctx.moveTo(675, 365);   ctx.lineTo(765, 365);
          ctx.stroke(); break;
        case "fuji":
          ctx.fillStyle = "rgba(45,90,167,0.30)";
          ctx.beginPath();
          ctx.moveTo(560, baseY); ctx.lineTo(715, 200); ctx.lineTo(870, baseY);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.beginPath();
          ctx.moveTo(680, 258); ctx.lineTo(715, 200); ctx.lineTo(750, 258);
          ctx.closePath(); ctx.fill(); break;
        case "mountains": case "andes": case "alps":
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(500 + i*95, baseY);
            ctx.lineTo(610 + i*75, 210 + i*15);
            ctx.lineTo(735 + i*55, baseY);
            ctx.closePath(); ctx.fill();
          }
          break;
        case "tableMtn":
          ctx.beginPath();
          ctx.moveTo(530, baseY); ctx.lineTo(600, 250); ctx.lineTo(780, 250); ctx.lineTo(850, baseY);
          ctx.closePath(); ctx.fill(); break;
        case "temple":
          ctx.fillRect(650, baseY - 90, 170, 90);
          ctx.beginPath();
          ctx.moveTo(625, baseY - 90); ctx.lineTo(735, baseY - 155); ctx.lineTo(845, baseY - 90);
          ctx.closePath(); ctx.fill(); break;
      }
      ctx.restore();
    }

    function drawPlane() {
      if (!planeReady) return;
      ctx.save();
      ctx.translate(player.x + PLANE_W, player.y);
      ctx.scale(-1, 1);
      ctx.drawImage(planeImg, 0, 0, PLANE_W, PLANE_H);
      ctx.restore();
    }

    // ── HUD ────────────────────────────────────────────────────────────────────
    const HUD_H   = 52;
    const HUD_TOP = NAV_BOTTOM;
    const HUD_BOT = HUD_TOP + HUD_H + 5;

    function drawHUD(c: Country) {
      ctx.save();
      ctx.textBaseline = "middle";
      ctx.globalAlpha  = 1;

      ctx.fillStyle = "rgba(23,50,77,0.92)";
      ctx.fillRect(0, HUD_TOP, W, HUD_H);

      const midY = HUD_TOP + HUD_H / 2;

      ctx.font      = "bold 20px Arial";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.fillText(`${c.flag} ${countryPts} / ${cfgPointsToAdvance}`, 20, midY);

      ctx.textAlign = "center";
      ctx.fillText(`${c.flag} ${c.name} · ${c.music}`, W / 2, midY);

      // Hearts bar
      const hs     = 14;
      const hGap   = 8;
      const barPad = 10;
      const barW   = cfgMaxLives * (hs * 2) + (cfgMaxLives - 1) * hGap + barPad * 2;
      const barH   = 36;
      const barX   = W - barW - 14;
      const barY   = HUD_TOP + (HUD_H - barH) / 2;
      const barR   = barH / 2;

      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.moveTo(barX + barR, barY);
      ctx.lineTo(barX + barW - barR, barY);
      ctx.arcTo(barX + barW, barY, barX + barW, barY + barR, barR);
      ctx.lineTo(barX + barW, barY + barH - barR);
      ctx.arcTo(barX + barW, barY + barH, barX + barW - barR, barY + barH, barR);
      ctx.lineTo(barX + barR, barY + barH);
      ctx.arcTo(barX, barY + barH, barX, barY + barH - barR, barR);
      ctx.lineTo(barX, barY + barR);
      ctx.arcTo(barX, barY, barX + barR, barY, barR);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      function drawHeart(cx: number, cy: number, alive: boolean) {
        ctx.save();
        const s = hs * 0.9;
        ctx.beginPath();
        ctx.moveTo(cx, cy + s * 0.35);
        ctx.bezierCurveTo(cx, cy, cx - s, cy, cx - s, cy + s * 0.35);
        ctx.bezierCurveTo(cx - s, cy + s * 0.75, cx, cy + s, cx, cy + s * 1.15);
        ctx.bezierCurveTo(cx, cy + s, cx + s, cy + s * 0.75, cx + s, cy + s * 0.35);
        ctx.bezierCurveTo(cx + s, cy, cx, cy, cx, cy + s * 0.35);
        ctx.closePath();
        if (alive) {
          ctx.fillStyle = "#ff3355";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,160,180,0.7)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.beginPath();
          ctx.ellipse(cx - s * 0.28, cy + s * 0.18, s * 0.2, s * 0.13, -0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      for (let i = 0; i < cfgMaxLives; i++) {
        const cx = barX + barPad + hs + i * (hs * 2 + hGap);
        const cy = barY + (barH / 2) - hs * 0.6;
        drawHeart(cx, cy, i < lives);
      }

      const pct = Math.min(1, countryPts / cfgPointsToAdvance);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(0, HUD_TOP + HUD_H, W, 5);
      ctx.fillStyle = c.accent;
      ctx.fillRect(0, HUD_TOP + HUD_H, W * pct, 5);

      ctx.restore();
    }

    function drawCountryFlash(c: Country) {
      if (countryFlash <= 0) return;
      const alpha = Math.min(0.95, countryFlash / 60);
      const pad = 16, br = 999;
      const bx  = pad;
      const by  = HUD_BOT + 8;
      const hPad = 18, gap = 8;

      ctx.save();
      ctx.globalAlpha  = alpha;
      ctx.textBaseline = "middle";
      ctx.textAlign    = "left";

      ctx.font = "bold 36px Arial";
      const p1Text = `${c.flag}  ${c.name}`;
      const p1W    = ctx.measureText(p1Text).width + hPad * 2;
      const p1H    = 52;

      ctx.shadowColor   = "rgba(0,0,0,0.18)";
      ctx.shadowBlur    = 12;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle     = "rgba(255,255,255,0.96)";
      ctx.beginPath();
      ctx.roundRect(bx, by, p1W, p1H, br);
      ctx.fill();

      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth   = 3.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, p1W, p1H, br);
      ctx.stroke();

      ctx.fillStyle = "#17324d";
      ctx.fillText(p1Text, bx + hPad, by + p1H / 2);

      ctx.font = "bold 17px Arial";
      const p2Text = `🎵  Music: ${c.music}`;
      const p2W    = ctx.measureText(p2Text).width + hPad * 2;
      const p2H    = 36;
      const p2Y    = by + p1H + gap;
      const p2X    = bx + (p1W - p2W) / 2;

      ctx.shadowColor   = "rgba(0,0,0,0.14)";
      ctx.shadowBlur    = 10;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle     = c.accent;
      ctx.beginPath();
      ctx.roundRect(p2X, p2Y, p2W, p2H, br);
      ctx.fill();

      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle  = "#fff";
      ctx.fillText(p2Text, p2X + hPad, p2Y + p2H / 2);

      ctx.restore();
    }

    function drawAdvanceBanner(c: Country) {
      if (advanceFlash <= 0) return;
      const alpha = Math.min(1, advanceFlash / 40);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign   = "center";
      ctx.textBaseline = "middle";

      const text = `✈️  Flying to ${c.flag} ${c.name}!`;
      ctx.font = "bold 32px Arial";
      const tw = ctx.measureText(text).width;
      const ph = 60, pw = tw + 48;
      const px = (W - pw) / 2;
      const py = HUD_BOT + 18;

      ctx.shadowColor   = "rgba(0,0,0,0.25)";
      ctx.shadowBlur    = 16;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle     = c.accent;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 999);
      ctx.fill();

      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle  = "#fff";
      ctx.fillText(text, W / 2, py + ph / 2);
      ctx.restore();
    }

    // ── Physics & logic ────────────────────────────────────────────────────────
    function update() {
      frame++;
      const inCountdown = countdownRef.current > 0;

      if (inCountdown) {
        player.y  = GH / 2 + Math.sin(frame * 0.07) * 18;
        player.vy = 0;
        player.vx = 0;
        for (const cl of clouds) {
          cl.x -= 0.2 * cl.s;
          if (cl.x < -160) { cl.x = GW + 60 + Math.random() * 120; cl.y = 55 + Math.random() * 220; cl.s = 0.3 + Math.random() * 0.8; }
        }
        return;
      }

      speed = cfgInitSpeed + Math.floor(totalScore / cfgScoreStep) * cfgSpeedStep;

      if (advanceFlash > 0) advanceFlash--;
      if (countryFlash > 0) countryFlash--;

      if (keys["arrowup"]   || keys["w"]) player.vy -= 1.3;
      if (keys["arrowdown"] || keys["s"]) player.vy += 1.3;
      player.vy += 0.45;
      player.vy *= 0.92;
      player.y  += player.vy;

      if (keys["arrowright"] || keys["d"]) player.vx += 1.8;
      if (keys["arrowleft"]  || keys["a"]) player.vx -= 1.8;
      player.vx *= 0.85;
      player.x  += player.vx;

      const topBound   = (HUD_BOT - gy) / gameScale;
      const botBound   = (H - gy) / gameScale - PLANE_H;
      if (player.y < topBound)   { player.y = topBound;   player.vy = 0; }
      if (player.y > botBound)   { player.y = botBound;   player.vy = 0; }
      if (player.x < 0)          { player.x = 0;          player.vx = 0; }
      if (player.x > GW - PLANE_W) { player.x = GW - PLANE_W; player.vx = 0; }

      for (const cl of clouds) {
        cl.x -= 0.45 * cl.s;
        if (cl.x < -160) { cl.x = GW + 60 + Math.random() * 120; cl.y = 55 + Math.random() * 220; cl.s = 0.3 + Math.random() * 0.8; }
      }

      const spawnInterval = Math.max(cfgMinSpawn, cfgBaseSpawn - Math.floor(totalScore / cfgSpawnDecayScore) * 3);
      if (frame % spawnInterval === 0) {
        const cc = COUNTRIES[countryOrder[countryIdx]];
        dots.push({
          x: (W - gx) / gameScale + 40,
          y: topBound + 20 + Math.random() * (botBound - topBound - 40),
          r: cfgDotRadius,
          flag: cc.flag,
          accent: cc.accent,
          collected: false,
          popAlpha: 0,
          popOffY: 0,
        });
      }

      const px = player.x + PLANE_W * 0.5;
      const py = player.y + PLANE_H * 0.5;

      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i];

        if (d.collected) {
          d.popAlpha -= 0.055;
          d.popOffY  += 1.4;
          if (d.popAlpha <= 0) dots.splice(i, 1);
          continue;
        }

        d.x -= speed * cfgDotSpeed;

        if (d.x < -d.r * 2) {
          dots.splice(i, 1);
          lives--;
          if (lives <= 0) {
            setFinalScore(totalScore);
            setGameWon(false);
            phaseRef.current = "over";
            setPhase("over");
            audio.pause();
          }
          continue;
        }

        const dist = Math.hypot(px - d.x, py - d.y);
        if (dist < d.r + Math.min(PLANE_W, PLANE_H) * 0.28) {
          d.collected = true;
          d.popAlpha  = 1;
          countryPts++;
          totalScore++;

          if (countryPts >= cfgPointsToAdvance) {
            countryPts = 0;
            const nextIdx = (countryIdx + 1) % COUNTRIES.length;

            if (nextIdx === 0) {
              setFinalScore(totalScore);
              setGameWon(true);
              phaseRef.current = "over";
              setPhase("over");
              audio.pause();
              return;
            }

            countryIdx   = nextIdx;
            countryFlash = 180;
            advanceFlash = 120;
            dots.length  = 0;
            loadCountryAudio(COUNTRIES[countryOrder[countryIdx]]);
          }
        }
      }
    }

    function drawCountdown() {
      const secs = countdownRef.current;
      if (secs <= 0) return;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = "bold 120px Arial";
      ctx.fillStyle    = "#ffca3a";
      ctx.shadowColor  = "rgba(0,0,0,0.6)";
      ctx.shadowBlur   = 18;
      ctx.fillText(String(secs), W / 2, H / 2 - 30);
      ctx.font      = "bold 28px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 8;
      ctx.fillText("Get ready!", W / 2, H / 2 + 72);
      ctx.restore();
    }

    function draw() {
      const c = COUNTRIES[countryOrder[countryIdx]];

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c.skyTop);
      grad.addColorStop(1, c.skyBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = c.ground;
      ctx.fillRect(0, H - 40, W, 40);

      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(gameScale, gameScale);

      clouds.forEach(cl => drawCloud(cl.x, cl.y, cl.s));
      drawLandmark(c);

      for (const d of dots) {
        ctx.save();
        if (d.collected) {
          ctx.globalAlpha = Math.max(0, d.popAlpha);
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r * (1.5 + (1 - d.popAlpha)), 0, Math.PI * 2);
          ctx.strokeStyle = d.accent;
          ctx.lineWidth   = 2.5;
          ctx.stroke();
          ctx.font         = `${Math.round(d.r * 1.5)}px Arial`;
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(d.flag, d.x, d.y - d.popOffY);
        } else {
          ctx.shadowColor = d.accent;
          ctx.shadowBlur  = 8;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.78)";
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.strokeStyle = d.accent;
          ctx.lineWidth   = 2.5;
          ctx.stroke();

          ctx.font         = `${Math.round(d.r * 1.45)}px Arial`;
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(d.flag, d.x, d.y + 1);

          const shine = ctx.createRadialGradient(
            d.x - d.r * 0.32, d.y - d.r * 0.35, 1,
            d.x - d.r * 0.1,  d.y - d.r * 0.1,  d.r * 0.7,
          );
          shine.addColorStop(0, "rgba(255,255,255,0.18)");
          shine.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = shine;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (phaseRef.current === "playing") drawPlane();
      ctx.restore();

      if (phaseRef.current === "playing") {
        if (countdownRef.current <= 0) drawHUD(c);
        drawCountryFlash(c);
        drawAdvanceBanner(COUNTRIES[countryOrder[(countryIdx + 1) % COUNTRIES.length]]);
        drawCountdown();
      }
    }

    function loop() {
      if (phaseRef.current === "playing") update();
      draw();
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown",   onKeyDown);
      document.removeEventListener("keyup",     onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      audio.pause();
      audio.src = "";
    };
  }, []);

  function handleDifficultySelect(d: Difficulty) {
    difficultyRef.current = d;
    startFnRef.current();
  }

  function handlePlayAgain() { endSessionRef.current(); }
  function handleChangeLevel() { endSessionRef.current(); }

  // ── Shared card base style ─────────────────────────────────────────────────
  const cardBase: React.CSSProperties = {
    border: "3px solid rgba(255,255,255,0.25)",
    borderRadius: 24,
    padding: "32px 28px",
    cursor: "pointer",
    color: "#fff",
    fontFamily: "'Baloo 2', Arial, sans-serif",
    width: 210,
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
    transition: "transform 0.15s, box-shadow 0.15s",
    outline: "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#17324d" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: "pointer" }}
      />

      {phase === "playing" && (
        <button
          onClick={handlePlayAgain}
          style={{
            position: "absolute", bottom: 20, right: 20,
            border: 0, background: "#ffca3a", color: "#17324d",
            fontWeight: 800, padding: "10px 22px", borderRadius: 999,
            cursor: "pointer", fontFamily: "'Baloo 2', Arial, sans-serif",
            fontSize: "1rem", boxShadow: "0 3px 12px rgba(0,0,0,0.35)", zIndex: 20,
          }}
        >
          ↺ Restart
        </button>
      )}

      {/* ── Skill selection screen ─────────────────────────────────────────── */}
      {phase === "select" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 32,
          background: "rgba(0,0,0,0.65)", zIndex: 30,
          overflowY: "auto", paddingTop: 20, paddingBottom: 20,
        }}>
          <div style={{ textAlign: "center", color: "#fff", fontFamily: "'Baloo 2', Arial, sans-serif" }}>
            <img
              src={asset("/characters/air-fante-plane.png")}
              style={{ height: "5.5rem", width: "auto", transform: "scaleX(-1)", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
              alt="Air Fante"
            />
            <div style={{ fontSize: "1.9rem", fontWeight: 900, marginTop: 10, letterSpacing: "0.01em" }}>
              Air Fante Collect!
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, opacity: 0.75, marginTop: 4 }}>
              Choose your level
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>

            {/* Rookie */}
            <button
              onClick={() => handleDifficultySelect("rookie")}
              onMouseEnter={() => setHoveredCard("rookie")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...cardBase,
                background: "linear-gradient(145deg, #00c9a7 0%, #0096c7 100%)",
                transform: hoveredCard === "rookie" ? "scale(1.06) translateY(-4px)" : "scale(1)",
                boxShadow: hoveredCard === "rookie"
                  ? "0 16px 48px rgba(0,201,167,0.55)"
                  : "0 8px 32px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ fontSize: "3.8rem", lineHeight: 1 }}>🌟</div>
              <div style={{ fontSize: "1.65rem", fontWeight: 900, marginTop: 10 }}>Rookie</div>
              <div style={{ fontSize: "0.88rem", opacity: 0.92, marginTop: 8, lineHeight: 1.5, minHeight: 60 }}>
                Perfect for young explorers!<br />
                Bigger flags, slower pace<br />
                & easier goals.
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 5 }}>
                <span style={{ fontSize: "1.25rem" }}>⭐</span>
                <span style={{ fontSize: "1.25rem", opacity: 0.28 }}>⭐</span>
                <span style={{ fontSize: "1.25rem", opacity: 0.28 }}>⭐</span>
              </div>
              <div style={{
                marginTop: 10, fontSize: "0.78rem", opacity: 0.8,
                background: "rgba(255,255,255,0.18)", borderRadius: 999,
                padding: "4px 14px", display: "inline-block",
              }}>
                6 flags per country
              </div>
            </button>

            {/* Jangles Master */}
            <button
              onClick={() => handleDifficultySelect("master")}
              onMouseEnter={() => setHoveredCard("master")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...cardBase,
                background: "linear-gradient(145deg, #ff8c00 0%, #e63946 100%)",
                transform: hoveredCard === "master" ? "scale(1.06) translateY(-4px)" : "scale(1)",
                boxShadow: hoveredCard === "master"
                  ? "0 16px 48px rgba(255,140,0,0.55)"
                  : "0 8px 32px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ fontSize: "3.8rem", lineHeight: 1 }}>⚡</div>
              <div style={{ fontSize: "1.65rem", fontWeight: 900, marginTop: 10 }}>Jangles Master</div>
              <div style={{ fontSize: "0.88rem", opacity: 0.92, marginTop: 8, lineHeight: 1.5, minHeight: 60 }}>
                For expert collectors!<br />
                Fast flags, fewer spawns<br />
                & bigger goals.
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 5 }}>
                <span style={{ fontSize: "1.25rem" }}>⭐</span>
                <span style={{ fontSize: "1.25rem" }}>⭐</span>
                <span style={{ fontSize: "1.25rem" }}>⭐</span>
              </div>
              <div style={{
                marginTop: 10, fontSize: "0.78rem", opacity: 0.8,
                background: "rgba(255,255,255,0.18)", borderRadius: 999,
                padding: "4px 14px", display: "inline-block",
              }}>
                15 flags per country
              </div>
            </button>
          </div>

          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            ↑ ↓ or W S to fly · ← → or A D to move · tap to boost
          </div>
        </div>
      )}

      {/* ── Win screen ─────────────────────────────────────────────────────── */}
      {phase === "over" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 20,
          background: "rgba(0,0,0,0.58)", zIndex: 30,
        }}>
          <div style={{ textAlign: "center", color: "#fff", fontFamily: "'Baloo 2', Arial, sans-serif" }}>
            <div style={{ fontSize: "3rem" }}>{gameWon ? "🌍" : "💔"}</div>
            <div style={{ fontSize: "2.4rem", fontWeight: 900, marginTop: 8 }}>
              {gameWon ? "World Tour Complete!" : "Game Over!"}
            </div>
            <div style={{ fontSize: "1.3rem", marginTop: 10, opacity: 0.85 }}>
              {gameWon
                ? <>You collected <span style={{ color: "#ffca3a", fontWeight: 900 }}>{finalScore} flags</span> across all {COUNTRIES.length} countries!</>
                : <>You collected <span style={{ color: "#ffca3a", fontWeight: 900 }}>{finalScore} flags</span> before running out of lives.</>
              }
            </div>
            <div style={{
              marginTop: 10, fontSize: "0.9rem", opacity: 0.65,
              background: difficultyRef.current === "rookie"
                ? "rgba(0,201,167,0.25)"
                : "rgba(255,140,0,0.25)",
              borderRadius: 999, padding: "4px 16px", display: "inline-block",
            }}>
              {difficultyRef.current === "rookie" ? "🌟 Rookie" : "⚡ Jangles Master"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <button
              onClick={handlePlayAgain}
              style={{
                background: "#ffca3a", color: "#17324d", border: "none", borderRadius: 999,
                padding: "14px 36px", fontSize: "1.2rem", fontWeight: 900, cursor: "pointer",
                fontFamily: "'Baloo 2', Arial, sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              Play Again
            </button>
            <button
              onClick={handleChangeLevel}
              style={{
                background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)",
                borderRadius: 999, padding: "14px 28px", fontSize: "1rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "'Baloo 2', Arial, sans-serif",
              }}
            >
              Change Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
