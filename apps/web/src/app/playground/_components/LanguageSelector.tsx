"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useRef, useState } from "react";
import { LANGUAGE_CONFIG } from "../_constants";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import useMounted from "@/hooks/useMounted";

function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const { language, setLanguage } = useCodeEditorStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLanguageObj = LANGUAGE_CONFIG[language];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-8 px-3
          bg-[var(--bg-input)] hover:bg-[var(--bg-active)]
          rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]
          transition-colors duration-100"
      >
        <Image
          src={currentLanguageObj.logoPath}
          alt={currentLanguageObj.label}
          width={14}
          height={14}
          className="object-contain"
        />
        <span className="min-w-[56px] text-left hidden sm:inline">
          {currentLanguageObj.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-disabled)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl py-1.5 shadow-2xl z-50"
          >
            <p className="px-3 pt-1 pb-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
              Language
            </p>
            <div
              className="max-h-[280px] overflow-y-auto scrollbar-hide"
              onWheel={(e) => e.stopPropagation()}
            >
              {Object.values(LANGUAGE_CONFIG).map((lang, i) => {
                const isActive = language === lang.id;
                return (
                  <motion.button
                    key={lang.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors duration-75 ${
                      isActive
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    <Image
                      src={lang.logoPath}
                      alt={lang.label}
                      width={14}
                      height={14}
                      className="object-contain shrink-0"
                    />
                    <span className="flex-1 text-left">{lang.label}</span>
                    {isActive && (
                      <Check className="w-3 h-3 text-[#3A5EFF] shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSelector;
