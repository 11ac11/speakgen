"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { authClient } from "@/lib/auth-client";

const Card = styled.div`
  width: 100%;
  max-width: 460px;
  padding: 2rem;
  border-radius: 1rem;
  color: var(--text-body);
`;

export default function JoinSchool({
  invitationId,
  schoolName
}: {
  invitationId: string;
  schoolName: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.organization.acceptInvitation({
        invitationId
      });
      if (res.error) {
        setError(res.error.message ?? "Could not join the school");
        return;
      }
      // A full navigation, so server components re-read the new membership.
      window.location.href = "/dashboard?tab=settings";
    } catch {
      setError("Could not join the school");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="glass">
      <h1 style={{ marginTop: 0, fontSize: "1.3rem" }}>
        {schoolName ? `Join ${schoolName}` : "Join a school"}
      </h1>
      <p style={{ fontSize: "var(--text-base)" }}>
        Joining gives you the school&apos;s shared question bank and its plan.
        Anything you write from then on belongs to the school as well as to you.
      </p>
      {error ? (
        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      ) : null}
      <div style={{ marginTop: "1.5rem" }}>
        <Button
          text={busy ? "Joining…" : "Join"}
          disabled={busy}
          onClick={accept}
        />
      </div>
    </Card>
  );
}
