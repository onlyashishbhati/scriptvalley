"use client";

import { useState, useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { motion } from "framer-motion";
import Hero from "./_sections/Hero";
import { KeyboardWithPreview } from "./_sections/Keyboard";
import AnimatedHero from "./_components/AnimatedHero";
import Preloader from "./_components/Preloader";
import Footer from "../../components/Footer";

export default function Home() {
  const [showLoader, setShowLoader] = useState(false);
  const [ready,      setReady]      = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sv-loaded")) {
      setReady(true);
    } else {
      setShowLoader(true);
    }
  }, []);

  function handleComplete() {
    sessionStorage.setItem("sv-loaded", "1");
    setShowLoader(false);
    setReady(true);
  }

  return (
    <>
      {showLoader && <Preloader onComplete={handleComplete} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <ReactLenis root>
          <div className="min-h-screen w-full overflow-x-clip bg-[var(--bg-base)]">
            <Hero />
            <KeyboardWithPreview />
            <AnimatedHero />
            <Footer />
          </div>
        </ReactLenis>
      </motion.div>
    </>
  );
}