import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { SKILL_SUGGESTIONS, TOOL_SUGGESTIONS } from "./constants";
import { PORTFOLIO_LIMITS } from "./schema";

export { SKILL_SUGGESTIONS, TOOL_SUGGESTIONS };

// ─── Validators ─────────────────────────────────────────────────────────────

const projectV = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  techStack: v.array(v.string()),
  liveUrl: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  order: v.number(),
});

const experienceV = v.object({
  id: v.string(),
  company: v.string(),
  role: v.string(),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  current: v.boolean(),
  order: v.number(),
});

// Single source of truth for these limits lives in schema.ts (PORTFOLIO_LIMITS)
// so the validation here can't silently drift out of sync with it.
const { MAX_INTERESTS, MAX_TOOLS } = PORTFOLIO_LIMITS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidMonthDate(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getPortfolio = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return null;

    return await ctx.db
      .query("portfolio")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
  },
});
export const getPublicPortfolio = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;
    const row = await ctx.db
      .query("portfolio")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!row) return null;

    return {
      bio: row.bio ?? null,
      skills: row.skills ?? [],
      projects: [...(row.projects ?? [])].sort((a, b) => a.order - b.order),
      experience: [...(row.experience ?? [])].sort((a, b) => a.order - b.order),
      interests: row.interests ?? [],
      tools: row.tools ?? [],
      showStats: row.showStats ?? true,
    };
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const upsertPortfolio = mutation({
  args: {
    userId: v.string(),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    projects: v.optional(v.array(projectV)),
    experience: v.optional(v.array(experienceV)),
    interests: v.optional(v.array(v.string())),
    tools: v.optional(v.array(v.string())),
    showStats: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { userId, bio, skills, projects, experience, interests, tools, showStats },
  ) => {
    if (!userId) throw new Error("Missing userId");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const cleanBio = bio?.trim() ?? "";
    if (cleanBio.length > 300) throw new Error("Bio must be 300 characters or fewer.");

    const cleanSkills = (skills ?? []).map((s) => s.trim()).filter(Boolean);
    if (cleanSkills.length > 30) throw new Error("You can add up to 30 skills.");
    for (const s of cleanSkills) {
      if (s.length > 40) throw new Error(`Skill "${s}" is too long (max 40 chars).`);
    }

    const cleanInterests = (interests ?? []).map((s) => s.trim()).filter(Boolean);
    if (cleanInterests.length > MAX_INTERESTS)
      throw new Error(`You can add up to ${MAX_INTERESTS} interests.`);
    for (const s of cleanInterests) {
      if (s.length > 30) throw new Error(`Interest "${s}" is too long (max 30 chars).`);
    }

    const cleanTools = (tools ?? []).map((s) => s.trim()).filter(Boolean);
    if (cleanTools.length > MAX_TOOLS)
      throw new Error(`You can add up to ${MAX_TOOLS} tools.`);
    for (const s of cleanTools) {
      if (s.length > 30) throw new Error(`Tool "${s}" is too long (max 30 chars).`);
    }

    const cleanProjects = projects ?? [];
    if (cleanProjects.length > 10) throw new Error("You can add up to 10 projects.");
    for (const p of cleanProjects) {
      if (!p.title.trim()) throw new Error("Each project must have a title.");
      if (p.liveUrl && !isValidUrl(p.liveUrl))
        throw new Error(`Invalid live URL for project "${p.title}".`);
      if (p.githubUrl && !isValidUrl(p.githubUrl))
        throw new Error(`Invalid GitHub URL for project "${p.title}".`);
      if (p.techStack.length > 15)
        throw new Error(`Project "${p.title}" can have at most 15 tech stack tags.`);
    }

    const cleanExperience = experience ?? [];
    if (cleanExperience.length > 10) throw new Error("You can add up to 10 experience entries.");
    for (const e of cleanExperience) {
      if (!e.company.trim()) throw new Error("Each experience entry must have a company name.");
      if (!e.role.trim()) throw new Error("Each experience entry must have a role.");
      if (!isValidMonthDate(e.startDate))
        throw new Error(`Invalid start date "${e.startDate}" for "${e.company}" — use YYYY-MM.`);
      if (e.endDate && !isValidMonthDate(e.endDate))
        throw new Error(`Invalid end date "${e.endDate}" for "${e.company}" — use YYYY-MM.`);
    }

    const now = Date.now();
    const payload = {
      userId,
      bio: cleanBio || undefined,
      skills: cleanSkills.length > 0 ? cleanSkills : undefined,
      projects: cleanProjects.length > 0 ? cleanProjects : undefined,
      experience: cleanExperience.length > 0 ? cleanExperience : undefined,
      interests: cleanInterests.length > 0 ? cleanInterests : undefined,
      tools: cleanTools.length > 0 ? cleanTools : undefined,
      showStats: showStats ?? true,
      updatedAt: now,
    };

    const existing = await ctx.db
      .query("portfolio")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { ok: true, action: "updated" };
    }

    await ctx.db.insert("portfolio", payload);
    return { ok: true, action: "created" };
  },
});