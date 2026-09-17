"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;

  /* The redesigned buttons are taller, so a pair wraps inside a plan card.
     Stretching them keeps the stack tidy instead of leaving ragged widths. */
  > * {
    flex: 1 1 140px;
  }

  button {
    width: 100%;
  }
`;

const Current = styled.div`
  margin-top: 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--leafgreen);
`;

export default function PlanActions({
  plan,
  currentPlan,
  signedIn,
  billingEnabled
}: {
  plan: "free" | "pro" | "academy";
  currentPlan: string | null;
  signedIn: boolean;
  billingEnabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (currentPlan === plan) return <Current>Your current plan</Current>;

  if (plan === "free") {
    return signedIn ? null : (
      <Row>
        <Button
          text="Create a free account"
          onClick={() => router.push("/signup")}
        />
      </Row>
    );
  }

  // Academy needs seats and an organisation, which do not exist yet.
  if (plan === "academy") {
    return (
      <Row>
        <Button text="Not available yet" disabled onClick={() => undefined} />
      </Row>
    );
  }

  const start = async (interval: "month" | "year") => {
    if (!signedIn) {
      router.push("/signup");
      return;
    }
    setBusy(interval);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval })
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not start checkout");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Could not start checkout");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Row>
        <Button
          text={busy === "month" ? "Opening…" : "Monthly"}
          disabled={!billingEnabled || busy !== null}
          onClick={() => start("month")}
        />
        <Button
          text={busy === "year" ? "Opening…" : "Yearly"}
          secondary
          disabled={!billingEnabled || busy !== null}
          onClick={() => start("year")}
        />
      </Row>
      {error ? (
        <p style={{ color: "#b3261e", fontSize: "0.85rem" }}>{error}</p>
      ) : null}
    </>
  );
}
