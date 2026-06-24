"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import type * as monacoEditor from "monaco-editor";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RefreshCcwIcon,
  ShareIcon,
  MaximizeIcon,
  MinimizeIcon,
  DownloadIcon,
} from "lucide-react";
import { SignedIn, useClerk } from "@clerk/nextjs";
import { EditorPanelSkeleton } from "./Skeleton";
import useMounted from "@/hooks/useMounted";
import ShareSnippetDialog from "./ShareSnippetDialog";
import RunButton from "./RunButton";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import AIAssistant from "./AIAssistant";

function EditorPanel() {
  const clerk = useClerk();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { language, theme, editor, setEditor } = useCodeEditorStore();
  const [rotate, setRotate] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(newCode);
  }, [language, editor]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleDownload = () => {
    if (!editor) return;
    const code = editor.getValue();
    const extension = LANGUAGE_CONFIG[language].extension || ".txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  };

  const handleClick = () => {
    setRotate((prev) => !prev);
    handleRefresh();
  };

  if (!mounted) return null;

  const iconBtn =
    "p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100";

  return (
    <AnimatePresence>
      <motion.div
        key="editor-wrapper"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`w-full ${isFullScreen ? "fixed inset-0 z-50 bg-[var(--bg-base)] p-4" : ""}`}
      >
        <div
          className={`w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg ${isFullScreen ? "h-full" : ""}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
            {/* Left: language icon + label */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--bg-hover)] flex items-center justify-center shrink-0 p-1">
                <Image
                  src={"/" + language + ".png"}
                  alt={language}
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
                  Editor
                </p>
                <p className="text-xs font-medium text-[var(--text-secondary)] leading-tight">
                  {LANGUAGE_CONFIG[language].label}
                </p>
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-1.5">
              <div className="hidden md:flex items-center gap-1.5">
                <ThemeSelector />
              </div>
              <LanguageSelector />

              <div className="w-px h-5 bg-[var(--border-subtle)] mx-1 hidden md:block" />

              <div className="hidden md:flex items-center gap-0.5">
                <AIAssistant />

                <button
                  onClick={handleDownload}
                  title="Download"
                  className={iconBtn}
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                </button>

                <button onClick={handleClick} title="Reset" className={iconBtn}>
                  <motion.span
                    animate={{ rotate: rotate ? 360 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="block"
                  >
                    <RefreshCcwIcon className="w-3.5 h-3.5" />
                  </motion.span>
                </button>

                <button
                  onClick={() => setIsShareDialogOpen(true)}
                  title="Share"
                  className={iconBtn}
                >
                  <ShareIcon className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsFullScreen((p) => !p)}
                  title="Fullscreen"
                  className={iconBtn}
                >
                  {isFullScreen ? (
                    <MinimizeIcon className="w-3.5 h-3.5" />
                  ) : (
                    <MaximizeIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

              <SignedIn>
                <RunButton
                  name="Run"
                  className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium transition-all"
                />
              </SignedIn>
            </div>
          </div>

          {/* Monaco Editor */}
          <div
            className={`relative rounded-b-lg overflow-hidden ${isFullScreen ? "h-[calc(100vh-64px)]" : ""}`}
          >
            {clerk.loaded ? (
              <Editor
                height={isFullScreen ? "100%" : "100vh"}
                language={LANGUAGE_CONFIG[language].monacoLanguage}
                onChange={handleEditorChange}
                theme={theme}
                beforeMount={defineMonacoThemes}
                onMount={(
                  editorInstance: monacoEditor.editor.IStandaloneCodeEditor,
                ) => setEditor(editorInstance)}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  renderWhitespace: "selection",
                  fontFamily:
                    '"Fira Code", "Cascadia Code", Consolas, monospace',
                  fontLigatures: true,
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  contextmenu: true,
                  renderLineHighlight: "all",
                  lineHeight: 1.6,
                  letterSpacing: 0.5,
                  roundedSelection: true,
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                  },
                }}
              />
            ) : (
              <EditorPanelSkeleton />
            )}
          </div>
        </div>

        {isShareDialogOpen && (
          <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default EditorPanel;
