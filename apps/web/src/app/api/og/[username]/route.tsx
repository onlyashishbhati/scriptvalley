import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";

export const runtime = "edge";

const W = 1200;
const H = 630;

const BG = "#0a0a0a";
const SURFACE = "#141414";
const BORDER = "#232323";
const TEXT = "#f2f2f0";
const TEXT_MUTED = "#9a9a96";
const TEXT_FAINT = "#5c5c58";
const ACCENT = "#3A5EFF";
const ACCENT_SOFT = "rgba(58,94,255,0.10)";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const profile = await fetchQuery(api.users.getPublicProfile, { username }).catch(() => null);

  if (!profile) {

    return new ImageResponse(
      <div
        style={{
          width: W, height: H, background: BG,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <p style={{ color: TEXT_FAINT, fontSize: 24, fontFamily: "sans-serif" }}>
          Profile not found
        </p>
      </div>,
      {
        width: W,
        height: H,
        // Short cache — a profile that doesn't exist yet today might exist
        // (and go public) soon, so don't lock this 404 image in for long.
        headers: { "Cache-Control": "public, max-age=300" },
      },
    );
  }

  const portfolio = await fetchQuery(api.portfolio.getPublicPortfolio, {
    userId: profile.userId,
  }).catch(() => null);

  // Clerk avatar fetch — same pattern as the page, non-critical
  let avatarUrl: string | null = null;
  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${profile.userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (clerkRes.ok) {
      const clerkUser = await clerkRes.json();
      avatarUrl = clerkUser.image_url ?? null;
    }
  } catch {
    avatarUrl = null;
  }

  const initials = profile.name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Role: first sentence of bio, or college name, or "Developer"
  const role = portfolio?.bio
    ? portfolio.bio.split(/[.!?]/)[0].trim()
    : profile.collegeName || "Developer";

  // Up to 4 skills for the pill row
  const skills = (portfolio?.skills ?? []).slice(0, 4);

  return new ImageResponse(
    <div
      style={{
        width: W,
        height: H,
        background: BG,
        display: "flex",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: ACCENT,
        }}
      />

      {/* Left content column */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 72px",
          borderRight: `1px solid ${BORDER}`,
        }}
      >
        {/* Avatar + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
          <div
            style={{
              width: 80, height: 80,
              borderRadius: 16,
              overflow: "hidden",
              background: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `2px solid ${BORDER}`,
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                width={80}
                height={80}
                style={{ objectFit: "cover" }}
                alt={profile.name}
              />
            ) : (
              <span style={{ color: "#fff", fontSize: 28, fontWeight: 600 }}>
                {initials}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Name — first name in gray, rest in white */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: "#6b6b6b" }}>
                {profile.name.split(" ")[0]}
              </span>
              <span style={{ fontSize: 28, fontWeight: 600, color: TEXT }}>
                {profile.name.split(" ").slice(1).join(" ")}
              </span>
            </div>
            <span style={{ fontSize: 16, color: TEXT_MUTED }}>@{profile.username}</span>
          </div>
        </div>

        {/* Role/bio headline */}
        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: TEXT,
            margin: 0,
            marginBottom: 20,
            lineHeight: 1.3,
            maxWidth: 520,
          }}
        >
          {role}
        </p>

        {/* Skill pills */}
        {skills.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {skills.map((skill: string) => (
              <span
                key={skill}
                style={{
                  fontSize: 13,
                  color: TEXT_MUTED,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 100,
                  padding: "5px 14px",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* URL badge at the bottom */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
          <span
            style={{
              fontSize: 13,
              color: ACCENT,
              background: ACCENT_SOFT,
              border: `1px solid rgba(58,94,255,0.3)`,
              borderRadius: 8,
              padding: "4px 12px",
            }}
          >
            scriptvalley.com/u/{profile.username}
          </span>
        </div>
      </div>

      {/* Right stats column */}
      <div
        style={{
          width: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 40px",
          gap: 16,
        }}
      >
        {/* ScriptValley wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>ScriptValley</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              background: ACCENT,
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            ID
          </span>
        </div>

        {/* Stat tiles */}
        {[
          { label: "Streak", value: `${profile.stats.currentStreak}d` },
          { label: "Solved", value: String(profile.stats.totalPotdSolved) },
          { label: "Sheets", value: String(profile.stats.sheetsFollowed) },
          { label: "Courses", value: String(profile.stats.coursesInProgress) },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, color: TEXT_FAINT }}>{stat.label}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>,
    {
      width: W,
      height: H,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}