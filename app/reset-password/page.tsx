import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Set a new password — SpeakGen" };

/* Suspense is required, not decorative: the form reads the token with
   useSearchParams, and a page that does that without a boundary fails the
   build. */
const ResetPassword = () => (
  <Suspense>
    <ResetPasswordForm />
  </Suspense>
);

export default ResetPassword;
