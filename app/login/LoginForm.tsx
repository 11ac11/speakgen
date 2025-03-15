"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button } from "../../components/ui/index";
import { useActionState } from "react";
import { authenticate } from "../../lib/actions";
import { useSearchParams } from "next/navigation";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
`;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  const handleEmailChange = (newValue: string) => {
    setEmail(newValue);
  };

  const handlePasswordChange = (newValue: string) => {
    setPassword(newValue);
  };

  return (
    <StyledForm action={formAction}>
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
        aria-disabled={isPending}
      />
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      {errorMessage && (
        <>
          <p>{errorMessage}</p>
        </>
      )}
    </StyledForm>
  );
};

export default LoginForm;
