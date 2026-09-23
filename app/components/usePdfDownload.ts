"use client";

import { useState } from "react";

/**
 * Downloads an exam's or a practice's PDF, with a busy state and an error.
 *
 * Fetched rather than linked: a paper with photographs takes a few seconds to
 * build, and a bare link gives no sign anything is happening, so teachers
 * click it again. Shared by the page header and the dashboard's card menus.
 */
export function usePdfDownload() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (kind: "exam" | "practice", id: number) => {
    const key = `${kind}:${id}`;
    setBusyId(key);
    setError(null);
    try {
      const res = await fetch(`/api/${kind}s/${id}/pdf`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not make the PDF. Please try again.");
        return;
      }
      const filename =
        /filename="([^"]+)"/.exec(
          res.headers.get("Content-Disposition") ?? ""
        )?.[1] ?? `${kind}.pdf`;
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setError("Could not make the PDF. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const isBusy = (kind: "exam" | "practice", id: number) =>
    busyId === `${kind}:${id}`;

  return { download, isBusy, busy: busyId !== null, error };
}
