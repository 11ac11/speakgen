import type { Metadata } from "next";
import ErrorScreen from "@/app/components/ErrorScreen";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("Link not working");

/**
 * A share link that no longer opens anything. The person reading this is
 * almost always a student, who cannot fix it and should not be sent to a
 * sign-up page, so it says who can: the teacher who sent it.
 */
export default function ShareNotFound() {
  return (
    <ErrorScreen
      code="Link"
      title="This link isn't working any more"
      primary={{ label: "Try a free practice exam", href: "/exams" }}
    >
      <p>
        Your teacher may have stopped sharing it, or the link may be incomplete.
        Ask them to send it again.
      </p>
    </ErrorScreen>
  );
}
