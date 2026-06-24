"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useRef, useState } from "react";
import { THEMES } from "../_constants";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Moon,
  Sun,
  Github,
  Laptop,
  Cloud,
  Check,
} from "lucide-react";
import useMounted from "@/hooks/useMounted";

const THEME_ICONS: Record<string, React.ReactNode> = {
  "vs-dark": <Moon className="w-3.5 h-3.5" />,
  "vs-light": <Sun className="w-3.5 h-3.5" />,
  "github-dark": <Github className="w-3.5 h-3.5" />,
  monokai: <Laptop className="w-3.5 h-3.5" />,
  "solarized-dark": <Cloud className="w-3.5 h-3.5" />,
};

function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = useCodeEditorStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEMES.find((t) => t.id === theme);

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
        <span className="text-[var(--text-faint)]">
          {THEME_ICONS[theme] ?? <Moon className="w-3.5 h-3.5" />}
        </span>
        <span className="hidden lg:inline min-w-[60px] text-left">
          {currentTheme?.label}
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
              Theme
            </p>
            <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
              {THEMES.map((t, i) => {
                const isActive = theme === t.id;
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors duration-75 ${
                      isActive
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    <span
                      className={
                        isActive ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"
                      }
                    >
                      {THEME_ICONS[t.id] ?? <Moon className="w-3.5 h-3.5" />}
                    </span>
                    <span className="flex-1 text-left">{t.label}</span>
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

export default ThemeSelector;
