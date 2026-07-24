"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users2, Lock, Globe, Check, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import toast from "react-hot-toast";
import type { BlendResourceType } from "../types";
import { RESOURCE_TYPE_META } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// NOTE: this modal no longer asks which sheet/course to track — that
// happens after creation, on the blend page itself, where any number of
// sheets/courses can be added over time (see BlendResourcesPanel). POTD is
// no longer a trackable type.
export default function CreateBlendModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const createBlend = useMutation(api.blends.createBlend);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [resourceType, setResourceType] = useState<BlendResourceType>("sheet");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName(""); setDescription(""); setVisibility("private"); setResourceType("sheet");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Give your blend a name"); return; }

    setSubmitting(true);
    try {
      const result = await createBlend({
        name,
        description: description || undefined,
        visibility,
        resourceType,
      });
      toast.success("Blend created! Add sheets or courses to start tracking.");
      reset();
      onClose();
      router.push(`/blend/${result.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create blend");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            // BUG FIX: was z-50, same as the floating dock (DockWrapper),
            // and since the dock mounts after page content in the DOM it
            // won the stacking tie and rendered on top of this modal. Bumped
            // well above the dock's z-50 so this always wins regardless of
            // DOM order.
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md pointer-events-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/20 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[rgba(58,94,255,0.08)]">
                    <Users2 className="w-3.5 h-3.5 text-[#3A5EFF]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Create a Blend</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-md text-[var(--text-faint)] hover:bg-[var(--bg-hover)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Striver Sheet Squad"
                    maxLength={60}
                    className="w-full h-9 bg-[var(--bg-input)] rounded-md px-3 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none focus:bg-[var(--bg-hover)] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A quick line about your goal together"
                    rows={2}
                    maxLength={200}
                    className="w-full bg-[var(--bg-input)] rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none resize-none focus:bg-[var(--bg-hover)] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Track</label>
                  <div className="flex gap-1.5">
                    {(Object.keys(RESOURCE_TYPE_META) as BlendResourceType[]).map((type) => {
                      const Icon = RESOURCE_TYPE_META[type].icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setResourceType(type)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs font-medium transition-colors ${
                            resourceType === type
                              ? "border-[#3A5EFF]/40 bg-[#3A5EFF]/8 text-[#3A5EFF]"
                              : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {RESOURCE_TYPE_META[type].label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[var(--text-disabled)]">
                    You&apos;ll pick which {resourceType === "sheet" ? "sheets" : "courses"} to track after creating — you can add more than one.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Visibility</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibility("private")}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        visibility === "private" ? "border-[#3A5EFF] bg-[#3A5EFF0d]" : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                      }`}
                    >
                      <Lock className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${visibility === "private" ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Private</p>
                        <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">Invite code only</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("public")}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        visibility === "public" ? "border-[#3A5EFF] bg-[#3A5EFF0d]" : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                      }`}
                    >
                      <Globe className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${visibility === "public" ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Public</p>
                        <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">Anyone can request to join</p>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {submitting ? "Creating…" : "Create Blend"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}