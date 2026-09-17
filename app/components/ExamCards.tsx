"use client";

import Link from "next/link";
import styled from "styled-components";

export const ExamList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
`;

// globals.css sets `a:hover { color: white }`, which is invisible against the
// near-white card. The whole card is the link here, so the rule has to be
// overridden rather than worked around.
export const ExamCard = styled(Link)`
  display: block;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: var(--text-body);
  transition: box-shadow 0.2s ease;

  &:hover,
  &:active,
  &:focus-visible {
    color: var(--text-body);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
  }
`;

/* A heading, not bold text: each card is a titled thing in a list, and a
   screen reader should be able to move between them. */
export const ExamTitle = styled.h3`
  font-size: var(--text-lg);
  color: var(--text-heading);
  margin: 0;
`;

export const ExamMeta = styled.div`
  margin-top: 0.4rem;
  color: var(--text-muted);
`;

export const BackLink = styled(Link)`
  font-size: var(--text-sm);
  color: var(--text-muted);

  &:hover,
  &:active {
    color: var(--text-body);
  }
`;

/**
 * A link styled as a secondary button. A real <a>, not a <button>, because it
 * navigates — but it carries the same shape, depth and lift so it does not
 * read as a stray box beside the designed controls.
 */
export const ExamsLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-control);
  border: 1.5px solid var(--green-edge);
  background: #fff;
  color: var(--green-600);
  font-size: var(--text-base);
  font-weight: 500;
  box-shadow: 0 3px 0 0 #e4ebe2;
  transition:
    transform 0.12s var(--lift),
    box-shadow 0.12s ease,
    background-color 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    color: var(--green-600);
    background: var(--green-tint);
    border-color: var(--leafgreen);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 0 #e4ebe2;
  }

  &:active {
    color: var(--green-600);
    transform: translateY(1px);
    box-shadow: 0 1px 0 0 #e4ebe2;
  }
`;
