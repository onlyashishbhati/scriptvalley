import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function sanitizeString(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.trim();
}

function isValidHttpUrl(value: string) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export const getUserPlatformData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = sanitizeString(args.userId);
    if (!userId) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return null;

    return await ctx.db
      .query("platforms")
      .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
      .unique();
  },
});

// Accepts either a full URL or just a username — normalizes both to a full URL.
export const updateDevStats = mutation({
  args: {
    userId:   v.string(),
    platform: v.string(),
    stats:    v.any(),
    idToken:  v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = sanitizeString(args.userId);
    if (!userId) throw new Error("Missing userId");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const platform = sanitizeString(args.platform).toLowerCase();
    const stats    = args.stats ?? {};

    let githubUrl:   string | undefined;
    let leetcodeUrl: string | undefined;

    if (platform === "github" || platform === "all") {
      const raw = (stats as any).githubUrl ?? (stats as any).githubUsername;
      if (raw !== undefined) {
        const g = sanitizeString(raw);
        githubUrl = g && !g.includes("http") ? `https://github.com/${g}` : g;
      }
    }

    if (platform === "leetcode" || platform === "all") {
      const raw = (stats as any).leetcodeUrl ?? (stats as any).leetcodeUsername;
      if (raw !== undefined) {
        const l = sanitizeString(raw);
        leetcodeUrl = l && !l.includes("http") ? `https://leetcode.com/u/${l}` : l;
      }
    }

    const invalid: string[] = [];
    if (githubUrl   && (!isValidHttpUrl(githubUrl)   || githubUrl.length   > 2048)) invalid.push("githubUrl");
    if (leetcodeUrl && (!isValidHttpUrl(leetcodeUrl) || leetcodeUrl.length > 2048)) invalid.push("leetcodeUrl");
    if (invalid.length) throw new Error(`Invalid field(s): ${invalid.join(", ")}`);

    const now = new Date().toISOString();
    const payload: {
      userId:       string;
      updatedAt:    string;
      githubUrl?:   string;
      leetcodeUrl?: string;
    } = { userId, updatedAt: now };
    if (githubUrl   !== undefined) payload.githubUrl   = githubUrl;
    if (leetcodeUrl !== undefined) payload.leetcodeUrl = leetcodeUrl;

    const existing = await ctx.db
      .query("platforms")
      .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("platforms", { ...payload, createdAt: now });
  },
});