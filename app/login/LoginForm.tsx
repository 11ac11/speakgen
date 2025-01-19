"use client";

import React, { useState } from "react";
import SecureInput from "../../components/ui/Input";
import Button from "../../components/ui/Button";

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
    <form>
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
    </form>
  );
};

export default LoginForm;
