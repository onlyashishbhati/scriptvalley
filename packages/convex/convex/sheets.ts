// DSA sheets — CRUD for instructors, review flow for admins, and student interactions.
// Also includes admin user progress reports (merged from progressAdmin.ts).
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin, requireInstructor, makeSlug } from "./_helper";

function parseContent(content: any) {
  if (!content) return { topics: [] };
  if (typeof content === "string") {
    try { return JSON.parse(content); }
    catch { return { topics: [] }; }
  }
  return content;
}

function normalizeSheetRow(doc: any) {
  if (!doc) return null;
  const content = parseContent(doc.content);
  return {
    _id:              doc._id,
    slug:             doc.slug,
    name:             doc.name             ?? "",
    category:         doc.category         ?? "",
    description:      doc.description      ?? "",
    shortDescription: doc.shortDescription ?? "",
    note:             doc.note             ?? [],
    content,
    topics:           content.topics       ?? [],
    createdBy:        doc.createdBy,
    createdAt:        doc.createdAt,
    updatedAt:        doc.updatedAt,
    order:            doc.order            ?? 0,
    status:           doc.status           ?? "published",
    rejectionReason:  doc.rejectionReason,
  };
}

export const getAll = query({
  handler: async ({ db }) => {
    const published = await db
      .query("dsaSheets")
      .withIndex("by_status", (q: any) => q.eq("status", "published"))
      .collect();
    const legacy = await db
      .query("dsaSheets")
      .collect()
      .then((all: any[]) => all.filter((r) => !r.status));
    return [...published, ...legacy]
      .map(normalizeSheetRow)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async ({ db }, { slug }) => {
    const row = await db
      .query("dsaSheets")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return normalizeSheetRow(row);
  },
});

export const adminGetAll = query({
  handler: async ({ db, auth }) => {
    await requireAdmin(db, auth);
    return (await db.query("dsaSheets").collect())
      .map(normalizeSheetRow)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  },
});

export const getPendingSheets = query({
  handler: async ({ db, auth }) => {
    await requireAdmin(db, auth);
    const rows = await db
      .query("dsaSheets")
      .withIndex("by_status", (q: any) => q.eq("status", "pending_review"))
      .collect();
    return rows.map(normalizeSheetRow);
  },
});

export const getMySheets = query({
  handler: async ({ db, auth }) => {
    await requireInstructor(db, auth);
    return (await db.query("dsaSheets").collect())
      .map(normalizeSheetRow)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  },
});

export const remove = mutation({
  args: { id: v.id("dsaSheets") },
  handler: async ({ db, auth }, { id }: { id: Id<"dsaSheets"> }) => {
    await requireAdmin(db, auth);
    const sheet = await db.get(id);
    if (!sheet) throw new Error("Sheet not found");
    await db.delete(id);
    return { ok: true };
  },
});

export const reorderSheets = mutation({
  args: { orderedIds: v.array(v.id("dsaSheets")) },
  handler: async ({ db, auth }, { orderedIds }) => {
    await requireAdmin(db, auth);
    for (let i = 0; i < orderedIds.length; i++) {
      const sheet = await db.get(orderedIds[i]);
      if (!sheet) continue;
      await db.patch(orderedIds[i], { order: i });
    }
    return { ok: true };
  },
});

export const publishSheet = mutation({
  args: { id: v.id("dsaSheets") },
  handler: async ({ db, auth }, { id }) => {
    await requireAdmin(db, auth);
    const sheet = await db.get(id);
    if (!sheet) throw new Error("Sheet not found");
    await db.patch(id, { status: "published", rejectionReason: undefined, updatedAt: Date.now() });
    return { ok: true };
  },
});

export const rejectSheet = mutation({
  args: { id: v.id("dsaSheets"), reason: v.optional(v.string()) },
  handler: async ({ db, auth }, { id, reason }) => {
    await requireAdmin(db, auth);
    const sheet = await db.get(id);
    if (!sheet) throw new Error("Sheet not found");
    await db.patch(id, {
      status:          "rejected",
      rejectionReason: reason ?? "No reason provided",
      updatedAt:       Date.now(),
    });
    return { ok: true };
  },
});

export const createDraftSheet = mutation({
  args: {
    name:             v.string(),
    slug:             v.optional(v.string()),
    category:         v.optional(v.string()),
    description:      v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    note:             v.optional(v.array(v.string())),
    content:          v.optional(v.any()),
    order:            v.optional(v.number()),
  },
  handler: async ({ db, auth }, args) => {
    const userId = await requireInstructor(db, auth);

    const computedSlug = makeSlug(args.slug ?? args.name);
    const exists = await db
      .query("dsaSheets")
      .withIndex("by_slug", (q) => q.eq("slug", computedSlug))
      .unique();
    if (exists) throw new Error("Slug already exists — choose a different name");

    const now        = Date.now();
    const contentObj = typeof args.content === "string"
      ? parseContent(args.content)
      : (args.content ?? { topics: [] });

    const allSheets  = await db.query("dsaSheets").collect();
    const maxOrder   = allSheets.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), 0);

    const inserted = await db.insert("dsaSheets", {
      slug:             computedSlug,
      name:             args.name,
      category:         args.category,
      description:      args.description,
      shortDescription: args.shortDescription,
      note:             args.note,
      content:          contentObj,
      createdBy:        userId,
      createdAt:        now,
      updatedAt:        now,
      order:            args.order ?? maxOrder + 1,
      status:           "draft",
    });

    return { ok: true, inserted };
  },
});

export const updateDraftSheet = mutation({
  args: {
    id:               v.id("dsaSheets"),
    name:             v.optional(v.string()),
    slug:             v.optional(v.string()),
    category:         v.optional(v.string()),
    description:      v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    note:             v.optional(v.array(v.string())),
    content:          v.optional(v.any()),
    order:            v.optional(v.number()),
  },
  handler: async ({ db, auth }, args) => {
    await requireInstructor(db, auth);

    const sheet = await db.get(args.id);
    if (!sheet) throw new Error("Sheet not found");

    const patch: Record<string, any> = {};

    if (sheet.status === "pending_review") {
      patch.status          = "draft";
      patch.rejectionReason = undefined;
    }

    if (typeof args.name !== "undefined") patch.name = args.name;

    if (typeof args.slug !== "undefined" || typeof args.name !== "undefined") {
      const base    = typeof args.slug !== "undefined" ? args.slug : (args.name ?? sheet.name);
      const cleaned = makeSlug(base);
      if (cleaned !== sheet.slug) {
        const exists = await db
          .query("dsaSheets")
          .withIndex("by_slug", (q) => q.eq("slug", cleaned))
          .unique();
        if (exists) throw new Error("Slug already exists");
      }
      patch.slug = cleaned;
    }

    if (typeof args.category         !== "undefined") patch.category         = args.category;
    if (typeof args.description      !== "undefined") patch.description      = args.description;
    if (typeof args.shortDescription !== "undefined") patch.shortDescription = args.shortDescription;
    if (typeof args.note             !== "undefined") patch.note             = args.note;
    if (typeof args.content          !== "undefined") {
      patch.content = typeof args.content === "string" ? parseContent(args.content) : args.content;
    }
    if (typeof args.order !== "undefined") patch.order = args.order;

    patch.updatedAt = Date.now();
    await db.patch(args.id, patch);
    return { ok: true };
  },
});

export const submitSheetForReview = mutation({
  args: { id: v.id("dsaSheets") },
  handler: async ({ db, auth }, { id }) => {
    await requireInstructor(db, auth);

    const sheet = await db.get(id);
    if (!sheet) throw new Error("Sheet not found");
    if (sheet.status !== "draft" && sheet.status !== "rejected")
      throw new Error("Only draft or rejected sheets can be submitted for review");

    await db.patch(id, {
      status:          "pending_review",
      rejectionReason: undefined,
      updatedAt:       Date.now(),
    });
    return { ok: true };
  },
});

export const withdrawSheetFromReview = mutation({
  args: { id: v.id("dsaSheets") },
  handler: async ({ db, auth }, { id }) => {
    await requireInstructor(db, auth);

    const sheet = await db.get(id);
    if (!sheet) throw new Error("Sheet not found");
    if (sheet.status !== "pending_review") throw new Error("Sheet is not under review");

    await db.patch(id, { status: "draft", updatedAt: Date.now() });
    return { ok: true };
  },
});

export const deleteMySheet = mutation({
  args: { id: v.id("dsaSheets") },
  handler: async ({ db, auth }, { id }) => {
    await requireInstructor(db, auth);
    const sheet = await db.get(id);
    if (!sheet) throw new Error("Sheet not found");
    if (sheet.status === "published")
      throw new Error("Published sheets cannot be deleted. Ask an admin to unpublish it first.");
    await db.delete(id);
    return { ok: true };
  },
});

export const migrateAllToPublished = mutation({
  handler: async ({ db, auth }) => {
    await requireAdmin(db, auth);
    const all   = await db.query("dsaSheets").collect();
    const unset = all.filter((s: any) => !s.status);
    let count   = 0;
    for (const s of unset) { await db.patch(s._id, { status: "published" }); count++; }
    return { ok: true, migrated: count };
  },
});

// REMOVED: followOrUnfollowSheet — the "follow" concept has been retired.
// saveOrUnsaveSheet (below) is now the only bookmark mechanism, and
// pins.ts's pinSheet covers the new single-item dashboard shortcut.

export const saveOrUnsaveSheet = mutation({
  args: { sheetSlug: v.string(), save: v.boolean() },
  handler: async ({ db, auth }, { sheetSlug, save }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const existing = await db
      .query("user_sheet_save")
      .withIndex("by_user_sheet", (q: any) =>
        q.eq("userId", userId).eq("sheetSlug", sheetSlug)
      )
      .unique()
      .catch(() => null);

    if (save) {
      const now = Date.now();
      if (!existing) {
        await db.insert("user_sheet_save", { userId, sheetSlug, savedAt: now });
      } else {
        await db.replace(existing._id, { ...existing, savedAt: now });
      }
    } else {
      if (existing) await db.delete(existing._id);
    }
    return { ok: true };
  },
});

export const getSavedSheets = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    const saved = await db
      .query("user_sheet_save")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const sheets = await Promise.all(
      saved.map(async (s: any) => {
        const row = await db
          .query("dsaSheets")
          .withIndex("by_slug", (q: any) => q.eq("slug", s.sheetSlug))
          .unique()
          .catch(() => null);
        return row ? normalizeSheetRow(row) : null;
      })
    );
    return sheets.filter(Boolean);
  },
});

export const recordAttempt = mutation({
  args: {
    sheetSlug:     v.string(),
    questionTitle: v.string(),
    difficulty:    v.optional(v.string()),
    status:        v.optional(v.string()),
  },
  handler: async ({ db, auth }, { sheetSlug, questionTitle, difficulty = "Medium", status = "attempted" }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const userId = identity.subject;
    const now    = Date.now();

    await db.insert("question_attempts", { userId, sheetSlug, questionTitle, difficulty, status, timestamp: now });

    const prog = await db
      .query("sheet_progress")
      .withIndex("by_user_sheet", (q: any) =>
        q.eq("userId", userId).eq("sheetSlug", sheetSlug)
      )
      .unique()
      .catch(() => null);

    const diffKey      = String(difficulty).toLowerCase();
    const attemptedInc = status === "skipped" ? 0 : 1;
    const solvedInc    = status === "solved"   ? 1 : 0;

    if (!prog) {
      const byDifficulty = {
        easy:   { attempted: 0, solved: 0, total: 0 },
        medium: { attempted: 0, solved: 0, total: 0 },
        hard:   { attempted: 0, solved: 0, total: 0 },
      };
      if      (diffKey.startsWith("easy")) { byDifficulty.easy.attempted   += attemptedInc; byDifficulty.easy.solved   += solvedInc; }
      else if (diffKey.startsWith("hard")) { byDifficulty.hard.attempted   += attemptedInc; byDifficulty.hard.solved   += solvedInc; }
      else                                 { byDifficulty.medium.attempted += attemptedInc; byDifficulty.medium.solved += solvedInc; }
      await db.insert("sheet_progress", { userId, sheetSlug, totalAttempted: attemptedInc, totalSolved: solvedInc, byDifficulty, updatedAt: now });
    } else {
      const upd: any = { ...prog };
      upd.totalAttempted = (upd.totalAttempted || 0) + attemptedInc;
      upd.totalSolved    = (upd.totalSolved    || 0) + solvedInc;
      upd.byDifficulty   = upd.byDifficulty ?? {
        easy:   { attempted: 0, solved: 0, total: 0 },
        medium: { attempted: 0, solved: 0, total: 0 },
        hard:   { attempted: 0, solved: 0, total: 0 },
      };
      if      (diffKey.startsWith("easy")) { upd.byDifficulty.easy.attempted   += attemptedInc; upd.byDifficulty.easy.solved   += solvedInc; }
      else if (diffKey.startsWith("hard")) { upd.byDifficulty.hard.attempted   += attemptedInc; upd.byDifficulty.hard.solved   += solvedInc; }
      else                                 { upd.byDifficulty.medium.attempted += attemptedInc; upd.byDifficulty.medium.solved += solvedInc; }
      upd.updatedAt = now;
      await db.replace(upd._id ?? prog._id, upd);
    }
    return { ok: true };
  },
});

export const adminSearchUsers = query({
  args: { q: v.string(), limit: v.optional(v.number()) },
  handler: async ({ db, auth }, { q, limit = 20 }) => {
    await requireAdmin(db, auth);
    const normalized = q.toLowerCase();
    const all        = await db.query("users").collect();
    return all
      .filter((u: any) =>
        (u.name   || "").toLowerCase().includes(normalized) ||
        (u.email  || "").toLowerCase().includes(normalized) ||
        (u.userId || "").toLowerCase().includes(normalized)
      )
      .slice(0, limit);
  },
});

// Full progress report for a specific user — used on the admin user detail
// page. `follows` key name kept for backward compatibility with that admin
// UI, even though it's now sourced from user_sheet_save (the "follow"
// table it originally read no longer exists).
export const adminGetUserReport = query({
  args: { userId: v.string() },
  handler: async ({ db, auth }, { userId }) => {
    await requireAdmin(db, auth);

    const profile      = await db.query("users").withIndex("by_user_id", (q: any) => q.eq("userId", userId)).unique().catch(() => null);
    const follows      = await db.query("user_sheet_save").withIndex("by_user", (q: any) => q.eq("userId", userId)).collect();
    const progressRows = await db.query("sheet_progress").withIndex("by_user_sheet", (q: any) => q.eq("userId", userId)).collect();
    const attempts     = await db.query("question_attempts").withIndex("by_user", (q: any) => q.eq("userId", userId)).take(10000);

    const slugs = Array.from(new Set([
      ...follows.map((f: any) => f.sheetSlug),
      ...progressRows.map((p: any) => p.sheetSlug),
    ]));

    const sheets = await Promise.all(
      slugs.map((slug) =>
        db.query("dsaSheets").withIndex("by_slug", (q: any) => q.eq("slug", slug)).unique().catch(() => null)
      )
    );

    return { profile, follows, progressRows, attempts, sheets };
  },
});