"use client";

import { useEffect } from "react";
import ErrorScreen from "@/app/components/ErrorScreen";

/**
 * Anything that throws while a page renders. The message itself is never
 * shown: from a server component it is a generic one by design, and from a
 * client one it may say more than a visitor should read. The digest is shown
 * instead, which matches the entry in the server's log.
 */
export default function ErrorPage({
  error,
  retry
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="Error"
      title="Something went wrong"
      onRetry={retry}
      primary={{ label: "Go to the home page", href: "/" }}
      reference={error.digest}
    >
      <p>
        That page could not be shown just now. It is usually temporary: try
        again, and if it keeps happening, let us know.
      </p>
    </ErrorScreen>
  );
}
