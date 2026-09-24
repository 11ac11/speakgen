"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { AD_CONSENT_COOKIE, isAdFreePath } from "@/lib/ads";

// The bar is fixed, so without this the last of the page sits underneath it and
// cannot be scrolled into view. Caught by looking at the exam builder, where it
// covered a whole slot.
const Spacer = styled.div`
  height: 96px;

  @media only screen and (max-width: 768px) {
    height: 150px;
  }
`;

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid var(--verylightgrey);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.08);
  color: var(--text-body);

  p {
    margin: 0;
    max-width: 620px;
    font-size: var(--text-sm);
    line-height: 1.5;
  }
`;

export default function ConsentBannerUI() {
  const router = useRouter();
  const pathname = usePathname();

  const choose = (value: "granted" | "denied") => {
    document.cookie = `${AD_CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    // Server components decide whether an ad renders, so they have to re-run.
    router.refresh();
  };

  // Asked here rather than in the server component, which renders in the root
  // layout and cannot see the path.
  if (isAdFreePath(pathname)) return null;

  return (
    <>
      <Spacer aria-hidden />
      <Bar role="region" aria-label="Advertising consent">
        <p>
          We would like to show ads on some pages to keep the free plan free.
          May we? Paid plans never show ads, and you can change your mind later.{" "}
          <Link href="/cookies">About cookies</Link>
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button text="Allow ads" onClick={() => choose("granted")} />
          <Button text="No thanks" secondary onClick={() => choose("denied")} />
        </div>
      </Bar>
    </>
  );
}
