import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── Reusable validators ──────────────────────────────────────────────────────

const mcqOptionV = v.object({
  text: v.string(),
  isCorrect: v.boolean(),
});

const mcqQuestionV = v.object({
  question: v.string(),
  options: v.array(mcqOptionV),
  explanation: v.optional(v.string()),
});

const codingChallengeV = v.object({
  title: v.string(),
  description: v.string(),
  difficulty: v.optional(
    v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  ),
  platform: v.optional(v.string()),
  link: v.optional(v.string()),
  hint: v.optional(v.string()),
});

const lessonV = v.object({
  order: v.number(),
  lessonNumber: v.optional(v.string()),
  title: v.string(),
  topicsCovered: v.optional(v.string()),
  content: v.optional(v.string()),
});

const moduleV = v.object({
  order: v.number(),
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  content: v.optional(v.string()),
  lessons: v.optional(v.array(lessonV)),
  mcqQuestions: v.optional(v.array(mcqQuestionV)),
  codingChallenges: v.optional(v.array(codingChallengeV)),
  miniProject: v.optional(codingChallengeV),
});

// ─── Portfolio sub-validators ──────────────────────────────────────────────────

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

// NEW — Interests: short tag chips, e.g. "Gaming", "Film Making", "Traveling".
// Plain string array, same pattern as skills — no icon mapping needed since
// these are free-form and rendered as text-only pills.
const MAX_INTERESTS = 12;

// NEW — Tools: icon-labeled chips, e.g. "Figma", "VS Code", "Docker".
// Stored as plain strings; the icon is resolved client-side from a known
// icon map (Lucide / simple-icons), falling back to a generic icon for
// anything not in the map. No need to store an icon reference in the DB —
// keeps this forward-compatible if the icon set changes later.
const MAX_TOOLS = 16;

export default defineSchema({
  // ── Users ──────────────────────────────────────────────────────────────────
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    collegeName: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    banned: v.optional(v.boolean()),
    flagged: v.optional(v.boolean()),

    // ── Mini-Portfolio ───────────────────────────────────────────────────────
    username: v.optional(v.string()),
    profileVisibility: v.optional(
      v.union(v.literal("public"), v.literal("private")),
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_username", ["username"]),

  // ── Portfolio (bio · skills · projects · experience · interests · tools) ───
  portfolio: defineTable({
    userId: v.string(),

    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    projects: v.optional(v.array(projectV)),
    experience: v.optional(v.array(experienceV)),

    // NEW fields ─────────────────────────────────────────────────────────────
    interests: v.optional(v.array(v.string())),
    tools: v.optional(v.array(v.string())),

    // NEW — showStats: controls whether the public profile shows the
    // ScriptValley-specific block (streak / solved / sheets / courses /
    // badges row). Defaults to true (existing behavior) when the field is
    // absent, so this is backward-compatible with rows created before this
    // field existed — no migration/backfill needed.
    showStats: v.optional(v.boolean()),

    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // ── Admins ─────────────────────────────────────────────────────────────────
  admins: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // ── Socials ────────────────────────────────────────────────────────────────
  socials: defineTable({
    userId: v.string(),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    portfolio: v.optional(v.string()),
    resume: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  // ── Platforms ──────────────────────────────────────────────────────────────
  platforms: defineTable({
    userId: v.string(),
    leetcodeUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  // ── Code executions ────────────────────────────────────────────────────────
  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  // ── Snippets ───────────────────────────────────────────────────────────────
  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(),
    isPrivate: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_privacy", ["userId", "isPrivate"])
    // Supports the public snippet feed (getSnippets) without a full-table
    // scan-and-filter as the table grows.
    .index("by_privacy", ["isPrivate"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userId_: v.optional(v.string()),
    userName: v.string(),
    content: v.string(),
  }).index("by_snippet_id", ["snippetId"]),

  // ── DSA Sheets ─────────────────────────────────────────────────────────────
  dsaSheets: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    note: v.optional(v.any()),
    content: v.optional(v.any()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    order: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending_review"),
        v.literal("published"),
        v.literal("rejected"),
      ),
    ),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  // ── Attempts ───────────────────────────────────────────────────────────────
  attempts: defineTable({
    userId: v.string(),
    questionTitle: v.string(),
    sheetSlug: v.string(),
    difficulty: v.string(),
    attempted: v.boolean(),
  }).index("by_user_question", ["userId", "questionTitle"]),

  question_attempts: defineTable({
    userId: v.string(),
    sheetSlug: v.string(),
    questionTitle: v.string(),
    difficulty: v.optional(v.string()),
    status: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_sheet", ["userId", "sheetSlug"])
    .index("by_user_question", ["userId", "questionTitle"]),

  // ── Sheet progress ─────────────────────────────────────────────────────────
  sheet_progress: defineTable({
    userId: v.string(),
    sheetSlug: v.string(),
    totalAttempted: v.number(),
    totalSolved: v.number(),
    byDifficulty: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_user_sheet", ["userId", "sheetSlug"])
    .index("by_sheet", ["sheetSlug"]),

  user_sheet_follow: defineTable({
    userId: v.string(),
    sheetSlug: v.string(),
    followedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sheet", ["sheetSlug"])
    .index("by_user_sheet", ["userId", "sheetSlug"]),

  user_sheet_save: defineTable({
    userId: v.string(),
    sheetSlug: v.string(),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sheet", ["sheetSlug"])
    .index("by_user_sheet", ["userId", "sheetSlug"]),

  // ── Starred questions ──────────────────────────────────────────────────────
  starred_questions: defineTable({
    userId: v.string(),
    sheetSlug: v.string(),
    topic: v.string(),
    questionTitle: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_question", ["userId", "questionTitle"])
    .index("by_user_sheet", ["userId", "sheetSlug"]),

  // ── Question notes ─────────────────────────────────────────────────────────
  questionNotes: defineTable({
    userId: v.string(),
    questionTitle: v.string(),
    notes: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_question", ["userId", "questionTitle"]),

  // ── POTD logs ──────────────────────────────────────────────────────────────
  potdLogs: defineTable({
    userId: v.string(),
    date: v.string(),
    questionTitle: v.string(),
    sheetSlug: v.string(),
    solved: v.boolean(),
    emoji: v.string(),
    count: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // ── Interview experiences ──────────────────────────────────────────────────
  experiences: defineTable({
    userId: v.string(),
    slug: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    linkedinUrl: v.string(),
    company: v.string(),
    role: v.string(),
    location: v.optional(v.string()),
    package: v.optional(v.string()),
    joiningDate: v.optional(v.string()),
    selectionType: v.optional(v.string()),
    outcome: v.string(),
    interviewDate: v.string(),
    rounds: v.array(
      v.object({
        type: v.string(),
        description: v.string(),
        duration: v.optional(v.string()),
        difficulty: v.optional(v.string()),
      }),
    ),
    overview: v.string(),
    tips: v.optional(v.string()),
    minCgpa: v.optional(v.string()),
    otherCriteria: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_userId", ["userId"]),

  // ── Instructors ────────────────────────────────────────────────────────────
  instructors: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    bio: v.optional(v.string()),
    isApproved: v.boolean(),
    appliedAt: v.number(),
    approvedAt: v.optional(v.number()),
  }).index("by_user_id", ["userId"]),

  // ── Courses ────────────────────────────────────────────────────────────────
  courses: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    template: v.optional(
      v.union(v.literal("freeform"), v.literal("structured")),
    ),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("all-levels"),
      ),
    ),
    schemaVersion: v.optional(v.number()),
    modules: v.array(moduleV),
    createdBy: v.string(),
    coAuthors: v.optional(
      v.array(
        v.object({
          userId: v.string(),
          name: v.string(),
          email: v.string(),
        }),
      ),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("published"),
      v.literal("rejected"),
    ),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    cheatSheetStorageId: v.optional(v.string()),
    cheatSheetFileName: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  // ── Lesson progress ────────────────────────────────────────────────────────
  lesson_progress: defineTable({
    userId: v.string(),
    courseSlug: v.string(),
    moduleSlug: v.string(),
    lessonSlug: v.string(),
    completedAt: v.number(),
  })
    .index("by_user_course", ["userId", "courseSlug"])
    .index("by_user_lesson", ["userId", "courseSlug", "moduleSlug", "lessonSlug"]),

  saved_courses: defineTable({
    userId: v.string(),
    courseSlug: v.string(),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_slug", ["userId", "courseSlug"]),

  // ── Announcements ──────────────────────────────────────────────────────────
  announcements: defineTable({
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("success"),
    ),
    expiresAt: v.optional(v.union(v.number(), v.null())),
    active: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_active", ["active"]),
});

// Exported for use in portfolio.ts validation (max array lengths).
export const PORTFOLIO_LIMITS = {
  MAX_INTERESTS,
  MAX_TOOLS,
};