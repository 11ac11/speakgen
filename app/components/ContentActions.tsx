"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import SharePanel from "@/app/components/SharePanel";
import LinkIcon from "@/app/components/ui/LinkIcon";
import TickIcon from "@/app/components/ui/TickIcon";

/**
 * The one action on an exam's or a practice's own page: handing it to a class.
 *
 * The page is a runner, put on a screen in front of a room, so it carries
 * nothing a teacher does at a desk. Editing and exporting live on the card's
 * menu in the dashboard; sharing stays here too, because a teacher who has
 * just opened an exam to run it is often the one about to send a class the
 * link to it.
 */

const Panel = styled.div`
  width: 100%;
  margin-top: 1rem;
  padding: 1.1rem 1.25rem;
  border-radius: var(--radius-card);
`;

export default function ContentActions({
  kind,
  id,
  initialSharePath
}: {
  kind: "exam" | "practice";
  id: number;
  initialSharePath: string | null;
}) {
  const [sharePath, setSharePath] = useState(initialSharePath);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* The same words and icon as the badge on the dashboard card. */}
      <Button
        text={sharePath ? "Share link active" : "Share"}
        icon={sharePath ? <LinkIcon /> : undefined}
        iconAfter={sharePath ? <TickIcon /> : undefined}
        secondary
        onClick={() => setOpen((value) => !value)}
      />

      {open ? (
        <Panel className="glass">
          <SharePanel
            kind={kind}
            id={id}
            initialPath={sharePath}
            onChange={setSharePath}
          />
        </Panel>
      ) : null}
    </>
  );
}
