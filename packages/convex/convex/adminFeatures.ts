import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./_helper";

// ─── Platform Stats ────────────────────────────────────────────────────────────

export const getPlatformStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx.db, ctx.auth);

    const [users, instructors, courses, sheets, potdLogs, sheetProgress, lessonProgress] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("instructors").collect(),
        ctx.db.query("courses").collect(),
        ctx.db.query("dsaSheets").collect(),
        ctx.db.query("potdLogs").collect(),
        ctx.db.query("sheet_progress").collect(),
        ctx.db.query("lesson_progress").collect(),
      ]);

    const publishedCourses = courses.filter((c: any) => c.status === "published");
    const publishedSheets  = sheets.filter((s: any) => s.status === "published" || !s.status);
    const approvedInstructors = instructors.filter((i: any) => i.isApproved);
    const pendingInstructors  = instructors.filter((i: any) => !i.isApproved);

    // Top 5 sheets by unique user saves (use sheet_progress as proxy for saves)
    const sheetSaveCounts: Record<string, number> = {};
    for (const sp of sheetProgress as any[]) {
      sheetSaveCounts[sp.sheetSlug] = (sheetSaveCounts[sp.sheetSlug] ?? 0) + 1;
    }
    const topSheets = Object.entries(sheetSaveCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([slug, count]) => {
        const sheet = (sheets as any[]).find((s) => s.slug === slug);
        return { slug, name: sheet?.name ?? slug, count };
      });

    // Top 5 courses by lesson progress (distinct users who completed at least 1 lesson)
    const courseUserSets: Record<string, Set<string>> = {};
    for (const lp of lessonProgress as any[]) {
      if (!courseUserSets[lp.courseSlug]) courseUserSets[lp.courseSlug] = new Set();
      courseUserSets[lp.courseSlug].add(lp.userId);
    }
    const topCourses = Object.entries(courseUserSets)
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 5)
      .map(([slug, userSet]) => {
        const course = (courses as any[]).find((c) => c.slug === slug);
        return { slug, title: course?.title ?? slug, count: userSet.size };
      });

    // POTD solve rate today
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const todaySolves = (potdLogs as any[]).filter((l) => l.date === todayKey && l.solved).length;
    const potdSolveRate = users.length > 0 ? Math.round((todaySolves / users.length) * 100) : 0;

    return {
      totalUsers:           users.length,
      totalInstructors:     instructors.length,
      approvedInstructors:  approvedInstructors.length,
      pendingInstructors:   pendingInstructors.length,
      publishedCourses:     publishedCourses.length,
      totalCourses:         courses.length,
      publishedSheets:      publishedSheets.length,
      totalSheets:          sheets.length,
      todayPotdSolves:      todaySolves,
      potdSolveRate,
      topSheets,
      topCourses,
    };
  },
});

// ─── User Management ───────────────────────────────────────────────────────────

export const adminGetUserDetail = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx.db, ctx.auth);

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    const [sheetProgress, lessonProgress, potdLogs] = await Promise.all([
      ctx.db.query("sheet_progress").withIndex("by_user_sheet", (q: any) => q.eq("userId", userId)).collect(),
      ctx.db.query("lesson_progress").withIndex("by_user_course", (q: any) => q.eq("userId", userId)).collect(),
      ctx.db.query("potdLogs").withIndex("by_user", (q: any) => q.eq("userId", userId)).collect(),
    ]);

    // Streak
    const logs = [...potdLogs as any[]].sort((a: any, b: any) => b.date.localeCompare(a.date));
    let streak = 0;
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    for (const log of logs) {
      const d = new Date(log.date); d.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
      if (diff > 1) break;
      if (diff === 0 || diff === 1) { streak++; cursor = d; }
    }

    const savedSheets = await ctx.db
      .query("user_sheet_save")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const savedCourses = await ctx.db
      .query("saved_courses")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    return {
      ...user,
      sheetsStarted:  (sheetProgress as any[]).length,
      coursesStarted: [...new Set((lessonProgress as any[]).map((l: any) => l.courseSlug))].length,
      potdStreak:     streak,
      totalPotdSolved: (potdLogs as any[]).filter((l: any) => l.solved).length,
      sheetsSaved:    savedSheets.length,
      coursesSaved:   savedCourses.length,
      lastActive:     logs[0]?.date ?? null,
    };
  },
});

export const banUser = mutation({
  args: { userId: v.string(), banned: v.boolean() },
  handler: async (ctx, { userId, banned }) => {
    await requireAdmin(ctx.db, ctx.auth);
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { banned } as any);
    return { ok: true };
  },
});

export const flagUser = mutation({
  args: { userId: v.string(), flagged: v.boolean() },
  handler: async (ctx, { userId, flagged }) => {
    await requireAdmin(ctx.db, ctx.auth);
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { flagged } as any);
    return { ok: true };
  },
});

// ─── Announcements ─────────────────────────────────────────────────────────────

export const createAnnouncement = mutation({
  args: {
    message:   v.string(),
    type:      v.union(v.literal("info"), v.literal("warning"), v.literal("success")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const callerId = await requireAdmin(ctx.db, ctx.auth);
    await ctx.db.insert("announcements" as any, {
      message:   args.message.trim(),
      type:      args.type,
      expiresAt: args.expiresAt ?? null,
      active:    true,
      createdBy: callerId,
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

export const deactivateAnnouncement = mutation({
  args: { id: v.id("announcements" as any) },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx.db, ctx.auth);
    await ctx.db.patch(id, { active: false } as any);
    return { ok: true };
  },
});

export const deleteAnnouncement = mutation({
  args: { id: v.id("announcements" as any) },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx.db, ctx.auth);
    await ctx.db.delete(id);
    return { ok: true };
  },
});

export const getActiveAnnouncements = query({
  handler: async (ctx) => {
    try {
      const rows = await (ctx.db as any)
        .query("announcements")
        .withIndex("by_active", (q: any) => q.eq("active", true))
        .collect();
      const now = Date.now();
      return (rows as any[]).filter((a) => !a.expiresAt || a.expiresAt > now);
    } catch {
      return [];
    }
  },
});

export const getAllAnnouncements = query({
  handler: async (ctx) => {
    await requireAdmin(ctx.db, ctx.auth);
    try {
      return await (ctx.db as any).query("announcements").order("desc").collect();
    } catch {
      return [];
    }
  },
});