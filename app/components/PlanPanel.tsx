"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import WaitlistButton from "@/app/components/Waitlist";

const Panel = styled.div`
  width: 100%;
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

/* Green, not amber: nothing is wrong, and the suggestion saves them money. */
const Nudge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0 0 1.5rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius-control);
  background: var(--green-tint);
  border: 1px solid var(--green-edge);

  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-body);
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
    /** Set when the plan is a school's Academy subscription. */
    schoolName?: string | null;
    /** False for a teacher covered by their school, who cannot cancel it. */
    canManage?: boolean;
    /**
     * They still pay for their own Pro, though their school's Academy covers
     * everything it does: the panel suggests cancelling it.
     */
    ownPlanCoveredBySchool?: boolean;
  };
  /**
   * While paid plans are not on sale the waitlist replaces the upgrade
   * buttons, and any paid plan in force is a free pilot set up by hand.
   */
  waitlist: { mode: boolean; joined: boolean; bonusAvailable: boolean };
};

function limitText(used: number, limit: number | null) {
  return limit === null ? `${used} · unlimited` : `${used} of ${limit}`;
}

export default function PlanPanel({
  plan,
  usage,
  billing,
  waitlist
}: PlanPanelProps) {
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

  /* "personal" opens the teacher's own subscription even when their school's
     is the one in force, which is the point of the nudge below. */
  const manage = async (scope: "effective" | "personal" = "effective") => {
    setBusy(scope === "personal" ? "personal" : "portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope })
      });
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
  const coveredBySchool = Boolean(billing.schoolName) && !billing.canManage;
  const forSchool = billing.schoolName ? ` for ${billing.schoolName}` : "";

  return (
    <Panel className="glass">
      <PlanName>{plan}</PlanName>
      <Meta>
        {isFree
          ? "You are on the free plan."
          : waitlist.mode
            ? `A free pilot of ${plan === "academy" ? "Academy" : "Pro"}${forSchool}${
                billing.renewsAt ? `, until ${billing.renewsAt}` : ""
              }.`
            : coveredBySchool
              ? `Covered by ${billing.schoolName}'s Academy plan. Its owner or an admin manages billing.`
              : billing.cancelAtPeriodEnd
                ? `Cancels on ${billing.renewsAt ?? "the end of the period"}.`
                : `Billed ${billing.interval === "year" ? "yearly" : "monthly"}${forSchool}${
                    billing.renewsAt ? `, renews ${billing.renewsAt}` : ""
                  }.`}
      </Meta>

      {billing.ownPlanCoveredBySchool ? (
        <Nudge>
          <p>
            {`${billing.schoolName}'s Academy plan now covers you, and it includes everything Pro does. You are still paying for your own Pro — cancel it to stop being charged twice.`}
          </p>
          <Button
            text={busy === "personal" ? "Opening…" : "Cancel my Pro"}
            secondary
            disabled={busy !== null}
            onClick={() => manage("personal")}
          />
        </Nudge>
      ) : null}

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
        {isFree && waitlist.mode ? (
          <WaitlistButton
            plan="pro"
            trigger="settings"
            signedIn
            joined={waitlist.joined}
            bonusAvailable={waitlist.bonusAvailable}
            text="Join the Pro waitlist"
          />
        ) : isFree ? (
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
        ) : coveredBySchool || !billing.enabled ? null : (
          <Button
            text={busy === "portal" ? "Opening…" : "Manage or cancel"}
            disabled={busy !== null}
            onClick={() => manage()}
          />
        )}
        <Button
          text="Compare plans"
          secondary
          onClick={() => router.push("/pricing")}
        />
      </div>

      {waitlist.mode ? (
        isFree ? (
          <Notice>
            {waitlist.joined
              ? "Pro and Academy are not on sale yet. You are on the waitlist, and we will tell you when they open."
              : waitlist.bonusAvailable
                ? "Pro and Academy are not on sale yet. Joining the waitlist adds an extra saved exam to your free account."
                : "Pro and Academy are not on sale yet. Join the waitlist to hear when they open."}
          </Notice>
        ) : null
      ) : !billing.enabled ? (
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
