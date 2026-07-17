import { cache } from "react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CourseOverview from "./[moduleSlug]/_components/CourseOverview";
import { courseMetadata, courseJsonLd } from "../../seoHelpers";
import { Course } from "../courseTypes";

interface Props {
  params: Promise<{ courseSlug: string }>;
}

const getCourse = cache(async (slug: string) => {
  return (await fetchQuery(api.courses.getCourseBySlug, { slug })) as Course | null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getCourse(courseSlug);
  if (!course) return { title: "Course Not Found" };
  return courseMetadata(course);
}

export default async function CourseOverviewPage({ params }: Props) {
  const { courseSlug } = await params;
  const course = await getCourse(courseSlug);
  if (!course) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd(course)) }}
      />
      <CourseOverview course={course} />
    </>
  );
}