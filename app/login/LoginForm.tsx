"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button } from "../../components/ui/index";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (newValue: string) => {
    setUsername(newValue);
  };

  const handlePasswordChange = (newValue: string) => {
    setPassword(newValue);
  };

  return (
    <StyledForm>
      <Input
        label="Username"
        type="text"
        value={username}
        onChange={handleUsernameChange}
        required
        minLength={3}
        maxLength={20}
        placeholder="Enter your username"
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
      />
      <Button
        onClick={() => console.log("button click")}
        text={"Log In"}
        isAsync={false}
      />
    </StyledForm>
  );
};

export default LoginForm;
