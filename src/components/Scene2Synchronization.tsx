import { useState, useRef } from "react";
import { motion } from "framer-motion";

const transition = { duration: 0.8, ease: [0.65, 0, 0.35, 1] as const };

interface GearConfig {
  id: number;
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  textFragment: string;
  targetAngle: number; // the angle at which text is "aligned" (0 = upright)
  currentAngle: number;
}

function GearSVG({
  cx,
  cy,
  r,
  teeth,
  angle,
  textFragment,
  aligned,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  angle: number;
  textFragment: string;
  aligned: boolean;
}) {
  const toothDepth = r * 0.15;
  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
    const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
    const a4 = ((i + 0.8) / teeth) * Math.PI * 2;
    points.push(`${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r}`);
    points.push(`${cx + Math.cos(a2) * (r + toothDepth)},${cy + Math.sin(a2) * (r + toothDepth)}`);
    points.push(`${cx + Math.cos(a3) * (r + toothDepth)},${cy + Math.sin(a3) * (r + toothDepth)}`);
    points.push(`${cx + Math.cos(a4) * r},${cy + Math.sin(a4) * r}`);
  }

  return (
    <motion.g
      animate={{ opacity: aligned ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
        <polygon
          points={points.join(" ")}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="0.75"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.2}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="0.75"
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--foreground))"
          fontSize={r * 0.35}
          fontFamily="'Playfair Display', serif"
          letterSpacing="0.05em"
        >
          {textFragment}
        </text>
      </g>
    </motion.g>
  );
}

interface Props {
  onComplete: () => void;
}

const SNAP_THRESHOLD = 12; // degrees from target to snap
const ROTATION_STEP = 15; // degrees per click

export default function Scene2Synchronization({ onComplete }: Props) {
  const [gears, setGears] = useState<GearConfig[]>([
    { id: 0, cx: 100, cy: 130, r: 55, teeth: 12, textFragment: "Amerian", targetAngle: 0, currentAngle: 45 },
    { id: 1, cx: 220, cy: 110, r: 45, teeth: 9, textFragment: "Villa", targetAngle: 0, currentAngle: -90 },
    { id: 2, cx: 320, cy: 140, r: 50, teeth: 10, textFragment: "María", targetAngle: 0, currentAngle: 120 },
  ]);

  const [alignedIds, setAlignedIds] = useState<Set<number>>(new Set());
  const [allAligned, setAllAligned] = useState(false);
  const completedRef = useRef(false);

  const rotateGear = (id: number, direction: number) => {
    if (alignedIds.has(id) || allAligned) return;

    setGears((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== id) return g;
        let newAngle = g.currentAngle + direction * ROTATION_STEP;
        // Normalize to -180..180
        while (newAngle > 180) newAngle -= 360;
        while (newAngle < -180) newAngle += 360;
        return { ...g, currentAngle: newAngle };
      });

      // Check alignment
      const newAligned = new Set(alignedIds);
      updated.forEach((g) => {
        const diff = Math.abs(g.currentAngle - g.targetAngle);
        const normalized = Math.min(diff, 360 - diff);
        if (normalized < SNAP_THRESHOLD) {
          newAligned.add(g.id);
        }
      });

      if (newAligned.size > alignedIds.size) {
        // Snap aligned gears
        const snapped = updated.map((g) =>
          newAligned.has(g.id) ? { ...g, currentAngle: g.targetAngle } : g
        );

        // Use setTimeout to update aligned state after render
        setTimeout(() => {
          setAlignedIds(newAligned);
          if (newAligned.size === prev.length && !completedRef.current) {
            completedRef.current = true;
            setAllAligned(true);
            setTimeout(onComplete, 2500);
          }
        }, 0);

        return snapped;
      }

      return updated;
    });
  };

  // Touch/drag tracking per gear
  const dragStart = useRef<{ x: number; gearId: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, gearId: number) => {
    if (alignedIds.has(gearId) || allAligned) return;
    dragStart.current = { x: e.clientX, gearId };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const id = dragStart.current.gearId;
    dragStart.current = null;

    if (Math.abs(dx) < 5) {
      // Simple click - rotate right
      rotateGear(id, 1);
    } else {
      rotateGear(id, dx > 0 ? 1 : -1);
    }
  };

  return (
    <motion.div
      className="h-svh w-full flex flex-col items-center justify-center overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.p
        className="text-label text-muted-foreground absolute top-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: allAligned ? 0 : 0.6, y: 0 }}
        transition={{ ...transition, delay: 0.5 }}
      >
        Alineá los engranajes
      </motion.p>

      <div className="relative">
        <svg
          width="420"
          height="280"
          viewBox="0 0 420 280"
          className="touch-none"
        >
          {gears.map((g) => (
            <g
              key={g.id}
              onPointerDown={(e) => handlePointerDown(e, g.id)}
              onPointerUp={handlePointerUp}
              style={{ cursor: alignedIds.has(g.id) ? "default" : "grab" }}
            >
              {/* Invisible hit area */}
              <circle
                cx={g.cx}
                cy={g.cy}
                r={g.r + 10}
                fill="transparent"
              />
              <GearSVG
                cx={g.cx}
                cy={g.cy}
                r={g.r}
                teeth={g.teeth}
                angle={g.currentAngle}
                textFragment={g.textFragment}
                aligned={alignedIds.has(g.id)}
              />
            </g>
          ))}
        </svg>

        {/* Left/Right buttons for each gear */}
        {!allAligned && gears.map((g) => {
          if (alignedIds.has(g.id)) return null;
          // Position buttons relative to SVG container
          const scale = 1; // SVG is 420 wide, rendered at 420px
          return (
            <div key={`btns-${g.id}`} className="absolute flex items-center gap-1" style={{
              left: g.cx * scale - 28,
              top: (g.cy + g.r + 16) * scale,
            }}>
              <button
                onClick={() => rotateGear(g.id, -1)}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors rounded-full border border-foreground/10"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 1L3 5L7 9" stroke="currentColor" strokeWidth="1"/></svg>
              </button>
              <button
                onClick={() => rotateGear(g.id, 1)}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors rounded-full border border-foreground/10"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1"/></svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Location reveal */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: allAligned ? 1 : 0 }}
        transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
      >
        <h2 className="text-display text-3xl md:text-5xl text-foreground tracking-wide">
          Amerian Villa María
        </h2>
        <p className="text-label text-muted-foreground mt-3 tracking-[0.2em]">
          VILLA MARÍA · CÓRDOBA
        </p>
      </motion.div>

      {!allAligned && (
        <motion.p
          className="text-body text-muted-foreground absolute bottom-12 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ ...transition, delay: 1.5 }}
        >
          tocá las flechas para rotar
        </motion.p>
      )}
    </motion.div>
  );
}
