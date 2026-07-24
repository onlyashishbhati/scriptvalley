// Dashboard "pin" shortcuts — one sheet + one course a user is actively
// working on, surfaced on dev-profile. Distinct from the "save" concept
// (sheets.ts/courses.ts), which is an unlimited bookmark list browsable on
// each feature's own page. Pinning a new item simply overwrites the old
// pin — no explicit unpin-first step required.
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mirrors blends.ts's identical helpers — duplicated locally rather than
// factored into a shared file, since _helper.ts isn't something this
// pass has visibility into to safely edit.
function parseSheetContent(content: any) {
  if (!content) return { topics: [] };
  if (typeof content === "string") {
    try { return JSON.parse(content); } catch { return { topics: [] }; }
  }
  return content;
}

function countSheetQuestions(sheetDoc: any): number {
  const content = parseSheetContent(sheetDoc?.content);
  let count = 0;
  for (const topic of content.topics ?? []) {
    if (topic.useSubTopics && topic.subTopics?.length) {
      for (const st of topic.subTopics) count += (st.questions ?? []).length;
    } else {
      count += (topic.questions ?? []).length;
    }
  }
  return count;
}

function countCourseLessons(courseDoc: any): number {
  return (courseDoc?.modules ?? []).reduce(
    (sum: number, mod: any) => sum + (mod.lessons?.length ?? 0),
    0,
  );
}

async function getUserRow(db: any, userId: string) {
  return db.query("users").withIndex("by_user_id", (q: any) => q.eq("userId", userId)).unique();
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export const pinSheet = mutation({
  args: { sheetSlug: v.string() },
  handler: async (ctx, { sheetSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to pin a sheet");

    const sheet = await ctx.db.query("dsaSheets").withIndex("by_slug", (q) => q.eq("slug", sheetSlug)).unique();
    if (!sheet) throw new Error("Sheet not found");

    const user = await getUserRow(ctx.db, identity.subject);
    if (!user) throw new Error("User profile not found");

    await ctx.db.patch(user._id, { pinnedSheetSlug: sheetSlug });
    return { ok: true };
  },
});

export const unpinSheet = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await getUserRow(ctx.db, identity.subject);
    if (user) await ctx.db.patch(user._id, { pinnedSheetSlug: undefined });
    return { ok: true };
  },
});

export const pinCourse = mutation({
  args: { courseSlug: v.string() },
  handler: async (ctx, { courseSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to pin a course");

    const course = await ctx.db.query("courses").withIndex("by_slug", (q) => q.eq("slug", courseSlug)).unique();
    if (!course) throw new Error("Course not found");

    const user = await getUserRow(ctx.db, identity.subject);
    if (!user) throw new Error("User profile not found");

    await ctx.db.patch(user._id, { pinnedCourseSlug: courseSlug });
    return { ok: true };
  },
});

export const unpinCourse = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await getUserRow(ctx.db, identity.subject);
    if (user) await ctx.db.patch(user._id, { pinnedCourseSlug: undefined });
    return { ok: true };
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getMyPinnedSheet = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getUserRow(ctx.db, identity.subject);
    if (!user?.pinnedSheetSlug) return null;

    const sheet = await ctx.db
      .query("dsaSheets")
      .withIndex("by_slug", (q) => q.eq("slug", user.pinnedSheetSlug!))
      .unique();
    if (!sheet) return null;

    const progress = await ctx.db
      .query("sheet_progress")
      .withIndex("by_user_sheet", (q) => q.eq("userId", identity.subject).eq("sheetSlug", user.pinnedSheetSlug!))
      .unique()
      .catch(() => null);

    const total = countSheetQuestions(sheet);
    const solved = progress?.totalSolved ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

    return {
      sheetSlug: sheet.slug,
      name: sheet.name,
      category: sheet.category ?? null,
      totalQuestions: total,
      solvedCount: solved,
      pct,
    };
  },
});

export const getMyPinnedCourse = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getUserRow(ctx.db, identity.subject);
    if (!user?.pinnedCourseSlug) return null;

    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", user.pinnedCourseSlug!))
      .unique();
    if (!course) return null;

    const progressRows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) => q.eq("userId", identity.subject).eq("courseSlug", user.pinnedCourseSlug!))
      .collect();

    const total = countCourseLessons(course);
    const completed = progressRows.length;
    const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    return {
      courseSlug: course.slug,
      title: course.title,
      totalLessons: total,
      completedLessons: completed,
      pct,
    };
  },
});