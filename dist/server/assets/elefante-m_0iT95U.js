import { r as reactExports, V as jsxRuntimeExports } from "./server-HtPeGmJD.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const COUNTRIES = [
  { name: "U.S.A.", flag: "🇺🇸", music: "Jazz & Blues", audio: "music/NEW ORLEANS.wav", skyTop: "#1a1a4e", skyBot: "#2d3a6e", ground: "#1a2a1a", accent: "#f5c94c", landmark: "none" },
  { name: "Mexico", flag: "🇲🇽", music: "Mariachi", audio: "music/MEXICO.wav", skyTop: "#4ac8ff", skyBot: "#ffe8a0", ground: "#d4a055", accent: "#ce1032", landmark: "palms" },
  { name: "Jamaica", flag: "🇯🇲", music: "Reggae", audio: "music/JAMAICA.wav", skyTop: "#5abfff", skyBot: "#c5f0ff", ground: "#f5d07a", accent: "#009b3a", landmark: "palms" },
  { name: "Barbados", flag: "🇧🇧", music: "Dancehall", audio: "music/BARBADOS_2.wav", skyTop: "#35c6ff", skyBot: "#aae8ff", ground: "#e8c87a", accent: "#003b7a", landmark: "palms" },
  { name: "Peru", flag: "🇵🇪", music: "Flutes", audio: "music/PERU.wav", skyTop: "#82c8e8", skyBot: "#c8e8a0", ground: "#b08a50", accent: "#d91023", landmark: "andes" },
  { name: "Argentina", flag: "🇦🇷", music: "Tango", audio: "music/ARGENTINA DRUMS AND HORNS_1.2.wav", skyTop: "#9ed6f5", skyBot: "#ddf0ff", ground: "#888080", accent: "#75aadb", landmark: "obelisk" },
  { name: "Antarctica", flag: "🇦🇶", music: "Ambient", audio: "", skyTop: "#cce8ff", skyBot: "#e8f5ff", ground: "#d0eaff", accent: "#4a9fd4", landmark: "mountains" },
  { name: "United Kingdom", flag: "🇬🇧", music: "Orchestral", audio: "music/UK.wav", skyTop: "#68b4e8", skyBot: "#c0d8f0", ground: "#8b7a6a", accent: "#c8102e", landmark: "none" },
  { name: "Spain", flag: "🇪🇸", music: "Flamenco", audio: "music/SPAIN1.2.wav", skyTop: "#7888d0", skyBot: "#c8b0e0", ground: "#d4a855", accent: "#c60b1e", landmark: "none" },
  { name: "France", flag: "🇫🇷", music: "Accordion", audio: "music/FRANCE.wav", skyTop: "#5abfff", skyBot: "#d0f0a0", ground: "#78aa60", accent: "#2d5aa7", landmark: "eiffel" },
  { name: "Italy", flag: "🇮🇹", music: "Opera", audio: "music/ITALY.wav", skyTop: "#78c0e8", skyBot: "#fff0c0", ground: "#e8c87a", accent: "#009246", landmark: "none" },
  { name: "Sri Lanka", flag: "🇱🇰", music: "Sitar & Tabla", audio: "music/SRI LANKA_1.1.wav", skyTop: "#508088", skyBot: "#a0d0c0", ground: "#a06030", accent: "#8d153a", landmark: "temple" },
  { name: "Japan", flag: "🇯🇵", music: "Shakuhachi", audio: "music/JAPAN.wav", skyTop: "#88ccdc", skyBot: "#cceeee", ground: "#306878", accent: "#bc002d", landmark: "fuji" },
  { name: "Switzerland", flag: "🇨🇭", music: "Alphorn", audio: "music/SWISS.wav", skyTop: "#88ccf0", skyBot: "#e8f5ff", ground: "#f0f8ff", accent: "#d52b1e", landmark: "alps" },
  { name: "Kenya", flag: "🇰🇪", music: "Benga", audio: "music/KENYA.wav", skyTop: "#70c8f0", skyBot: "#c8e888", ground: "#c8a850", accent: "#006600", landmark: "none" },
  { name: "South Africa", flag: "🇿🇦", music: "Goema", audio: "music/SOUTH AFRICA_1.2.wav", skyTop: "#68c8f0", skyBot: "#d0f0ff", ground: "#e8d080", accent: "#007a4d", landmark: "tableMtn" },
  { name: "Ghana", flag: "🇬🇭", music: "Azonto", audio: "music/GHANA.wav", skyTop: "#68b8e8", skyBot: "#e8e0a8", ground: "#d0a040", accent: "#ce1126", landmark: "none" },
  { name: "South Korea", flag: "🇰🇷", music: "K-pop", audio: "music/SOUTH KOREA.wav", skyTop: "#8878b0", skyBot: "#c0b0d8", ground: "#7070a0", accent: "#cd2e3a", landmark: "none" },
  { name: "Nepal", flag: "🇳🇵", music: "Sarangi", audio: "music/NEPAL.wav", skyTop: "#88c8e8", skyBot: "#e0f0ff", ground: "#d0e8f8", accent: "#dc143c", landmark: "mountains" },
  { name: "Indonesia", flag: "🇮🇩", music: "Gamelan", audio: "music/INDONESIA.wav", skyTop: "#35c6e8", skyBot: "#a0e8e8", ground: "#c8a878", accent: "#ce1126", landmark: "palms" },
  { name: "Australia", flag: "🇦🇺", music: "Orchestral", audio: "music/Jamie Jangles_Daniel_Australia.wav", skyTop: "#2878d4", skyBot: "#5090e0", ground: "#1c5ca8", accent: "#0f4c81", landmark: "opera" }
];
const COUNTRY_DURATION_MS = 1e4;
const MAX_LIVES = 5;
const PLANE_W = 190;
const PLANE_H = 118;
function ElefanteGame() {
  const canvasRef = reactExports.useRef(null);
  const audioRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const existing = document.querySelector("link[rel='icon']");
    const prevHref = existing?.href ?? "";
    const link = existing ?? document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = "/characters/air-fante.png";
    if (!existing) document.head.appendChild(link);
    return () => {
      link.href = prevHref;
    };
  }, []);
  const phaseRef = reactExports.useRef("start");
  const startFnRef = reactExports.useRef(() => {
  });
  const [phase, setPhase] = reactExports.useState("start");
  const [livesDisplay, setLivesDisplay] = reactExports.useState(MAX_LIVES);
  const [finalScore, setFinalScore] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");
    const GW = 900, GH = 506;
    const gameScale = Math.min(W / GW, H / GH) * 0.5;
    const gx = Math.round((W - GW * gameScale) / 2);
    const gy = Math.round((H - GH * gameScale) / 2);
    const keys = {};
    let score = 0;
    let countryIdx = 0;
    let lastCountryIdx = -1;
    let countryFlash = 0;
    let rafId = 0;
    let gameStartTime = 0;
    let elapsedMs = 0;
    const player = { x: 120, y: GH / 2, vy: 0 };
    const clouds = [];
    const NUM_CLOUDS = 5;
    for (let i = 0; i < NUM_CLOUDS; i++) {
      const laneW = GW / NUM_CLOUDS;
      clouds.push({
        x: i * laneW + Math.random() * laneW * 0.85,
        y: 55 + Math.random() * 220,
        s: 0.3 + Math.random() * 0.8
      });
    }
    const planeImg = new Image();
    let planeReady = false;
    planeImg.onload = () => {
      planeReady = true;
    };
    planeImg.src = "/characters/air-fante-plane.png";
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;
    function loadCountryAudio(c) {
      if (phaseRef.current === "over") return;
      if (!c.audio) {
        audio.pause();
        return;
      }
      audio.src = "/" + encodeURI(c.audio);
      audio.currentTime = 0;
      audio.play().catch(() => {
      });
    }
    function startGame() {
      score = 0;
      countryIdx = 0;
      lastCountryIdx = -1;
      countryFlash = 160;
      gameStartTime = performance.now();
      elapsedMs = 0;
      player.x = 120;
      player.y = GH / 2;
      player.vy = 0;
      phaseRef.current = "playing";
      setPhase("playing");
      setLivesDisplay(MAX_LIVES);
      loadCountryAudio(COUNTRIES[0]);
    }
    startFnRef.current = startGame;
    function onKeyDown(e) {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " ") {
        if (phaseRef.current === "playing") player.vy = -7;
      }
    }
    function onKeyUp(e) {
      keys[e.key.toLowerCase()] = false;
    }
    function onPointerDown() {
      if (phaseRef.current === "playing") player.vy = -7;
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    function drawCloud(x, y, s) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(x, y, 20 * s, 0, Math.PI * 2);
      ctx.arc(x + 22 * s, y - 18 * s, 30 * s, 0, Math.PI * 2);
      ctx.arc(x + 52 * s, y - 8 * s, 24 * s, 0, Math.PI * 2);
      ctx.arc(x + 68 * s, y + 4 * s, 16 * s, 0, Math.PI * 2);
      ctx.arc(x + 12 * s, y + 10 * s, 18 * s, 0, Math.PI * 2);
      ctx.arc(x + 38 * s, y + 8 * s, 22 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    function drawPlane() {
      if (!planeReady) return;
      ctx.save();
      ctx.translate(player.x + PLANE_W, player.y);
      ctx.scale(-1, 1);
      ctx.drawImage(planeImg, 0, 0, PLANE_W, PLANE_H);
      ctx.restore();
    }
    function drawHUD(c) {
      ctx.save();
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(23,50,77,0.92)";
      ctx.fillRect(0, 0, W, 52);
      const midY = 26;
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.fillText(`Score: ${score}`, 20, midY);
      ctx.textAlign = "center";
      ctx.fillText(`${c.flag} ${c.name} · ${c.music}`, W / 2, midY);
      const pct = elapsedMs % COUNTRY_DURATION_MS / COUNTRY_DURATION_MS;
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(0, 52, W, 5);
      ctx.fillStyle = "#ffca3a";
      ctx.fillRect(0, 52, W * pct, 5);
      ctx.restore();
    }
    function drawCountryFlash(c) {
      if (countryFlash <= 0) return;
      const alpha = Math.min(0.95, countryFlash / 90);
      const bx = W / 2 - 265, by = H / 2 - 64;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.fillRect(bx, by, 530, 128);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 5;
      ctx.strokeRect(bx, by, 530, 128);
      ctx.fillStyle = "#17324d";
      ctx.textAlign = "center";
      ctx.font = "bold 46px Arial";
      ctx.fillText(`${c.flag} ${c.name}`, W / 2, by + 46);
      ctx.font = "bold 22px Arial";
      ctx.fillText(`Music: ${c.music}`, W / 2, by + 90);
      ctx.restore();
    }
    function update() {
      elapsedMs = performance.now() - gameStartTime;
      const newIdx = Math.floor(elapsedMs / COUNTRY_DURATION_MS) % COUNTRIES.length;
      if (newIdx !== lastCountryIdx) {
        countryIdx = newIdx;
        lastCountryIdx = newIdx;
        countryFlash = 160;
        loadCountryAudio(COUNTRIES[countryIdx]);
      }
      if (countryFlash > 0) countryFlash--;
      if (keys["arrowup"] || keys["w"]) player.vy -= 0.55;
      if (keys["arrowdown"] || keys["s"]) player.vy += 0.55;
      player.vy += 0.2;
      player.vy *= 0.92;
      player.y += player.vy;
      if (player.y < 0) {
        player.y = 0;
        player.vy = 0;
      }
      if (player.y > GH - PLANE_H) {
        player.y = GH - PLANE_H;
        player.vy = 0;
      }
      for (const cl of clouds) {
        cl.x -= 0.45 * cl.s;
        if (cl.x < -160) {
          cl.x = GW + 60 + Math.random() * 120;
          cl.y = 55 + Math.random() * 220;
          cl.s = 0.3 + Math.random() * 0.8;
        }
      }
    }
    function draw() {
      const c = COUNTRIES[countryIdx];
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c.skyTop);
      grad.addColorStop(1, c.skyBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(W - 100, 90, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = c.ground;
      ctx.fillRect(0, H - 40, W, 40);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(gameScale, gameScale);
      clouds.forEach((cl) => drawCloud(cl.x, cl.y, cl.s));
      if (phaseRef.current === "playing") drawPlane();
      ctx.restore();
      if (phaseRef.current === "playing") {
        drawHUD(c);
        drawCountryFlash(c);
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
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      audio.pause();
      audio.src = "";
    };
  }, []);
  function handlePlay() {
    startFnRef.current();
  }
  function handlePlayAgain() {
    startFnRef.current();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "fixed", inset: 0, overflow: "hidden", background: "#17324d" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        style: { width: "100%", height: "100%", display: "block", cursor: "pointer" }
      }
    ),
    phase === "playing" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "absolute",
          top: 10,
          left: 16,
          display: "flex",
          gap: 6,
          zIndex: 20,
          pointerEvents: "none"
        },
        children: Array.from({ length: MAX_LIVES }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: i < livesDisplay ? "#ff3355" : "rgba(255,255,255,0.12)",
              border: `2.5px solid ${i < livesDisplay ? "#ff99aa" : "rgba(255,255,255,0.25)"}`,
              boxShadow: i < livesDisplay ? "0 0 8px #ff335566" : "none",
              transition: "background 0.2s, box-shadow 0.2s"
            }
          },
          i
        ))
      }
    ),
    phase === "playing" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handlePlay,
        style: {
          position: "absolute",
          bottom: 20,
          right: 20,
          border: 0,
          background: "#ffca3a",
          color: "#17324d",
          fontWeight: 800,
          padding: "10px 22px",
          borderRadius: 999,
          cursor: "pointer",
          fontFamily: "'Baloo 2', Arial, sans-serif",
          fontSize: "1rem",
          boxShadow: "0 3px 12px rgba(0,0,0,0.35)",
          zIndex: 20
        },
        children: "↺ Restart"
      }
    ),
    phase === "start" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "rgba(0,0,0,0.42)",
          zIndex: 30
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#fff", fontFamily: "'Baloo 2', Arial, sans-serif" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "4rem", lineHeight: 1 }, children: "✈️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "2.8rem", fontWeight: 900, marginTop: 8, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }, children: "Air Fante" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.15rem", fontWeight: 600, opacity: 0.85, marginTop: 4 }, children: "World Tour" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handlePlay,
              style: {
                background: "#ffca3a",
                color: "#17324d",
                border: "none",
                borderRadius: 999,
                padding: "16px 52px",
                fontSize: "1.5rem",
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "'Baloo 2', Arial, sans-serif",
                boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
                letterSpacing: "0.02em"
              },
              children: "▶ Play"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }, children: "Tap or press Space / ↑ ↓ to fly" })
        ]
      }
    ),
    phase === "over" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: "rgba(0,0,0,0.58)",
          zIndex: 30
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#fff", fontFamily: "'Baloo 2', Arial, sans-serif" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "2.6rem", fontWeight: 900 }, children: "Game Over" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.4rem", marginTop: 8, opacity: 0.85 }, children: [
              "Final Score: ",
              finalScore
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handlePlayAgain,
              style: {
                background: "#ffca3a",
                color: "#17324d",
                border: "none",
                borderRadius: 999,
                padding: "14px 44px",
                fontSize: "1.3rem",
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "'Baloo 2', Arial, sans-serif",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
              },
              children: "Play Again"
            }
          )
        ]
      }
    )
  ] });
}
const SplitComponent = ElefanteGame;
export {
  SplitComponent as component
};
