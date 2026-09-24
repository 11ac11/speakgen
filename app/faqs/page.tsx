import FaqsContent from "./FaqsContent";
import AdSlot from "@/app/components/ads/AdSlot";
import type { Metadata } from "next";
import { isWaitlistMode } from "@/lib/waitlist";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Which Cambridge exams SpeakGen covers, what it costs, how exams, practices and share links work, and why A1 and A2 are not included yet."
};

export default function FaqsPage() {
  return (
    <>
      <FaqsContent waitlist={isWaitlistMode()} />
      <AdSlot placement="faqs" />
    </>
  );
}
