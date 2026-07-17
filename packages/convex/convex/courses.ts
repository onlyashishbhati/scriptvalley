// Everything related to courses — CRUD, review workflow, lesson progress, and saved courses.
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireInstructor, makeSlug } from "./_helper";

// Validators mirroring schema.ts — defined here so mutations can accept nested objects.
const mcqOptionV = v.object({ text: v.string(), isCorrect: v.boolean() });

const mcqQuestionV = v.object({
  question:    v.string(),
  options:     v.array(mcqOptionV),
  explanation: v.optional(v.string()),
});

const codingChallengeV = v.object({
  title:       v.string(),
  description: v.string(),
  difficulty:  v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
  platform:    v.optional(v.string()),
  link:        v.optional(v.string()),
  hint:        v.optional(v.string()),
});

const lessonV = v.object({
  order:         v.number(),
  lessonNumber:  v.optional(v.string()),
  title:         v.string(),
  topicsCovered: v.optional(v.string()),
  content:       v.optional(v.string()),
});

const moduleV = v.object({
  order:            v.number(),
  title:            v.string(),
  slug:             v.string(),
  description:      v.optional(v.string()),
  content:          v.optional(v.string()),
  lessons:          v.optional(v.array(lessonV)),
  mcqQuestions:     v.optional(v.array(mcqQuestionV)),
  codingChallenges: v.optional(v.array(codingChallengeV)),
  miniProject:      v.optional(codingChallengeV),
});

const levelV = v.optional(v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
  v.literal("all-levels"),
));

export const getAllCourses = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
  },
});

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!course || course.status !== "published") return null;
    return course;
  },
});

// ─── Returns ALL courses visible to instructors (not just the caller's own).
// The UI shows a "created by" label so instructors know who owns each course.
export const getMyCourses = query({
  handler: async (ctx) => {
    await requireInstructor(ctx.db, ctx.auth);
    return await ctx.db.query("courses").collect();
  },
});

export const getPendingCourses = query({
  handler: async (ctx) => {
    await requireAdmin(ctx.db, ctx.auth);
    return await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .collect();
  },
});

export const adminGetAllCourses = query({
  handler: async (ctx) => {
    await requireAdmin(ctx.db, ctx.auth);
    return await ctx.db.query("courses").collect();
  },
});

export const createCourse = mutation({
  args: {
    title:       v.string(),
    slug:        v.optional(v.string()),
    description: v.optional(v.string()),
    template:    v.optional(v.union(v.literal("freeform"), v.literal("structured"))),
    level:       levelV,
    modules:     v.array(moduleV),
  },
  handler: async (ctx, args) => {
    const userId = await requireInstructor(ctx.db, ctx.auth);

    const computedSlug = makeSlug(args.slug ?? args.title);
    const exists = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", computedSlug))
      .unique();
    if (exists) throw new Error("A course with this slug already exists");

    await ctx.db.insert("courses", {
      title:         args.title.trim(),
      slug:          computedSlug,
      description:   args.description?.trim(),
      template:      args.template ?? "freeform",
      level:         args.level,
      schemaVersion: 1,
      modules:       [...args.modules].sort((a, b) => a.order - b.order),
      createdBy:     userId,
      status:        "draft",
      createdAt:     Date.now(),
    });

    return { ok: true };
  },
});

// ─── Any instructor can edit any course.
// Published courses remain live while being edited (status not reset).
// Only pending_review courses get pulled back to draft on edit.
export const updateCourse = mutation({
  args: {
    id:          v.id("courses"),
    title:       v.optional(v.string()),
    description: v.optional(v.string()),
    template:    v.optional(v.union(v.literal("freeform"), v.literal("structured"))),
    level:       levelV,
    modules:     v.optional(v.array(moduleV)),
  },
  handler: async (ctx, args) => {
    await requireInstructor(ctx.db, ctx.auth);

    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");

    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.title       !== undefined) patch.title       = args.title.trim();
    if (args.description !== undefined) patch.description = args.description?.trim();
    if (args.template    !== undefined) patch.template    = args.template;
    if (args.level       !== undefined) patch.level       = args.level;
    if (args.modules     !== undefined) patch.modules     = [...args.modules].sort((a, b) => a.order - b.order);

    // Only pull back from pending_review — published courses stay live while being edited.
    if (course.status === "pending_review") patch.status = "draft";

    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});

export const submitCourseForReview = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireInstructor(ctx.db, ctx.auth);
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");
    if (!["draft", "rejected", "published"].includes(course.status))
      throw new Error("Only draft, rejected, or published courses can be submitted");
    if (course.modules.length === 0)
      throw new Error("Add at least one module before submitting");

    if (course.template === "structured") {
      for (const mod of course.modules) {
        if (!mod.lessons || mod.lessons.length === 0)
          throw new Error(`Module "${mod.title}" has no lessons`);
      }
    }

    await ctx.db.patch(id, {
      status:          "pending_review",
      rejectionReason: undefined,
      updatedAt:       Date.now(),
    });
    return { ok: true };
  },
});

export const withdrawCourseFromReview = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireInstructor(ctx.db, ctx.auth);
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");
    if (course.status !== "pending_review") throw new Error("Course is not under review");
    await ctx.db.patch(id, { status: "draft", updatedAt: Date.now() });
    return { ok: true };
  },
});

// ─── Delete is blocked for published courses — only drafts/rejected can be deleted
// by any instructor. Admins use adminDeleteCourse if they need to force-delete.
export const deleteMyCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireInstructor(ctx.db, ctx.auth);
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");
    if (course.status === "published")
      throw new Error("Published courses cannot be deleted. Ask an admin to unpublish it first.");
    await ctx.db.delete(id);
    return { ok: true };
  },
});

export const publishCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx.db, ctx.auth);
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");
    await ctx.db.patch(id, { status: "published", rejectionReason: undefined, updatedAt: Date.now() });
    return { ok: true };
  },
});

export const rejectCourse = mutation({
  args: { id: v.id("courses"), reason: v.optional(v.string()) },
  handler: async (ctx, { id, reason }) => {
    await requireAdmin(ctx.db, ctx.auth);
    const course = await ctx.db.get(id);
    if (!course) throw new Error("Course not found");
    await ctx.db.patch(id, {
      status:          "rejected",
      rejectionReason: reason ?? "No reason provided",
      updatedAt:       Date.now(),
    });
    return { ok: true };
  },
});

export const adminDeleteCourse = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx.db, ctx.auth);
    await ctx.db.delete(id);
    return { ok: true };
  },
});

// Returns all completed lesson slugs for the current user in a given course.
export const getLessonProgress = query({
  args: { courseSlug: v.string() },
  handler: async (ctx, { courseSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", userId).eq("courseSlug", courseSlug)
      )
      .collect();
  },
});

// PERF: batched version of getLessonProgress for a list of course slugs.
// Added specifically to fix the course listing page (CourseCard.tsx), which
// previously ran one live getLessonProgress subscription PER in-progress
// course card — N live queries on one page instead of one. This single
// query uses the same "by_user_course" index but only constrains on userId
// (a valid index-prefix query), then groups the results by course slug in
// memory. At 10k MAU, one user's total lesson_progress row count is small,
// so this stays cheap while cutting N subscriptions down to 1.
export const getLessonProgressForSlugs = query({
  args: { courseSlugs: v.array(v.string()) },
  handler: async (ctx, { courseSlugs }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || courseSlugs.length === 0) return {};

    const userId  = identity.subject;
    const slugSet = new Set(courseSlugs);

    const rows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) => q.eq("userId", userId))
      .collect();

    const grouped: Record<string, { moduleSlug: string; lessonSlug: string }[]> = {};
    for (const r of rows) {
      if (!slugSet.has(r.courseSlug)) continue;
      (grouped[r.courseSlug] ??= []).push({ moduleSlug: r.moduleSlug, lessonSlug: r.lessonSlug });
    }
    return grouped;
  },
});

// Idempotent — safe to call multiple times for the same lesson.
export const markLessonComplete = mutation({
  args: { courseSlug: v.string(), moduleSlug: v.string(), lessonSlug: v.string() },
  handler: async (ctx, { courseSlug, moduleSlug, lessonSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", userId)
         .eq("courseSlug", courseSlug)
         .eq("moduleSlug", moduleSlug)
         .eq("lessonSlug", lessonSlug)
      )
      .unique();

    if (existing) return { ok: true, alreadyDone: true };

    await ctx.db.insert("lesson_progress", {
      userId,
      courseSlug,
      moduleSlug,
      lessonSlug,
      completedAt: Date.now(),
    });
    return { ok: true, alreadyDone: false };
  },
});

export const getSavedCourses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return await ctx.db
      .query("saved_courses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const saveOrUnsaveCourse = mutation({
  args: { courseSlug: v.string(), save: v.boolean() },
  handler: async (ctx, { courseSlug, save }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("saved_courses")
      .withIndex("by_user_slug", (q) =>
        q.eq("userId", userId).eq("courseSlug", courseSlug)
      )
      .unique();

    if (save && !existing)  await ctx.db.insert("saved_courses", { userId, courseSlug, savedAt: Date.now() });
    if (!save && existing)  await ctx.db.delete(existing._id);
    return { ok: true };
  },
});

// Returns a map of courseSlug → completedLessonCount — used on the course listing page.
export const getAllLessonProgressCounts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};
    const userId = identity.subject;
    const rows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) => q.eq("userId", userId))
      .collect();
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.courseSlug] = (counts[row.courseSlug] ?? 0) + 1;
    }
    return counts;
  },
});

// Wipes all lesson progress for a course — used by the full course reset button.
export const resetCourseProgress = mutation({
  args: { courseSlug: v.string() },
  handler: async (ctx, { courseSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");
    const userId = identity.subject;

    const rows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", userId).eq("courseSlug", courseSlug)
      )
      .collect();

    await Promise.all(rows.map((r) => ctx.db.delete(r._id)));
    return { ok: true, deleted: rows.length };
  },
});

// Wipes progress for a single module — used by the per-module reset button in the sidebar.
export const resetModuleProgress = mutation({
  args: { courseSlug: v.string(), moduleSlug: v.string() },
  handler: async (ctx, { courseSlug, moduleSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");
    const userId = identity.subject;

    const rows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", userId).eq("courseSlug", courseSlug)
      )
      .collect();

    const toDelete = rows.filter((r) => r.moduleSlug === moduleSlug);
    await Promise.all(toDelete.map((r) => ctx.db.delete(r._id)));
    return { ok: true, deleted: toDelete.length };
  },
});

// Step 1 — frontend asks for a short-lived upload URL.
export const generateImageUploadUrl = mutation({
  handler: async (ctx) => {
    await requireInstructor(ctx.db, ctx.auth);
    return await ctx.storage.generateUploadUrl();
  },
});

// Step 2 — after the PUT succeeds, exchange the storageId for a permanent URL.
export const saveUploadedImage = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    await requireInstructor(ctx.db, ctx.auth);
    const url = await ctx.storage.getUrl(storageId as any);
    return url;
  },
});
// ─── Co-author mutations ───────────────────────────────────────────────────────
//
// Only the course owner (createdBy) can add or remove co-authors.
// Co-authors can edit but cannot publish, reject, or delete.

export const addCoAuthor = mutation({
  args: {
    courseId: v.id("courses"),
    email:    v.string(),
  },
  handler: async (ctx, { courseId, email }) => {
    const callerId = await requireInstructor(ctx.db, ctx.auth);

    const course = await ctx.db.get(courseId);
    if (!course) throw new Error("Course not found");
    if (course.createdBy !== callerId)
      throw new Error("Only the course owner can add co-authors");

    // Look up the target user by email (case-insensitive).
    const normalizedEmail = email.trim().toLowerCase();
    const allUsers = await ctx.db.query("users").collect();
    const targetUser = (allUsers as any[]).find(
      (u) => (u.email ?? "").toLowerCase() === normalizedEmail
    );
    if (!targetUser)
      throw new Error(`No ScriptValley account found for "${email}". The user must sign up first.`);

    // Target must be an approved instructor.
    const instructorRow = await ctx.db
      .query("instructors")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUser.userId))
      .unique();
    if (!instructorRow || !instructorRow.isApproved)
      throw new Error(`${email} is not an approved instructor`);

    // Cannot add yourself.
    if (targetUser.userId === callerId)
      throw new Error("You are already the course owner");

    // Idempotency guard — don't add the same person twice.
    const existing = (course.coAuthors ?? []) as Array<{ userId: string; name: string; email: string }>;
    if (existing.some((a) => a.userId === targetUser.userId))
      throw new Error(`${email} is already a co-author on this course`);

    await ctx.db.patch(courseId, {
      coAuthors: [
        ...existing,
        {
          userId: targetUser.userId,
          name:   targetUser.name ?? "",
          email:  targetUser.email ?? normalizedEmail,
        },
      ],
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const removeCoAuthor = mutation({
  args: {
    courseId: v.id("courses"),
    userId:   v.string(),
  },
  handler: async (ctx, { courseId, userId }) => {
    const callerId = await requireInstructor(ctx.db, ctx.auth);

    const course = await ctx.db.get(courseId);
    if (!course) throw new Error("Course not found");
    if (course.createdBy !== callerId)
      throw new Error("Only the course owner can remove co-authors");

    const existing = (course.coAuthors ?? []) as Array<{ userId: string; name: string; email: string }>;
    const updated  = existing.filter((a) => a.userId !== userId);

    if (updated.length === existing.length)
      throw new Error("That user is not a co-author of this course");

    await ctx.db.patch(courseId, {
      coAuthors: updated,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

// ─── Cheat Sheet / Revision PDF ───────────────────────────────────────────────
//
// Instructors upload a PDF cheat sheet per course.
// Students unlock view access at 40% progress, download at 50%.
// The storage URL is never returned to clients below the 40% threshold.

// Step 1 — instructor requests a short-lived upload URL for the PDF.
export const generateCheatSheetUploadUrl = mutation({
  handler: async (ctx) => {
    await requireInstructor(ctx.db, ctx.auth);
    return await ctx.storage.generateUploadUrl();
  },
});

// Step 2 — after upload succeeds, save the storageId + filename to the course.
// Only the course owner or a co-author can call this.
export const saveCheatSheet = mutation({
  args: {
    courseId: v.id("courses"),
    storageId: v.string(),
    fileName:  v.string(),
  },
  handler: async (ctx, { courseId, storageId, fileName }) => {
    const callerId = await requireInstructor(ctx.db, ctx.auth);

    const course = await ctx.db.get(courseId);
    if (!course) throw new Error("Course not found");

    const isOwner    = course.createdBy === callerId;
    const isCoAuthor = (course.coAuthors ?? []).some((a: any) => a.userId === callerId);
    if (!isOwner && !isCoAuthor)
      throw new Error("Only the course owner or a co-author can upload a cheat sheet");

    // If a previous cheat sheet exists, delete it from storage first
    if (course.cheatSheetStorageId) {
      try { await ctx.storage.delete(course.cheatSheetStorageId as any); } catch {}
    }

    await ctx.db.patch(courseId, {
      cheatSheetStorageId: storageId,
      cheatSheetFileName:  fileName.trim() || "cheatsheet.pdf",
      updatedAt:           Date.now(),
    });

    return { ok: true };
  },
});

// Remove the cheat sheet — deletes from storage and clears the course fields.
export const removeCheatSheet = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const callerId = await requireInstructor(ctx.db, ctx.auth);

    const course = await ctx.db.get(courseId);
    if (!course) throw new Error("Course not found");

    const isOwner    = course.createdBy === callerId;
    const isCoAuthor = (course.coAuthors ?? []).some((a: any) => a.userId === callerId);
    if (!isOwner && !isCoAuthor)
      throw new Error("Only the course owner or a co-author can remove the cheat sheet");

    if (course.cheatSheetStorageId) {
      try { await ctx.storage.delete(course.cheatSheetStorageId as any); } catch {}
    }

    await ctx.db.patch(courseId, {
      cheatSheetStorageId: undefined,
      cheatSheetFileName:  undefined,
      updatedAt:           Date.now(),
    });

    return { ok: true };
  },
});

// Returns the student's access level for the cheat sheet.
// Progress is computed server-side — the URL is NEVER returned for "none" access.
//
// accessLevel:
//   "none"     — < 40% complete (or no sheet uploaded)
//   "view"     — 40–49% complete (can view inline, no download)
//   "download" — >= 50% complete (can view + download)
export const getCheatSheetAccess = query({
  args: { courseSlug: v.string() },
  handler: async (ctx, { courseSlug }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", courseSlug))
      .unique();

    if (!course || !course.cheatSheetStorageId) {
      return { hasSheet: false, accessLevel: "none" as const, url: null, fileName: null };
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasSheet: true, accessLevel: "none" as const, url: null, fileName: course.cheatSheetFileName ?? "cheatsheet.pdf" };
    }

    const userId = identity.subject;

    // Count completed lessons for this user + course
    const progressRows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q) => q.eq("userId", userId).eq("courseSlug", courseSlug))
      .collect();

    const completedLessons = progressRows.length;

    // Count total lessons in the course
    const totalLessons = (course.modules ?? []).reduce(
      (sum: number, m: any) => sum + (m.lessons?.length ?? 0),
      0
    );

    // Edge case: freeform course with no lessons — grant download on any progress
    const pct = totalLessons === 0
      ? (completedLessons > 0 ? 100 : 0)
      : Math.floor((completedLessons / totalLessons) * 100);

    // Determine access level
    if (pct < 40) {
      return {
        hasSheet:    true,
        accessLevel: "none" as const,
        url:         null,
        fileName:    course.cheatSheetFileName ?? "cheatsheet.pdf",
        pct,
        threshold:   40,
      };
    }

    // Fetch the storage URL — only returned when access is granted
    const url = await ctx.storage.getUrl(course.cheatSheetStorageId as any);

    if (pct < 50) {
      return {
        hasSheet:    true,
        accessLevel: "view" as const,
        url,
        fileName:    course.cheatSheetFileName ?? "cheatsheet.pdf",
        pct,
        threshold:   50,
      };
    }

    return {
      hasSheet:    true,
      accessLevel: "download" as const,
      url,
      fileName:    course.cheatSheetFileName ?? "cheatsheet.pdf",
      pct,
      threshold:   null,
    };
  },
});