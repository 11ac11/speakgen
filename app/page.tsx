import LandingContent from "./LandingContent";
import AdSlot from "@/app/components/ads/AdSlot";
import type { Metadata } from "next";

// The home page is the brand, so its title is not "Home — SpeakGen".
export const metadata: Metadata = {
  title: {
    absolute: "SpeakGen — Cambridge speaking exam practice for teachers"
  }
};

// A server wrapper so the ad slot can read the plan from the database. The page
// itself stays a client component.
export default function LandingPage() {
  return (
    <>
      <LandingContent />
      <AdSlot placement="landing" />
    </>
  );
}
