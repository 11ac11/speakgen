import React from "react";
import LoginForm from "./LoginForm";
import { Suspense } from "react";

const Login = () => {
  return (
    <div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default Login;
