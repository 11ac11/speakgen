import { notFound } from "next/navigation";
import { getLevel } from "@/lib/levels";

/**
 * Guards every route under /[level].
 *
 * [level] is a dynamic segment at the root of the app, so it sits alongside
 * /dashboard, /login, /about and the rest. Next matches static segments first,
 * so those keep working, but anything else would fall through to here. This
 * layout 404s unknown or disabled levels so /nonsense/exams/1 cannot render.
 *
 * Adding a new top-level route shadows a level of the same name, which is the
 * cost of this URL shape. Level codes are short (b2, c1, c2), so the names to
 * avoid are few and obvious.
 */
export default async function LevelLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;

  if (!(await getLevel(level))) notFound();

  return <>{children}</>;
}
