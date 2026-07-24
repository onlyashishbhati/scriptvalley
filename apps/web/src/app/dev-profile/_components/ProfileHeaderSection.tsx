"use client";

import React, { useEffect } from "react";
import type { ReactElement } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { Globe, Mail, ExternalLink, LayoutGrid, Linkedin, Sparkles } from "lucide-react";
import { SiGithub, SiLeetcode, SiX } from "react-icons/si";
import Link from "next/link";
import { motion } from "framer-motion";

function normalizeHandle(input?: string | null) {
  if (!input) return null;
  try {
    if (input.includes("http")) {
      const u = new URL(input);
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] || null;
    }
  } catch {}
  return input?.trim().replace(/^@/, "") || null;
}

const NAV_ITEMS: {
  key: "progress" | "github" | "leetcode";
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "progress", label: "My Progress", icon: LayoutGrid },
  { key: "github",   label: "GitHub",      icon: SiGithub   },
  { key: "leetcode", label: "LeetCode",    icon: SiLeetcode },
];

export default function ProfileHeaderSection({
  onSelect,
  selectedView,
  onLoadingChange,
}: {
  onSelect?: (v: "progress" | "github" | "leetcode") => void;
  selectedView?: "progress" | "github" | "leetcode";
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const { user } = useUser();
  const userId   = user?.id;

  const basic    = useQuery(api.users.getUser,                 userId ? { userId } : "skip");
  const socials  = useQuery(api.socials.getUserSocialLinks,    userId ? { userId } : "skip");
  const platform = useQuery(api.platforms.getUserPlatformData, userId ? { userId } : "skip");

  useEffect(() => {
    onLoadingChange?.(!basic || !socials || !platform);
  }, [basic, socials, platform, onLoadingChange]);

  const profileSrc =
    typeof user?.imageUrl === "string" && user.imageUrl
      ? user.imageUrl
      : "/default-avatar.png";

  const githubHandle = normalizeHandle(platform?.githubUrl);
  const leetHandle   = normalizeHandle(platform?.leetcodeUrl);

  const socialLinks: { href: string; icon: ReactElement; label: string }[] = [
    ...(socials?.linkedin  ? [{ href: socials.linkedin,        icon: <Linkedin className="w-3.5 h-3.5" />, label: "LinkedIn" }] : []),
    ...(socials?.twitter   ? [{ href: socials.twitter,         icon: <SiX        className="w-3.5 h-3.5" />, label: "Twitter"  }] : []),
    ...(socials?.portfolio ? [{ href: socials.portfolio,       icon: <Globe      className="w-3.5 h-3.5" />, label: "Website"  }] : []),
    ...(basic?.email       ? [{ href: `mailto:${basic.email}`, icon: <Mail       className="w-3.5 h-3.5" />, label: "Email"    }] : []),
  ];

  const hasPortfolio = !!basic?.username && basic?.profileVisibility === "public";

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden sticky top-20">

      {/* Avatar + name */}
      <div className="px-4 pt-5 pb-4 border-b border-[var(--border-subtle)] flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[var(--border-subtle)]">
          <Image
            src={profileSrc}
            alt={basic?.name || "Avatar"}
            width={64} height={64}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>

        {basic?.name ? (
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{basic.name}</p>
            {basic.email && <p className="text-xs text-[var(--text-disabled)] mt-0.5">{basic.email}</p>}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-[var(--bg-hover)] rounded animate-pulse mx-auto" />
            <div className="h-3 w-36 bg-[var(--bg-hover)] rounded animate-pulse mx-auto" />
          </div>
        )}

        <Link
          href="/dev-profile/edit-profile"
          className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Edit profile
        </Link>
      </div>

      {/* NEW — Portfolio quick-access, requested to live directly in this
          sidebar rather than as a separate card in the main content area. */}
      {basic && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">Portfolio</p>
          {hasPortfolio ? (
            <a
              href={`/u/${basic.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 -mx-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3A5EFF] shrink-0" />
              <span className="flex-1 text-xs text-[var(--text-secondary)] truncate">View public portfolio</span>
              <ExternalLink className="w-3 h-3 text-[var(--text-disabled)] shrink-0" />
            </a>
          ) : (
            <Link
              href="/dev-profile/edit-profile?tab=Share"
              className="flex items-center gap-2 px-2 py-1.5 -mx-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
              <span className="flex-1 text-xs text-[var(--text-muted)]">Set up your portfolio</span>
            </Link>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="px-1.5 py-2 space-y-px border-b border-[var(--border-subtle)]">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = selectedView === key;
          return (
            <button
              key={key}
              onClick={() => onSelect?.(key)}
              className={`relative group w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors duration-100 ${
                active
                  ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="profileNav"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3A5EFF] rounded-r-full"
                />
              )}
              <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Socials */}
      {socialLinks.length > 0 && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-2">Socials</p>
          <div className="flex flex-wrap gap-1">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Platforms */}
      {(githubHandle || leetHandle) && (
        <div className="px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-2">Platforms</p>
          <div className="space-y-0.5">
            {githubHandle && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelect?.("github")}
                  className={`flex items-center gap-2 flex-1 text-left px-2 py-1.5 rounded-md transition-colors duration-100 ${
                    selectedView === "github"
                      ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <SiGithub className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs truncate">{githubHandle}</span>
                </button>
                <a
                  href={`https://github.com/${githubHandle}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {leetHandle && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelect?.("leetcode")}
                  className={`flex items-center gap-2 flex-1 text-left px-2 py-1.5 rounded-md transition-colors duration-100 ${
                    selectedView === "leetcode"
                      ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <SiLeetcode className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs truncate">{leetHandle}</span>
                </button>
                <a
                  href={`https://leetcode.com/u/${leetHandle}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}