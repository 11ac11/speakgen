"use client";

import React, { useState } from "react";
import styled from "styled-components";
import {
  Alt,
  AuthContainer as Container,
  AuthForm as StyledForm,
  FormError,
  Heading,
  Sub
} from "@/app/components/AuthShell";
import { Input, Button } from "@/app/components/ui/index";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import GoogleIcon from "@/public/google-icon.svg";
import { authClient } from "@/lib/auth-client";

const OrContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.9rem;
  /* Was 2rem of padding on every side, which pushed the divider away from the
     two things it divides. */
  padding: 1.35rem 0;
  color: var(--text-muted);
  font-size: var(--text-sm);
`;

const Divider = styled.div`
  height: 1px;
  background: var(--verylightgrey);
  flex: 1;
`;

const GoogleButton = styled(Button)`
  width: 100%;

  button {
    /* Same shape and depth as every other button; only the colour says
       "third party". */
    background: var(--ink);
    color: #fff;
    width: 100%;
    border-color: transparent;
    box-shadow: 0 3px 0 0 #000;
  }

  button:hover {
    background: #222c25;
    box-shadow: 0 5px 0 0 #000;
  }

  button:active {
    box-shadow: 0 1px 0 0 #000;
  }
`;

/* The auth client rejects rather than returning { error }, so a refusal has to
   be caught. It returned the shape the old code read in some versions, so both
   are handled: whichever arrives, the message is the server's own — "Invalid
   email or password", which deliberately does not say which was wrong. */
function messageFor(thrown: unknown) {
  if (thrown instanceof Error && thrown.message) return thrown.message;
  const shaped = thrown as { error?: { message?: string } };
  return shaped?.error?.message || "Unable to log in. Please try again.";
}

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl
      });

      // Kept for the version that reports rather than throws.
      if (res?.error) {
        setError(messageFor(res));
        setSubmitting(false);
        return;
      }
    } catch (thrown) {
      /* Without this the rejection was unhandled: setError was never reached,
         nothing appeared on the page, and a wrong password looked exactly like
         a click that had not registered. */
      setError(messageFor(thrown));
      setSubmitting(false);
      return;
    }

    router.push(callbackUrl); // manual redirect
  };

  const signInWithGoogle = async () => {
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      });
    } catch (thrown) {
      setError(messageFor(thrown));
    }
  };

  // A stale message sitting under the form while you retype is worse than none.
  const handleEmailChange = (newValue: string) => {
    setEmail(newValue);
    if (error) setError("");
  };

  const handlePasswordChange = (newValue: string) => {
    setPassword(newValue);
    if (error) setError("");
  };

  return (
    <Container>
      <Heading>Log in</Heading>
      <Sub>Welcome back.</Sub>
      <GoogleButton
        onClick={signInWithGoogle}
        isAsync={true}
        text="Login with Google"
        iconUrl={GoogleIcon}
      />
      <OrContainer>
        <Divider />
        <span>or</span>
        <Divider />
      </OrContainer>
      <StyledForm onSubmit={handleSubmit}>
        {/* Both fields are marked, not one: the server will not say which of
            the two was wrong, and guessing here would be a worse lie than
            colouring both. */}
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          invalid={!!error}
          required
          minLength={3}
          maxLength={254}
          placeholder="Enter your Email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          invalid={!!error}
          required
          minLength={3}
          maxLength={128}
          placeholder=""
        />
        <Button
          onClick={() => undefined}
          text={submitting ? "Logging in..." : "Log In"}
          isAsync={false}
          type="submit"
          width="100%"
          disabled={submitting}
        />
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        {error && <FormError role="alert">{error}</FormError>}
      </StyledForm>
      {/* Under the form rather than beside the password field: somebody who
          knows their password never needs it, and somebody who does not has
          already failed once and is looking for a way out. */}
      <Alt>
        <Link href="/forgot-password">Forgotten your password?</Link>
      </Alt>
      <Alt style={{ marginTop: "0.5rem" }}>
        {"New here? "}
        <Link href="/signup">Create an account</Link>
      </Alt>
    </Container>
  );
};

export default LoginForm;
