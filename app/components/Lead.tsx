"use client";

import styled from "styled-components";

/**
 * The one muted line under a page title.
 *
 * It lived in Prose, which made it look like a long-form thing, so the pages
 * that are not long-form each wrote it out again: `style={{ color:
 * "var(--text-muted)" }}` on Plans, on both practices pages, on the random
 * question page. Five copies of one declaration, and the two that were missed —
 * the exam listings — came out in full black body text against everything else.
 *
 * globals.css gives every p the body colour explicitly, so this is not
 * something a parent can set once and have inherited; it has to be said on the
 * element. Saying it in one place is the point of this file.
 *
 * The bottom margin is part of it: a lead line is separated from what follows
 * by more than a paragraph break, because what follows is usually the page
 * proper rather than the next sentence.
 */
export const Lead = styled.p`
  color: var(--text-muted);
  margin: 0 0 2.5rem;
`;

export default Lead;
