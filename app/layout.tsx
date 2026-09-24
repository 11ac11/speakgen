// Not a client component: it reads server-only configuration, and every child
// that needs interactivity is already a client component in its own right.
import React from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Rubik } from "next/font/google";
import StyledComponentsRegistry from "../lib/registry";
import Navbar from "@/app/components/Nav";
import Providers from "./providers";
import ConsentBanner from "@/app/components/ads/ConsentBanner";
import Footer from "@/app/components/Footer";
import SiteAnalytics from "@/app/components/SiteAnalytics";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
// Library styles first, ours second. auth-ui ships Tailwind's preflight, which
// includes h1..h6 { font-size: inherit; font-weight: inherit } — loaded after
// globals.css it flattened every plain heading in the app to body text.
import "@neondatabase/auth-ui/css";
import "../styles/globals.css";

/* Loaded through next/font rather than an @import in globals.css. An @import
   must come before every other rule, and globals.css is now bundled after the
   auth-ui stylesheet, so the font @import landed mid-file and was ignored —
   which is why headings fell back. This also self-hosts the files, so no
   request reaches Google and there is no layout shift. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

const body = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

/* The defaults every page inherits. A page sets only its own title, and the
   template adds the name, so "Plans" becomes "Plans — SpeakGen" without each
   page spelling it; the home page opts out with an absolute title. The icons
   and manifest come from their file conventions beside this file.

   Open Graph and Twitter carry only what is true of every page — the site's
   name, type and locale. A title or URL here is inherited by every page that
   does not set its own, so every link preview would read as the home page;
   without one, chat apps and social sites fall back to the page's own title
   and description, which is what they should show. */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    template: `%s — ${SITE_NAME}`,
    default: `${SITE_NAME} — Cambridge speaking exam practice`
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB"
  },
  twitter: {
    card: "summary"
  }
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        <Providers>
          <StyledComponentsRegistry>
            {/* A column the height of the viewport, so main can take the
                slack and the footer sits at the bottom of a short page
                instead of halfway up it. */}
            <div className="app-shell">
              <Navbar />
              <main>{children}</main>
              <Footer />
              <ConsentBanner />
            </div>
            <SiteAnalytics />
            {/* <BackgroundToggle /> */}
          </StyledComponentsRegistry>
        </Providers>
      </body>
    </html>
  );
}
