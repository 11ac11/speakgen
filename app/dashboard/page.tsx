import Dashboard from "./Dashboard";
import { getAuthenticatedUserId } from "@/lib/session";
import { ensureProfile } from "@/lib/profile";
import type { Metadata } from "next";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("My work");

export default async function Page({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const currentSearchParams = await searchParams;
  const tab = currentSearchParams?.tab;

  // First authenticated page view is where a profile row appears for anyone who
  // signed up after migration 006. getEntitlements also creates one, so any
  // path that reads a plan is self-healing; this just gets there sooner.
  const userId = await getAuthenticatedUserId();
  if (userId) await ensureProfile(userId);

  return <Dashboard tab={tab} />;
}
