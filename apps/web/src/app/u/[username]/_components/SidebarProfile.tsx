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

// ─── Forced dark palette ────────────────────────────────────────────────────
const T = {
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
  accent: "#3A5EFF",
  accentSoft: "rgba(58, 94, 255, 0.10)",
  accentBorder: "rgba(58, 94, 255, 0.35)",
  statusGreen: "#34d399",
  statusGreenBg: "rgba(52, 211, 153, 0.10)",
  statusGreenBorder: "rgba(52, 211, 153, 0.3)",
};

// ─── Badge icon map ─────────────────────────────────────────────────────────
const BADGE_ICON_MAP: Record<BadgeIconName, LucideIcon> = {
  flame: Flame, trophy: Trophy, target: Target, swords: Swords,
  "clipboard-check": ClipboardCheck, "graduation-cap": GraduationCap,
  sprout: Sprout, users: Users, zap: Zap,
};

// ─── Tool icon map ──────────────────────────────────────────────────────────
// Maps tool names (lowercase) to Lucide icons. Unknown tools fall back to Wrench.
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
  platforms: { githubUrl?: string | null; leetcodeUrl?: string | null },
  socials: { linkedin?: string | null; twitter?: string | null; portfolio?: string | null },
): ContactItem[] {
  const items: ContactItem[] = [];
  if (platforms.githubUrl) items.push({ href: platforms.githubUrl, label: "GitHub", icon: Github });
  if (platforms.leetcodeUrl) items.push({ href: platforms.leetcodeUrl, label: "LeetCode", icon: Code2 });
  if (socials.linkedin) items.push({ href: socials.linkedin, label: "LinkedIn", icon: Linkedin });
  if (socials.twitter) items.push({ href: socials.twitter, label: "Twitter / X", icon: Twitter });
  if (socials.portfolio) items.push({ href: socials.portfolio, label: "Portfolio", icon: Globe });
  return items;
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

type Portfolio = {
  bio?: string | null;
  skills?: string[];
  interests?: string[];
  tools?: string[];
  projects?: { id: string; title: string; description?: string; techStack: string[]; liveUrl?: string; githubUrl?: string }[];
  experience?: { id: string; company: string; role: string; startDate: string; endDate?: string; current: boolean }[];
  showStats?: boolean;
} | null;

interface Props {
  profile: Profile;
  portfolio: Portfolio;
  avatarUrl: string | null;
}

const SECTIONS = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "about", label: "About", icon: User },
  { id: "contact", label: "Contact", icon: Mail },
] as const;

// ─── Root component ─────────────────────────────────────────────────────────
export default function SidebarProfile({ profile, portfolio, avatarUrl }: Props) {
  const [active, setActive] = useState<string>("home");
  // MutableRefObject (not RefObject) — current is writable so the section
  // ref callback can assign to sectionRefs.current[id] without TS error.
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the visible area.
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
    SECTIONS.forEach(({ id }) => {
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
  const hasAbout =
    (portfolio?.skills?.length ?? 0) > 0 ||
    (portfolio?.interests?.length ?? 0) > 0 ||
    (portfolio?.tools?.length ?? 0) > 0 ||
    (portfolio?.experience?.length ?? 0) > 0 ||
    showStats;

  const contactItems = buildContactItems(profile.platforms, profile.socials);
  const hasContact = contactItems.length > 0;

  const visibleSections = SECTIONS.filter((s) => {
    if (s.id === "work") return hasWork;
    if (s.id === "about") return hasAbout;
    if (s.id === "contact") return hasContact;
    return true;
  });

  // Sidebar subtitle: first sentence of bio, or college name, or blank
  const sidebarSubtitle = portfolio?.bio
    ? portfolio.bio.split(/[.!?]/)[0].trim()
    : profile.collegeName || "";

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }} className="flex">

      {/* ── Fixed left sidebar ──────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 px-6 py-8"
        style={{ borderRight: `1px solid ${T.sidebarBorder}` }}
      >
        {/* Sidebar: name only, no subtitle — bio was overflowing here */}
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
          {/* Avatar row + status pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start justify-between gap-4 mb-8"
          >
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ background: T.accent }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-semibold">{initials}</span>
              )}
            </div>

            <span
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0"
              style={{ color: T.statusGreen, background: T.statusGreenBg, border: `1px solid ${T.statusGreenBorder}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.statusGreen }} />
              Profile live
            </span>
          </motion.div>

          {/* Name — Role headline: "Ashish — Full Stack Developer" */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-4xl font-semibold leading-tight"
          >
            {sidebarSubtitle ? (
              <>
                {/* First name in muted gray — less visual weight than the role */}
                <span style={{ color: "#6b6b6b" }}>{profile.name.split(" ")[0]}</span>
                <span style={{ color: T.textMuted }}> — </span>
                {/* Role/bio-first-sentence in near-white */}
                <span style={{ color: T.text }}>{sidebarSubtitle}</span>
              </>
            ) : (
              <>
                <span style={{ color: "#6b6b6b" }}>Hey, I&apos;m </span>
                <span style={{ color: T.text }}>{profile.name.split(" ")[0]}</span>
              </>
            )}
          </motion.h2>

          {/* Full bio — shown in full here, not truncated */}
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

          {/* Contact icon row — Lucide icons per platform */}
          {hasContact && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-2 mt-8 flex-wrap"
            >
              {contactItems.map((item) => (
                <IconLinkButton key={item.label} {...item} />
              ))}
            </motion.div>
          )}
        </section>

        {/* ── Work ─────────────────────────────────────────────────────── */}
        {hasWork && (
          <SectionBlock id="work" sectionRefs={sectionRefs} title="Featured Work">
            <div className="flex flex-col gap-3">
              {portfolio!.projects!.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
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
          <SectionBlock id="about" sectionRefs={sectionRefs} title="About">
            <div className="flex flex-col gap-10">

              {/* Stats + Badges */}
              {showStats && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                    <MiniStat value={profile.stats.currentStreak} suffix="d" label="Streak" />
                    <MiniStat value={profile.stats.longestStreak} suffix="d" label="Longest" />
                    <MiniStat value={profile.stats.totalPotdSolved} label="Solved" />
                    <MiniStat value={profile.stats.sheetsFollowed} label="Sheets" />
                    <MiniStat value={profile.stats.coursesInProgress} label="Courses" />
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
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Skills */}
              {portfolio?.skills && portfolio.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Skills</h4>
                  <PillRow items={portfolio.skills} />
                </div>
              )}

              {/* Interests */}
              {portfolio?.interests && portfolio.interests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: T.text }}>Interests</h4>
                  <PillRow items={portfolio.interests} />
                </div>
              )}

              {/* Tools — with icons */}
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

              {/* Experience — highlighted cards */}
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

        {/* ── Contact ──────────────────────────────────────────────────── */}
        {hasContact && (
          <SectionBlock id="contact" sectionRefs={sectionRefs} title="Contact">
            {/* Large contact cards — each link gets its own card with icon */}
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
              <ShareButtonDark username={profile.username!} />
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
  children,
}: {
  id: string;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  title: string;
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

function MiniStat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="rounded-xl px-3 py-3 flex flex-col items-center justify-center"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <span className="font-bold text-base leading-none" style={{ color: T.text }}>
        {value}{suffix && <span className="text-[10px] font-normal">{suffix}</span>}
      </span>
      <span className="text-[10px] mt-1.5 text-center" style={{ color: T.textFaint }}>{label}</span>
    </div>
  );
}

function BadgeChip({ icon: Icon, label, earned, pct }: { icon: LucideIcon; label: string; earned: boolean; pct: number }) {
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

function PillRow({ items }: { items: string[] }) {
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

// Icon-button used in the Home section contact row (small squares with real Lucide icons)
function IconLinkButton({ href, label, icon: Icon }: ContactItem) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      animate={{ y: hovered ? -3 : 0 }}
      transition={{ duration: 0.15 }}
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

function ShareButtonDark({ username }: { username: string }) {
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