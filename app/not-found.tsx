import type { Metadata } from "next";
import ErrorScreen from "@/app/components/ErrorScreen";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("Page not found");

/**
 * The site's 404, for an address that does not exist and for anything the
 * pages turn away with notFound() — including somebody else's private exam,
 * which is deliberately indistinguishable from a missing one. So it says both,
 * without saying which.
 */
export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="We can't find that page"
      primary={{ label: "Go to the home page", href: "/" }}
      secondary={{ label: "Browse the free exams", href: "/exams" }}
    >
      <p>
        The address may be mistyped, or the page may have moved. If it is an
        exam or practice somebody else made, it may be private to them and their
        school.
      </p>
    </ErrorScreen>
  );
}
