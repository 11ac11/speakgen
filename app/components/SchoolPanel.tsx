"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { authClient } from "@/lib/auth-client";

const Panel = styled.div`
  width: 100%;
  max-width: 680px;
  padding: 1.75rem;
  border-radius: 1rem;
  color: var(--text-body);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--verylightgrey);
  font-size: var(--text-base);

  &:last-of-type {
    border-bottom: none;
  }

  span {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
`;

const Field = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;

  input {
    flex: 1;
    min-width: 220px;
    font-family: inherit;
    font-size: var(--text-base);
    color: var(--text-body);
    background: #fff;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--verylightgrey);
    border-radius: 0.5rem;
  }
`;

const Link = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  background: #f3f7f1;
  border: 1px solid var(--verylightgrey);
  font-size: var(--text-xs);
  word-break: break-all;
  color: var(--text-body);
`;

const Error = styled.p`
  color: var(--danger);
  font-size: var(--text-sm);
`;

export type SchoolMember = {
  user_id: string;
  name: string;
  email: string;
  role: string;
};

export default function SchoolPanel({
  school,
  members,
  seats,
  canAdmin,
  origin
}: {
  school: { id: string; name: string } | null;
  members: SchoolMember[];
  seats: { used: number; seats: number; pending: number };
  canAdmin: boolean;
  origin: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const createSchool = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const slug = `${name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
      const res = await authClient.organization.create({
        name: name.trim(),
        slug
      });
      if (res.error) {
        setError(res.error.message ?? "Could not create the school");
        return;
      }
      window.location.reload();
    } catch {
      setError("Could not create the school");
    } finally {
      setBusy(false);
    }
  };

  const invite = async () => {
    if (!school || !email.trim()) return;
    setBusy(true);
    setError(null);
    setInviteLink(null);
    try {
      const res = await authClient.organization.inviteMember({
        organizationId: school.id,
        email: email.trim(),
        role: "member"
      });
      if (res.error) {
        // The seat limit comes back as a 402 from our own proxy.
        setError(res.error.message ?? "Could not invite that teacher");
        return;
      }
      const id = (res.data as { id?: string })?.id;
      if (id) setInviteLink(`${origin}/school/join?invitation=${id}`);
      setEmail("");
    } catch {
      setError("Could not invite that teacher");
    } finally {
      setBusy(false);
    }
  };

  if (!school) {
    return (
      <Panel className="glass">
        <h2>Your school</h2>
        <p style={{ fontSize: "var(--text-base)" }}>
          Create a school to share a question bank with colleagues. Content
          written by anyone in the school belongs to the school, so it stays
          when a teacher moves on. Adding teachers needs an Academy
          subscription.
        </p>
        <Field>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="St Mary's Language Academy"
            maxLength={80}
          />
          <Button
            text={busy ? "Creating…" : "Create school"}
            disabled={busy || !name.trim()}
            onClick={createSchool}
          />
        </Field>
        {error ? <Error>{error}</Error> : null}
      </Panel>
    );
  }

  return (
    <Panel className="glass">
      <h2>{school.name}</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
        {seats.seats === 0
          ? "No seats. An Academy subscription is needed to add teachers."
          : `${seats.used} of ${seats.seats} seats used${
              seats.pending ? ` (${seats.pending} invited)` : ""
            }.`}
      </p>

      {members.map((member) => (
        <Row key={member.user_id}>
          <div>
            <div>{member.name}</div>
            <span>{member.email}</span>
          </div>
          <span>{member.role}</span>
        </Row>
      ))}

      {canAdmin ? (
        <>
          <Field>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.example"
              type="email"
            />
            <Button
              text={busy ? "Inviting…" : "Invite teacher"}
              disabled={busy || !email.trim()}
              onClick={invite}
            />
          </Field>
          {error ? <Error>{error}</Error> : null}
          {inviteLink ? (
            <Link>
              <strong>Send this link to the teacher.</strong>
              <div style={{ marginTop: "0.35rem" }}>{inviteLink}</div>
            </Link>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}
