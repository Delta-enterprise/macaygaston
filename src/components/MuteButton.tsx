import { useAudio } from "@/hooks/useAudio";
import { motion } from "framer-motion";

export default function MuteButton() {
  const { muted, toggleMute } = useAudio();

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        toggleMute();
      }}
      className="fixed bottom-4 right-4 z-[100] w-9 h-9 flex items-center justify-center rounded-full border border-foreground/15 bg-background/80 backdrop-blur-sm text-foreground/50 hover:text-foreground/80 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      aria-label={muted ? "Activar sonido" : "Silenciar"}
    >
      {muted ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </motion.button>
  );
}
