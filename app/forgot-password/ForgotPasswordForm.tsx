"use client";

import React, { useState } from "react";
import Link from "next/link";
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

/**
 * Step one of a password reset: ask Neon Auth to email a link.
 *
 * The app sends nothing itself. request-password-reset is proxied through to
 * the auth service, which owns the token and the mail — which is why this works
 * while the contact page still has no provider of its own. `redirectTo` is the
 * page the emailed link lands on, and the service appends the token to it.
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !email) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          /* Built from the live origin rather than a configured base URL: this
             has to be the host the person is actually on, or the link in their
             inbox sends them to a different deployment than the one they asked
             from. */
          redirectTo: `${window.location.origin}/reset-password`
        })
      });

      /* Anything other than a network or server failure is a success as far as
         this page is concerned. The endpoint answers the same way whether or
         not the address has an account — deliberately, because a form that says
         "no such user" is a form that will tell anyone who asks which of your
         teachers has signed up. */
      if (res.status >= 500) {
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthContainer>
        <Heading>Check your email</Heading>
        <Sub>{`If an account exists for ${email}, a link to set a new password is on its way.`}</Sub>
        <Confirmation>
          <p>The link works once, and expires after a short while.</p>
          <p>
            Nothing arrived? Check the spam folder, or try again with another
            address.
          </p>
        </Confirmation>
        <Alt>
          <Link href="/login">Back to log in</Link>
        </Alt>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <Heading>Forgotten your password?</Heading>
      <Sub>
        Give us the address you signed up with and we will email you a link to
        set a new one.
      </Sub>

      <AuthForm onSubmit={submit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (error) setError("");
          }}
          required
          minLength={3}
          maxLength={254}
          placeholder="Enter your Email"
        />
        <Button
          onClick={() => undefined}
          text={submitting ? "Sending..." : "Email me a link"}
          type="submit"
          width="100%"
          disabled={submitting || !email}
        />
        {error && <FormError role="alert">{error}</FormError>}
      </AuthForm>

      <Alt>
        {"Remembered it? "}
        <Link href="/login">Log in</Link>
      </Alt>
    </AuthContainer>
  );
}
