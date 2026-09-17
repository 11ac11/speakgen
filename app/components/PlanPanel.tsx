"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";

const Panel = styled.div`
  width: 100%;
  max-width: 620px;
  padding: 1.75rem;
  border-radius: 1rem;
  color: var(--text-body);
`;

const PlanName = styled.div`
  font-size: var(--text-2xl);
  font-weight: 600;
  text-transform: capitalize;
  margin: 0 0 0.2rem;
`;

const Meta = styled.div`
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: 1.5rem;
`;

const UsageRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--verylightgrey);
  font-size: var(--text-base);

  &:last-of-type {
    border-bottom: none;
  }

  span:last-child {
    color: var(--text-muted);
  }
`;

const Bar = styled.div<{ $full: boolean }>`
  height: 5px;
  border-radius: 3px;
  background: var(--verylightgrey);
  overflow: hidden;
  margin-top: 0.4rem;

  div {
    height: 100%;
    background: ${(p) => (p.$full ? "#e0894f" : "var(--leafgreen)")};
  }
`;

const Notice = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 1.25rem;
`;

export type PlanPanelProps = {
  plan: string;
  usage: {
    exams: { used: number; limit: number | null };
    practices: { used: number; limit: number | null };
  };
  billing: {
    enabled: boolean;
    simulated: boolean;
    interval: string | null;
    renewsAt: string | null;
    cancelAtPeriodEnd: boolean;
  };
};

function limitText(used: number, limit: number | null) {
  return limit === null ? `${used} · unlimited` : `${used} of ${limit}`;
}

export default function PlanPanel({ plan, usage, billing }: PlanPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (interval: "month" | "year") => {
    setBusy(interval);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", interval })
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

  const manage = async () => {
    setBusy("portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not open the billing portal");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Could not open the billing portal");
    } finally {
      setBusy(null);
    }
  };

  const isFree = plan === "free";

  return (
    <Panel className="glass">
      <PlanName>{plan}</PlanName>
      <Meta>
        {isFree
          ? "You are on the free plan."
          : billing.cancelAtPeriodEnd
            ? `Cancels on ${billing.renewsAt ?? "the end of the period"}.`
            : `Billed ${billing.interval === "year" ? "yearly" : "monthly"}${
                billing.renewsAt ? `, renews ${billing.renewsAt}` : ""
              }.`}
      </Meta>

      <UsageRow>
        <span>Questions</span>
        <span>Unlimited on every plan</span>
      </UsageRow>
      <UsageRow>
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Saved exams</span>
            <span style={{ color: "var(--text-muted)" }}>
              {limitText(usage.exams.used, usage.exams.limit)}
            </span>
          </div>
          {usage.exams.limit !== null ? (
            <Bar $full={usage.exams.used >= usage.exams.limit}>
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (usage.exams.used / usage.exams.limit) * 100
                  )}%`
                }}
              />
            </Bar>
          ) : null}
        </div>
      </UsageRow>
      <UsageRow>
        <span>Practices</span>
        <span>{limitText(usage.practices.used, usage.practices.limit)}</span>
      </UsageRow>

      {error ? (
        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginTop: "1.5rem",
          flexWrap: "wrap"
        }}
      >
        {isFree ? (
          <>
            <Button
              text={busy === "month" ? "Opening…" : "Upgrade — €5/month"}
              disabled={busy !== null}
              onClick={() => start("month")}
            />
            <Button
              text={busy === "year" ? "Opening…" : "Upgrade — €49/year"}
              secondary
              disabled={busy !== null}
              onClick={() => start("year")}
            />
          </>
        ) : (
          <Button
            text={busy === "portal" ? "Opening…" : "Manage or cancel"}
            disabled={busy !== null}
            onClick={manage}
          />
        )}
        <Button
          text="Compare plans"
          secondary
          onClick={() => router.push("/pricing")}
        />
      </div>

      {!billing.enabled ? (
        <Notice>
          Paid plans are not available to buy yet. The limits above are live.
        </Notice>
      ) : billing.simulated ? (
        <Notice>
          Checkout is simulated while a payment provider is being chosen. No
          card is collected and nothing is charged.
        </Notice>
      ) : null}
    </Panel>
  );
}
