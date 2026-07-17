import { cache } from "react";
import { api } from "../../../../../../../../packages/convex/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LessonContent      from "../_components/LessonContent";
import AssessmentsContent from "../_components/AssessmentsContent";
import {
  lessonMetadata, assessmentMetadata,
  lessonJsonLd,
} from "../../../../seoHelpers";
import { Course, Lesson } from "../../../courseTypes";

interface Props {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}

type ProgressRow = { moduleSlug: string; lessonSlug: string };

function makeLessonSlug(lesson: Lesson, idx: number): string {
  const base = lesson.title
    .trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
  return base || `lesson-${idx + 1}`;
}
const getCourse = cache(async (slug: string) => {
  return (await fetchQuery(api.courses.getCourseBySlug, { slug })) as Course | null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const course = await getCourse(courseSlug);

  if (!course) return { title: "Course" };

  const mod = course.modules?.find((m) => m.slug === moduleSlug);
  if (!mod)  return { title: course.title };

  if (lessonSlug === "assessments") return assessmentMetadata(course, mod);

  const lessons   = [...(mod.lessons ?? [])].sort((a, b) => a.order - b.order);
  const lessonIdx = lessons.findIndex((l, i) => makeLessonSlug(l, i) === lessonSlug);
  const lesson    = lessons[lessonIdx];

  if (!lesson) return { title: `${mod.title} — ${course.title}` };
  return lessonMetadata(course, mod, lesson, lessonSlug);
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;

  const course = await getCourse(courseSlug);
  if (!course) notFound();

  const seen = new Set<string>();
  const modules = (course.modules ?? []).sort((a, b) => a.order - b.order).filter((m) => {
    if (seen.has(m.slug)) return false;
    seen.add(m.slug);
    return true;
  });

  const modIndex = modules.findIndex((m) => m.slug === moduleSlug);
  if (modIndex === -1) notFound();

  const mod     = modules[modIndex];
  const prevMod = modules[modIndex - 1] ?? null;
  const nextMod = modules[modIndex + 1] ?? null;

  if (lessonSlug === "assessments") {
    const hasMCQ        = (mod.mcqQuestions?.length     ?? 0) > 0;
    const hasChallenges = (mod.codingChallenges?.length ?? 0) > 0;
    const hasMiniProj   = !!mod.miniProject?.title;
    if (!hasMCQ && !hasChallenges && !hasMiniProj) notFound();
    return (
      <AssessmentsContent
        courseSlug={courseSlug} mod={mod} modIndex={modIndex}
        totalModules={modules.length} prevMod={prevMod} nextMod={nextMod}
      />
    );
  }

  if (course.template !== "structured") notFound();

  const lessons     = [...(mod.lessons ?? [])].sort((a, b) => a.order - b.order);
  const lessonIndex = lessons.findIndex((l, i) => makeLessonSlug(l, i) === lessonSlug);
  if (lessonIndex === -1) notFound();

  const lesson     = lessons[lessonIndex];
  const prevLesson = lessons[lessonIndex - 1] ?? null;
  const nextLesson = lessons[lessonIndex + 1] ?? null;

  let isCompleted = false;
  try {
    const { userId } = await auth();
    if (userId) {
      const progress = await fetchQuery(api.courses.getLessonProgress, {
        courseSlug,
      }) as ProgressRow[];
      isCompleted = progress.some(
        (r) => r.moduleSlug === moduleSlug && r.lessonSlug === lessonSlug
      );
    }
  } catch {
  }

  const jsonLd = lessonJsonLd(course, mod, lesson, lessonSlug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LessonContent
        courseSlug={courseSlug}
        mod={mod}
        modIndex={modIndex}
        totalModules={modules.length}
        lesson={lesson}
        lessonIndex={lessonIndex}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        isCompleted={isCompleted}
      />
    </>
  );
}