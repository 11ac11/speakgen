"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Input, Button } from "@/app/components/ui/index";
import { authClient } from "@/lib/auth-client";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
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

/* Same measurements as the login form, so the two pages do not drift. */
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  width: 100%;
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
    <Container>
      <Heading>Create an account</Heading>
      <Sub>Free, and you keep every question you write.</Sub>
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
          maxLength={254}
          placeholder="Enter your email"
          error={emailError}
          /* A taken address is reported under the form, so the box it refers
             to is marked without repeating the words. */
          invalid={!emailError && /email|exist|user/i.test(formError)}
          name="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          required
          minLength={3}
          maxLength={128}
          placeholder=""
          invalid={!!passwordError || /password/i.test(formError)}
          name="password"
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={handlePasswordConfirmChange}
          required
          minLength={3}
          maxLength={128}
          placeholder=""
          error={passwordError}
          name="password2"
        />
        <Button
          onClick={() => undefined}
          text={"Sign up"}
          isAsync={false}
          type="submit"
          width="100%"
          disabled={
            isSubmitting ||
            !allFieldsCompleted ||
            !!passwordError ||
            !!emailError
          }
        />
        {formError && <FormError role="alert">{formError}</FormError>}
      </StyledForm>
      <Alt>
        {"Already have an account? "}
        <Link href="/login">Log in</Link>
      </Alt>
    </Container>
  );
};

export default LoginForm;
