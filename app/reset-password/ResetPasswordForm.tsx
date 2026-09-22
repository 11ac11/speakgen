"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input, Button } from "@/app/components/ui/index";
import {
  Alt,
  AuthContainer,
  AuthForm,
  Confirmation,
  FormError,
  Heading,
  Sub
} from "@/app/components/AuthShell";

/* What the auth service sends back, turned into something worth reading. The
   codes are its own; the wording is ours, because "INVALID_TOKEN" is true and
   useless when what you need to know is that the link has expired and where to
   get another. */
function messageFor(code: string | undefined, fallback: string) {
  switch (code) {
    case "INVALID_TOKEN":
      return "This link has expired or has already been used. Ask for a new one below.";
    case "PASSWORD_TOO_SHORT":
      return "That password is too short. Use at least 8 characters.";
    case "PASSWORD_TOO_LONG":
      return "That password is too long.";
    default:
      return fallback;
  }
}

/* Long enough to be worth having, short enough that nobody is fighting the
   form. The service enforces its own minimum and will refuse anything under
   it; checking here only saves a round trip and a confusing error. */
const MIN_LENGTH = 8;

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = !!confirm && password !== confirm;
  const tooShort = !!password && password.length < MIN_LENGTH;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !token) return;

    if (tooShort) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (mismatch) {
      setError("The two passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          messageFor(
            body?.code,
            body?.message ?? "Could not set that password."
          )
        );
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  /* No token means the link was truncated on its way through a mail client, or
     somebody found this page on its own. Either way there is nothing to submit,
     so the form is not drawn at all rather than drawn and refused. */
  if (!token) {
    return (
      <AuthContainer>
        <Heading>This link is incomplete</Heading>
        <Sub>
          A password reset link carries a one-time code, and this one arrived
          without it. Mail clients sometimes cut long links in half.
        </Sub>
        <Alt>
          <Link href="/forgot-password">Ask for a new link</Link>
        </Alt>
      </AuthContainer>
    );
  }

  if (done) {
    return (
      <AuthContainer>
        <Heading>Password changed</Heading>
        <Sub>You can log in with your new password now.</Sub>
        <Confirmation>
          <p>Anywhere you were already signed in may need signing in again.</p>
        </Confirmation>
        <Alt>
          <Link href="/login">Go to log in</Link>
        </Alt>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <Heading>Set a new password</Heading>
      <Sub>Pick something you have not used here before.</Sub>

      <AuthForm onSubmit={submit}>
        <Input
          label="New password"
          name="password"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (error) setError("");
          }}
          required
          minLength={MIN_LENGTH}
          maxLength={128}
          error={
            tooShort ? `Use at least ${MIN_LENGTH} characters.` : undefined
          }
        />
        <Input
          label="Confirm new password"
          name="password2"
          type="password"
          value={confirm}
          onChange={(value) => {
            setConfirm(value);
            if (error) setError("");
          }}
          required
          minLength={MIN_LENGTH}
          maxLength={128}
          error={mismatch ? "The two passwords do not match." : undefined}
        />
        <Button
          onClick={() => undefined}
          text={submitting ? "Saving..." : "Set new password"}
          type="submit"
          width="100%"
          disabled={submitting || !password || !confirm || mismatch || tooShort}
        />
        {error && <FormError role="alert">{error}</FormError>}
      </AuthForm>

      <Alt>
        {"Link expired? "}
        <Link href="/forgot-password">Ask for a new one</Link>
      </Alt>
    </AuthContainer>
  );
}
