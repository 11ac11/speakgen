"use client";

import React from "react";
import styled from "styled-components";
import type { AdPlacement } from "@/lib/ads";

const Frame = styled.div`
  width: 100%;
  max-width: 728px;
  min-height: 90px;
  margin: 0 auto;
  border-radius: 0.75rem;
  border: 1px dashed var(--verylightgrey);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--text-xs);
  text-align: center;
  padding: 1rem;
`;

const Wrap = styled.div`
  margin: 2rem auto 0;
  width: 100%;
`;

const Label = styled.div`
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 0.3rem;
`;

/**
 * Presentation only. Whether this viewer, this plan and this placement may
 * carry an ad, and whether consent was given, are all decided in AdSlot on the
 * server — so the decision cannot be changed from the browser and there is no
 * flash of an ad slot appearing after hydration.
 */
export default function AdUnit({
  placement,
  clientId
}: {
  placement: AdPlacement;
  clientId: string | null;
}) {
  return (
    <Wrap>
      <Label>Advertisement</Label>
      {clientId ? (
        <Frame data-ad-client={clientId} data-ad-placement={placement}>
          {/* A real network's script mounts here. */}
        </Frame>
      ) : (
        <Frame data-ad-placement={placement}>
          {`Ad placeholder (${placement}). No ad network is configured.`}
        </Frame>
      )}
    </Wrap>
  );
}
