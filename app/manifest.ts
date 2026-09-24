import type { MetadataRoute } from "next";

// The favicon, icon.svg and apple-icon.png beside this file are picked up by
// file convention; these are the larger icons a phone uses when the site is
// added to its home screen. The maskable one is the reversed mark on a
// full-bleed green square, kept inside the central safe zone so Android's
// circle or squircle crop never cuts into the bubble.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeakGen",
    short_name: "SpeakGen",
    description:
      "Cambridge speaking exam practice for teachers. Build an exam, or run a free one straight from the page.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#62cc54",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
