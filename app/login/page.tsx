import React from "react";
import LoginForm from "./LoginForm";
import { Suspense } from "react";

/* No wrapping div: main is a flex column with align-items: center, so a bare
   div becomes a shrink-to-fit flex item and the form's own max-width resolves
   against whatever its widest child happens to be. The form is the item. */
const Login = () => {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
};

export default Login;
