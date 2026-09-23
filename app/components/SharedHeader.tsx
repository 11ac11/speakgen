"use client";

import React from "react";
import styled from "styled-components";

/**
 * The top of a shared exam or practice: whose it is, and what it is.
 *
 * A student arriving from a link has not chosen this site and may not know it,
 * so the first thing they see is their school's name — or, unbranded, that a
 * teacher sent it — rather than the product's.
 */

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.9rem;
  margin-bottom: 1.25rem;
  border-bottom: 3px solid var(--green-600);

  img {
    height: 44px;
    width: auto;
    max-width: 180px;
    object-fit: contain;
  }

  strong {
    font-family: var(--font-display), sans-serif;
    font-size: var(--text-lg);
    color: var(--text-heading);
  }
`;

const Kicker = styled.p`
  margin: 0 0 0.25rem;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

export default function SharedHeader({
  branding,
  title,
  meta
}: {
  branding: { name: string; logoUrl: string | null } | null;
  title: string;
  meta: string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {branding ? (
        <Brand>
          {branding.logoUrl ? (
            // A plain img: the logo may be a data: URL in development, and a
            // blob URL next/image would need configuring for. It is small.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt="" />
          ) : null}
          <strong>{branding.name}</strong>
        </Brand>
      ) : (
        <Kicker>Shared with you by your teacher</Kicker>
      )}
      <h1 style={{ marginBottom: "0.25rem" }}>{title}</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{meta}</p>
    </div>
  );
}
