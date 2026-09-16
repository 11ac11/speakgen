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
  color: var(--slategrey);
  transition: box-shadow 0.2s ease;

  &:hover,
  &:active,
  &:focus-visible {
    color: var(--slategrey);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
  }
`;

export const ExamTitle = styled.strong`
  font-size: 1.2rem;
  color: var(--slategrey);
`;

export const ExamMeta = styled.div`
  margin-top: 0.4rem;
  color: var(--lightgrey);
`;

export const BackLink = styled(Link)`
  font-size: 0.9rem;
  color: var(--lightgrey);

  &:hover,
  &:active {
    color: var(--slategrey);
  }
`;
