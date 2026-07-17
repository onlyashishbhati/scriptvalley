"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import SnippetsPageSkeleton from "./_components/SnippetsPageSkeleton";
import { motion } from "framer-motion";
import { Search, Tag, X, Lock, Globe, User } from "lucide-react";
import SnippetCard from "./_components/SnippetCard";
import { useUser } from "@clerk/nextjs";

type FilterType = "public" | "private" | "my-snippets";

function SnippetsPage() {
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState<FilterType>("public");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  type ButtonPosition = { left: number; width: number };
  const [buttonPositions, setButtonPositions] = useState<Record<string, ButtonPosition>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const getButtonPosition = (filter: string) => {
    if (!containerRef.current) return { left: 0, width: 0 };
    const button = containerRef.current.querySelector(`[data-filter="${filter}"]`) as HTMLElement | null;
    if (!button) return { left: 0, width: 0 };
    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return { left: buttonRect.left - containerRect.left, width: buttonRect.width };
  };

  useEffect(() => {
    const updatePositions = () => {
      const positions: Record<string, ButtonPosition> = {};
      ["public", "private", "my-snippets"].forEach((filter) => {
        positions[filter] = getButtonPosition(filter);
      });
      setButtonPositions(positions);
    };
    const timeoutId = setTimeout(updatePositions, 100);
    window.addEventListener("resize", updatePositions);
    return () => { clearTimeout(timeoutId); window.removeEventListener("resize", updatePositions); };
  }, [user]);

  const activePosition = buttonPositions[activeFilter] || { left: 0, width: 0 };

  const publicSnippets = useQuery(
    api.snippets.getSnippets,
    activeFilter === "public" ? {} : "skip",
  );
  const privateSnippets = useQuery(
    api.snippets.getPrivateSnippets,
    activeFilter === "private" && user ? {} : "skip",
  );
  const userSnippets = useQuery(
    api.snippets.getUserSnippets,
    activeFilter === "my-snippets" && user ? {} : "skip",
  );

  const getCurrentSnippets = () => {
    switch (activeFilter) {
      case "public":      return publicSnippets  || [];
      case "private":     return privateSnippets || [];
      case "my-snippets": return userSnippets    || [];
      default:            return [];
    }
  };

  const snippets = getCurrentSnippets();

  const currentQueryResult =
    activeFilter === "public" ? publicSnippets :
    activeFilter === "private" ? privateSnippets :
    userSnippets;

  if (currentQueryResult === undefined) return <div className="min-h-screen"><SnippetsPageSkeleton /></div>;

  const languages = [...new Set(snippets.map((s) => s.language))];
  const popularLanguages = languages.slice(0, 5);

  const filteredSnippets = snippets.filter((snippet) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      snippet.title.toLowerCase().includes(q) ||
      snippet.language.toLowerCase().includes(q) ||
      snippet.userName.toLowerCase().includes(q);
    const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "public":      return "Public Snippets";
      case "private":     return "Private Snippets";
      case "my-snippets": return "My Snippets";
      default:            return "Code Snippets";
    }
  };

  const getFilterDescription = () => {
    switch (activeFilter) {
      case "public":      return "Browse community snippets to learn patterns, tricks, and best practices.";
      case "private":     return "Your private snippets, only visible to you for quick reference.";
      case "my-snippets": return "All your snippets in one place, both public and private.";
      default:            return "Explore code snippets to boost your productivity.";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 mt-8">

        <div className="mb-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1"
          >
            Library
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-2xl font-semibold text-[var(--text-primary)] mb-2"
          >
            {getFilterTitle()}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-sm text-[var(--text-muted)]"
          >
            {getFilterDescription()}
          </motion.p>
        </div>

        <div className="flex items-center mb-8">
          <div
            ref={containerRef}
            className="inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--bg-input)] px-1 py-1 relative gap-px"
          >
            <motion.div
              className="absolute rounded-md bg-[var(--bg-active)]"
              animate={{ left: activePosition.left, width: activePosition.width }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ top: 4, bottom: 4, height: "calc(100% - 8px)" }}
            />

            <button
              data-filter="public"
              onClick={() => setActiveFilter("public")}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors duration-100 ${
                activeFilter === "public" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Public
            </button>

            {user && (
              <>
                <button
                  data-filter="private"
                  onClick={() => setActiveFilter("private")}
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors duration-100 ${
                    activeFilter === "private" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Private
                </button>

                <button
                  data-filter="my-snippets"
                  onClick={() => setActiveFilter("my-snippets")}
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors duration-100 ${
                    activeFilter === "my-snippets" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Mine
                </button>
              </>
            )}
          </div>

          <span className="ml-auto text-xs text-[var(--text-disabled)]">
            {filteredSnippets.length} snippet{filteredSnippets.length !== 1 && "s"}
          </span>
        </div>

        <div className="mb-8 space-y-3">
          <div className="relative flex items-center h-9 bg-[var(--bg-input)] rounded-md px-3 focus-within:bg-[var(--bg-hover)] transition-colors duration-100">
            <Search className="w-3.5 h-3.5 text-[var(--text-faint)] mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, language, or author…"
              className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
              <Tag className="w-3 h-3" />
              Filter
            </div>

            {popularLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang === selectedLanguage ? null : lang)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors duration-100 ${
                  selectedLanguage === lang
                    ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Image src={`/${lang}.png`} alt={lang} width={12} height={12} className="object-contain" />
                {lang}
              </button>
            ))}

            {selectedLanguage && (
              <button
                onClick={() => setSelectedLanguage(null)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSnippets.map((snippet) => (
            <SnippetCard key={snippet._id} snippet={snippet} />
          ))}
        </div>

        {filteredSnippets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-sm mx-auto mt-16 p-6 rounded-lg border border-[var(--border-subtle)] text-center"
          >
            <p className="text-sm text-[var(--text-faint)]">
              {searchQuery || selectedLanguage
                ? "Try adjusting your search or filters."
                : activeFilter === "private"
                ? "No private snippets yet."
                : activeFilter === "my-snippets"
                ? "You haven't created any snippets yet."
                : "Be the first to share a snippet."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SnippetsPage;