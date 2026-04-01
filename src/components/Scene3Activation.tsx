import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

const transition = { duration: 0.8, ease: [0.65, 0, 0.35, 1] as const };

const MAX_PROGRESS = 100;
const DECAY_RATE = 8;
const DECAY_INTERVAL = 50;

function tapGain(progress: number): number {
  if (progress < 30) return 10;
  if (progress < 60) return 6;
  if (progress < 85) return 3.5;
  return 2;
}

interface Props {
  onComplete: () => void;
}

// Pixel art champagne bottle as a grid of colored cells
// Each row is an array of [startX, width, color] segments
// Colors: 'g' = dark green bottle, 'G' = green highlight, 'l' = label gold, 'L' = label dark, 'f' = foil/cap, 'n' = neck ring
const PIXEL = 4; // size of each "pixel" block

function PixelBottle({ corkY, popped, pct }: { corkY: number; popped: boolean; pct: number }) {
  const fg = "hsl(var(--foreground))";
  const gold = "hsl(var(--accent))";
  const bottleGreen = "hsl(153 40% 20%)";
  const bottleLight = "hsl(153 35% 28%)";
  const bottleDark = "hsl(153 45% 12%)";
  const foilColor = "hsl(43 50% 45%)";
  const labelBg = "hsl(43 40% 85%)";
  const labelBorder = "hsl(43 50% 50%)";
  const corkColor = "hsl(30 30% 55%)";
  const corkDark = "hsl(30 25% 42%)";
  const corkLight = "hsl(30 35% 65%)";

  const P = PIXEL;

  const svgPadTop = P * 10; // extra space above so cork doesn't clip
  const totalH = P * 62 + svgPadTop;

  return (
    <svg width={P * 28} height={totalH} viewBox={`0 ${-svgPadTop} ${P * 28} ${totalH}`} className="overflow-visible" style={{ imageRendering: "pixelated" }}>
      {/* Cork - moves up based on corkY */}
      {!popped && (
        <g>
          {/* Cork body */}
          <rect x={P * 11} y={corkY} width={P * 6} height={P * 5} fill={corkColor} />
          <rect x={P * 12} y={corkY} width={P * 2} height={P * 5} fill={corkLight} />
          <rect x={P * 16} y={corkY} width={P * 1} height={P * 5} fill={corkDark} />
          {/* Cork texture lines */}
          <rect x={P * 11} y={corkY + P * 1} width={P * 6} height={P * 0.5} fill={corkDark} opacity={0.3} />
          <rect x={P * 11} y={corkY + P * 3} width={P * 6} height={P * 0.5} fill={corkDark} opacity={0.3} />
          {/* Wire cage */}
          <g opacity={Math.max(0, 1 - pct * 1.5)}>
            <rect x={P * 10} y={corkY + P * 4} width={P * 1} height={P * 2} fill={fg} opacity={0.3} />
            <rect x={P * 17} y={corkY + P * 4} width={P * 1} height={P * 2} fill={fg} opacity={0.3} />
            <rect x={P * 11} y={corkY + P * 5} width={P * 6} height={P * 0.5} fill={fg} opacity={0.25} />
          </g>
        </g>
      )}

      {/* Flying cork when popped */}
      {popped && (
        <motion.g
          initial={{ y: 0 }}
          animate={{ y: -350, x: 40, rotate: 540, opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
        >
          <rect x={P * 11} y={corkY} width={P * 6} height={P * 5} fill={corkColor} />
          <rect x={P * 12} y={corkY} width={P * 2} height={P * 5} fill={corkLight} />
        </motion.g>
      )}

      {/* Flash / sparkle burst when popped */}
      {popped && (
        <>
          {/* Central flash */}
          <motion.circle
            cx={P * 14}
            cy={P * 9}
            r={P * 2}
            fill={gold}
            initial={{ opacity: 1, r: P * 1 }}
            animate={{ opacity: 0, r: P * 12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <motion.circle
            cx={P * 14}
            cy={P * 9}
            r={P * 1}
            fill={fg}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0, r: P * 6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
          {/* Star sparkles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <motion.line
                key={`spark-${i}`}
                x1={P * 14}
                y1={P * 9}
                x2={P * 14}
                y2={P * 9}
                stroke={i % 2 === 0 ? gold : fg}
                strokeWidth={P * 0.6}
                initial={{ opacity: 1 }}
                animate={{
                  x1: P * 14 + Math.cos(a) * P * 3,
                  y1: P * 9 + Math.sin(a) * P * 3,
                  x2: P * 14 + Math.cos(a) * P * 8,
                  y2: P * 9 + Math.sin(a) * P * 8,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              />
            );
          })}
        </>
      )}

      {/* Liquid overflow when popped */}
      {popped && (
        <>
          {/* Main foam stream */}
          <motion.ellipse
            cx={P * 14}
            cy={P * 10}
            rx={P * 2.5}
            ry={P * 1}
            fill={gold}
            initial={{ opacity: 0.8, ry: P * 0.5 }}
            animate={{ ry: P * 4, cy: P * 7, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
          />
          {/* Dripping liquid sides */}
          {[-1, 1].map((side) => (
            <motion.rect
              key={`drip-${side}`}
              x={P * 13 + side * P * 1.5}
              y={P * 10}
              width={P * 1}
              height={P * 1}
              fill={gold}
              opacity={0.6}
              initial={{ height: P * 1, opacity: 0.7 }}
              animate={{ height: P * 8, y: P * 12, opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            />
          ))}
          {/* Foam bubbles dripping down */}
          {Array.from({ length: 6 }).map((_, i) => {
            const xOff = (i - 2.5) * P * 1.2;
            return (
              <motion.rect
                key={`foam-${i}`}
                x={P * 13.5 + xOff}
                y={P * 10}
                width={P * 0.8}
                height={P * 0.8}
                fill={gold}
                initial={{ opacity: 0.7 }}
                animate={{ y: P * 10 + P * (4 + i * 2), opacity: 0 }}
                transition={{ duration: 0.8 + i * 0.15, ease: "easeIn", delay: 0.3 + i * 0.08 }}
              />
            );
          })}
        </>
      )}

      {/* Foil top / neck cap */}
      <rect x={P * 10} y={P * 10} width={P * 8} height={P * 2} fill={foilColor} />
      <rect x={P * 11} y={P * 10} width={P * 2} height={P * 2} fill={gold} opacity={0.5} />

      {/* Neck */}
      <rect x={P * 11} y={P * 12} width={P * 6} height={P * 10} fill={bottleGreen} />
      <rect x={P * 12} y={P * 12} width={P * 2} height={P * 10} fill={bottleLight} />
      <rect x={P * 16} y={P * 12} width={P * 1} height={P * 10} fill={bottleDark} />
      {/* Neck ring */}
      <rect x={P * 10} y={P * 14} width={P * 8} height={P * 1} fill={foilColor} />

      {/* Shoulder taper */}
      <rect x={P * 10} y={P * 22} width={P * 8} height={P * 2} fill={bottleGreen} />
      <rect x={P * 9} y={P * 23} width={P * 10} height={P * 2} fill={bottleGreen} />
      <rect x={P * 8} y={P * 24} width={P * 12} height={P * 2} fill={bottleGreen} />
      {/* Highlight on shoulder */}
      <rect x={P * 11} y={P * 22} width={P * 2} height={P * 2} fill={bottleLight} />
      <rect x={P * 10} y={P * 23} width={P * 2} height={P * 3} fill={bottleLight} />

      {/* Body */}
      <rect x={P * 7} y={P * 26} width={P * 14} height={P * 28} fill={bottleGreen} />
      {/* Body highlight (left light stripe) */}
      <rect x={P * 9} y={P * 26} width={P * 2} height={P * 28} fill={bottleLight} />
      {/* Body shadow (right dark stripe) */}
      <rect x={P * 19} y={P * 26} width={P * 2} height={P * 28} fill={bottleDark} />

      {/* Label */}
      <rect x={P * 8} y={P * 32} width={P * 12} height={P * 14} fill={labelBg} />
      <rect x={P * 8} y={P * 32} width={P * 12} height={P * 1} fill={labelBorder} />
      <rect x={P * 8} y={P * 45} width={P * 12} height={P * 1} fill={labelBorder} />
      <rect x={P * 8} y={P * 32} width={P * 1} height={P * 14} fill={labelBorder} opacity={0.5} />
      <rect x={P * 19} y={P * 32} width={P * 1} height={P * 14} fill={labelBorder} opacity={0.5} />
      {/* M&G monogram on label */}
      <text
        x={P * 14}
        y={P * 38}
        textAnchor="middle"
        fill={bottleDark}
        fontSize={P * 3}
        fontFamily="'Playfair Display', serif"
        fontWeight="700"
        style={{ imageRendering: "auto" }}
      >
        M&amp;G
      </text>
      {/* Divider on label */}
      <rect x={P * 10} y={P * 39.5} width={P * 8} height={P * 0.5} fill={labelBorder} opacity={0.6} />
      {/* Year */}
      <text
        x={P * 14}
        y={P * 43}
        textAnchor="middle"
        fill={bottleDark}
        fontSize={P * 1.8}
        fontFamily="var(--font-sans)"
        letterSpacing="0.15em"
        style={{ imageRendering: "auto" }}
      >
        2026
      </text>

      {/* Bottom / base */}
      <rect x={P * 6} y={P * 54} width={P * 16} height={P * 2} fill={bottleDark} />
      <rect x={P * 7} y={P * 56} width={P * 14} height={P * 2} fill={bottleDark} />
      {/* Base highlight */}
      <rect x={P * 8} y={P * 54} width={P * 3} height={P * 2} fill={bottleGreen} />

      {/* Fizz particles when popped */}
      {popped && (
        <>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const dist = 40 + Math.random() * 100;
            const size = P * (0.8 + Math.random() * 1.2);
            return (
              <motion.rect
                key={i}
                x={P * 14 - size / 2}
                y={P * 10 - size / 2}
                width={size}
                height={size}
                fill={i % 3 === 0 ? gold : fg}
                initial={{ opacity: 0.9 }}
                animate={{
                  x: P * 14 + Math.cos(angle) * dist - size / 2,
                  y: P * 10 + Math.sin(angle) * dist - 30 - size / 2,
                  opacity: 0,
                }}
                transition={{ duration: 0.6 + Math.random() * 0.5, ease: "easeOut" }}
              />
            );
          })}
        </>
      )}
    </svg>
  );
}

export default function Scene3Activation({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [popped, setPopped] = useState(false);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const lastTapRef = useRef(0);
  const { playWin } = useAudio();

  useEffect(() => {
    const interval = setInterval(() => {
      if (completedRef.current) return;
      const now = Date.now();
      const sinceTap = now - lastTapRef.current;
      if (sinceTap > 300 && progressRef.current > 0) {
        const decay = DECAY_RATE * (DECAY_INTERVAL / 1000);
        const newP = Math.max(0, progressRef.current - decay);
        progressRef.current = newP;
        setProgress(newP);
      }
    }, DECAY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleTap = useCallback(() => {
    if (completedRef.current) return;
    lastTapRef.current = Date.now();
    const gain = tapGain(progressRef.current);
    const newP = Math.min(MAX_PROGRESS, progressRef.current + gain);
    progressRef.current = newP;
    setProgress(newP);

    if (newP >= MAX_PROGRESS) {
      completedRef.current = true;
      setPopped(true);
      playWin();
      setTimeout(() => {
        setComplete(true);
        setTimeout(onComplete, 1500);
      }, 1200);
    }
  }, [onComplete]);

  const pct = progress / MAX_PROGRESS;
  const corkY = PIXEL * 5 - pct * PIXEL * 5; // from pixel row 5 to row 0
  const bottleShake = pct > 0.6 ? (pct - 0.6) * 8 : 0;

  return (
    <motion.div
      className="h-svh w-full flex flex-col items-center justify-center overflow-hidden relative select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onClick={handleTap}
      style={{ cursor: "pointer" }}
    >
      <motion.p
        className="text-label text-muted-foreground absolute top-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: complete ? 0 : 0.6, y: 0 }}
        transition={{ ...transition, delay: 0.5 }}
      >
        Destapá la botella
      </motion.p>

      <motion.div
        className="relative"
        animate={
          popped
            ? {}
            : { x: bottleShake > 0 ? [0, -bottleShake, bottleShake, -bottleShake / 2, 0] : 0 }
        }
        transition={{ duration: 0.3, repeat: bottleShake > 0 ? Infinity : 0, repeatType: "loop" }}
      >
        <PixelBottle corkY={corkY} popped={popped} pct={pct} />
      </motion.div>

      {/* Progress bar - pixelated style */}
      {!complete && (
        <div className="absolute bottom-20 w-48 h-1 bg-foreground/10" style={{ imageRendering: "pixelated" }}>
          <motion.div
            className="h-full bg-accent/60"
            style={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      )}

      {!complete && !popped && (
        <motion.p
          className="text-body text-muted-foreground absolute bottom-10 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ ...transition, delay: 1.5 }}
        >
          {pct < 0.3 ? "tocá para destapar" : pct < 0.7 ? "¡más rápido!" : "¡daleeeee!"}
        </motion.p>
      )}

      <AnimatePresence>
        {complete && (
          <motion.div
            className="absolute inset-0 bg-background z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
