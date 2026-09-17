// Not a client component: it reads server-only configuration, and every child
// that needs interactivity is already a client component in its own right.
import React from "react";
import StyledComponentsRegistry from "../lib/registry";
import Navbar from "@/app/components/Nav";
import Providers from "./providers";
import ConsentBanner from "@/app/components/ads/ConsentBanner";
// Library styles first, ours second. auth-ui ships Tailwind's preflight, which
// includes h1..h6 { font-size: inherit; font-weight: inherit } — loaded after
// globals.css it flattened every plain heading in the app to body text.
import "@neondatabase/auth-ui/css";
import "../styles/globals.css";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <StyledComponentsRegistry>
            <Navbar />
            <main>{children}</main>
            <ConsentBanner />
            {/* <BackgroundToggle /> */}
          </StyledComponentsRegistry>
        </Providers>
      </body>
    </html>
  );
}
