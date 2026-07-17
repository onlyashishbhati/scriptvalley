"use client";

import { motion } from "framer-motion";
import {
  Building2, Briefcase, MapPin, Linkedin, ArrowLeft,
  Calendar, Clock, Lightbulb, ChevronRight, Loader2,
  Pencil, Trash2, Share2, Twitter, Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OutcomeBadge } from "../_components/ExperienceCard";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { Id } from "../../../../../../packages/convex/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

const DIFF: Record<string, string> = {
  Easy:   "text-emerald-400 bg-emerald-500/8  border-emerald-500/20",
  Medium: "text-amber-400   bg-amber-500/8    border-amber-500/20",
  Hard:   "text-red-400     bg-red-500/8      border-red-500/20",
};

function ShareMenu({ slug, company, role }: { slug: string; company: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/experiences/${slug}` : `/experiences/${slug}`;
  const text = `Check out this ${role} interview experience at ${company}!`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // BUG FIX: same unhandled-promise-rejection issue as ExperienceCard's
  // ShareMenu — navigator.clipboard.writeText() can reject and was
  // previously unawaited/uncaught.
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    } catch {
      // Clipboard API blocked — no confirmation shown, but no crash either.
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors ${
          open
            ? "border-[#3A5EFF]/30 bg-[#3A5EFF]/8 text-[#3A5EFF]"
            : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        }`}
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-9 right-0 z-50 w-44 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg overflow-hidden"
        >
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-xs text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Twitter className="w-3.5 h-3.5" /> Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-xs text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" /> Share on LinkedIn
          </a>
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy link"}
          </button>
        </motion.div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-5 h-5 text-[var(--text-disabled)] animate-spin" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-16 pb-16 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-4xl font-semibold text-[var(--bg-active)]">404</p>
        <p className="text-sm text-[var(--text-disabled)]">This experience doesn&apos;t exist or hasn&apos;t been published yet.</p>
        <Link
          href="/experiences"
          className="inline-flex items-center gap-1.5 text-xs text-[#3A5EFF] hover:text-[#4a6aff] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to experiences
        </Link>
      </div>
    </div>
  );
}

export default function ExperienceDetailPage() {
  const params   = useParams();
  const slug     = params.slug as string;
  const exp      = useQuery(api.experiences.getExperienceBySlug, { slug });
  const { user } = useUser();
  const router   = useRouter();
  const deleteMutation = useMutation(api.experiences.deleteExperience);

  const [deleting,       setDeleting]       = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);

  if (exp === undefined) return <Skeleton />;
  if (exp === null)      return <NotFound />;

  const isAuthor = user && exp.userId === user.id;

  const month = exp.interviewDate
    ? new Date(exp.interviewDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteMutation({ id: exp._id as Id<"experiences"> });
      router.push("/experiences");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6">

        {/* Back + header */}
        <div className="mt-8 mb-5">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors mb-5"
          >
            <ArrowLeft className="w-3 h-3" /> All experiences
          </Link>

          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-[var(--text-disabled)]" />
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{exp.company}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[var(--text-faint)]">
                <Briefcase className="w-3.5 h-3.5" />
                {exp.role}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ShareMenu slug={slug} company={exp.company} role={exp.role} />
              {isAuthor && (
                <>
                  <Link
                    href={`/experiences/${slug}/edit`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-[#3A5EFF] hover:border-[#3A5EFF]/30 hover:bg-[#3A5EFF]/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors disabled:opacity-50 ${
                      confirmDelete
                        ? "border-red-500/40 bg-red-500/10 text-red-400"
                        : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5"
                    }`}
                  >
                    {deleting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                    {confirmDelete ? "Confirm?" : "Delete"}
                  </button>
                  {confirmDelete && !deleting && (
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-muted)]"
                    >
                      cancel
                    </button>
                  )}
                </>
              )}
              <OutcomeBadge o={exp.outcome} />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {exp.location && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-disabled)]">
                <MapPin className="w-3 h-3" />{exp.location}
              </span>
            )}
            {exp.package && <span className="text-xs text-[var(--text-disabled)]">· {exp.package}</span>}
            {month && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-disabled)]">
                <Calendar className="w-3 h-3" />{month}
              </span>
            )}
            <span className="text-xs text-[var(--text-disabled)]">· {exp.rounds.length} rounds</span>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] mb-5" />

        {/* Author card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-4 mb-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)] shrink-0">
              {exp.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{exp.name}</p>
              <p className="text-xs text-[var(--text-disabled)]">Placed at {exp.company}</p>
            </div>
          </div>
          <a
            href={exp.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:bg-[#0077b5]/5 transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
            Connect on LinkedIn
          </a>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden mb-5"
        >
          <div className="px-5 py-3 bg-[var(--bg-input)] border-b border-[var(--border-subtle)]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Overview</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-[var(--text-muted)] leading-[1.9]">{exp.overview}</p>
          </div>
        </motion.div>

        {/* Rounds */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden mb-5"
        >
          <div className="px-5 py-3 bg-[var(--bg-input)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Interview rounds</p>
            <span className="text-[10px] text-[var(--text-disabled)]">{exp.rounds.length} total</span>
          </div>

          <div className="divide-y divide-[var(--border-default)]">
            {exp.rounds.map((r, i) => (
              <div key={i} className="px-5 py-4 flex gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <span className="w-6 h-6 rounded-md bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-disabled)] flex items-center justify-center">
                    {i + 1}
                  </span>
                  {i < exp.rounds.length - 1 && (
                    <div className="w-px flex-1 bg-[var(--border-default)] min-h-[16px]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">{r.type}</p>
                    {r.difficulty && (
                      <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-medium ${
                        DIFF[r.difficulty] ?? "text-[var(--text-faint)] bg-[var(--bg-hover)] border-[var(--border-subtle)]"
                      }`}>
                        {r.difficulty}
                      </span>
                    )}
                    {r.duration && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-disabled)]">
                        <Clock className="w-3 h-3" />{r.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-faint)] leading-relaxed">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        {exp.tips && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden mb-5"
          >
            <div className="px-5 py-3 bg-[var(--bg-input)] border-b border-[var(--border-subtle)] flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Tips</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--text-muted)] leading-[1.9]">{exp.tips}</p>
            </div>
          </motion.div>
        )}

        {/* Footer CTA */}
        <div className="rounded-lg border border-dashed border-[var(--border-medium)] px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-0.5">Got placed recently?</p>
            <p className="text-xs text-[var(--text-disabled)]">Help the next batch of candidates.</p>
          </div>
          <Link
            href="/experiences/submit"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-xs font-medium transition-colors"
          >
            Share yours <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}