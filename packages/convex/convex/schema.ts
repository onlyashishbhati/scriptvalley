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

const educationV = v.object({
  id: v.string(),
  institution: v.string(),
  degree: v.string(),
  fieldOfStudy: v.optional(v.string()),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  current: v.boolean(),
  order: v.number(),
});

const MAX_INTERESTS = 12;
const MAX_TOOLS = 16;
const MAX_EDUCATION = 6;
const MAX_TAGLINE = 80;

// ─── Blend limits ───────────────────────────────────────────────────────────
const MAX_PRIVATE_BLEND_MEMBERS = 10;
const MAX_PUBLIC_BLEND_MEMBERS = 50;
const MAX_BLEND_NAME_LEN = 60;
const MAX_BLEND_DESC_LEN = 200;
const INVITE_CODE_LENGTH = 6;
const MAX_RESOURCES_PER_BLEND = 10;

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

    username: v.optional(v.string()),
    profileVisibility: v.optional(
      v.union(v.literal("public"), v.literal("private")),
    ),

    // NEW — dev-profile "pin one to your dashboard" shortcuts. Distinct
    // from user_sheet_save / saved_courses (unlimited bookmarks browsable
    // on each feature's own page) — a pin is a single, dashboard-visible
    // "what I'm actively working on right now" item. Pinning a new one
    // simply overwrites the old value; no separate unpin-first step.
    pinnedSheetSlug: v.optional(v.string()),
    pinnedCourseSlug: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_username", ["username"]),

  portfolio: defineTable({
    userId: v.string(),

    bio: v.optional(v.string()),
    tagline: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    projects: v.optional(v.array(projectV)),
    experience: v.optional(v.array(experienceV)),
    education: v.optional(v.array(educationV)),

    interests: v.optional(v.array(v.string())),
    tools: v.optional(v.array(v.string())),

    accentColor: v.optional(v.string()),
    showStats: v.optional(v.boolean()),

    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  admins: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_user_id", ["userId"]),

  socials: defineTable({
    userId: v.string(),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    portfolio: v.optional(v.string()),
    resume: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  platforms: defineTable({
    userId: v.string(),
    leetcodeUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

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
    .index("by_privacy", ["isPrivate"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userId_: v.optional(v.string()),
    userName: v.string(),
    content: v.string(),
  }).index("by_snippet_id", ["snippetId"]),

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

  // REMOVED: user_sheet_follow. The "follow" concept has been retired —
  // user_sheet_save (below) now serves both roles it used to split: the
  // persistent "sheets I care about" set that potd.ts personalizes off of,
  // AND the multi-item bookmark list browsable on /dsa-sheet. `pinnedSheetSlug`
  // on `users` (above) covers the NEW single-item "show this on my
  // dashboard" concept, which save/follow never provided.

  user_sheet_save: defineTable({
    userId: v.string(),
    sheetSlug: v.string(),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sheet", ["sheetSlug"])
    .index("by_user_sheet", ["userId", "sheetSlug"]),

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

  questionNotes: defineTable({
    userId: v.string(),
    questionTitle: v.string(),
    notes: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_question", ["userId", "questionTitle"]),

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

  instructors: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    bio: v.optional(v.string()),
    isApproved: v.boolean(),
    appliedAt: v.number(),
    approvedAt: v.optional(v.number()),
  }).index("by_user_id", ["userId"]),

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

  // ── Blend ──────────────────────────────────────────────────────────────────
  blends: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    ownerUserId: v.string(),
    visibility: v.union(v.literal("private"), v.literal("public")),
    resourceType: v.union(v.literal("sheet"), v.literal("course")),
    inviteCode: v.string(),
    memberCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_invite_code", ["inviteCode"])
    .index("by_slug", ["slug"])
    .index("by_visibility", ["visibility"]),

  blend_members: defineTable({
    blendId: v.id("blends"),
    userId: v.string(),
    userName: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_blend", ["blendId"])
    .index("by_user", ["userId"])
    .index("by_blend_user", ["blendId", "userId"]),

  blend_resources: defineTable({
    blendId: v.id("blends"),
    resourceSlug: v.string(),
    resourceName: v.string(),
    addedByUserId: v.string(),
    addedAt: v.number(),
  })
    .index("by_blend", ["blendId"])
    .index("by_blend_slug", ["blendId", "resourceSlug"]),

  blend_join_requests: defineTable({
    blendId: v.id("blends"),
    userId: v.string(),
    userName: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestedAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_blend", ["blendId"])
    .index("by_blend_user", ["blendId", "userId"])
    .index("by_blend_status", ["blendId", "status"]),

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("blend_member_joined"),
      v.literal("blend_removed"),
      v.literal("blend_milestone"),
      v.literal("blend_join_request"),
      v.literal("blend_join_approved"),
      v.literal("blend_join_rejected"),
      v.literal("generic"),
    ),
    title: v.string(),
    body: v.optional(v.string()),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),
});

export const PORTFOLIO_LIMITS = {
  MAX_INTERESTS,
  MAX_TOOLS,
  MAX_EDUCATION,
  MAX_TAGLINE,
};

export const BLEND_LIMITS = {
  MAX_PRIVATE_BLEND_MEMBERS,
  MAX_PUBLIC_BLEND_MEMBERS,
  MAX_BLEND_NAME_LEN,
  MAX_BLEND_DESC_LEN,
  INVITE_CODE_LENGTH,
  MAX_RESOURCES_PER_BLEND,
};