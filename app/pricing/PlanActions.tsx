"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui";
import { authClient } from "@/lib/auth-client";

/* Academy is bought by a school, so a teacher with no school names one here
   and carries straight on to checkout, rather than being sent to Settings to
   make it and back again to buy. */
const SchoolStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1.25rem;

  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-body);
  }

  /* Full width, like the Monthly and Yearly buttons it replaces. */
  > div,
  button {
    width: 100%;
  }
`;

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
  // Set when checkout said there is no school yet: the interval they chose,
  // so creating the school can carry on to the checkout they asked for.
  const [needsSchool, setNeedsSchool] = useState<"month" | "year" | null>(null);
  const [schoolName, setSchoolName] = useState("");

  /* Nothing at all: the card says so with a badge in its corner and a green
     border, which is both louder and out of the way. This used to print "Your
     current plan" where the buttons go, at the bottom of the tallest column. */
  if (currentPlan === plan) return null;

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
        if (body.reason === "no_school") {
          setNeedsSchool(interval);
          return;
        }
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

  /* The same slug scheme SchoolPanel uses: readable, and unique because of
     the timestamp rather than because anybody checked. */
  const createSchoolAndContinue = async () => {
    if (!needsSchool || !schoolName.trim()) return;
    setBusy("school");
    setError(null);
    try {
      const name = schoolName.trim();
      const slug = `${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
      const res = await authClient.organization.create({ name, slug });
      if (res.error) {
        setError(res.error.message ?? "Could not create the school");
        setBusy(null);
        return;
      }
      await start(needsSchool);
    } catch {
      setError("Could not create the school");
      setBusy(null);
    }
  };

  if (plan === "academy" && needsSchool) {
    return (
      <>
        <SchoolStep>
          <p>
            Academy is bought for a school. Name yours and you will go straight
            on to checkout.
          </p>
          <Input
            type="text"
            label="School name"
            value={schoolName}
            onChange={setSchoolName}
            placeholder="St Mary's Language Academy"
            maxLength={80}
          />
          <Button
            text={
              busy === "school" ? "Creating…" : "Create school and continue"
            }
            disabled={busy !== null || !schoolName.trim()}
            onClick={createSchoolAndContinue}
          />
          <Button
            text="Back"
            secondary
            disabled={busy !== null}
            onClick={() => setNeedsSchool(null)}
          />
        </SchoolStep>
        {error ? (
          <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
            {error}
          </p>
        ) : null}
      </>
    );
  }

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
        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      ) : null}
    </>
  );
}
