"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button } from "@/app/components/ui/index";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import GoogleIcon from "@/public/google-icon.svg";
import { authClient } from "@/lib/auth-client";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 340px;
  margin: 4rem auto 0;
  padding: 0 1rem;
`;

const Heading = styled.h1`
  font-size: var(--text-2xl);
  margin: 0 0 0.4rem;
  align-self: flex-start;
`;

const Sub = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
  margin: 0 0 1.75rem;
  align-self: flex-start;
`;

const Alt = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 1.75rem 0 0;

  a {
    color: var(--green-600);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const FormError = styled.p`
  color: var(--danger);
  font-size: var(--text-sm);
  margin: 0;
`;

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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  width: 100%;
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

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl
    });

    if (res.error) {
      setError(res.error.message || "Unable to log in");
    } else {
      router.push(callbackUrl); // manual redirect
    }
  };

  const handleEmailChange = (newValue: string) => {
    setEmail(newValue);
  };

  const handlePasswordChange = (newValue: string) => {
    setPassword(newValue);
  };

  return (
    <Container>
      <Heading>Log in</Heading>
      <Sub>Welcome back.</Sub>
      <GoogleButton
        onClick={async () => {
          await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard"
          });
        }}
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
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          required
          minLength={3}
          maxLength={20}
          placeholder="Enter your Email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          required
          minLength={3}
          maxLength={20}
          placeholder=""
        />
        <Button
          onClick={() => undefined}
          text={"Log In"}
          isAsync={false}
          type="submit"
          width="100%"
        />
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        {error && <FormError role="alert">{error}</FormError>}
      </StyledForm>
      <Alt>
        {"New here? "}
        <Link href="/signup">Create an account</Link>
      </Alt>
    </Container>
  );
};

export default LoginForm;
