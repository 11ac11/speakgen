"use client";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
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
          <StackProvider app={stackClientApp}>
            <StackTheme>
              <StyledComponentsRegistry>
                <Navbar />
                <main>{children}</main>
                {/* <BackgroundToggle /> */}
              </StyledComponentsRegistry>
            </StackTheme>
          </StackProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
