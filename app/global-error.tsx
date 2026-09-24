"use client";

import { useEffect } from "react";

/**
 * The last resort, for an error in the root layout itself. It replaces the
 * layout, so it has none of the site's styles, fonts or components — styled
 * components included — and is written in plain inline styles that match the
 * house colours as closely as the browser's defaults allow.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fafafa",
          color: "#313131"
        }}
      >
        <title>Something went wrong — SpeakGen</title>
        <main
          style={{ maxWidth: 560, margin: "0 auto", padding: "5rem 1.25rem" }}
        >
          <p
            style={{
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "#1f6e3c",
              margin: 0
            }}
          >
            SpeakGen
          </p>
          <h1 style={{ color: "#171e19", margin: "1rem 0 0.6rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6f6f6f", margin: "0 0 1.75rem" }}>
            The site could not load just now. It is usually temporary.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                minHeight: 44,
                padding: "0.6rem 1.2rem",
                border: "none",
                borderRadius: 12,
                background: "#1f6e3c",
                color: "#fff",
                font: "inherit",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Try again
            </button>
            {/* A full reload rather than a client navigation: the app shell
                is what failed, so it has to be fetched again. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full reload is the point */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 1.2rem",
                borderRadius: 12,
                border: "1.5px solid #c9dcc6",
                color: "#1f6e3c",
                textDecoration: "none",
                fontWeight: 500
              }}
            >
              Go to the home page
            </a>
          </div>
          {error.digest ? (
            <p style={{ marginTop: "2rem", fontSize: 12, color: "#8a918a" }}>
              If you contact us about this, quote <code>{error.digest}</code>.
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
