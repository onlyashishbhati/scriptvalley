"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bug,
  Zap,
  Check,
  X,
  Eye,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { LANGUAGE_CONFIG } from "../_constants";
import AICodePreview from "./AICodePreview";

interface AISuggestion {
  success: boolean;
  originalCode: string;
  suggestedCode: string;
  action: "fix" | "optimize";
  language: string;
  message?: string;
}

function AIAssistant() {
  const { language, editor } = useCodeEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedPreview, setShowDetailedPreview] = useState(false);

  const getCurrentCode = () => (editor ? editor.getValue() : "");

  const applySuggestion = () => {
    if (!editor || !suggestion) return;
    const position = editor.getPosition();
    editor.setValue(suggestion.suggestedCode);
    localStorage.setItem(`editor-code-${language}`, suggestion.suggestedCode);
    if (position) editor.setPosition(position);
    setSuggestion(null);
    setIsOpen(false);
  };

  const handleAIRequest = async (action: "fix" | "optimize") => {
    const code = getCurrentCode().trim();
    if (!code) {
      setError("Please write some code first");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const response = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: LANGUAGE_CONFIG[language].monacoLanguage,
          action,
        }),
      });
      const data: AISuggestion & { error?: string } = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to get AI suggestion");
      if (data.success) {
        setSuggestion(data);
      } else throw new Error("Invalid response from AI service");
    } catch (err: unknown) {
      setError(
        (err as Error).message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs
          text-[var(--text-muted)] hover:text-[var(--text-secondary)]
          hover:bg-[var(--bg-hover)]
          transition-colors duration-100
          disabled:opacity-40"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-[#3A5EFF]" />
        )}
        <span className="hidden sm:inline">AI</span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-disabled)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 mt-1 w-68 z-50 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl shadow-2xl"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#3A5EFF]" />
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    AI Assistant
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Actions */}
              {!suggestion && !isLoading && !error && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-3">
                    {LANGUAGE_CONFIG[language].label} · Choose action
                  </p>

                  <button
                    onClick={() => handleAIRequest("fix")}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 p-3 rounded-lg
                      bg-transparent hover:bg-[var(--bg-hover)]
                      border border-[var(--border-subtle)] hover:border-[var(--border-medium)]
                      transition-colors duration-100 text-left disabled:opacity-40"
                  >
                    <Bug className="w-3.5 h-3.5 text-red-400/70 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-[var(--text-secondary)]">
                        Fix Errors & Bugs
                      </div>
                      <div className="text-[10px] text-[var(--text-faint)] mt-0.5">
                        Identify and fix syntax / logic errors
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAIRequest("optimize")}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 p-3 rounded-lg
                      bg-transparent hover:bg-[var(--bg-hover)]
                      border border-[var(--border-subtle)] hover:border-[var(--border-medium)]
                      transition-colors duration-100 text-left disabled:opacity-40"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#3A5EFF] shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-[var(--text-secondary)]">
                        Optimize Performance
                      </div>
                      <div className="text-[10px] text-[var(--text-faint)] mt-0.5">
                        Improve code quality and efficiency
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 gap-3"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-[#3A5EFF]" />
                  <p className="text-xs text-[var(--text-faint)] text-center">
                    Analyzing {LANGUAGE_CONFIG[language].label} code…
                  </p>
                  <div className="w-full h-[2px] rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "rgba(58,94,255,0.5)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[var(--bg-input)] border border-[var(--border-medium)] rounded-lg p-3"
                >
                  <p className="text-xs text-red-400/70 mb-2">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {/* Suggestion preview */}
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest ${
                        suggestion.action === "fix"
                          ? "bg-[var(--bg-input)] text-red-400/70"
                          : "bg-[#3A5EFF]/10 text-[#3A5EFF]"
                      }`}
                    >
                      {suggestion.action === "fix"
                        ? "Bug Fixes"
                        : "Optimizations"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--bg-input)] text-[var(--text-faint)]">
                      {LANGUAGE_CONFIG[language].label}
                    </span>
                  </div>

                  {/* Code preview — always dark bg for readability */}
                  <div className="bg-[#161616] border border-[var(--border-subtle)] rounded-lg p-3 max-h-28 overflow-y-auto scrollbar-hide">
                    <pre className="text-[11px] font-mono text-[#888] whitespace-pre-wrap">
                      {suggestion.suggestedCode.substring(0, 300)}
                      {suggestion.suggestedCode.length > 300 && (
                        <span className="text-[#444]">
                          … ({suggestion.suggestedCode.length - 300} more chars)
                        </span>
                      )}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetailedPreview(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md
                        text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
                        border border-[var(--border-subtle)] transition-colors duration-100"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={applySuggestion}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md
                        text-white bg-[#3A5EFF] hover:bg-[#4a6aff] transition-colors duration-100"
                    >
                      <Check className="w-3 h-3" />
                      Apply
                    </button>
                  </div>

                  <button
                    onClick={() => setSuggestion(null)}
                    className="w-full text-center text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors py-1"
                  >
                    Reject Changes
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AICodePreview
        suggestion={suggestion}
        language={language}
        isOpen={showDetailedPreview}
        onClose={() => setShowDetailedPreview(false)}
        onApply={applySuggestion}
      />
    </div>
  );
}

export default AIAssistant;
