"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, X, Check } from "lucide-react";
import { diffLines } from "diff";
import { LANGUAGE_CONFIG } from "../_constants";

interface AISuggestion {
  success: boolean;
  originalCode: string;
  suggestedCode: string;
  action: "fix" | "optimize";
  language: string;
}

interface AICodePreviewProps {
  suggestion: AISuggestion | null;
  language: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

function AICodePreview({
  suggestion,
  language,
  isOpen,
  onClose,
  onApply,
}: AICodePreviewProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleApplyAndClose = () => {
    onApply();
    onClose();
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  const renderDiff = () => {
    if (!suggestion) return null;
    return diffLines(suggestion.originalCode, suggestion.suggestedCode).map(
      (part, i) => {
        const cls = part.added
          ? "bg-emerald-500/[0.05] text-emerald-400/80"
          : part.removed
            ? "bg-red-500/[0.05] text-red-400/50 line-through"
            : "text-[#888]";
        return (
          <span
            key={i}
            className={`block whitespace-pre-wrap font-mono text-xs ${cls}`}
          >
            {part.value}
          </span>
        );
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && suggestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[#3A5EFF]/10 flex items-center justify-center">
                  <Code2 className="w-3.5 h-3.5 text-[#3A5EFF]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
                    Diff Preview
                  </p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] leading-tight">
                    {suggestion.action === "fix"
                      ? "Bug Fixes"
                      : "Optimizations"}{" "}
                    · {LANGUAGE_CONFIG[language].label}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-5 py-2 border-b border-[var(--border-default)] bg-[var(--bg-input)] shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm bg-emerald-500/30" />
                <span className="text-[10px] text-[var(--text-disabled)]">
                  Added
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm bg-red-500/30" />
                <span className="text-[10px] text-[var(--text-disabled)]">
                  Removed
                </span>
              </div>
            </div>

            {/* Diff content — always dark bg for code readability */}
            <div
              className="flex-1 overflow-y-auto p-5 scrollbar-hide"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="bg-[#161616] border border-[var(--border-subtle)] rounded-lg p-4">
                {renderDiff()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)] shrink-0">
              <span className="text-[10px] text-[var(--text-disabled)] uppercase tracking-widest">
                {LANGUAGE_CONFIG[language].label} · {suggestion.action}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors duration-100"
                >
                  Close
                </button>
                <button
                  onClick={handleApplyAndClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#3A5EFF] hover:bg-[#4a6aff] rounded-md transition-colors duration-100"
                >
                  <Check className="w-3 h-3" />
                  Apply Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AICodePreview;
