"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Input, Button } from "@/app/components/ui/index";
import { authClient } from "@/lib/auth-client";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
`;

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!!confirmPassword && password !== confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError(""); // Clear error if passwords match
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [password, confirmPassword]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sensitiveParams = ["username", "email", "password", "password2"];
    const hadSensitiveParams = sensitiveParams.some((param) =>
      url.searchParams.has(param)
    );

    if (hadSensitiveParams) {
      sensitiveParams.forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleUsernameChange = (newValue: string) => {
    setUsername(newValue);
  };

  const handlePasswordChange = (newValue: string) => {
    setPassword(newValue);
  };

  const handlePasswordConfirmChange = (newValue: string) => {
    setConfirmPassword(newValue);
  };

  const handleEmailChange = (newValue: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    setEmail(newValue);

    if (emailError) {
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError(""); // Clear error if valid email
      }
    }
  };

  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(""); // Clear error if valid email
    }
  };

  const allFieldsCompleted =
    !!email && !!password && !!confirmPassword && !!username;

  const handleSignup = async () => {
    if (!allFieldsCompleted || passwordError || emailError) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await authClient.signUp.email({
        name: username,
        email,
        password,
        callbackURL: "/dashboard"
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Unable to create your account");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledForm
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSignup();
      }}
    >
      <Input
        label="Username"
        type="text"
        value={username}
        onChange={handleUsernameChange}
        required
        minLength={3}
        maxLength={20}
        placeholder="Enter your username"
        name="username"
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={validateEmail}
        required
        minLength={3}
        maxLength={20}
        placeholder="Enter your email"
        error={emailError}
        name="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        required
        minLength={3}
        maxLength={20}
        placeholder=""
        name="password"
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={handlePasswordConfirmChange}
        required
        minLength={3}
        maxLength={20}
        placeholder=""
        error={passwordError}
        name="password2"
      />
      <Button
        onClick={() => undefined}
        text={"Sign up"}
        isAsync={false}
        type="submit"
        disabled={
          isSubmitting ||
          !allFieldsCompleted ||
          !!passwordError ||
          !!emailError
        }
      />
      {formError && <p role="alert">{formError}</p>}
    </StyledForm>
  );
};

export default LoginForm;
