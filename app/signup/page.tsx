import React from "react";
import SignupForm from "./SignupForm";
import type { Metadata } from "next";

/* See app/login/page.tsx: the form is the flex item, with nothing between it
   and main to collapse its width. */
const Signup = () => {
  return <SignupForm />;
};

export const metadata: Metadata = {
  title: "Create a free account",
  description:
    "Sign up free to write your own Cambridge speaking questions, build exams and practices, and share them with your class."
};

export default Signup;
