"use client";

import { motion } from "framer-motion";
import {
  Flame, Trophy, Target, Swords, ClipboardCheck,
  GraduationCap, Sprout, Users, Zap, Share2,
  Home, Briefcase, User, Mail,
  Github, Linkedin, Twitter, Globe, Code2,
  Figma, Container, BookOpen, Box, Layers,
  Wrench, type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  computeBadges,
  type BadgeInputs,
  type BadgeIconName,
} from "../../../../../../../packages/convex/convex/badgeEngine";
import { ACCENT_COLOR_OPTIONS } from "../../../../../../../packages/convex/convex/constants";
import GithubTabSection from "./GithubTabSection";
import LeetcodeTabSection from "./LeetcodeTabSection";

// ─── Accent color resolution ────────────────────────────────────────────────
// The portfolio page is intentionally themed independently of the rest of
// the site — always dark, never follows the visitor's light/dark toggle.
// accentColor is the one customization knob a user has over that theme.
// Everything derived from it (soft background, border) is computed from
// the same hex so the whole page stays visually coherent instead of mixing
// a chosen accent with leftover hardcoded blue in some corners.
const DEFAULT_ACCENT_HEX = ACCENT_COLOR_OPTIONS[0].hex;

function resolveAccentHex(accentColorKey: string | null | undefined): string {
  const match = ACCENT_COLOR_OPTIONS.find((c) => c.key === accentColorKey);
  return match?.hex ?? DEFAULT_ACCENT_HEX;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  if (Number.isNaN(bigint)) return `rgba(58, 94, 255, ${alpha})`;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildTheme(accentColorKey: string | null | undefined) {
  const accent = resolveAccentHex(accentColorKey);
  return {
    bg: "#0a0a0a",
    sidebarBorder: "#1f1f1f",
    surface: "#141414",
    surfaceNested: "#1a1a1a",
    surfaceHover: "#202020",
    border: "#232323",
    borderHover: "#343434",
    text: "#f2f2f0",
    textMuted: "#9a9a96",
    textFaint: "#5c5c58",
    accent,
    accentSoft: hexToRgba(accent, 0.1),
    accentBorder: hexToRgba(accent, 0.35),
    statusGreen: "#34d399",
    statusGreenBg: "rgba(52, 211, 153, 0.10)",
    statusGreenBorder: "rgba(52, 211, 153, 0.3)",
  };
}

export type PortfolioTheme = ReturnType<typeof buildTheme>;

// ─── Badge icon map ─────────────────────────────────────────────────────────
const BADGE_ICON_MAP: Record<BadgeIconName, LucideIcon> = {
  flame: Flame, trophy: Trophy, target: Target, swords: Swords,
  "clipboard-check": ClipboardCheck, "graduation-cap": GraduationCap,
  sprout: Sprout, users: Users, zap: Zap,
};

// ─── Tool icon map ──────────────────────────────────────────────────────────
const TOOL_ICON_MAP: Record<string, LucideIcon> = {
  "vs code": Code2,
  "vscode": Code2,
  "figma": Figma,
  "docker": Container,
  "docker desktop": Container,
  "github desktop": Github,
  "github": Github,
  "notion": BookOpen,
  "postman": Box,
  "blender": Layers,
  "sketch": Figma,
  "adobe xd": Figma,
  "linear": Layers,
  "slack": Users,
  "photoshop": Layers,
  "illustrator": Layers,
  "after effects": Layers,
  "premiere pro": Layers,
  "davinci resolve": Layers,
};

function getToolIcon(tool: string): LucideIcon {
  return TOOL_ICON_MAP[tool.toLowerCase()] ?? Wrench;
}

// ─── Contact icon map ────────────────────────────────────────────────────────
type ContactItem = { href: string; label: string; icon: LucideIcon };

function buildContactItems(
  socials: { linkedin?: string | null; twitter?: string | null; portfolio?: string | null },
): ContactItem[] {
  // NOTE: GitHub/LeetCode moved out of the contact row now that they're
  // full nav tabs with their own stats — repeating them here as tiny icon
  // links would be redundant with the richer section below.
  const items: ContactItem[] = [];
  if (socials.linkedin) items.push({ href: socials.linkedin, label: "LinkedIn", icon: Linkedin });
  if (socials.twitter) items.push({ href: socials.twitter, label: "Twitter / X", icon: Twitter });
  if (socials.portfolio) items.push({ href: socials.portfolio, label: "Portfolio", icon: Globe });
  return items;
}

// ─── Count-up number (small motion touch for stat cards) ───────────────────
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

// ─── Types ──────────────────────────────────────────────────────────────────
type Profile = {
  name: string;
  username: string | null;
  collegeName?: string | null;
  stats: {
    currentStreak: number; longestStreak: number; totalPotdSolved: number;
    sheetsFollowed: number; coursesInProgress: number;
  };
  platforms: { githubUrl?: string | null; leetcodeUrl?: string | null };
  socials: { linkedin?: string | null; twitter?: string | null; portfolio?: string | null };
  _badgeInputs: BadgeInputs;
};

type EducationEntry = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
};

type Portfolio = {
  bio?: string | null;
  tagline?: string | null;
  skills?: string[];
  interests?: string[];
  tools?: string[];
  projects?: { id: string; title: string; description?: string; techStack: string[]; liveUrl?: string; githubUrl?: string }[];
  experience?: { id: string; company: string; role: string; startDate: string; endDate?: string; current: boolean }[];
  education?: EducationEntry[];
  accentColor?: string | null;
  showStats?: boolean;
} | null;

interface Props {
  profile: Profile;
  portfolio: Portfolio;
  avatarUrl: string | null;
}

const BASE_SECTIONS = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "about", label: "About", icon: User },
  { id: "github", label: "GitHub", icon: Github },
  { id: "leetcode", label: "LeetCode", icon: Code2 },
  { id: "contact", label: "Contact", icon: Mail },
] as const;

function formatMonthYear(value?: string): string {
  if (!value) return "";
  const [y, m] = value.split("-");
  if (!y || !m) return value;
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Root component ─────────────────────────────────────────────────────────
export default function SidebarProfile({ profile, portfolio, avatarUrl }: Props) {
  const T = buildTheme(portfolio?.accentColor);
  const [active, setActive] = useState<string>("home");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const topmost = intersecting.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActive(topmost.target.id);
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 },
    );
    BASE_SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const showStats = portfolio?.showStats ?? true;
  const badges = showStats ? computeBadges(profile._badgeInputs) : [];
  const earnedCount = badges.filter((b) => b.earned).length;
  const initials = profile.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const hasWork = (portfolio?.projects?.length ?? 0) > 0;
  const hasEducation = (portfolio?.education?.length ?? 0) > 0;
  const hasAbout =
    (portfolio?.skills?.length ?? 0) > 0 ||
    (portfolio?.interests?.length ?? 0) > 0 ||
    (portfolio?.tools?.length ?? 0) > 0 ||
    (portfolio?.experience?.length ?? 0) > 0 ||
    hasEducation ||
    showStats;

  const hasGithub = !!profile.platforms.githubUrl;
  const hasLeetcode = !!profile.platforms.leetcodeUrl;

  const contactItems = buildContactItems(profile.socials);
  const hasContact = contactItems.length > 0;

  const visibleSections = BASE_SECTIONS.filter((s) => {
    if (s.id === "work") return hasWork;
    if (s.id === "about") return hasAbout;
    if (s.id === "github") return hasGithub;
    if (s.id === "leetcode") return hasLeetcode;
    if (s.id === "contact") return hasContact;
    return true;
  });

  // Sidebar subtitle priority: tagline (short, explicit) → bio's first
  // sentence → college name → nothing.
  const sidebarSubtitle = portfolio?.tagline
    ? portfolio.tagline
    : portfolio?.bio
      ? portfolio.bio.split(/[.!?]/)[0].trim()
      : profile.collegeName || "";

  const educationEntries = [...(portfolio?.education ?? [])];

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }} className="flex">

      {/* ── Fixed left sidebar ──────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 px-6 py-8"
        style={{ borderRight: `1px solid ${T.sidebarBorder}` }}
      >
        <div className="mb-8">
          <h1 className="text-base font-semibold leading-snug" style={{ color: T.text }}>
            {profile.name}
          </h1>
        </div>

        <div style={{ borderTop: `1px solid ${T.sidebarBorder}` }} className="pt-2">
          <nav className="flex flex-col gap-0.5">
            {visibleSections.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 text-left"
                  style={{
                    color: isActive ? T.text : T.textFaint,
                    background: isActive ? T.surfaceHover : "transparent",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebarActive"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full"
                      style={{ background: T.accent }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Mobile top nav ───────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-1 px-4 py-3 overflow-x-auto"
        style={{ background: T.bg, borderBottom: `1px solid ${T.sidebarBorder}` }}
      >
        {visibleSections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors duration-150"
            style={{
              color: active === id ? T.text : T.textFaint,
              background: active === id ? T.surfaceHover : "transparent",
              border: `1px solid ${active === id ? T.borderHover : "transparent"}`,
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Content column ───────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-6 md:px-14 py-10 md:py-16 pt-20 md:pt-16 max-w-3xl">

        {/* ── Home ─────────────────────────────────────────────────────── */}
        <section
          id="home"
          ref={(el) => { sectionRefs.current["home"] = el; }}
          className="min-h-[80vh] flex flex-col justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start justify-between gap-4 mb-8"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ background: T.accent }}
              whileHover={{ scale: 1.04, rotate: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-semibold">{initials}</span>
              )}
            </motion.div>

            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0"
              style={{ color: T.statusGreen, background: T.statusGreenBg, border: `1px solid ${T.statusGreenBorder}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.statusGreen }} />
              Profile live
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-4xl font-semibold leading-tight"
          >
            {sidebarSubtitle ? (
              <>
                <span style={{ color: "#6b6b6b" }}>{profile.name.split(" ")[0]}</span>
                <span style={{ color: T.textMuted }}> — </span>
                <span style={{ color: T.text }}>{sidebarSubtitle}</span>
              </>
            ) : (
              <>
                <span style={{ color: "#6b6b6b" }}>Hey, I&apos;m </span>
                <span style={{ color: T.text }}>{profile.name.split(" ")[0]}</span>
              </>
            )}
          </motion.h2>

          {portfolio?.bio && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-base mt-5 leading-relaxed max-w-xl"
              style={{ color: T.textMuted }}
            >
              {portfolio.bio}
            </motion.p>
          )}

          {hasContact && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-2 mt-8 flex-wrap"
            >
              {contactItems.map((item, i) => (
                <IconLinkButton key={item.label} {...item} T={T} delay={0.28 + i * 0.05} />
              ))}
            </motion.div>
          )}
        </section>

        {/* ── Work ─────────────────────────────────────────────────────── */}
        {hasWork && (
          <SectionBlock id="work" sectionRefs={sectionRefs} title="Featured Work" T={T}>
            <div className="flex flex-col gap-3">
              {portfolio!.projects!.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -3, borderColor: T.borderHover }}
                  className="rounded-xl p-5"
                  style={{ background: T.surface, border: `1px solid ${T.border}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-medium" style={{ color: T.text }}>{p.title}</h3>
                    <div className="flex gap-3 shrink-0 mt-0.5">
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-medium" style={{ color: T.accent }}>Live</a>
                      )}
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-medium" style={{ color: T.textFaint }}>Code</a>
                      )}
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: T.textMuted }}>{p.description}</p>
                  )}
                  {p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.techStack.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: T.surfaceNested, color: T.textFaint }}>{t}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </SectionBlock>
        )}

        {/* ── About ────────────────────────────────────────────────────── */}
        {hasAbout && (
          <SectionBlock id="about" sectionRefs={sectionRefs} title="About" T={T}>
            <div className="flex flex-col gap-10">

              {showStats && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                    <MiniStat value={profile.stats.currentStreak} suffix="d" label="Streak" T={T} />
                    <MiniStat value={profile.stats.longestStreak} suffix="d" label="Longest" T={T} />
                    <MiniStat value={profile.stats.totalPotdSolved} label="Solved" T={T} />
                    <MiniStat value={profile.stats.sheetsFollowed} label="Sheets" T={T} />
                    <MiniStat value={profile.stats.coursesInProgress} label="Courses" T={T} />
                  </div>
                  {badges.length > 0 && (
                    <>
                      <div className="flex items-baseline justify-between mb-3">
                        <h4 className="text-sm font-medium" style={{ color: T.text }}>Badges</h4>
                        <span className="text-xs" style={{ color: T.textFaint }}>{earnedCount} / {badges.length} earned</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {badges.map((badge) => (
                          <BadgeChip
                            key={badge.id}
                            icon={BADGE_ICON_MAP[badge.icon]}
                            label={badge.label}
                            earned={badge.earned}
                            pct={badge.progress.target > 0 ? Math.min(100, Math.round((badge.progress.current / badge.progress.target) * 100)) : 0}
                            T={T}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Education (NEW) — its own timeline, above skills so
                  recruiters scanning top-down see credentials early. */}
              {hasEducation && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Education</h4>
                  <div className="flex flex-col gap-2.5">
                    {educationEntries.map((ed, i) => (
                      <motion.div
                        key={ed.id}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.06 }}
                        whileHover={{ x: 2 }}
                        className="rounded-xl p-4 flex items-start gap-3"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: T.surfaceNested }}
                        >
                          <GraduationCap className="w-4 h-4" style={{ color: T.accent }} strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold" style={{ color: T.text }}>{ed.degree}</span>
                                {ed.current && (
                                  <span
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                    style={{ color: T.statusGreen, background: T.statusGreenBg, border: `1px solid ${T.statusGreenBorder}` }}
                                  >
                                    Ongoing
                                  </span>
                                )}
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                                {ed.institution}
                                {ed.fieldOfStudy ? ` · ${ed.fieldOfStudy}` : ""}
                              </p>
                            </div>
                            <span
                              className="text-xs shrink-0 px-2 py-1 rounded-lg mt-0.5"
                              style={{ background: T.surfaceNested, color: T.textFaint }}
                            >
                              {formatMonthYear(ed.startDate)} – {ed.current ? "Present" : formatMonthYear(ed.endDate)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {portfolio?.skills && portfolio.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Skills</h4>
                  <PillRow items={portfolio.skills} T={T} />
                </div>
              )}

              {portfolio?.interests && portfolio.interests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Interests</h4>
                  <PillRow items={portfolio.interests} T={T} />
                </div>
              )}

              {portfolio?.tools && portfolio.tools.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.tools.map((tool, i) => {
                      const Icon = getToolIcon(tool);
                      return (
                        <motion.span
                          key={tool}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.25, delay: i * 0.03 }}
                          whileHover={{ y: -2 }}
                          className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                          style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: T.accent }} strokeWidth={1.75} />
                          {tool}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>
              )}

              {portfolio?.experience && portfolio.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Experience</h4>
                  <div className="flex flex-col gap-2.5">
                    {portfolio.experience.map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.06 }}
                        whileHover={{ x: 2 }}
                        className="rounded-xl p-4"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold" style={{ color: T.text }}>{e.role}</span>
                              {e.current && (
                                <span
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                  style={{ color: T.statusGreen, background: T.statusGreenBg, border: `1px solid ${T.statusGreenBorder}` }}
                                >
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{e.company}</p>
                          </div>
                          <span
                            className="text-xs shrink-0 px-2 py-1 rounded-lg mt-0.5"
                            style={{ background: T.surfaceNested, color: T.textFaint }}
                          >
                            {e.startDate} – {e.current ? "Present" : e.endDate}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionBlock>
        )}

        {/* ── GitHub (NEW full tab) ────────────────────────────────────── */}
        {hasGithub && (
          <SectionBlock id="github" sectionRefs={sectionRefs} title="GitHub" T={T}>
            <GithubTabSection handle={profile.platforms.githubUrl!} T={T} />
          </SectionBlock>
        )}

        {/* ── LeetCode (NEW full tab) ──────────────────────────────────── */}
        {hasLeetcode && (
          <SectionBlock id="leetcode" sectionRefs={sectionRefs} title="LeetCode" T={T}>
            <LeetcodeTabSection handle={profile.platforms.leetcodeUrl!} T={T} />
          </SectionBlock>
        )}

        {/* ── Contact ──────────────────────────────────────────────────── */}
        {hasContact && (
          <SectionBlock id="contact" sectionRefs={sectionRefs} title="Contact" T={T}>
            <div className="flex flex-col gap-2.5 mb-8">
              {contactItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-xl p-4 transition-colors duration-150 group"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150"
                      style={{ background: T.surfaceNested }}
                    >
                      <Icon className="w-5 h-5" style={{ color: T.accent }} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium" style={{ color: T.text }}>{item.label}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: T.textFaint }}>
                        {item.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </p>
                    </div>
                    <span className="text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: T.textFaint }}>
                      ↗
                    </span>
                  </motion.a>
                );
              })}
            </div>

            <div className="flex flex-col items-start gap-3 pt-6" style={{ borderTop: `1px solid ${T.border}` }}>
              <ShareButtonDark username={profile.username!} T={T} />
              <a href="/sign-up" className="text-sm font-medium hover:underline" style={{ color: T.accent }}>
                Join ScriptValley →
              </a>
            </div>
          </SectionBlock>
        )}
      </main>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function SectionBlock({
  id,
  sectionRefs,
  title,
  T,
  children,
}: {
  id: string;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  title: string;
  T: PortfolioTheme;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      ref={(el) => { sectionRefs.current[id] = el; }}
      className="py-16"
      style={{ borderTop: `1px solid ${T.border}` }}
    >
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-semibold mb-8"
        style={{ color: T.text }}
      >
        {title}
      </motion.h3>
      {children}
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MiniStat({ value, suffix, label, T }: { value: number; suffix?: string; label: string; T: PortfolioTheme }) {
  const animated = useCountUp(value);
  return (
    <div className="rounded-xl px-3 py-3 flex flex-col items-center justify-center"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <span className="font-bold text-base leading-none tabular-nums" style={{ color: T.text }}>
        {animated}{suffix && <span className="text-[10px] font-normal">{suffix}</span>}
      </span>
      <span className="text-[10px] mt-1.5 text-center" style={{ color: T.textFaint }}>{label}</span>
    </div>
  );
}

function BadgeChip({ icon: Icon, label, earned, pct, T }: { icon: LucideIcon; label: string; earned: boolean; pct: number; T: PortfolioTheme }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: hovered ? -2 : 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-2 rounded-xl p-3"
      style={{ background: earned ? T.accentSoft : T.surface, border: `1px solid ${earned ? T.accentBorder : T.border}` }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: earned ? T.accent : T.surfaceHover }}>
          <Icon className="w-3.5 h-3.5" style={{ color: earned ? "#ffffff" : T.textFaint }} strokeWidth={2.25} />
        </div>
        <span className="text-[11px] font-medium truncate" style={{ color: earned ? T.text : T.textFaint }}>{label}</span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: T.surfaceHover }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${earned ? 100 : pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="h-full"
          style={{ background: earned ? T.accent : T.textFaint }}
        />
      </div>
    </motion.div>
  );
}

function PillRow({ items, T }: { items: string[]; T: PortfolioTheme }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function IconLinkButton({ href, label, icon: Icon, T, delay = 0 }: ContactItem & { T: PortfolioTheme; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={label}
      className="w-11 h-11 rounded-xl flex items-center justify-center"
      style={{
        background: T.surface,
        border: `1px solid ${hovered ? T.accentBorder : T.border}`,
        color: hovered ? T.accent : T.textFaint,
      }}
    >
      <Icon className="w-5 h-5" strokeWidth={1.75} />
    </motion.a>
  );
}

function ShareButtonDark({ username, T }: { username: string; T: PortfolioTheme }) {
  const [copied, setCopied] = useState(false);
  const url = `https://scriptvalley.com/u/${username}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `${username} on ScriptValley`, url }); return; }
      catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* blocked */ }
  }

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full text-white"
      style={{ background: T.accent }}
    >
      <Share2 className="w-3.5 h-3.5" />
      {copied ? "Copied!" : "Share profile"}
    </motion.button>
  );
}