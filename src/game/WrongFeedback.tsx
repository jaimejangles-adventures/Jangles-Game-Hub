import { motion } from "framer-motion";

export const WRONG_MS = 2000;

export function CountdownBar({ ms = WRONG_MS, color = "#c0392b" }: { ms?: number; color?: string }) {
  return (
    <div style={{ height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
      <motion.div
        style={{ height: "100%", background: color, transformOrigin: "left" }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: ms / 1000, ease: "linear" }}
      />
    </div>
  );
}
