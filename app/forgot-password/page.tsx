import { Suspense } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: "Forgotten password — Speakgen" };

/* No wrapping div, for the reason the login page gives: main is a centred flex
   column, so a bare div becomes a shrink-to-fit item and the form's max-width
   resolves against its widest child rather than against the page. */
const ForgotPassword = () => (
  <Suspense>
    <ForgotPasswordForm />
  </Suspense>
);

export default ForgotPassword;
