"use client";

import React from "react";
import "../styles/globals.css";
import StyledComponentsRegistry from "../lib/registry";
import Navbar from "@/app/components/Nav";
import Providers from "./providers";
import "@neondatabase/auth-ui/css";

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
            {/* <BackgroundToggle /> */}
          </StyledComponentsRegistry>
        </Providers>
      </body>
    </html>
  );
}
