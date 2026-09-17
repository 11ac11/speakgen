import { permanentRedirect } from "next/navigation";

export default function LegacyNewQuestionPage() {
  permanentRedirect("/questions/new");
}
