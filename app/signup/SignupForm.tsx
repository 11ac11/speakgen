"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SecureInput, Button } from "../../components/ui/index";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

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

    if (!!emailError) {
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

  return (
    <StyledForm>
      <SecureInput
        label="Username"
        type="text"
        value={username}
        onChange={handleUsernameChange}
        required
        minLength={3}
        maxLength={20}
        placeholder="Enter your username"
      />
      <SecureInput
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
      />
      <SecureInput
        label="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        required
        minLength={3}
        maxLength={20}
        placeholder=""
      />
      <SecureInput
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={handlePasswordConfirmChange}
        required
        minLength={3}
        maxLength={20}
        placeholder=""
        error={passwordError}
      />
      <Button
        onClick={() => console.log("button click")}
        text={"Sign up"}
        isAsync={false}
        disabled={!allFieldsCompleted || !!passwordError || !!emailError}
      />
    </StyledForm>
  );
};

export default LoginForm;
