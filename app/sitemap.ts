import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { listLevels } from "@/lib/levels";
import { siteUrl } from "@/lib/site";

/*
 * Rebuilt at most hourly rather than frozen at build time, so a house exam
 * added in a migration appears without a redeploy, and the build does not need
 * the database to be reachable.
 */
export const revalidate = 3600;

/**
 * The free library, for search engines: the product pages, each enabled level
 * with its exam listing and its random-question pages, and every house exam.
 *
 * Nothing a teacher owns is listed, since none of it is public — their exams
 * and practices are readable only by them and their school, and share links
 * are private by design.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const url = (path: string) => `${base}${path}`;

  const [levels, exams] = await Promise.all([
    listLevels(),
    sql(
      `SELECT e.id::int AS id, e.level, e.updated_at
         FROM content.exams e
         JOIN content.levels l ON l.code = e.level AND l.enabled
        WHERE e.owner_id IS NULL
        ORDER BY e.level, e.id`,
      []
    ) as unknown as Promise<{ id: number; level: string; updated_at: string }[]>
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/exams"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/pricing"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/faqs"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/signup"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/cookies"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/dpa"), changeFrequency: "yearly", priority: 0.3 }
  ];

  for (const level of levels) {
    pages.push(
      {
        url: url(`/${level.code}`),
        changeFrequency: "monthly",
        priority: 0.8
      },
      {
        url: url(`/${level.code}/exams`),
        changeFrequency: "weekly",
        priority: 0.8
      },
      ...level.parts.map((part) => ({
        url: url(`/${level.code}/questions/random/${part}`),
        changeFrequency: "weekly" as const,
        priority: 0.6
      }))
    );
  }

  for (const exam of exams) {
    pages.push({
      url: url(`/${exam.level}/exams/${exam.id}`),
      lastModified: new Date(exam.updated_at),
      changeFrequency: "monthly",
      priority: 0.7
    });
  }

  return pages;
}
