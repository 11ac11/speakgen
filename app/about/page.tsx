import AboutContent from "./AboutContent";
import AdSlot from "@/app/components/ads/AdSlot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "What SpeakGen is, who it is for, and how it runs a Cambridge-style speaking test in the classroom, part by part and on the clock."
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
      <AdSlot placement="about" />
    </>
  );
}
