"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button } from "@/app/components/ui/index";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/public/google-icon.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
`;

const OrContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1rem;
  padding: 2rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
`;

const Divider = styled.div`
  height: 1px;
  border-bottom: 1px solid grey;
  width: 100%;
`;

const GoogleButton = styled(Button)`
  width: 100%;
  button {
    background: var(--slategrey);
    color: white;
    width: 100%;
    border-width: 0;
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

    const res = await signIn("credentials", {
      redirect: false, // don't redirect automatically
      email,
      password,
      callbackUrl: "http://localhost:3000/dashboard",
    });

    if (res?.error) {
      setError(res.error);
    } else if (res?.ok) {
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
      <GoogleButton
        onClick={async () => {
          await signIn("google", { callbackUrl: "/dashboard" });
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
          onClick={() => console.log("button click")}
          text={"Log In"}
          isAsync={false}
        />
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        {error && (
          <>
            <p>{error}</p>
          </>
        )}
      </StyledForm>
    </Container>
  );
};

export default LoginForm;
