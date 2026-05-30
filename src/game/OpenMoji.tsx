import { motion, type HTMLMotionProps } from "framer-motion";

const CDN = "https://cdn.jsdelivr.net/npm/openmoji@15.1.0/color/svg";

export const EMOJI = {
  check: "2705",
  cross: "274C",
  fire: "1F525",
  star: "2B50",
  music: "1F3B5",
  globe: "1F30D",
  trophy: "1F3C6",
  party: "1F389",
} as const;

type Props = Omit<HTMLMotionProps<"img">, "src" | "alt"> & {
  name: keyof typeof EMOJI;
  size?: number;
  alt?: string;
};

export function OpenMoji({ name, size = 32, alt = "", style, ...rest }: Props) {
  return (
    <motion.img
      src={`${CDN}/${EMOJI[name]}.svg`}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      style={{ display: "inline-block", width: size, height: size, ...style }}
      {...rest}
    />
  );
}
