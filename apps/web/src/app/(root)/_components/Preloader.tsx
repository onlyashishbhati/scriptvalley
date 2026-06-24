"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STAGES: [number, number][] = [
  [0,    0],
  [120,  18],
  [280,  38],
  [500,  57],
  [750,  71],
  [980,  83],
  [1180, 91],
  [1380, 96],
  [1580, 99],
  [1750, 100],
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [displayed, setDisplayed] = useState(0);
  const [done,      setDone]      = useState(false);
  const targetRef  = useRef(0);
  const dispRef    = useRef(0);
  const rafRef     = useRef<number | null>(null);
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Drive target through staged milestones
    STAGES.forEach(([ms, val]) => {
      timers.current.push(
        setTimeout(() => { targetRef.current = val; }, ms)
      );
    });

    // Lerp displayed toward target each frame
    function tick() {
      const gap = targetRef.current - dispRef.current;
      if (gap > 0) {
        const step = Math.max(1, Math.ceil(gap * 0.14));
        dispRef.current = Math.min(dispRef.current + step, targetRef.current);
        setDisplayed(dispRef.current);
      }

      if (dispRef.current < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayed(100);
        // Small hold at 100 before sliding away
        timers.current.push(setTimeout(() => setDone(true), 350));
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      timers.current.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Fire onComplete after slide-up transition finishes (~950ms)
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onComplete, 980);
    return () => clearTimeout(t);
  }, [done, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "var(--bg-base, #0b0b0f)" }}
      animate={done ? { y: "-101%" } : { y: "0%" }}
      transition={
        done
          ? { duration: 0.95, ease: [0.76, 0, 0.24, 1] }
          : { duration: 0 }
      }
    >
      {/* Thin progress bar at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          className="h-full"
          style={{
            width: `${displayed}%`,
            background: "linear-gradient(90deg, #3A5EFF 0%, #818cf8 100%)",
            boxShadow: "0 0 14px rgba(58,94,255,0.55)",
          }}
        />
      </div>

      {/* Brand label bottom-left */}
      <span
        className="absolute bottom-7 left-8"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.16)",
        }}
      >
        Script Valley
      </span>

      {/* Counter */}
      <div
        className="flex items-start select-none"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontSize: "clamp(5rem, 20vw, 16rem)",
          color: "#efefef",
        }}
      >
        <span style={{ fontVariantNumeric: "tabular-nums", minWidth: "3ch", textAlign: "right" }}>
          {displayed}
        </span>
        <span
          style={{
            fontSize: "0.28em",
            fontWeight: 400,
            color: "rgba(255,255,255,0.25)",
            marginTop: "0.18em",
            letterSpacing: 0,
          }}
        >
          %
        </span>
      </div>
    </motion.div>
  );
}