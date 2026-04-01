import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene1Trajectory from "@/components/Scene1Trajectory";
import Scene2Synchronization from "@/components/Scene2Synchronization";
import Scene3Activation from "@/components/Scene3Activation";
import FinalReveal from "@/components/FinalReveal";
import MuteButton from "@/components/MuteButton";
import { AudioProvider } from "@/hooks/useAudio";

type Scene = "trajectory" | "synchronization" | "activation" | "reveal";

export default function Index() {
  const [scene, setScene] = useState<Scene>("trajectory");
  const [assetsReady, setAssetsReady] = useState(false);

  const handleReady = useCallback(() => setAssetsReady(true), []);

  return (
    <AudioProvider onReady={handleReady}>
      <div className="h-svh w-full overflow-hidden bg-background">
        {/* Preloader */}
        <AnimatePresence>
          {!assetsReady && (
            <motion.div
              key="preloader"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="w-40 h-px bg-foreground/10 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-accent/50"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {scene === "trajectory" && (
            <Scene1Trajectory key="s1" onComplete={() => setScene("synchronization")} />
          )}
          {scene === "synchronization" && (
            <Scene2Synchronization key="s2" onComplete={() => setScene("activation")} />
          )}
          {scene === "activation" && (
            <Scene3Activation key="s3" onComplete={() => setScene("reveal")} />
          )}
          {scene === "reveal" && <FinalReveal key="s4" />}
        </AnimatePresence>

        <MuteButton />
      </div>
    </AudioProvider>
  );
}
