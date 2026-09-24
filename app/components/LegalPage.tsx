"use client";

import React from "react";
import styled from "styled-components";
import { Prose } from "@/app/components/Prose";
import { Notice } from "@/app/components/ui/Notice";

/**
 * The frame the privacy policy, terms, cookie policy and data processing
 * agreement share: a title, when it was last changed, and — until a lawyer has
 * read them — a notice saying they are a draft, which is the honest thing to
 * show while the operator's details are still placeholders.
 */

const Wrap = styled(Prose)`
  padding-top: 3rem;
  padding-bottom: 3rem;

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0 1.25rem;
    font-size: var(--text-sm);
  }

  th,
  td {
    text-align: left;
    vertical-align: top;
    padding: 0.55rem 0.7rem;
    border-bottom: 1px solid var(--verylightgrey);
  }

  th {
    color: var(--text-heading);
    font-weight: 600;
  }

  td code {
    font-size: var(--text-xs);
    word-break: break-all;
  }

  /* The page's paragraph spacing is for running text, not for the draft
     notice's single line, which it left with a gap under it. */
  [role="status"] p {
    margin: 0;
  }

  /* A table of this width does not fit a phone, so it scrolls in place
     rather than pushing the page sideways. */
  .table-scroll {
    width: 100%;
    overflow-x: auto;
  }
`;

const Updated = styled.p`
  && {
    margin: -1rem 0 1.5rem;
    font-size: var(--text-sm);
    color: var(--text-faint);
  }
`;

export default function LegalPage({
  title,
  lastUpdated,
  draft,
  children
}: {
  title: string;
  lastUpdated: string;
  draft: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <Wrap>
        <h1>{title}</h1>
        <Updated>{`Last updated ${lastUpdated}`}</Updated>
        {draft ? (
          <div style={{ width: "100%", marginBottom: "0.5rem" }}>
            <Notice>
              <p>
                This is a working draft. It describes how SpeakGen handles data
                today, but it has not yet been reviewed by a lawyer and some
                details — including who operates the service — are still to be
                added.
              </p>
            </Notice>
          </div>
        ) : null}
        {children}
      </Wrap>
    </div>
  );
}
