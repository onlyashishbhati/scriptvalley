import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function sanitizeString(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.trim();
}

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export const getUserSocialLinks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = sanitizeString(args.userId);
    if (!userId) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return null;

    return await ctx.db
      .query("socials")
      .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
      .unique();
  },
});

export const updateSocialLinks = mutation({
  args: {
    userId:    v.string(),
    linkedin:  v.optional(v.string()),
    twitter:   v.optional(v.string()),
    portfolio: v.optional(v.string()),
    resume:    v.optional(v.string()),
    idToken:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId    = sanitizeString(args.userId);
    if (!userId) throw new Error("Missing userId");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const linkedin  = sanitizeString(args.linkedin  ?? "");
    const twitter   = sanitizeString(args.twitter   ?? "");
    const portfolio = sanitizeString(args.portfolio ?? "");
    const resume    = sanitizeString(args.resume    ?? "");

    const invalidFields: string[] = [];
    for (const [k, val] of [["linkedin", linkedin], ["twitter", twitter], ["portfolio", portfolio], ["resume", resume]] as const) {
      if (val && (!isValidUrl(val) || val.length > 2048)) invalidFields.push(k);
    }
    if (invalidFields.length)
      throw new Error(`Invalid URL(s) for: ${invalidFields.join(", ")}`);

    const now = new Date().toISOString();
    const payload = { userId, linkedin, twitter, portfolio, resume, updatedAt: now };

    const existing = await ctx.db
      .query("socials")
      .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("socials", { ...payload, createdAt: now });
  },
});