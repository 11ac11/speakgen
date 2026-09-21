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
 *   The colour.  Body text is --text-muted, as the lead line on Plans is.
 *                That grey was a problem while the sizes were within a whisker
 *                of each other, because contrast was the only thing saying
 *                which line was a heading. With the ladder stepping properly
 *                it is just the softer colour to read a page of prose in, and
 *                headings and emphasis keep ink to sit above it.
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
  color: var(--text-muted);

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

  /* Colour and line-height are set on the elements, not inherited from the
     container: globals.css gives p and li both explicitly, and an element rule
     beats an inherited value however specific the ancestor is. Setting them
     on the container alone looked right in the file and changed nothing on
     the page. */
  p,
  li {
    color: var(--text-muted);
    line-height: 1.65;
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
