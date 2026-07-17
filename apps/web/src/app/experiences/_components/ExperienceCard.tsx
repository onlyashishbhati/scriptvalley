"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2, Briefcase, MapPin, Linkedin, ChevronRight,
  Calendar, Pencil, Trash2, Share2, Twitter, Link as LinkIcon,
  GraduationCap, Users,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { Id } from "../../../../../../packages/convex/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";

type ConvexExperience = {
  _id: string;
  slug: string;
  name: string;
  linkedinUrl: string;
  company: string;
  role: string;
  location?: string;
  package?: string;
  joiningDate?: string;
  selectionType?: string;
  outcome: string;
  interviewDate: string;
  rounds: { type: string; description: string; duration?: string; difficulty?: string }[];
  overview: string;
  tips?: string;
  minCgpa?: string;
  otherCriteria?: string;
  status: string;
  createdAt: number;
  publishedAt?: number;
  userId?: string;
};

export const OUTCOME_CLS: Record<string, string> = {
  Selected:  "border-emerald-500/25 bg-emerald-500/8  text-emerald-400",
  Rejected:  "border-red-500/25    bg-red-500/8      text-red-400",
  "On Hold": "border-amber-500/25  bg-amber-500/8    text-amber-400",
  Withdrew:  "border-[var(--border-subtle)] bg-[var(--bg-hover)] text-[var(--text-faint)]",
};

export function OutcomeBadge({ o }: { o: string }) {
  const cls = OUTCOME_CLS[o] ?? "border-[var(--border-subtle)] bg-[var(--bg-hover)] text-[var(--text-faint)]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium tracking-wide ${cls}`}>
      {o}
    </span>
  );
}

function Pips({ n }: { n: number }) {
  const show = Math.min(n, 7);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: show }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#3A5EFF]" style={{ opacity: 0.9 - i * 0.1 }} />
      ))}
      {n > 7 && <span className="text-[9px] text-[var(--text-disabled)] ml-0.5">+{n - 7}</span>}
      <span className="text-[10px] text-[var(--text-disabled)] ml-1">
        {n} round{n !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function ShareMenu({ slug, company, role }: { slug: string; company: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/experiences/${slug}` : `/experiences/${slug}`;
  const text = `Check out this ${role} interview experience at ${company}!`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API blocked — no-op, menu still closes below.
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((p) => !p); }}
        className="p-1 rounded-md text-[var(--text-disabled)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
        title="Share"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-7 right-0 z-50 w-40 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg overflow-hidden"
        >
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Twitter className="w-3.5 h-3.5" /> Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" /> Share on LinkedIn
          </a>
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" /> Copy link
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function ExperienceCard({ exp, index = 0, onDeleted }: {
  exp: ConvexExperience;
  index?: number;
  onDeleted?: () => void;
}) {
  const { user } = useUser();
  const deleteMutation = useMutation(api.experiences.deleteExperience);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAuthor = user && exp.userId === user.id;

  const { slug, name, company, role, location, outcome, rounds, interviewDate, overview, linkedinUrl, package: pkg, joiningDate, selectionType, minCgpa } = exp;

  const month = interviewDate
    ? new Date(interviewDate + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  const joining = joiningDate
    ? new Date(joiningDate + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  const accentColor =
    outcome === "Selected" ? "bg-emerald-500/50"
    : outcome === "Rejected" ? "bg-red-500/40"
    : outcome === "On Hold" ? "bg-amber-500/40"
    : "bg-[var(--bg-active)]";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteMutation({ id: exp._id as Id<"experiences"> });
      onDeleted?.();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.05 }}
      className="group relative rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-medium)] transition-colors duration-150 overflow-hidden flex flex-col"
    >
      <div className={`h-[2px] w-full shrink-0 ${accentColor}`} />

      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        {/* Company + outcome */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--text-disabled)] shrink-0" />
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{company}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-[var(--text-disabled)] shrink-0" />
              <p className="text-xs text-[var(--text-faint)] truncate">{role}</p>
            </div>
          </div>
          <OutcomeBadge o={outcome} />
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {location && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-disabled)]">
              <MapPin className="w-3 h-3" />{location}
            </span>
          )}
          {pkg && <span className="text-[11px] text-[var(--text-disabled)]">· {pkg}</span>}
          {joining && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-disabled)]" title="Expected joining date">
              <Calendar className="w-3 h-3 text-emerald-400/70" />
              <span>Joining: {joining}</span>
            </span>
          )}
          {month && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-disabled)]">
              <Calendar className="w-3 h-3" />{month}
            </span>
          )}
          {selectionType && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
              selectionType === "on-campus"
                ? "border-violet-500/25 bg-violet-500/8 text-violet-400"
                : "border-sky-500/25 bg-sky-500/8 text-sky-400"
            }`}>
              <Users className="w-2.5 h-2.5" />
              {selectionType === "on-campus" ? "On-Campus" : "Off-Campus"}
            </span>
          )}
          {minCgpa && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-disabled)]" title="Minimum CGPA required">
              <GraduationCap className="w-3 h-3" />
              CGPA ≥ {minCgpa}
            </span>
          )}
        </div>

        <Pips n={rounds.length} />

        <p className="text-xs text-[var(--text-faint)] leading-relaxed line-clamp-2 flex-1">{overview}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <p className="text-[11px] font-medium text-[var(--text-muted)] truncate">{name}</p>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md text-[var(--border-medium)] hover:text-[#0077b5] hover:bg-[#0077b5]/8 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-1">
            {/* Share */}
            <ShareMenu slug={slug} company={company} role={role} />

            {/* Author actions */}
            {isAuthor && (
              <>
                <Link
                  href={`/experiences/${slug}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-md text-[var(--text-disabled)] hover:text-[#3A5EFF] hover:bg-[#3A5EFF]/8 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`p-1 rounded-md transition-colors ${
                    confirmDelete
                      ? "text-red-400 bg-red-500/10 border border-red-500/20"
                      : "text-[var(--text-disabled)] hover:text-red-400 hover:bg-red-500/8"
                  }`}
                  title={confirmDelete ? "Click again to confirm delete" : "Delete"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {confirmDelete && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(false); }}
                    className="text-[9px] text-[var(--text-disabled)] hover:text-[var(--text-muted)] px-1"
                  >
                    cancel
                  </button>
                )}
              </>
            )}

            <Link
              href={`/experiences/${slug}`}
              className="flex items-center gap-0.5 text-[10px] text-[var(--text-disabled)] hover:text-[#3A5EFF] transition-colors"
            >
              Read <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}