import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";
import { OPERATOR, SUBPROCESSORS, operatorName } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What SpeakGen collects about teachers and schools, why, who it is shared with, how long it is kept, and your rights. Students need no account."
};

export default function PrivacyPage() {
  const contact = OPERATOR.privacyEmail ? (
    <a href={`mailto:${OPERATOR.privacyEmail}`}>{OPERATOR.privacyEmail}</a>
  ) : (
    <Link href="/contact">our contact page</Link>
  );

  return (
    <LegalPage
      title="Privacy policy"
      lastUpdated={OPERATOR.lastUpdated}
      draft={!OPERATOR.reviewed}
    >
      <p>
        SpeakGen is a tool for running Cambridge-style speaking exams. This
        policy explains what personal data it handles, why, and what you can do
        about it. The short version: we collect what we need to give teachers an
        account, we do not sell data, and students using a shared link do not
        need an account and are not asked who they are.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {`SpeakGen is run by ${operatorName()}`}
        {OPERATOR.address ? `, ${OPERATOR.address}` : ""}
        {OPERATOR.registration ? ` (${OPERATOR.registration})` : ""}
        {`, which is the data controller for teachers' accounts. For questions about your data, or to use any of the rights below, contact us through `}
        {contact}.
      </p>
      <p>
        When a school uses SpeakGen with its staff and students, the school
        decides how the service is used and is the controller for that use; we
        act on its behalf as a processor. Our{" "}
        <Link href="/dpa">data processing agreement</Link> sets that out.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account.</strong> Your name and email address, and your
          password, which is stored only as a secure hash. If you sign in with
          Google, we receive your name, email address and profile picture from
          Google instead of a password.
        </li>
        <li>
          <strong>Sign-in sessions.</strong> While you are signed in, your
          session records the IP address and browser it was started from, so a
          session used from somewhere unexpected can be spotted. Sessions expire
          after seven days.
        </li>
        <li>
          <strong>What you create.</strong> Questions, exams and practices, the
          photographs you choose for them, the share links you make, and when
          you made and changed them.
        </li>
        <li>
          <strong>Schools.</strong> The school&apos;s name, who belongs to it
          and in what role, the email addresses of teachers invited to join, and
          the school&apos;s branding: its display name, colour and logo.
        </li>
        <li>
          <strong>Your plan.</strong> Which plan you or your school are on, its
          status and renewal date. Card details are handled by our payment
          provider and never reach us.
        </li>
        <li>
          <strong>Messages you send us</strong>, and our replies.
        </li>
        <li>
          <strong>Server logs.</strong> Like any website, our hosting provider
          records requests to the site — the page, the time, the IP address and
          the browser — to keep it running and secure.
        </li>
      </ul>

      <h2>Students</h2>
      <p>
        Students do not need an account. A student who opens an exam or a
        practice from a link their teacher sent is not asked for a name or any
        other detail, and nothing about them is stored beyond the hosting
        provider&apos;s standard server logs. Students may be children, which is
        why links shared with students never show advertising.
      </p>
      <p>
        We ask teachers not to put students&apos; personal information — names,
        photographs of students, anything that identifies them — into questions
        or exam titles. The service does not need it.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>
          <strong>To provide the service you signed up for</strong> — your
          account, your content, your school — because it is necessary to
          perform our agreement with you.
        </li>
        <li>
          <strong>To keep it secure and working</strong> — sessions, server
          logs, fixing faults — because we have a legitimate interest in running
          a safe, reliable service.
        </li>
        <li>
          <strong>To bill for paid plans</strong> and keep the records tax law
          requires, because we are legally obliged to.
        </li>
        <li>
          <strong>To show ads on the free plan</strong>, only if ads are
          switched on and only if you agree. You can say no, and saying no is as
          easy as saying yes.
        </li>
      </ul>
      <p>
        We do not sell personal data, and we do not use it to build profiles of
        you. We do not use students&apos; activity for anything at all.
      </p>

      <h2>Who we share it with</h2>
      <p>
        Only the services that run SpeakGen for us, each under a contract that
        limits what they may do with it. Services marked &ldquo;not yet in
        use&rdquo; are listed now so that this policy does not have to be
        rewritten on the day one is switched on.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>What for</th>
              <th>What it receives</th>
              <th>Where</th>
            </tr>
          </thead>
          <tbody>
            {SUBPROCESSORS.map((s) => (
              <tr key={s.name}>
                <td>
                  {s.name}
                  {s.pending ? " (not yet in use)" : ""}
                </td>
                <td>{s.purpose}</td>
                <td>{s.data}</td>
                <td>{s.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Where data goes outside the UK or the European Economic Area, it is
        protected by the safeguards the law requires, such as the EU&ndash;US
        Data Privacy Framework or the European Commission&apos;s standard
        contractual clauses.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          Your account and what you create, for as long as the account exists.
          Content that belongs to a school stays with the school when a teacher
          leaves it.
        </li>
        <li>Sign-in sessions, up to seven days.</li>
        <li>
          Billing records, for as long as tax law requires, even after an
          account is closed.
        </li>
        <li>
          Server logs, for the period our hosting provider keeps them, which is
          short.
        </li>
      </ul>
      <p>
        When an account is deleted, its account details, sessions and personal
        content are deleted with it.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see the data we hold about you, to correct it, to delete
        it, to restrict or object to how we use it, or to have a copy to take
        elsewhere. Where we rely on your consent, as for ads, you can withdraw
        it at any time. For any of these, contact us through {contact}; we reply
        within a month.
      </p>
      <p>
        You can delete your account yourself, at any time, from{" "}
        <Link href="/settings">Settings</Link>. It shows what will be deleted
        before you confirm. Content you wrote inside a school stays with the
        school, passed to a colleague there, because it belongs to the school as
        well as to you.
      </p>
      <p>
        If you are unhappy with how we have handled your data, you can complain
        to a data protection authority
        {OPERATOR.supervisoryAuthority
          ? `, such as ${OPERATOR.supervisoryAuthority}`
          : ", usually the one where you live"}
        .
      </p>

      <h2>Cookies</h2>
      <p>
        SpeakGen uses a small number of cookies, mostly to keep you signed in.
        The <Link href="/cookies">cookie policy</Link> lists every one.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change this policy, the date at the top changes with it. If the
        change is significant, we will tell account holders by email or in the
        app before it takes effect.
      </p>
    </LegalPage>
  );
}
