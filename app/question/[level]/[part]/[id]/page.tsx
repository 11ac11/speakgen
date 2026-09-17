import { permanentRedirect } from "next/navigation";

// Questions used to live here before the URLs became level-scoped. Part has
// dropped out of the path: a question id is unique on its own.
export default async function LegacyQuestionPage({
  params
}: {
  params: Promise<{ level: string; part: string; id: string }>;
}) {
  const { level, id } = await params;
  permanentRedirect(`/${level.toLowerCase()}/questions/${id}`);
}
