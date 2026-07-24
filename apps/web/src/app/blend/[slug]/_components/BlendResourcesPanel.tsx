"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import type { Id } from "../../../../../../../packages/convex/convex/_generated/dataModel";
import toast from "react-hot-toast";
import { ArrowUpRight, Plus, Trash2, Loader2 } from "lucide-react";
import { RESOURCE_TYPE_META, type BlendDetail } from "../../types";

interface SheetOption {
  slug: string;
  name: string;
}

interface CourseOption {
  slug: string;
  title: string;
}

export default function BlendResourcesPanel({ detail }: { detail: BlendDetail }) {
  const { blend, resources, isOwner } = detail;
  const meta = RESOURCE_TYPE_META[blend.resourceType];
  const Icon = meta.icon;

  const addResource = useMutation(api.blends.addResource);
  const removeResource = useMutation(api.blends.removeResource);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  const sheets = useQuery(
    api.sheets.getAll,
    blend.resourceType === "sheet" && adding ? {} : "skip",
  ) as SheetOption[] | undefined;
  const courses = useQuery(
    api.courses.getAllCourses,
    blend.resourceType === "course" && adding ? {} : "skip",
  ) as CourseOption[] | undefined;

  const trackedSlugs = new Set(resources.map((r) => r.resourceSlug));
  const options = blend.resourceType === "sheet"
    ? (sheets ?? []).filter((s) => !trackedSlugs.has(s.slug)).map((s) => ({ slug: s.slug, name: s.name }))
    : (courses ?? []).filter((c) => !trackedSlugs.has(c.slug)).map((c) => ({ slug: c.slug, name: c.title }));

  const detailHref = (slug: string) => blend.resourceType === "sheet" ? `/dsa-sheet/${slug}` : `/courses/${slug}`;

  async function handleAdd() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await addResource({ blendId: blend._id as Id<"blends">, resourceSlug: selected });
      toast.success("Added to the blend");
      setSelected("");
      setAdding(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(slug: string) {
    setRemovingSlug(slug);
    try {
      await removeResource({ blendId: blend._id as Id<"blends">, resourceSlug: slug });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingSlug(null);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-[var(--text-faint)]" />
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
            Tracking {resources.length} {resources.length === 1 ? meta.itemLabel : `${meta.itemLabel}s`}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setAdding((p) => !p)}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#3A5EFF] hover:text-[#4a6aff]"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2 overflow-hidden"
        >
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 h-8 bg-[var(--bg-input)] rounded-md px-2 text-xs text-[var(--text-secondary)] outline-none"
          >
            <option value="">Select a {meta.itemLabel}…</option>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>{o.name}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selected || submitting}
            className="px-3 py-1.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
          </button>
        </motion.div>
      )}

      {resources.length === 0 ? (
        <p className="text-xs text-[var(--text-disabled)] text-center py-8 px-5">
          {isOwner ? `Add a ${meta.itemLabel} to start tracking progress together.` : "The owner hasn't added anything to track yet."}
        </p>
      ) : (
        <div className="divide-y divide-[var(--border-default)]">
          {resources.map((r) => (
            <div key={r.resourceSlug} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)] truncate">{r.resourceName}</p>
              </div>
              <Link
                href={detailHref(r.resourceSlug)}
                className="flex items-center gap-1 text-xs text-[#3A5EFF] hover:text-[#4a6aff] shrink-0"
              >
                Open <ArrowUpRight className="w-3 h-3" />
              </Link>
              {isOwner && (
                <button
                  onClick={() => handleRemove(r.resourceSlug)}
                  disabled={removingSlug === r.resourceSlug}
                  className="p-1 rounded-md text-[var(--text-disabled)] hover:text-red-400 hover:bg-red-500/[0.06] transition-colors shrink-0 disabled:opacity-50"
                >
                  {removingSlug === r.resourceSlug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}