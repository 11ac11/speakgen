import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";
import { OPERATOR, operatorName } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms for using SpeakGen: accounts, plans and billing, what you may put in it, who owns what, and share links."
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      lastUpdated={OPERATOR.lastUpdated}
      draft={!OPERATOR.reviewed}
    >
      <p>
        {`These terms are the agreement between you and ${operatorName()}, who runs SpeakGen. By creating an account or using the service you agree to them. If you use SpeakGen for a school, you agree to them on the school's behalf, and confirm you are allowed to.`}
      </p>

      <h2>The service</h2>
      <p>
        SpeakGen helps teachers run Cambridge-style speaking exams: it provides
        questions, a structure and a timer for each part, and lets teachers
        write their own questions, build exams and practices, export them as
        PDFs and share them with students. The free exams and random questions
        can be used without an account.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give an accurate name and email address, and keep them current.</li>
        <li>
          Keep your password to yourself. You are responsible for what is done
          with your account.
        </li>
        <li>
          Accounts are for teachers and other adults. Students do not need one
          and should not create one.
        </li>
      </ul>

      <h2>Plans and payment</h2>
      <ul>
        <li>
          The free plan is free, with the limits shown on the{" "}
          <Link href="/pricing">plans page</Link>. Pro and Academy are paid
          subscriptions, billed monthly or yearly in advance, once they are on
          sale. Until then nothing is charged, and joining a waitlist commits
          you to nothing.
        </li>
        <li>
          Subscriptions renew automatically until cancelled. You can cancel at
          any time from Settings; the plan then stays active until the end of
          the period already paid for, and is not refunded for the remainder
          unless the law where you live says otherwise.
        </li>
        <li>
          Academy is bought by a school for up to the number of teachers it
          includes. Its owner and admins manage billing; teachers they invite
          are covered while they belong to the school.
        </li>
        <li>
          If prices change, we will tell you before your next renewal, and the
          new price applies only from then.
        </li>
        <li>
          If you move to a plan with lower limits, nothing you have made is
          deleted, but you may not be able to create more until you are within
          the limits again.
        </li>
      </ul>

      <h2>What you may put in SpeakGen</h2>
      <p>
        You are responsible for the questions and other content you add. Do not
        add anything that:
      </p>
      <ul>
        <li>
          you do not have the right to use, such as another publisher&apos;s
          exam material;
        </li>
        <li>
          identifies students — their names, photographs or other personal
          details;
        </li>
        <li>
          is unlawful, hateful, harassing, sexual, or otherwise unsuitable for a
          classroom;
        </li>
        <li>
          tries to break, overload or gain unauthorised access to the service.
        </li>
      </ul>
      <p>
        We may remove content or suspend accounts that break these rules, and
        will tell you why unless the law prevents it.
      </p>

      <h2>Who owns what</h2>
      <ul>
        <li>
          You own the questions and exams you write. You give us permission to
          store, display and process them only as needed to run the service for
          you — including showing them to people you share them with.
        </li>
        <li>
          Content created inside a school belongs to the school as well as its
          author, and stays with the school when a teacher leaves.
        </li>
        <li>
          SpeakGen itself — the software, design, house questions and exams —
          belongs to us. Photographs come from Pexels and are used under the
          Pexels licence.
        </li>
      </ul>

      <h2>Share links</h2>
      <p>
        A share link lets anyone who has it run that one exam or practice
        without an account. Share links with care: anyone you forward one to can
        pass it on. You can stop a link working at any time, and sharing again
        makes a new one.
      </p>

      <h2>Not a Cambridge product</h2>
      <p>
        SpeakGen is an independent practice tool. It is not affiliated with or
        endorsed by Cambridge University Press &amp; Assessment. &ldquo;B1
        Preliminary&rdquo;, &ldquo;B2 First&rdquo;, &ldquo;C1 Advanced&rdquo;
        and &ldquo;C2 Proficiency&rdquo; are their trademarks, and using
        SpeakGen does not guarantee any result in their exams.
      </p>

      <h2>Availability and liability</h2>
      <p>
        We work to keep SpeakGen available and your content safe, but we cannot
        promise it will never be interrupted, and we recommend keeping your own
        copy of anything you cannot afford to lose — a PDF export is one way. To
        the extent the law allows, we are not liable for indirect losses, and
        our total liability to you is limited to what you paid us in the twelve
        months before the claim. Nothing in these terms limits rights you have
        as a consumer that cannot be limited by law.
      </p>

      <h2>Ending the agreement</h2>
      <p>
        You can stop using SpeakGen and delete your account at any time, from
        Settings. We may close an account that seriously or repeatedly breaks
        these terms. We may also change or stop the service, and will give
        reasonable notice before stopping it, so you can export what you need.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms in a way that matters, we will tell account
        holders before the change takes effect. Continuing to use SpeakGen after
        that means you accept the new terms.
      </p>

      <h2>Law</h2>
      <p>
        {OPERATOR.governingLaw
          ? `These terms are governed by ${OPERATOR.governingLaw}.`
          : "These terms are governed by the law of the country where the operator of SpeakGen is established."}{" "}
        If you are a consumer, you also keep the protection of the law where you
        live.
      </p>

      <p>
        How we handle personal data is in the{" "}
        <Link href="/privacy">privacy policy</Link>, and for schools, the{" "}
        <Link href="/dpa">data processing agreement</Link>.
      </p>
    </LegalPage>
  );
}
