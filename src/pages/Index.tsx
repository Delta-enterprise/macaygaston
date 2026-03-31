import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Scene1Trajectory from "@/components/Scene1Trajectory";
import Scene2Synchronization from "@/components/Scene2Synchronization";
import Scene3Activation from "@/components/Scene3Activation";
import FinalReveal from "@/components/FinalReveal";

type Scene = "trajectory" | "synchronization" | "activation" | "reveal";

export default function Index() {
  const [scene, setScene] = useState<Scene>("trajectory");

  return (
    <div className="h-svh w-full overflow-hidden bg-background">
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
        {scene === "reveal" && (
          <FinalReveal key="s4" />
        )}
      </AnimatePresence>
    </div>
  );
}
