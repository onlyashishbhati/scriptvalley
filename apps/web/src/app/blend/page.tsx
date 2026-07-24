"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Users2, Plus, KeyRound, Search, Globe } from "lucide-react";
import BlendCard from "./_components/BlendCard";
import CreateBlendModal from "./_components/CreateBlendModal";
import JoinBlendModal from "./_components/JoinBlendModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Blend } from "./types";

type Tab = "mine" | "discover";

function BlendPageContent() {
  const [tab, setTab] = useState<Tab>("mine");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const myBlends = useQuery(api.blends.getMyBlends) as Blend[] | undefined;
  const publicBlends = useQuery(
    api.blends.getPublicBlends,
    tab === "discover" ? { search: search || undefined } : "skip",
  ) as Blend[] | undefined;

  const myBlendIds = new Set((myBlends ?? []).map((b) => b._id));

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 mt-8 mb-16 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1"
            >
              Accountability
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="flex items-center gap-2 mb-2"
            >
              <Users2 className="w-5 h-5 text-[#3A5EFF]" />
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Blend</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
              className="text-sm text-[var(--text-muted)] max-w-md"
            >
              Track a sheet, course, or your daily streak together with friends. Same goal, shared progress.
            </motion.p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setJoinOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" /> Join with code
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create a blend
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex relative bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-md p-1 gap-px">
          {(["mine", "discover"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-100 ${
                tab === t ? "bg-[var(--bg-active)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {t === "mine" ? "My Blends" : "Discover"}
            </button>
          ))}
        </div>

        {tab === "discover" && (
          <div className="relative flex items-center h-9 bg-[var(--bg-input)] rounded-md px-3 focus-within:bg-[var(--bg-hover)] transition-colors duration-100">
            <Search className="w-3.5 h-3.5 text-[var(--text-faint)] mr-2.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search public blends by name or resource…"
              className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none"
            />
          </div>
        )}

        {/* My Blends */}
        <AnimatePresence mode="wait">
          {tab === "mine" && (
            <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {myBlends === undefined ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-[150px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] animate-pulse" />
                  ))}
                </div>
              ) : myBlends.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center rounded-lg border border-dashed border-[var(--border-subtle)]">
                  <Users2 className="w-8 h-8 text-[var(--text-disabled)]" />
                  <p className="text-sm text-[var(--text-faint)]">You&apos;re not in any blends yet</p>
                  <p className="text-xs text-[var(--text-disabled)] max-w-xs">
                    Create one around a sheet, course, or POTD streak — or join a friend&apos;s with an invite code.
                  </p>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBlends.map((blend, i) => (
                    <BlendCard key={blend._id} blend={blend} index={i} isMember />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === "discover" && (
            <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {publicBlends === undefined ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-[150px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] animate-pulse" />
                  ))}
                </div>
              ) : publicBlends.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center rounded-lg border border-dashed border-[var(--border-subtle)]">
                  <Globe className="w-8 h-8 text-[var(--text-disabled)]" />
                  <p className="text-sm text-[var(--text-faint)]">No public blends found</p>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicBlends.map((blend, i) => (
                    <BlendCard key={blend._id} blend={blend} index={i} isMember={myBlendIds.has(blend._id)} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <CreateBlendModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinBlendModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}

export default function BlendPage() {
  return (
    <ProtectedRoute>
      <BlendPageContent />
    </ProtectedRoute>
  );
}