import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * What crawlers may visit. The public surface is the free library — the level
 * pages, the house exams, the random questions — and the pages about the
 * product. Everything that belongs to one person is kept out: their dashboard
 * and settings, billing, the editors and invitations.
 *
 * Share links are deliberately not disallowed. They carry noindex on the page,
 * and a crawler can only obey that if it is allowed to fetch the page; blocked
 * here, a link someone posted publicly could still be listed as a bare URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/settings",
        "/billing/",
        "/school/",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/questions/new",
        "/*/questions/new",
        "/*/exams/new",
        "/*/practices/",
        "/*/exams/*/edit"
      ]
    },
    sitemap: `${siteUrl()}/sitemap.xml`
  };
}
