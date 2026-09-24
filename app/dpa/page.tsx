import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";
import { OPERATOR, SUBPROCESSORS, operatorName } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Data processing agreement",
  description:
    "The data processing agreement for schools using SpeakGen: what we process on the school's behalf, how it is protected, sub-processors, and breach notification."
};

/**
 * A GDPR Article 28 agreement for schools. It is published rather than only
 * emailed so a school can read it before buying, and it is written against the
 * same sub-processor list as the privacy policy, from lib/legal.ts.
 */
export default function DpaPage() {
  const contact = OPERATOR.privacyEmail ? (
    <a href={`mailto:${OPERATOR.privacyEmail}`}>{OPERATOR.privacyEmail}</a>
  ) : (
    <Link href="/contact">our contact page</Link>
  );

  return (
    <LegalPage
      title="Data processing agreement"
      lastUpdated={OPERATOR.lastUpdated}
      draft={!OPERATOR.reviewed}
    >
      <p>
        {`This agreement applies when a school, academy or other organisation (“the school”) uses SpeakGen for its staff and students. It is between the school, as controller, and ${operatorName()} (“we”), as processor, and forms part of the `}
        <Link href="/terms">terms of use</Link>
        {`. It is written to meet Article 28 of the UK and EU General Data Protection Regulation.`}
      </p>
      <p>
        Most schools need nothing more than this page. If yours needs a signed
        copy for its records, contact us through {contact} and we will send one,
        countersigned.
      </p>

      <h2>1. What we process, and why</h2>
      <div className="table-scroll">
        <table>
          <tbody>
            <tr>
              <th>Purpose</th>
              <td>
                Providing SpeakGen to the school: accounts for its teachers, the
                questions, exams and practices they create, the school&apos;s
                shared bank and branding, and links shared with students.
              </td>
            </tr>
            <tr>
              <th>People</th>
              <td>
                The school&apos;s teachers and administrators; teachers invited
                to join; and students who open a shared link.
              </td>
            </tr>
            <tr>
              <th>Data</th>
              <td>
                For staff: name, email address, sign-in sessions (including IP
                address and browser), role in the school, and the content they
                create. For students: none beyond the hosting provider&apos;s
                standard server logs — students have no accounts and are not
                asked for their name or anything else.
              </td>
            </tr>
            <tr>
              <th>Special categories</th>
              <td>
                None are needed, and the terms ask teachers not to enter
                students&apos; personal data into content.
              </td>
            </tr>
            <tr>
              <th>Duration</th>
              <td>
                For as long as the school uses SpeakGen, and until deletion
                under section 8.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2. Acting on the school&apos;s instructions</h2>
      <p>
        We process the school&apos;s personal data only to provide the service
        and as the school instructs — through how it uses and configures
        SpeakGen, and in writing — unless the law requires otherwise, in which
        case we will tell the school first unless the law forbids it. We will
        tell the school if we think an instruction breaks data protection law.
      </p>

      <h2>3. Confidentiality</h2>
      <p>
        Everyone we allow to access the school&apos;s personal data is bound to
        keep it confidential, and access is limited to what their work requires.
      </p>

      <h2>4. Security</h2>
      <p>
        We protect the data with measures appropriate to the risk, including:
      </p>
      <ul>
        <li>
          encryption in transit (HTTPS throughout) and at rest in the database;
        </li>
        <li>
          passwords stored only as secure hashes, and sign-in cookies that
          scripts cannot read;
        </li>
        <li>
          access control enforced in the database queries themselves, so a
          teacher can read only their own content, their school&apos;s, and the
          free library, and a share link opens only the one exam or practice it
          names;
        </li>
        <li>
          share links built on long random tokens that cannot be guessed, and
          that the school can stop at any time;
        </li>
        <li>no advertising or tracking on anything shown to students;</li>
        <li>
          the website&apos;s server code, database and sign-in service all run
          in London, UK.
        </li>
      </ul>

      <h2>5. Sub-processors</h2>
      <p>
        The school authorises us to use the sub-processors below. Each is bound
        by data protection terms at least as protective as this agreement. We
        will update this list at least 30 days before adding or replacing a
        sub-processor that handles the school&apos;s personal data; if the
        school objects on reasonable data protection grounds, it may end its
        subscription without penalty.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Sub-processor</th>
              <th>Purpose</th>
              <th>Location</th>
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
                <td>{s.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>6. International transfers</h2>
      <p>
        Where a sub-processor handles data outside the UK or the European
        Economic Area, the transfer is protected by an adequacy decision, the
        EU&ndash;US Data Privacy Framework, or the European Commission&apos;s
        standard contractual clauses and the UK addendum to them.
      </p>

      <h2>7. Helping the school</h2>
      <ul>
        <li>
          <strong>Requests from individuals.</strong> We will help the school
          answer requests from its staff to access, correct, delete or export
          their data, and pass on any such request we receive directly.
        </li>
        <li>
          <strong>Breaches.</strong> We will tell the school without undue
          delay, and within 48 hours, after becoming aware of a personal data
          breach affecting its data, with what we know and what we are doing
          about it.
        </li>
        <li>
          <strong>Assessments and audits.</strong> We will give the school the
          information it reasonably needs to show compliance with Article 28,
          and to carry out any data protection impact assessment.
        </li>
      </ul>

      <h2>8. When the school stops using SpeakGen</h2>
      <p>
        When the school&apos;s subscription ends, its content stays available to
        its teachers on the free plan&apos;s terms. If the school asks us to, we
        will delete its data, or return it first in a common format, within 30
        days — except where the law requires us to keep something, such as
        billing records.
      </p>

      <h2>9. If this agreement and the terms disagree</h2>
      <p>
        For anything to do with personal data, this agreement takes precedence
        over the terms of use.
      </p>
    </LegalPage>
  );
}
