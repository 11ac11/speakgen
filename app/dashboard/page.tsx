import Dashboard from "./Dashboard";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const currentSearchParams = await searchParams;
  const tab = currentSearchParams?.tab;

  return <Dashboard tab={tab} />;
}
