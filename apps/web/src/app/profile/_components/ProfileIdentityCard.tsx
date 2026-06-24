"use client";

import Link from "next/link";
import {
  Pencil, CalendarDays, MapPin, GraduationCap,
  Phone, Globe, Code2, Github, Linkedin, Twitter,
} from "lucide-react";

const ROLE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:      { label: "Admin",      color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
  instructor: { label: "Instructor", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  user:       { label: "Student",    color: "#3A5EFF", bg: "rgba(58,94,255,0.08)",  border: "rgba(58,94,255,0.2)"  },
  student:    { label: "Student",    color: "#3A5EFF", bg: "rgba(58,94,255,0.08)",  border: "rgba(58,94,255,0.2)"  },
};

function PropRow({
  icon: Icon, label, value, href,
}: {
  icon:   React.FC<{ className?: string }>;
  label:  string;
  value:  string;
  href?:  string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)] w-28 shrink-0">
        <Icon className="w-3 h-3 shrink-0" />
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#3A5EFF] hover:underline truncate"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm text-[var(--text-secondary)] truncate">{value}</span>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  user: {
    fullName:  string | null;
    imageUrl:  string | null;
    firstName: string | null;
    email:     string | null;
  };
  profile: {
    role?:        string;
    createdAt?:   string;
    state?:       string;
    country?:     string;
    collegeName?: string;
    phoneNumber?: string;
  } | null;
  socials: {
    linkedin?:  string;
    twitter?:   string;
    portfolio?: string;
  } | null;
  platforms: {
    leetcodeUrl?: string;
    githubUrl?:   string;
  } | null;
}

export default function ProfileIdentityCard({ user, profile, socials, platforms }: Props) {
  const roleMeta   = ROLE_META[profile?.role ?? "user"] ?? ROLE_META.user;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;
  const location   = [profile?.state, profile?.country].filter(Boolean).join(", ");
  const hasAnyDetail = !!(
    location || profile?.collegeName || profile?.phoneNumber ||
    platforms?.leetcodeUrl || platforms?.githubUrl ||
    socials?.linkedin || socials?.twitter || socials?.portfolio
  );

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-input)] flex items-center gap-4">
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "Avatar"}
            className="w-14 h-14 rounded-full border border-[var(--border-subtle)] object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[rgba(58,94,255,0.08)] border border-[rgba(58,94,255,0.25)] flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[#3A5EFF]">
              {user.firstName?.[0] ?? "?"}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-[var(--text-primary)] truncate">
            {user.fullName ?? user.firstName ?? "—"}
          </p>
          <p className="text-xs text-[var(--text-faint)] mt-0.5 truncate">
            {user.email}
          </p>
          <span
            className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1.5 uppercase tracking-wide"
            style={{ color: roleMeta.color, background: roleMeta.bg, borderColor: roleMeta.border }}
          >
            {roleMeta.label}
          </span>
        </div>

        <Link
          href="/dev-profile/edit-profile"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors shrink-0"
        >
          <Pencil className="w-3 h-3" />
          Edit profile
        </Link>
      </div>

      {/* Property rows */}
      <div className="px-5 py-1">
        {memberSince         && <PropRow icon={CalendarDays}  label="Member since" value={memberSince} />}
        {location            && <PropRow icon={MapPin}        label="Location"     value={location} />}
        {profile?.collegeName && <PropRow icon={GraduationCap} label="College"     value={profile.collegeName} />}
        {profile?.phoneNumber && <PropRow icon={Phone}        label="Phone"        value={profile.phoneNumber} />}
        {platforms?.leetcodeUrl && <PropRow icon={Code2}      label="LeetCode"     value={platforms.leetcodeUrl} href={platforms.leetcodeUrl} />}
        {platforms?.githubUrl   && <PropRow icon={Github}     label="GitHub"       value={platforms.githubUrl}   href={platforms.githubUrl} />}
        {socials?.linkedin      && <PropRow icon={Linkedin}   label="LinkedIn"     value={socials.linkedin}      href={socials.linkedin} />}
        {socials?.twitter       && <PropRow icon={Twitter}    label="Twitter"      value={socials.twitter}       href={socials.twitter} />}
        {socials?.portfolio     && <PropRow icon={Globe}      label="Portfolio"    value={socials.portfolio}     href={socials.portfolio} />}

        {!hasAnyDetail && (
          <p className="text-sm text-[var(--text-disabled)] italic py-4 text-center">
            No details added yet. {" "}
            <Link href="/dev-profile/edit-profile" className="text-[#3A5EFF] hover:underline not-italic">
              Add your location, college, and coding profiles.
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}