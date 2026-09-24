import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import { privatePage } from "@/lib/site";

export const metadata = privatePage("Set a new password");

/* Suspense is required, not decorative: the form reads the token with
   useSearchParams, and a page that does that without a boundary fails the
   build. */
const ResetPassword = () => (
  <Suspense>
    <ResetPasswordForm />
  </Suspense>
);

export default ResetPassword;
