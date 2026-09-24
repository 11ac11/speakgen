"use client";

import React from "react";
import styled from "styled-components";

/**
 * Credit for the photographs, as Pexels' API guidelines ask: a prominent link
 * to Pexels wherever its photographs are fetched, and "Photo by <name> on
 * Pexels" on each photograph where possible, linking to the photographer and
 * to the photograph's own page.
 *
 * The links open in a new tab, so following one in the middle of an exam does
 * not throw the runner away.
 */

export type CreditedPhoto = {
  photographer?: string | null;
  photographer_url?: string | null;
  url?: string | null;
};

export const PEXELS_URL = "https://www.pexels.com";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/* On the photograph: a small dark tab in the corner, which reads on any
   picture and stays out of the way of what the candidate is describing. */
const Overlay = styled.span`
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  z-index: 1;
  max-width: calc(100% - 1rem);
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: var(--text-xs);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    color: #fff;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    color: #fff;
  }
`;

/* Under the photograph, for the form and the previews. */
const Caption = styled.span`
  display: block;
  margin-top: 0.3rem;
  font-size: var(--text-xs);
  color: var(--text-faint);
  line-height: 1.4;

  a {
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    color: var(--green-600);
  }
`;

export function PhotoCredit({
  photo,
  variant = "caption"
}: {
  photo: CreditedPhoto | null | undefined;
  variant?: "overlay" | "caption";
}) {
  if (!photo?.photographer) return null;

  const Frame = variant === "overlay" ? Overlay : Caption;

  return (
    <Frame>
      {"Photo by "}
      {photo.photographer_url ? (
        <a href={photo.photographer_url} {...external}>
          {photo.photographer}
        </a>
      ) : (
        photo.photographer
      )}
      {" on "}
      <a href={photo.url || PEXELS_URL} {...external}>
        Pexels
      </a>
    </Frame>
  );
}

const Provided = styled.a`
  display: inline-block;
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(--green-600);
  }
`;

/** "Photos provided by Pexels", the link their guidelines require. */
export function PexelsLink({ className }: { className?: string }) {
  return (
    <Provided href={PEXELS_URL} {...external} className={className}>
      Photos provided by Pexels
    </Provided>
  );
}
