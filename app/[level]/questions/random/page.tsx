import { redirect } from "next/navigation";

// A bare /[level]/questions/random starts at Part 1. Not a permanent redirect:
// this is a default entry point rather than a moved resource, so browsers
// should not cache it if the default ever changes.
export default async function RandomQuestionDefaultPage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  redirect(`/${level.toLowerCase()}/questions/random/1`);
}
