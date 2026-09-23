"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";

const Card = styled.div`
  width: 100%;
  max-width: 460px;
  padding: 2rem;
  border-radius: 1rem;
  color: var(--text-body);
`;

const Banner = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid #f0c98a;
  background: #fff8ec;
  font-size: var(--text-sm);
  margin-bottom: 1.5rem;
`;

export default function DummyPortal({
  returnUrl,
  schoolName
}: {
  returnUrl: string;
  /** Set when the plan being managed is a school's Academy subscription. */
  schoolName?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/dummy/cancel", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not cancel");
        return;
      }
      window.location.href = returnUrl;
    } catch {
      setError("Could not cancel");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="glass">
      <Banner>
        <strong>Simulated billing portal.</strong> A real provider hosts this
        page, where a customer changes their card or cancels.
      </Banner>

      <h1 style={{ fontSize: "1.3rem", marginTop: 0 }}>Manage your plan</h1>
      <p style={{ fontSize: "var(--text-base)" }}>
        {schoolName
          ? `Cancelling returns every teacher at ${schoolName} to their own plan immediately, and turns off its branding. The school's questions, exams and practices are kept.`
          : "Cancelling returns you to the free plan immediately. Your questions are kept; exams beyond the free limit stay saved but you will not be able to create more until you are under it."}
      </p>

      {error ? (
        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Button
          text={busy ? "Cancelling…" : "Cancel subscription"}
          disabled={busy}
          onClick={cancel}
        />
        <Button
          text="Back"
          secondary
          onClick={() => {
            window.location.href = returnUrl;
          }}
        />
      </div>
    </Card>
  );
}
