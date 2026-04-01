import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";

interface AudioContextType {
  muted: boolean;
  toggleMute: () => void;
  playWin: () => void;
  ready: boolean;
}

const AudioCtx = createContext<AudioContextType>({
  muted: false,
  toggleMute: () => {},
  playWin: () => {},
  ready: false,
});

export function AudioProvider({ children, onReady }: { children: ReactNode; onReady?: () => void }) {
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const bgRef = useRef<HTMLAudioElement | null>(null);
  const winRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const onReadyCalled = useRef(false);

  useEffect(() => {
    const bg = new Audio("/audio/music1.mp3");
    bg.loop = true;
    bg.volume = 0.75;
    bg.preload = "auto";

    const win = new Audio("/audio/win.mp3");
    win.preload = "auto";
    win.volume = 0.85;

    bgRef.current = bg;
    winRef.current = win;

    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded >= 2 && !onReadyCalled.current) {
        onReadyCalled.current = true;
        setReady(true);
        onReady?.();
      }
    };

    bg.addEventListener("canplaythrough", check, { once: true });
    win.addEventListener("canplaythrough", check, { once: true });

    // Fallback timeout
    const t = setTimeout(() => {
      if (!onReadyCalled.current) {
        onReadyCalled.current = true;
        setReady(true);
        onReady?.();
      }
    }, 4000);

    return () => {
      clearTimeout(t);
      bg.pause();
      win.pause();
    };
  }, [onReady]);

  // Start music on first user interaction
  useEffect(() => {
    const start = () => {
      if (startedRef.current || !bgRef.current) return;
      startedRef.current = true;
      bgRef.current.play().catch(() => {});
    };
    window.addEventListener("click", start, { once: true });
    window.addEventListener("touchstart", start, { once: true });
    return () => {
      window.removeEventListener("click", start);
      window.removeEventListener("touchstart", start);
    };
  }, []);

  useEffect(() => {
    if (bgRef.current) bgRef.current.muted = muted;
    if (winRef.current) winRef.current.muted = muted;
  }, [muted]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const playWin = useCallback(() => {
    if (!winRef.current) return;
    winRef.current.currentTime = 0;
    winRef.current.play().catch(() => {});
  }, []);

  return (
    <AudioCtx.Provider value={{ muted, toggleMute, playWin, ready }}>
      {children}
    </AudioCtx.Provider>
  );
}

export const useAudio = () => useContext(AudioCtx);
