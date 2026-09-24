import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminViewer } from "@/lib/admin";
import { getMetrics } from "@/lib/metrics";
import { privatePage } from "@/lib/site";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = privatePage("Metrics");

// Always today's numbers.
export const dynamic = "force-dynamic";

/**
 * The admin metrics page. A 404 for anyone not in ADMIN_EMAILS, signed in or
 * not, so it does not advertise that it exists.
 */
export default async function AdminPage() {
  if (!(await isAdminViewer())) notFound();

  const metrics = await getMetrics();
  return (
    <AdminDashboard
      metrics={metrics}
      generatedAt={new Date().toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/London"
      })}
    />
  );
}
