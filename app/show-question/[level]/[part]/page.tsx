import { permanentRedirect } from "next/navigation";

// The random-question runner moved under its level.
export default async function LegacyShowQuestionPage({
  params
}: {
  params: Promise<{ level: string; part: string }>;
}) {
  const { level, part } = await params;
  permanentRedirect(`/${level.toLowerCase()}/questions/random/${part}`);
}
