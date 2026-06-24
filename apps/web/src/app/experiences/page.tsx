"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, BookOpen, Plus, User } from "lucide-react";
import Link from "next/link";
import ExperienceCard from "./_components/ExperienceCard";
import type { Outcome } from "./types/experiences";
import { useQuery } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const OUTCOMES: (Outcome | "All")[] = ["All", "Selected", "Rejected", "On Hold", "Withdrew"];

export default function ExperiencesListPage() {
  const experiences = useQuery(api.experiences.getPublishedExperiences) ?? [];
  const { user } = useUser();

  const [search,    setSearch]    = useState("");
  const [outcome,   setOutcome]   = useState<Outcome | "All">("All");
  const [company,   setCompany]   = useState("All");
  const [showFilt,  setShowFilt]  = useState(false);
  const [myOnly,    setMyOnly]    = useState(false);

  const companies = useMemo(
    () => ["All", ...Array.from(new Set(experiences.map((e) => e.company)))],
    [experiences],
  );

  const filtered = useMemo(() => experiences.filter((e) => {
    const q  = search.toLowerCase();
    const ms = !q || [e.company, e.role, e.name, e.overview].some((s) => s.toLowerCase().includes(q));
    const myMatch = !myOnly || (user && e.userId === user.id);
    return ms && (outcome === "All" || e.outcome === outcome) && (company === "All" || e.company === company) && myMatch;
  }), [experiences, search, outcome, company, myOnly, user]);

  const active = (outcome !== "All" ? 1 : 0) + (company !== "All" ? 1 : 0);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-16 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mt-8 mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1">Experiences</p>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Interview Experiences from Real Students</h1>
            <p className="mt-1.5 text-sm text-[var(--text-disabled)]">
              Real stories from students who cracked their coding interviews. Companies, rounds, tips, and outcomes.
            </p>
          </div>
          <Link
            href="/experiences/submit"
            className="shrink-0 self-start flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Share yours
          </Link>
        </div>
        <div className="border-t border-[var(--border-subtle)] mb-5" />

        {/* Search + filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-disabled)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by company, role, or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-md pl-8 pr-8 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-disabled)] focus:outline-none focus:border-[#3A5EFF] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-disabled)] hover:text-[var(--text-muted)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* My Experiences toggle — only for logged-in users */}
          {user && (
            <button
              onClick={() => setMyOnly((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs transition-colors ${
                myOnly
                  ? "border-[#3A5EFF]/40 bg-[#3A5EFF]/5 text-[#3A5EFF]"
                  : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
              }`}
              title="Show only my submissions"
            >
              <User className="w-3.5 h-3.5" />
              Mine
            </button>
          )}

          <button
            onClick={() => setShowFilt((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs transition-colors ${
              showFilt || active > 0
                ? "border-[#3A5EFF]/40 bg-[#3A5EFF]/5 text-[#3A5EFF]"
                : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {active > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#3A5EFF] text-white text-[9px] font-bold flex items-center justify-center">
                {active}
              </span>
            )}
          </button>
        </div>

        {/* Filter drawer */}
        {showFilt && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4 mb-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-2">Outcome</p>
                <div className="flex flex-wrap gap-1.5">
                  {OUTCOMES.map((o) => (
                    <button key={o} onClick={() => setOutcome(o)}
                      className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                        outcome === o
                          ? "bg-[var(--bg-active)] border-[var(--border-medium)] text-[var(--text-secondary)]"
                          : "border-[var(--border-subtle)] text-[var(--text-disabled)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                      }`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-2">Company</p>
                <div className="flex flex-wrap gap-1.5">
                  {companies.map((c) => (
                    <button key={c} onClick={() => setCompany(c)}
                      className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                        company === c
                          ? "bg-[var(--bg-active)] border-[var(--border-medium)] text-[var(--text-secondary)]"
                          : "border-[var(--border-subtle)] text-[var(--text-disabled)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {active > 0 && (
              <button
                onClick={() => { setOutcome("All"); setCompany("All"); }}
                className="text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
              >
                Clear all ×
              </button>
            )}
          </motion.div>
        )}

        {/* My experiences banner */}
        {myOnly && user && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-2.5 rounded-md border border-[#3A5EFF]/20 bg-[#3A5EFF]/5 mb-4"
          >
            <p className="text-xs text-[#3A5EFF]">
              Showing your experiences. Edit or delete them from the cards below.
            </p>
            <button onClick={() => setMyOnly(false)} className="text-[10px] text-[#3A5EFF]/70 hover:text-[#3A5EFF]">
              Show all ×
            </button>
          </motion.div>
        )}

        <p className="text-[10px] text-[var(--text-disabled)] mb-4">
          {filtered.length} experience{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <BookOpen className="w-8 h-8 text-[var(--bg-active)]" />
            <p className="text-sm text-[var(--text-disabled)]">
              {myOnly ? " You haven't shared an experience yet." : "No experiences found"}
            </p>
            <Link
              href="/experiences/submit"
              className="flex items-center gap-1.5 text-xs text-[#3A5EFF] hover:text-[#4a6aff] transition-colors"
            >
              <Plus className="w-3 h-3" /> {myOnly ? "Share your first experience" : "Share the first one"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((e, i) => <ExperienceCard key={e._id} exp={e} index={i} />)}
          </div>
        )}

      </div>
    </div>
  );
}