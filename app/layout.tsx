"use client";

import React from "react";
import "../styles/globals.css";
import StyledComponentsRegistry from "../lib/registry";
import Navbar from "@/app/components/Nav";
import BackgroundToggle from "@/app/components/BackgroundToggle";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en">
        <body>
          <StyledComponentsRegistry>
            <Navbar />
            <main>{children}</main>
            {/* <BackgroundToggle /> */}
          </StyledComponentsRegistry>
        </body>
      </html>
    </SessionProvider>
  );
}
