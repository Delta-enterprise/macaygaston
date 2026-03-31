import { motion } from "framer-motion";

const transition = { duration: 1.2, ease: [0.65, 0, 0.35, 1] as const };

export default function FinalReveal() {
  return (
    <motion.div
      className="h-svh w-full flex flex-col items-center justify-center overflow-hidden relative bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...transition, delay: 0.3 }}
    >
      {/* Small label */}
      <motion.p
        className="text-label text-muted-foreground mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 0.8 }}
      >
        Save the Date
      </motion.p>

      {/* Date */}
      <motion.h1
        className="text-display text-[14vw] md:text-[8vw] leading-none text-foreground tracking-tighter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 1.2 }}
      >
        24 OCT 2026
      </motion.h1>

      {/* Names */}
      <motion.p
        className="text-label text-foreground tracking-[0.2em] mt-8 text-sm md:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition, delay: 1.8 }}
      >
        Macarena & Gastón
      </motion.p>

      {/* Location */}
      <motion.p
        className="text-body text-muted-foreground mt-3 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transition, delay: 2.2 }}
      >
        Villa María, Córdoba
      </motion.p>

      {/* Divider */}
      <motion.div
        className="w-12 h-px bg-accent mt-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ ...transition, delay: 2.6 }}
      />

      {/* CTA */}
      <motion.a
        href="#"
        className="mt-12 px-6 py-2.5 border border-foreground/20 text-xs text-label tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors duration-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transition, delay: 3 }}
        onClick={(e) => {
          e.preventDefault();
          const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Macarena+%26+Gast%C3%B3n+Casamiento&dates=20261024/20261025&location=Villa+Mar%C3%ADa%2C+C%C3%B3rdoba`;
          window.open(url, "_blank");
        }}
      >
        Agregar al Calendario
      </motion.a>
    </motion.div>
  );
}
