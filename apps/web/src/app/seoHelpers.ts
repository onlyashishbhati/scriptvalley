import type { Metadata } from "next";

export const SITE_NAME = "Script Valley";
export const SITE_URL = "https://scriptvalley.com";

// ── Types ─────────────────────────────────────────────────────────────────────
type Lesson = {
  title: string;
  topicsCovered?: string;
};

type Module = {
  title: string;
  slug: string;
  description?: string;
  lessons?: Lesson[];
};

type Course = {
  title: string;
  slug: string;
  description?: string;
  level?: string;
  modules?: Module[];
};

type Question = {
  id?: string;
};

type Topic = {
  topic: string;
  questions: Question[];
};

type DsaSheet = {
  name: string;
  slug: string;
  description?: string;
  topics?: Topic[];
};

// ── URL builders ──────────────────────────────────────────────────────────────
export const urls = {
  home: () => SITE_URL,
  courses: () => `${SITE_URL}/courses`,
  course: (slug: string) => `${SITE_URL}/courses/${slug}`,
  module: (cSlug: string, mSlug: string) =>
    `${SITE_URL}/courses/${cSlug}/${mSlug}`,
  lesson: (cSlug: string, mSlug: string, lSlug: string) =>
    `${SITE_URL}/courses/${cSlug}/${mSlug}/${lSlug}`,
  dsaSheets: () => `${SITE_URL}/dsa-sheet`,
  dsaSheet: (slug: string) => `${SITE_URL}/dsa-sheet/${slug}`,
};

// ── Shared builder ────────────────────────────────────────────────────────────
function make(
  title: string,
  description: string,
  pageUrl: string,
  type: "website" | "article" = "website"
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title, description, url: pageUrl, siteName: SITE_NAME, type },
    twitter: { card: "summary", title, description },
  };
}

// ── Course metadata ───────────────────────────────────────────────────────────
export function courseMetadata(course: Course): Metadata {
  return make(
    `${course.title} · ${SITE_NAME}`,
    course.description ??
      `Learn ${course.title} with ${
        course.modules?.length ?? 0
      } structured modules on ${SITE_NAME}.`,
    urls.course(course.slug)
  );
}

export function moduleMetadata(
  course: { title: string; slug: string },
  mod: { title: string; slug: string; description?: string }
): Metadata {
  return make(
    `${mod.title} · ${course.title} · ${SITE_NAME}`,
    mod.description ??
      `${mod.title} is part of the ${course.title} course on ${SITE_NAME}.`,
    urls.module(course.slug, mod.slug),
    "article"
  );
}

export function lessonMetadata(
  course: { title: string; slug: string },
  mod: { title: string; slug: string },
  lesson: Lesson,
  lSlug: string
): Metadata {
  return make(
    `${lesson.title} · ${mod.title}· ${course.title} · ${SITE_NAME}`,
    lesson.topicsCovered
      ? `Topics: ${lesson.topicsCovered}. Part of ${course.title} on ${SITE_NAME}.`
      : `$${lesson.title}, part of the ${mod.title}  module in ${course.title} on ${SITE_NAME}.`,
    urls.lesson(course.slug, mod.slug, lSlug),
    "article"
  );
}

export function assessmentMetadata(
  course: { title: string; slug: string },
  mod: { title: string; slug: string }
): Metadata {
  return make(
    `Practice & Assessment · ${mod.title} · ${course.title} · ${SITE_NAME}`,
    `Test your understanding of ${mod.title} with MCQs and coding challenges on ${SITE_NAME}.`,
    urls.lesson(course.slug, mod.slug, "assessments"),
    "article"
  );
}

// ── DSA sheet metadata ────────────────────────────────────────────────────────
export function dsaSheetsPageMetadata(): Metadata {
  return make(
    `DSA Sheets · ${SITE_NAME}`,
    `Browse curated DSA problem sheets for interview prep, revision, and concept mastery on ${SITE_NAME}.`,
    urls.dsaSheets()
  );
}

export function dsaSheetMetadata(sheet: DsaSheet): Metadata {
  const totalQ = (sheet.topics ?? []).reduce(
    (s, t) => s + (t.questions?.length ?? 0),
    0
  );

  return make(
    `${sheet.name} · DSA Sheet · ${SITE_NAME}`,
    sheet.description
      ? sheet.description.replace(/<[^>]+>/g, "").slice(0, 160)
      : `Practice ${totalQ} DSA problems in the ${sheet.name} sheet on ${SITE_NAME}.`,
    urls.dsaSheet(sheet.slug)
  );
}

// ── JSON-LD builders ──────────────────────────────────────────────────────────
export function courseJsonLd(course: Course) {
  const totalLessons = (course.modules ?? []).reduce(
    (s: number, m: Module) => s + (m.lessons?.length ?? 0),
    0
  );

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      course.description ?? `Learn ${course.title} on ${SITE_NAME}`,
    url: urls.course(course.slug),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    courseMode: "online",
    educationalLevel: course.level ?? "all-levels",
    numberOfCredits: totalLessons,
  };
}

export function lessonJsonLd(
  course: { title: string; slug: string },
  mod: { title: string; slug: string },
  lesson: Lesson,
  lSlug: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: lesson.title,
    description: lesson.topicsCovered ?? lesson.title,
    url: urls.lesson(course.slug, mod.slug, lSlug),
    isPartOf: {
      "@type": "Course",
      name: course.title,
      url: urls.course(course.slug),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "en",
  };
}

export function dsaSheetsListJsonLd(
  sheets: { name: string; slug: string; description?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `DSA Sheets · ${SITE_NAME}`,
    url: urls.dsaSheets(),
    itemListElement: sheets.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: urls.dsaSheet(s.slug),
    })),
  };
}

export function dsaSheetJsonLd(sheet: DsaSheet) {
  const totalQ = (sheet.topics ?? []).reduce(
    (s, t) => s + (t.questions?.length ?? 0),
    0
  );

  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: sheet.name,
    description:
      sheet.description?.replace(/<[^>]+>/g, "") ??
      `${totalQ} DSA problems`,
    url: urls.dsaSheet(sheet.slug),
    educationalUse: "practice",
    learningResourceType: "problem set",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "en",
    about: (sheet.topics ?? []).map((t) => ({
      "@type": "Thing",
      name: t.topic,
    })),
  };
}