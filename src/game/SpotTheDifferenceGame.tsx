import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { burstFinale } from "@/game/confetti";
import { cn } from "@/lib/utils";
import { LEVELS, resolveLevel, type ResolvedDiff, type DiffType } from "./spot-the-difference-data";
import { asset } from "@/lib/asset";

const HIT_RADIUS_ROOKIE = 30;
const HIT_RADIUS_MASTER = 16;
const VB = 400;

type Difficulty = "rookie" | "master";

// ── Shape renderers ────────────────────────────────────────────────────────────
// Designed to look like illustrated elements that belong in a children's book.

function ShapeBird({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* body */}
      <ellipse cx={cx} cy={cy + 4} rx={12} ry={9} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      {/* head */}
      <circle cx={cx + 10} cy={cy - 2} r={7} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      {/* beak */}
      <polygon points={`${cx + 17},${cy - 2} ${cx + 23},${cy} ${cx + 17},${cy + 2}`} fill="#f39c12" />
      {/* eye */}
      <circle cx={cx + 12} cy={cy - 4} r={2} fill="#2c3e50" />
      <circle cx={cx + 13} cy={cy - 5} r={0.8} fill="white" />
      {/* wing */}
      <path d={`M${cx - 2},${cy} Q${cx - 10},${cy - 8} ${cx - 14},${cy + 2} Q${cx - 6},${cy + 4} ${cx - 2},${cy}`} fill="rgba(0,0,0,0.15)" />
      {/* tail */}
      <path d={`M${cx - 10},${cy + 4} L${cx - 18},${cy} L${cx - 18},${cy + 8} Z`} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
    </g>
  );
}

function ShapeButterfly({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const c2 = color === "#fff" ? "#aee6f8" : color;
  return (
    <g>
      {/* upper wings */}
      <ellipse cx={cx - 11} cy={cy - 7} rx={12} ry={9} fill={c2} opacity={0.9} stroke="rgba(0,0,0,0.2)" strokeWidth={1} transform={`rotate(-25,${cx - 11},${cy - 7})`} />
      <ellipse cx={cx + 11} cy={cy - 7} rx={12} ry={9} fill={c2} opacity={0.9} stroke="rgba(0,0,0,0.2)" strokeWidth={1} transform={`rotate(25,${cx + 11},${cy - 7})`} />
      {/* lower wings */}
      <ellipse cx={cx - 9} cy={cy + 7} rx={9} ry={6} fill={c2} opacity={0.75} stroke="rgba(0,0,0,0.15)" strokeWidth={1} transform={`rotate(20,${cx - 9},${cy + 7})`} />
      <ellipse cx={cx + 9} cy={cy + 7} rx={9} ry={6} fill={c2} opacity={0.75} stroke="rgba(0,0,0,0.15)" strokeWidth={1} transform={`rotate(-20,${cx + 9},${cy + 7})`} />
      {/* wing spots */}
      <circle cx={cx - 10} cy={cy - 8} r={3} fill="rgba(255,255,255,0.5)" />
      <circle cx={cx + 10} cy={cy - 8} r={3} fill="rgba(255,255,255,0.5)" />
      {/* body */}
      <ellipse cx={cx} cy={cy} rx={3} ry={10} fill="#3d2b1f" />
      {/* antennae */}
      <line x1={cx - 1} y1={cy - 9} x2={cx - 7} y2={cy - 18} stroke="#3d2b1f" strokeWidth={1.2} />
      <circle cx={cx - 7} cy={cy - 18} r={2} fill="#3d2b1f" />
      <line x1={cx + 1} y1={cy - 9} x2={cx + 7} y2={cy - 18} stroke="#3d2b1f" strokeWidth={1.2} />
      <circle cx={cx + 7} cy={cy - 18} r={2} fill="#3d2b1f" />
    </g>
  );
}

function ShapeCrab({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* legs */}
      {[-16, -8, 8, 16].map((dx) => (
        <line key={dx} x1={cx + dx * 0.4} y1={cy + 4} x2={cx + dx} y2={cy + 12} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      ))}
      {/* claws */}
      <circle cx={cx - 20} cy={cy - 2} r={5} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      <circle cx={cx + 20} cy={cy - 2} r={5} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      <line x1={cx - 11} y1={cy + 2} x2={cx - 17} y2={cy - 1} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + 11} y1={cy + 2} x2={cx + 17} y2={cy - 1} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* body */}
      <ellipse cx={cx} cy={cy + 2} rx={14} ry={10} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* eyes */}
      <circle cx={cx - 5} cy={cy - 4} r={2.5} fill="white" />
      <circle cx={cx + 5} cy={cy - 4} r={2.5} fill="white" />
      <circle cx={cx - 5} cy={cy - 4} r={1.5} fill="#2c3e50" />
      <circle cx={cx + 5} cy={cy - 4} r={1.5} fill="#2c3e50" />
    </g>
  );
}

function ShapeStarfish({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a1 = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    return `${cx + Math.cos(a1) * 14},${cy + Math.sin(a1) * 14} ${cx + Math.cos(a2) * 6},${cy + Math.sin(a2) * 6}`;
  }).join(" ");
  return (
    <g>
      <polygon points={pts} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} opacity={0.9} />
      <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.4)" />
      {/* texture dots */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return <circle key={i} cx={cx + Math.cos(a) * 9} cy={cy + Math.sin(a) * 9} r={1.5} fill="rgba(255,255,255,0.5)" />;
      })}
    </g>
  );
}

function ShapeFish({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* tail fin */}
      <polygon points={`${cx + 12},${cy} ${cx + 22},${cy - 8} ${cx + 22},${cy + 8}`} fill={color} opacity={0.8} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
      {/* body */}
      <ellipse cx={cx} cy={cy} rx={14} ry={9} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* stripe */}
      <ellipse cx={cx - 1} cy={cy} rx={4} ry={9} fill="rgba(255,255,255,0.3)" />
      {/* eye */}
      <circle cx={cx - 7} cy={cy - 2} r={3} fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      <circle cx={cx - 7} cy={cy - 2} r={1.8} fill="#2c3e50" />
      <circle cx={cx - 6} cy={cy - 3} r={0.7} fill="white" />
      {/* top fin */}
      <path d={`M${cx - 4},${cy - 9} Q${cx},${cy - 16} ${cx + 6},${cy - 9}`} fill={color} opacity={0.8} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
    </g>
  );
}

function ShapeFlower({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* stem */}
      <line x1={cx} y1={cy + 6} x2={cx} y2={cy + 18} stroke="#27ae60" strokeWidth={2.5} strokeLinecap="round" />
      {/* petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse
          key={deg}
          cx={cx + Math.cos((deg * Math.PI) / 180) * 9}
          cy={cy + Math.sin((deg * Math.PI) / 180) * 9}
          rx={6} ry={4}
          fill={color}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={0.5}
          transform={`rotate(${deg},${cx + Math.cos((deg * Math.PI) / 180) * 9},${cy + Math.sin((deg * Math.PI) / 180) * 9})`}
        />
      ))}
      {/* centre */}
      <circle cx={cx} cy={cy} r={6} fill="#f9ca24" stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={3} fill="#e67e22" />
    </g>
  );
}

function ShapeCloud({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g opacity={0.93}>
      <ellipse cx={cx} cy={cy + 4} rx={22} ry={13} fill="white" />
      <ellipse cx={cx + 14} cy={cy + 5} rx={15} ry={11} fill="white" />
      <ellipse cx={cx - 14} cy={cy + 6} rx={13} ry={10} fill="white" />
      <ellipse cx={cx + 4} cy={cy - 3} rx={16} ry={12} fill="white" />
      <ellipse cx={cx - 5} cy={cy - 1} rx={13} ry={10} fill="white" />
      {/* subtle shading */}
      <ellipse cx={cx} cy={cy + 10} rx={20} ry={7} fill="rgba(200,220,240,0.35)" />
    </g>
  );
}

function ShapeSnowflake({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {[0, 60, 120].map((deg) => (
        <line
          key={deg}
          x1={cx + Math.cos((deg * Math.PI) / 180) * 15}
          y1={cy + Math.sin((deg * Math.PI) / 180) * 15}
          x2={cx - Math.cos((deg * Math.PI) / 180) * 15}
          y2={cy - Math.sin((deg * Math.PI) / 180) * 15}
          stroke={color} strokeWidth={2.5} strokeLinecap="round"
        />
      ))}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = Math.PI / 180;
        const bx = cx + Math.cos(deg * r) * 9;
        const by = cy + Math.sin(deg * r) * 9;
        return (
          <g key={`b${deg}`}>
            <line x1={bx} y1={by} x2={bx + Math.cos((deg + 50) * r) * 5} y2={by + Math.sin((deg + 50) * r) * 5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
            <line x1={bx} y1={by} x2={bx + Math.cos((deg - 50) * r) * 5} y2={by + Math.sin((deg - 50) * r) * 5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
}

function ShapePenguin({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* body */}
      <ellipse cx={cx} cy={cy + 4} rx={11} ry={14} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* belly */}
      <ellipse cx={cx} cy={cy + 8} rx={7} ry={9} fill="white" />
      {/* head */}
      <circle cx={cx} cy={cy - 9} r={10} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* face */}
      <ellipse cx={cx} cy={cy - 7} rx={6} ry={5} fill="white" />
      {/* beak */}
      <polygon points={`${cx - 3},${cy - 7} ${cx + 3},${cy - 7} ${cx},${cy - 2}`} fill="#f39c12" />
      {/* eyes */}
      <circle cx={cx - 3} cy={cy - 11} r={2} fill="#2c3e50" />
      <circle cx={cx + 3} cy={cy - 11} r={2} fill="#2c3e50" />
      <circle cx={cx - 2.5} cy={cy - 11.5} r={0.8} fill="white" />
      <circle cx={cx + 3.5} cy={cy - 11.5} r={0.8} fill="white" />
      {/* flippers */}
      <ellipse cx={cx - 13} cy={cy + 3} rx={4} ry={9} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={1} transform={`rotate(-15,${cx - 13},${cy + 3})`} />
      <ellipse cx={cx + 13} cy={cy + 3} rx={4} ry={9} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={1} transform={`rotate(15,${cx + 13},${cy + 3})`} />
      {/* feet */}
      <ellipse cx={cx - 5} cy={cy + 18} rx={5} ry={3} fill="#f39c12" />
      <ellipse cx={cx + 5} cy={cy + 18} rx={5} ry={3} fill="#f39c12" />
    </g>
  );
}

function ShapeBalloon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* string */}
      <path d={`M${cx},${cy + 17} Q${cx + 5},${cy + 25} ${cx},${cy + 32}`} fill="none" stroke="#95a5a6" strokeWidth={1.2} />
      {/* balloon */}
      <ellipse cx={cx} cy={cy} rx={14} ry={17} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
      {/* highlight */}
      <ellipse cx={cx - 4} cy={cy - 5} rx={5} ry={7} fill="rgba(255,255,255,0.35)" />
      {/* knot */}
      <circle cx={cx} cy={cy + 17} r={2.5} fill={color} />
    </g>
  );
}

function ShapeCat({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* tail */}
      <path d={`M${cx + 10},${cy + 10} Q${cx + 22},${cy + 4} ${cx + 18},${cy - 6}`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      {/* body */}
      <ellipse cx={cx} cy={cy + 6} rx={12} ry={10} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* head */}
      <circle cx={cx} cy={cy - 5} r={11} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* ears */}
      <polygon points={`${cx - 10},${cy - 13} ${cx - 5},${cy - 20} ${cx - 1},${cy - 13}`} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      <polygon points={`${cx + 10},${cy - 13} ${cx + 5},${cy - 20} ${cx + 1},${cy - 13}`} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* inner ears */}
      <polygon points={`${cx - 9},${cy - 14} ${cx - 5},${cy - 19} ${cx - 2},${cy - 14}`} fill="#ffb3c1" />
      <polygon points={`${cx + 9},${cy - 14} ${cx + 5},${cy - 19} ${cx + 2},${cy - 14}`} fill="#ffb3c1" />
      {/* face */}
      <circle cx={cx - 4} cy={cy - 6} r={2.5} fill="#2c3e50" />
      <circle cx={cx + 4} cy={cy - 6} r={2.5} fill="#2c3e50" />
      <circle cx={cx - 3.2} cy={cy - 6.8} r={0.9} fill="white" />
      <circle cx={cx + 4.8} cy={cy - 6.8} r={0.9} fill="white" />
      {/* nose */}
      <polygon points={`${cx - 2},${cy - 2} ${cx + 2},${cy - 2} ${cx},${cy}`} fill="#ffb3c1" />
      {/* whiskers */}
      <line x1={cx - 3} y1={cy - 1} x2={cx - 13} y2={cy - 3} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      <line x1={cx - 3} y1={cy}   x2={cx - 13} y2={cy + 1}   stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      <line x1={cx + 3} y1={cy - 1} x2={cx + 13} y2={cy - 3} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      <line x1={cx + 3} y1={cy}   x2={cx + 13} y2={cy + 1}   stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
    </g>
  );
}

function ShapeLadybug({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* head */}
      <circle cx={cx} cy={cy - 8} r={6} fill="#2c3e50" />
      {/* antennae */}
      <line x1={cx - 3} y1={cy - 13} x2={cx - 8} y2={cy - 21} stroke="#2c3e50" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={cx - 8} cy={cy - 21} r={1.5} fill="#2c3e50" />
      <line x1={cx + 3} y1={cy - 13} x2={cx + 8} y2={cy - 21} stroke="#2c3e50" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={cx + 8} cy={cy - 21} r={1.5} fill="#2c3e50" />
      {/* body */}
      <ellipse cx={cx} cy={cy + 2} rx={12} ry={10} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      {/* centre line */}
      <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 12} stroke="rgba(0,0,0,0.3)" strokeWidth={1.2} />
      {/* spots */}
      <circle cx={cx - 5} cy={cy - 1} r={2.5} fill="rgba(0,0,0,0.4)" />
      <circle cx={cx + 5} cy={cy - 1} r={2.5} fill="rgba(0,0,0,0.4)" />
      <circle cx={cx - 5} cy={cy + 6} r={2}   fill="rgba(0,0,0,0.4)" />
      <circle cx={cx + 5} cy={cy + 6} r={2}   fill="rgba(0,0,0,0.4)" />
    </g>
  );
}

function ShapeMusicNote({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* note head */}
      <ellipse cx={cx - 2} cy={cy + 10} rx={7} ry={5} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} transform={`rotate(-20,${cx - 2},${cy + 10})`} />
      {/* stem */}
      <line x1={cx + 4} y1={cy + 7} x2={cx + 4} y2={cy - 10} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* flag */}
      <path d={`M${cx + 4},${cy - 10} Q${cx + 16},${cy - 4} ${cx + 10},${cy + 2}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function ShapeSeashell({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* outer shape */}
      <path
        d={`M${cx},${cy + 14} Q${cx - 16},${cy + 6} ${cx - 14},${cy - 6} Q${cx - 8},${cy - 16} ${cx},${cy - 12} Q${cx + 8},${cy - 16} ${cx + 14},${cy - 6} Q${cx + 16},${cy + 6} ${cx},${cy + 14}`}
        fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} opacity={0.9}
      />
      {/* ridges */}
      {[-5, 0, 5].map((dx) => (
        <path key={dx} d={`M${cx + dx},${cy - 10} Q${cx + dx * 1.5},${cy} ${cx + dx * 0.5},${cy + 12}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
      ))}
      {/* centre dot */}
      <circle cx={cx} cy={cy + 14} r={3} fill="rgba(0,0,0,0.15)" />
    </g>
  );
}

function ShapeCoconut({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* husk */}
      <ellipse cx={cx} cy={cy} rx={11} ry={13} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      {/* fibre texture */}
      <line x1={cx - 6} y1={cy - 4} x2={cx + 6} y2={cy - 8} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <line x1={cx - 7} y1={cy + 1} x2={cx + 7} y2={cy - 3} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <line x1={cx - 6} y1={cy + 6} x2={cx + 6} y2={cy + 2}  stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      {/* eyes — the three dark circles */}
      <circle cx={cx - 3} cy={cy - 6} r={2} fill="#5D3A1A" />
      <circle cx={cx + 3} cy={cy - 6} r={2} fill="#5D3A1A" />
      <circle cx={cx}     cy={cy - 2} r={2} fill="#5D3A1A" />
    </g>
  );
}

function ShapeLeaf({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <path d={`M${cx},${cy + 16} Q${cx - 14},${cy} ${cx - 8},${cy - 12} Q${cx},${cy - 18} ${cx + 8},${cy - 12} Q${cx + 14},${cy} ${cx},${cy + 16}`} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} opacity={0.9} />
      <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 14} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} />
      <line x1={cx} y1={cy - 4} x2={cx - 8} y2={cy + 2} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      <line x1={cx} y1={cy - 4} x2={cx + 8} y2={cy + 2} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
    </g>
  );
}

function DiffShape({ diff }: { diff: ResolvedDiff }) {
  const { type, cx, cy, color, scale = 1 } = diff;
  const inner: Record<DiffType, React.ReactElement> = {
    "bird":        <ShapeBird       cx={cx} cy={cy} color={color} />,
    "butterfly":   <ShapeButterfly  cx={cx} cy={cy} color={color} />,
    "crab":        <ShapeCrab       cx={cx} cy={cy} color={color} />,
    "starfish":    <ShapeStarfish   cx={cx} cy={cy} color={color} />,
    "fish":        <ShapeFish       cx={cx} cy={cy} color={color} />,
    "flower":      <ShapeFlower     cx={cx} cy={cy} color={color} />,
    "cloud":       <ShapeCloud      cx={cx} cy={cy} />,
    "snowflake":   <ShapeSnowflake  cx={cx} cy={cy} color={color} />,
    "penguin":     <ShapePenguin    cx={cx} cy={cy} color={color} />,
    "balloon":     <ShapeBalloon    cx={cx} cy={cy} color={color} />,
    "cat":         <ShapeCat        cx={cx} cy={cy} color={color} />,
    "ladybug":     <ShapeLadybug    cx={cx} cy={cy} color={color} />,
    "music-note":  <ShapeMusicNote  cx={cx} cy={cy} color={color} />,
    "seashell":    <ShapeSeashell   cx={cx} cy={cy} color={color} />,
    "coconut":     <ShapeCoconut    cx={cx} cy={cy} color={color} />,
    "leaf":        <ShapeLeaf       cx={cx} cy={cy} color={color} />,
  };
  if (scale === 1) return inner[type];
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`}>
      {inner[type]}
    </g>
  );
}

// ── Panels ────────────────────────────────────────────────────────────────────

function OriginalPanel({ src }: { src: string }) {
  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full" style={{ display: "block" }}>
      <image href={src} x={0} y={0} width={VB} height={VB} preserveAspectRatio="xMidYMid slice" />
    </svg>
  );
}

function NewItemsPanel({
  src, diffs, found, showHints, misses, hitRadius, onHit, onMiss,
}: {
  src: string;
  diffs: ResolvedDiff[];
  found: Set<string>;
  showHints: boolean;
  misses: { id: number; x: number; y: number }[];
  hitRadius: number;
  onHit: (id: string) => void;
  onMiss: (x: number, y: number) => void;
}) {
  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * VB;
    const py = ((e.clientY - rect.top) / rect.height) * VB;

    for (const diff of diffs) {
      if (found.has(diff.id)) continue;
      const dx = px - diff.cx, dy = py - diff.cy;
      if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) {
        onHit(diff.id);
        return;
      }
    }
    onMiss(px, py);
  }

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      className="w-full h-full cursor-crosshair"
      style={{ display: "block" }}
      onClick={handleClick}
    >
      <image href={src} x={0} y={0} width={VB} height={VB} preserveAspectRatio="xMidYMid slice" />

      {/* All new items rendered on top */}
      {diffs.map((diff) => (
        <g key={diff.id} opacity={found.has(diff.id) ? 0.5 : 1}>
          <DiffShape diff={diff} />
        </g>
      ))}

      {/* Found rings */}
      {diffs.filter((d) => found.has(d.id)).map((d) => (
        <motion.circle
          key={`ring-${d.id}`}
          cx={d.cx} cy={d.cy} r={hitRadius}
          fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth={3}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />
      ))}

      {/* Hint rings for unfound items */}
      {showHints && diffs.filter((d) => !found.has(d.id)).map((d) => (
        <motion.circle
          key={`hint-${d.id}`}
          cx={d.cx} cy={d.cy} r={hitRadius + 4}
          fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth={2.5}
          strokeDasharray="6 3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      ))}

      {/* Miss flashes */}
      {misses.map((m) => (
        <circle key={m.id} cx={m.x} cy={m.y} r={14} fill="rgba(239,68,68,0.4)" />
      ))}
    </svg>
  );
}

// ── Difficulty picker ─────────────────────────────────────────────────────────

function DifficultyPicker({ onPick }: { onPick: (d: Difficulty) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-indigo-100 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-sky-800 tracking-tight">Spot the Difference!</h1>
        <p className="text-sky-600 mt-2">Choose your difficulty to start the world tour</p>
      </div>
      <div className="flex gap-6 flex-wrap justify-center">
        <motion.button
          onClick={() => onPick("rookie")}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="bg-white rounded-3xl p-8 shadow-lg border-2 border-green-300 flex flex-col items-center gap-3 w-56 cursor-pointer"
        >
          <div className="text-6xl">🌱</div>
          <h2 className="text-2xl font-bold text-green-600">Rookie</h2>
          <p className="text-sm text-gray-500 text-center">Big, bright objects placed in easy-to-spot locations</p>
          <span className="mt-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Great for beginners</span>
        </motion.button>
        <motion.button
          onClick={() => onPick("master")}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="bg-white rounded-3xl p-8 shadow-lg border-2 border-purple-400 flex flex-col items-center gap-3 w-56 cursor-pointer"
        >
          <div className="text-6xl">🏆</div>
          <h2 className="text-2xl font-bold text-purple-700">Jangles Master</h2>
          <p className="text-sm text-gray-500 text-center">Tiny, camouflaged objects hidden in the busiest parts of the scene</p>
          <span className="mt-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">For sharp eyes only!</span>
        </motion.button>
      </div>
    </div>
  );
}

// ── Main game ─────────────────────────────────────────────────────────────────

export function SpotTheDifferenceGame() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playLevelMusic(src: string | null) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.55;
    audio.play().catch(() => {});
    audioRef.current = audio;
  }

  function stopMusic() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [resolvedDiffs, setResolvedDiffs] = useState<ResolvedDiff[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState<{ id: number; x: number; y: number }[]>([]);
  const [missCounter, setMissCounter] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const level = LEVELS[levelIdx];
  const diffs = resolvedDiffs;
  const hitRadius = difficulty === "master" ? HIT_RADIUS_MASTER : HIT_RADIUS_ROOKIE;
  const total = diffs.length;
  const foundCount = found.size;

  // All hooks must be called before any early return
  const handleHit = useCallback((id: string) => {
    setShowHints(false);
    setFound((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === total) {
        // Play this country's music on level complete
        playLevelMusic(LEVELS[levelIdx].music);
        if (levelIdx === LEVELS.length - 1) {
          setTimeout(() => burstFinale(), 100);
          setGameComplete(true);
        } else {
          setLevelComplete(true);
        }
      }
      return next;
    });
  }, [total, levelIdx]);

  const handleMiss = useCallback((x: number, y: number) => {
    const id = missCounter;
    setMissCounter((c) => c + 1);
    setMisses((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setMisses((prev) => prev.filter((m) => m.id !== id)), 500);
  }, [missCounter]);

  if (!difficulty) return (
    <DifficultyPicker onPick={(d) => {
      setDifficulty(d);
      setLevelIdx(0);
      setResolvedDiffs(resolveLevel(d === "master" ? LEVELS[0].masterDiffs : LEVELS[0].rookieDiffs));
      setFound(new Set());
      setMisses([]);
      setShowHints(false);
      setLevelComplete(false);
      setGameComplete(false);
    }} />
  );

  const src = asset(`/puzzle-pages/page-${level.page}.png`);

  function nextLevel() {
    stopMusic();
    const nextIdx = levelIdx + 1;
    setLevelIdx(nextIdx);
    setResolvedDiffs(resolveLevel(difficulty === "master" ? LEVELS[nextIdx].masterDiffs : LEVELS[nextIdx].rookieDiffs));
    setFound(new Set());
    setMisses([]);
    setShowHints(false);
    setLevelComplete(false);
  }

  function restart() {
    stopMusic();
    setDifficulty(null);
    setResolvedDiffs([]);
    setLevelIdx(0);
    setFound(new Set());
    setMisses([]);
    setShowHints(false);
    setLevelComplete(false);
    setGameComplete(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-indigo-100 flex flex-col items-center justify-center p-4 gap-4">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-1">
        <h1 className="text-3xl font-bold text-sky-800 tracking-tight">Spot the Difference!</h1>
        <p className="text-sky-600 text-sm">
          Level {levelIdx + 1} of {LEVELS.length} — <span className="font-semibold">{level.country}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "px-3 py-0.5 rounded-full text-xs font-bold",
            difficulty === "rookie" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
          )}>
            {difficulty === "rookie" ? "🌱 Rookie" : "🏆 Jangles Master"}
          </span>
          <button
            onClick={restart}
            className="text-xs text-sky-500 hover:text-sky-700 underline"
          >
            change
          </button>
        </div>
      </div>

      {/* Level progress */}
      <div className="flex gap-1 flex-wrap justify-center max-w-lg">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-6 rounded-full transition-colors duration-300",
              i < levelIdx ? "bg-green-400" : i === levelIdx ? "bg-sky-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Dot counter */}
      <div className="flex gap-2 items-center">
        {diffs.map((d) => (
          <div
            key={d.id}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-colors duration-300",
              found.has(d.id) ? "bg-green-400 border-green-500" : "bg-white border-gray-300"
            )}
          />
        ))}
        <span className="ml-1 text-sky-800 font-semibold text-sm">{foundCount} / {total}</span>
      </div>

      {/* Panels */}
      <div className="flex gap-3 w-full max-w-4xl">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-center text-xs font-semibold text-sky-700 uppercase tracking-widest">Original</span>
          <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-sky-200 aspect-square">
            <OriginalPanel src={src} />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-center text-xs font-semibold text-amber-600 uppercase tracking-widest">What's been added? Click to find!</span>
          <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-amber-300 aspect-square">
            <NewItemsPanel
              src={src} diffs={diffs} found={found}
              showHints={showHints} misses={misses} hitRadius={hitRadius}
              onHit={handleHit} onMiss={handleMiss}
            />
          </div>
        </div>
      </div>

      {/* Hint button */}
      {foundCount < total && (
        <button
          onClick={() => setShowHints((s) => !s)}
          className={cn(
            "px-6 py-2 rounded-full font-semibold text-sm border-2 transition-all",
            showHints
              ? "bg-amber-400 border-amber-500 text-white"
              : "bg-white border-amber-300 text-amber-600 hover:bg-amber-50"
          )}
        >
          {showHints ? "Hide hints" : "Show me where 👀"}
        </button>
      )}

      {/* Level complete */}
      <AnimatePresence>
        {levelComplete && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <div className="text-6xl">🌍</div>
              <h2 className="text-3xl font-bold text-green-600">Level Complete!</h2>
              <p className="text-gray-500">You found all {total} new items in <strong>{level.country}</strong>!</p>
              <button
                onClick={nextLevel}
                className="mt-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-bold text-lg transition-colors"
              >
                Next Country →
              </button>
            </motion.div>
          </motion.div>
        )}

        {gameComplete && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-bold text-green-600">World Tour Complete!</h2>
              <p className="text-gray-500 text-center">You spotted every new item across all {LEVELS.length} countries!</p>
              <button
                onClick={restart}
                className="mt-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-bold text-lg transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
