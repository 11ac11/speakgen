"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button } from "@/app/components/ui/index";
// import { useActionState } from "react";
// import { authenticate } from "@/lib/actions";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

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
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  // const [errorMessage, formAction, isPending] = useActionState(
  //   authenticate,
  //   undefined
  // );

  const credentialsAction = (formData: FormData) => {
    const formObject: { [key: string]: string } = {};

    formData.forEach((value, key) => {
      formObject[key] = value.toString();
    });

    // Now you can pass the extracted data to the signIn function
    signIn("credentials", formObject);
  };

  const handleEmailChange = (newValue: string) => {
    setEmail(newValue);
  };

  const handlePasswordChange = (newValue: string) => {
    setPassword(newValue);
  };

  return (
    <StyledForm action={credentialsAction}>
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
        // aria-disabled={isPending}
      />
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      {/* {errorMessage && (
        <>
          <p>{errorMessage}</p>
        </>
      )} */}
    </StyledForm>
  );
};

export default LoginForm;
