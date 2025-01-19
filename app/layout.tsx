import React from "react";
import "../styles/globals.css";
import StyledComponentsRegistry from "../lib/registry";
import Navbar from "../components/Nav";
import BackgroundToggle from "../components/BackgroundToggle";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <Navbar />
          <main>{children}</main>
        </StyledComponentsRegistry>
        <BackgroundToggle />
      </body>
    </html>
  );
}
