import Dashboard from "./Dashboard";

export default async function Page({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const currentSearchParams = await searchParams;
  return <Dashboard searchParams={currentSearchParams} />;
}
