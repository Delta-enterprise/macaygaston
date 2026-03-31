import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

const transition = { duration: 0.8, ease: [0.65, 0, 0.35, 1] as const };

// Maze configuration - simple grid-based maze
// 0 = path, 1 = wall, 2 = start, 3 = end (church)
const CELL = 40;
const MAZE_COLS = 9;
const MAZE_ROWS = 7;
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 1, 0, 0, 0, 3, 1],
  [1, 0, 0, 1, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const MAZE_W = MAZE_COLS * CELL;
const MAZE_H = MAZE_ROWS * CELL;

function getStartPos() {
  for (let r = 0; r < MAZE_ROWS; r++)
    for (let c = 0; c < MAZE_COLS; c++)
      if (MAZE[r][c] === 2) return { r, c };
  return { r: 1, c: 1 };
}

function getEndPos() {
  for (let r = 0; r < MAZE_ROWS; r++)
    for (let c = 0; c < MAZE_COLS; c++)
      if (MAZE[r][c] === 3) return { r, c };
  return { r: 1, c: 7 };
}

const CoupleIcon = () => (
  <svg width="24" height="36" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="6" r="3.5" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="10" y1="10" x2="10" y2="34" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="10" y1="34" x2="6" y2="46" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="10" y1="34" x2="14" y2="46" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="10" y1="18" x2="3" y2="26" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <circle cx="22" cy="8" r="3.5" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="22" y1="12" x2="22" y2="34" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="22" y1="34" x2="18" y2="46" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="22" y1="34" x2="26" y2="46" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="22" y1="18" x2="29" y2="26" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="10" y1="18" x2="22" y2="18" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
  </svg>
);

const ChurchIcon = () => (
  <svg width="28" height="36" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="24" y1="0" x2="24" y2="12" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <line x1="20" y1="4" x2="28" y2="4" stroke="hsl(var(--foreground))" strokeWidth="0.75" />
    <path d="M14 28 L24 12 L34 28" stroke="hsl(var(--foreground))" strokeWidth="0.75" fill="none" />
    <rect x="8" y="28" width="32" height="34" stroke="hsl(var(--foreground))" strokeWidth="0.75" fill="none" />
    <path d="M19 62 L19 50 A5 5 0 0 1 29 50 L29 62" stroke="hsl(var(--foreground))" strokeWidth="0.75" fill="none" />
    <circle cx="24" cy="38" r="4" stroke="hsl(var(--foreground))" strokeWidth="0.75" fill="none" />
  </svg>
);

interface Props {
  onComplete: () => void;
}

export default function Scene1Trajectory({ onComplete }: Props) {
  const startPos = getStartPos();
  const endPos = getEndPos();
  const [pos, setPos] = useState(startPos);
  const [reached, setReached] = useState(false);
  const [shaking, setShaking] = useState(false);

  const move = useCallback((dr: number, dc: number) => {
    if (reached) return;
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    if (nr < 0 || nr >= MAZE_ROWS || nc < 0 || nc >= MAZE_COLS) return;
    
    if (MAZE[nr][nc] === 1) {
      // Hit wall - shake and reset
      setShaking(true);
      setTimeout(() => {
        setShaking(false);
        setPos(getStartPos());
      }, 400);
      return;
    }
    
    setPos({ r: nr, c: nc });
    
    if (nr === endPos.r && nc === endPos.c) {
      setReached(true);
      setTimeout(onComplete, 1500);
    }
  }, [pos, reached, endPos, onComplete]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(-1, 0);
      else if (e.key === "ArrowDown") move(1, 0);
      else if (e.key === "ArrowLeft") move(0, -1);
      else if (e.key === "ArrowRight") move(0, 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  // Swipe controls for mobile
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (Math.max(absDx, absDy) < 20) return; // too small
    
    if (absDx > absDy) {
      move(0, dx > 0 ? 1 : -1);
    } else {
      move(dy > 0 ? 1 : -1, 0);
    }
    touchStart.current = null;
  };

  return (
    <motion.div
      className="h-svh w-full flex flex-col items-center justify-center overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.p
        className="text-label text-muted-foreground mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: reached ? 0 : 0.6, y: 0 }}
        transition={{ ...transition, delay: 0.5 }}
      >
        Llevá a los novios a la iglesia
      </motion.p>

      <motion.div
        className="relative"
        animate={shaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg width={MAZE_W} height={MAZE_H} viewBox={`0 0 ${MAZE_W} ${MAZE_H}`}>
          {/* Draw walls */}
          {MAZE.map((row, r) =>
            row.map((cell, c) => {
              if (cell === 1) {
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * CELL}
                    y={r * CELL}
                    width={CELL}
                    height={CELL}
                    fill="hsl(var(--foreground))"
                    fillOpacity={0.08}
                    stroke="hsl(var(--foreground))"
                    strokeWidth={0.5}
                    strokeOpacity={0.15}
                  />
                );
              }
              return null;
            })
          )}

          {/* Grid lines for paths (subtle) */}
          {MAZE.map((row, r) =>
            row.map((cell, c) => {
              if (cell !== 1) {
                return (
                  <rect
                    key={`p-${r}-${c}`}
                    x={c * CELL}
                    y={r * CELL}
                    width={CELL}
                    height={CELL}
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={0.25}
                    strokeOpacity={0.06}
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {/* Church at end position */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: endPos.c * CELL,
            top: endPos.r * CELL,
            width: CELL,
            height: CELL,
          }}
        >
          <ChurchIcon />
        </div>

        {/* Couple at current position */}
        <motion.div
          className="absolute flex items-center justify-center"
          animate={{
            left: pos.c * CELL,
            top: pos.r * CELL,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            width: CELL,
            height: CELL,
          }}
        >
          <motion.div
            animate={reached ? { scale: [1, 1.15, 1] } : undefined}
            transition={{ duration: 0.5 }}
          >
            <CoupleIcon />
          </motion.div>
        </motion.div>

        {/* Arrow buttons for mobile */}
        {!reached && (
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <button onClick={() => move(-1, 0)} className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3L14 11H2L8 3Z" fill="currentColor"/></svg>
            </button>
            <div className="flex gap-1">
              <button onClick={() => move(0, -1)} className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L11 2V14L3 8Z" fill="currentColor"/></svg>
              </button>
              <button onClick={() => move(1, 0)} className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13L2 5H14L8 13Z" fill="currentColor"/></svg>
              </button>
              <button onClick={() => move(0, 1)} className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8L5 14V2L13 8Z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {!reached && (
        <motion.p
          className="text-body text-muted-foreground absolute bottom-8 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ ...transition, delay: 1.5 }}
        >
          deslizá o usá las flechas
        </motion.p>
      )}
    </motion.div>
  );
}
