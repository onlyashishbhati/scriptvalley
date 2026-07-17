import { cache } from "react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import ModuleContent from "./_components/ModuleContent";
import { Course } from "../../courseTypes";

interface Props {
  params: Promise<{ courseSlug: string; moduleSlug: string }>;
}
const getCourse = cache(async (slug: string) => {
  return (await fetchQuery(api.courses.getCourseBySlug, { slug })) as Course | null;
});

export async function generateMetadata({ params }: Props) {
  const { courseSlug, moduleSlug } = await params;
  const course = await getCourse(courseSlug);
  const mod = course?.modules?.find((m) => m.slug === moduleSlug);
  return { title: mod ? `${mod.title} — ${course!.title}` : "Course" };
}

export default async function ModulePage({ params }: Props) {
  const { courseSlug, moduleSlug } = await params;

  const course = await getCourse(courseSlug);
  if (!course) notFound();

  const isStructured = course.template === "structured";

  // De-duplicate modules by slug
  const seen = new Set<string>();
  const modules = (course.modules ?? [])
    .sort((a, b) => a.order - b.order)
    .filter((m) => {
      if (seen.has(m.slug)) return false;
      seen.add(m.slug);
      return true;
    });

  const modIndex = modules.findIndex((m) => m.slug === moduleSlug);
  if (modIndex === -1) notFound();

  const mod = modules[modIndex];

  if (isStructured) {
    const lessons = [...(mod.lessons ?? [])].sort((a, b) => a.order - b.order);
    if (lessons.length > 0) {
      const firstLesson = lessons[0];
      const lSlug =
        firstLesson.title
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 60) || "lesson-1";
      redirect(`/courses/${courseSlug}/${moduleSlug}/${lSlug}`);
    }
  }

  const prevMod = modules[modIndex - 1] ?? null;
  const nextMod = modules[modIndex + 1] ?? null;

  return (
    <ModuleContent
      courseSlug={courseSlug}
      mod={mod}
      modIndex={modIndex}
      totalModules={modules.length}
      prevMod={prevMod}
      nextMod={nextMod}
      isStructured={isStructured}
    />
  );
}