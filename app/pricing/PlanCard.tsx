"use client";

import styled from "styled-components";

/**
 * The plan cards, laid out so that the same feature sits on the same line in
 * every column.
 *
 * It did not before, and the reason was not the feature list: it was everything
 * above it. Free's one-line blurb wraps to two at this width while Pro's does
 * not, so Free's list started a line lower and every row after it was off by
 * one. Padding the blurb to a fixed height would fix today's copy and break on
 * the next edit.
 *
 * So the grid owns the rows and the cards borrow them. The container declares
 * one row per band — name, price, yearly, blurb, one per feature, actions — and
 * each card is a subgrid spanning all of them, which means a row is exactly as
 * tall as the tallest card needs and every card agrees on where it starts. Add
 * a feature and the rows follow; rewrite a blurb and nothing shifts.
 */
export const PlanGrid = styled.div<{ $rows: number }>`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-template-rows: repeat(${(p) => p.$rows}, auto);
  align-items: start;
`;

export const Card = styled.div<{ $current: boolean }>`
  position: relative;
  display: grid;
  /* Spans every row the container declared, and takes its row sizes from it. */
  grid-row: 1 / -1;
  grid-template-rows: subgrid;
  padding: 1.5rem;
  border-radius: var(--radius-card);

  /* Always two pixels, transparent when this is not your plan: a border that
     appears on one card would make that card a different size from the others
     and knock the columns out of true. */
  border: 2px solid ${(p) => (p.$current ? "var(--green-600)" : "transparent")};
`;

/* The badge sits in the corner rather than under the price, where the words
   "Your current plan" used to be: that put the one thing you want to find at a
   glance at the bottom of the tallest column. */
export const CurrentBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-pill);
  background: var(--green-600);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

export const PlanName = styled.h2<{ $current: boolean }>`
  font-size: var(--text-lg);
  text-transform: capitalize;
  margin: 0;
  /* Clear of the badge, so "Academy" does not run under it in a narrow
     column. */
  padding-right: ${(p) => (p.$current ? "7rem" : "0")};
`;

export const Price = styled.div`
  font-size: var(--text-3xl);
  font-weight: 600;
  margin: 0.5rem 0 0.1rem;
  color: var(--text-body);

  span {
    font-size: var(--text-sm);
    font-weight: 400;
  }
`;

export const Yearly = styled.div`
  color: var(--text-muted);
  font-size: var(--text-sm);
`;

export const Blurb = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 1rem 0;
`;

export const Features = styled.ul<{ $rows: number }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  /* One card row per feature, taken from the card's subgrid, so row three of
     this list is row three of every other list on the page. */
  grid-row: span ${(p) => p.$rows};
  grid-template-rows: subgrid;
`;

export const Feature = styled.li<{ $on: boolean }>`
  display: grid;
  grid-template-columns: 1.1rem 1fr;
  gap: 0.55rem;
  align-items: start;
  font-size: var(--text-sm);
  line-height: 1.6;
  padding: 0.2rem 0;
  /* What you do not get is still worth reading — it is half the reason to
     compare — but it should not compete with what you do. */
  color: ${(p) => (p.$on ? "var(--text-body)" : "var(--text-muted)")};

  svg {
    width: 1.1rem;
    height: 1.1rem;
    margin-top: 0.22rem;
    flex: none;
  }
`;

const Actions = styled.div`
  /* Bottom of the card whatever the rows above did. */
  align-self: end;
`;

export { Actions };

/* Two icons rather than colour alone: red and green at this size are the
   classic pair to lose to colour blindness, and a tick and a cross differ in
   shape as well. aria-hidden because the row's own words already say it —
   "No ads" and "Includes ads" are not the same sentence with a different
   icon. */
export function Tick() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="var(--green-tint)" />
      <path
        d="M6 10.4l2.6 2.6L14 7.6"
        stroke="var(--green-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Cross() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="rgba(198, 64, 47, 0.1)" />
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="var(--danger)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
