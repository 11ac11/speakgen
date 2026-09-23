"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  color: var(--text-body);
`;

const Line = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--verylightgrey);

  &:last-of-type {
    border-bottom: none;
    font-weight: 600;
    font-size: var(--text-lg);
  }
`;

export default function DummyCheckout({
  intent,
  planLabel,
  intervalLabel,
  amount,
  schoolName,
  seats
}: {
  intent: string;
  planLabel: string;
  intervalLabel: string;
  amount: string;
  /** Who is billed, for a school's Academy purchase. */
  schoolName?: string | null;
  seats?: number | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/dummy/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent })
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Simulated payment failed");
        return;
      }
      // A full navigation, so the server components re-read the new plan.
      window.location.href = body.redirect ?? "/settings";
    } catch {
      setError("Simulated payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="glass">
      <Banner>
        <strong>Simulated checkout.</strong> No card is collected and nothing is
        charged. This exists so the billing flow can be finished before a
        provider is chosen.
      </Banner>

      <h1 style={{ fontSize: "1.3rem", marginTop: 0 }}>Confirm your plan</h1>

      <Line>
        <span>Plan</span>
        <span>{planLabel}</span>
      </Line>
      {schoolName ? (
        <Line>
          <span>School</span>
          <span>{schoolName}</span>
        </Line>
      ) : null}
      {seats ? (
        <Line>
          <span>Teachers</span>
          <span>{`Up to ${seats}`}</span>
        </Line>
      ) : null}
      <Line>
        <span>Billing</span>
        <span>{intervalLabel}</span>
      </Line>
      <Line>
        <span>Due today</span>
        <span>{amount}</span>
      </Line>

      {error ? (
        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Button
          text={busy ? "Processing…" : "Pay"}
          disabled={busy}
          onClick={pay}
        />
        <Button
          text="Cancel"
          secondary
          onClick={() => router.push("/pricing")}
        />
      </div>
    </Card>
  );
}
