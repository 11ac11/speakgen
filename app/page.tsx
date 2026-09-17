import LandingContent from "./LandingContent";
import AdSlot from "@/app/components/ads/AdSlot";

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
