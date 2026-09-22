import ContactContent from "./ContactContent";
import { supportEmail } from "@/lib/feedback";

/* Read on the server and passed down, so SUPPORT_EMAIL stays a server variable
   rather than becoming NEXT_PUBLIC_ anything. It still reaches the browser —
   the mail link is assembled there — but only this page carries it, rather than
   every bundle in the app.

   No AdSlot. About and the FAQs carry one; a page somebody opens to report that
   something is broken is not the place to sell them anything, and "contact" is
   deliberately absent from AD_PLACEMENTS in lib/ads.ts. */
export default function ContactPage() {
  return <ContactContent supportEmail={supportEmail()} />;
}
