"use client";

import styled from "styled-components";

/**
 * The shared shell for the long-form pages — About and FAQs — which had a
 * copy of these rules each and had drifted apart.
 *
 * What it fixes, in the order it mattered:
 *
 *   The ladder.  The global h2 is --text-2xl, one step under the h1's
 *                --text-3xl. On a page whose body is --text-lg that made three
 *                sizes within a whisker of each other, so "About Speakgen" and
 *                "Why this exists" read as the same level and neither read as
 *                the title. --text-xl for a section heading puts a real gap
 *                above the body and a clearer one below the title.
 *
 *   The colour.  Body text was --text-muted, the grey meant for captions and
 *                hints, with headings in ink. Hierarchy was being carried by
 *                contrast because the sizes were too close to carry it. Body
 *                goes to --text-body and the sizes do the work; --text-muted
 *                is kept for the one lead line under the title, which is what
 *                the Plans page does and what these pages are matching.
 *
 *   The size.    The container set --text-lg on everything, so body text ran a
 *                step larger than body text everywhere else in the app and the
 *                gap up to the headings closed from both ends. It inherits the
 *                normal size now, as Plans does.
 *
 *   The measure. --page-max is 960px. At 18px that is about 110 characters a
 *                line, which is where the eye starts losing the beginning of
 *                the next one. 66ch is the same text at a readable width.
 *
 *   The weight.  Emphasis inside a paragraph was 600, the same weight as the
 *                headings, so a bolded phrase in the middle of a sentence
 *                pulled harder than the heading above it. 500 in the heading
 *                colour reads as emphasis without shouting.
 */
export const Prose = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 66ch;
  color: var(--text-body);
  line-height: 1.65;

  h1 {
    margin: 0 0 1.5rem;
  }

  h2 {
    font-size: var(--text-xl);
    color: var(--text-heading);
    /* Bound to what follows it, spaced from what came before: a heading
       belongs to its own section, and the old even margins left it floating
       between the two. */
    margin: 2.25rem 0 0.6rem;
  }

  /* The first section already has the h1's margin above it. */
  > *:first-of-type h2:first-child,
  > h2:first-of-type {
    margin-top: 0;
  }

  p {
    margin: 0 0 1.25rem;
  }

  ul {
    margin: 0 0 1.25rem;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  strong {
    font-weight: 500;
    color: var(--text-heading);
  }

  a {
    color: var(--green-600);
    font-weight: 500;
  }
`;

/** The one muted line under the page title, as on Plans. */
export const Lead = styled.p`
  color: var(--text-muted);
  margin: 0 0 2.5rem;
`;

export default Prose;
