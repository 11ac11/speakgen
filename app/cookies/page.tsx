import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";
import { COOKIES, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Every cookie SpeakGen sets, what it is for and how long it lasts. Advertising cookies are only ever set with your consent."
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      lastUpdated={OPERATOR.lastUpdated}
      draft={!OPERATOR.reviewed}
    >
      <p>
        A cookie is a small file a website stores in your browser. SpeakGen uses
        as few as it can. Most are needed to keep you signed in; one remembers
        your answer about ads; and advertising cookies are only ever set if you
        allow them.
      </p>

      <h2>The cookies we use</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Type</th>
              <th>What it does</th>
              <th>How long</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((cookie) => (
              <tr key={cookie.name}>
                <td>
                  <code>{cookie.name}</code>
                </td>
                <td>{cookie.kind}</td>
                <td>{cookie.purpose}</td>
                <td>{cookie.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Essential cookies</h2>
      <p>
        The sign-in cookies are needed for the service to work: without them you
        could not stay signed in from one page to the next. They are set only
        when you sign in, so a visitor who never signs in — a student following
        a link, for instance — does not get them. They do not need your consent,
        and they are not used to track you.
      </p>

      <h2>Advertising</h2>
      <p>
        The free plan may show ads on a few pages: the home page, About, FAQs
        and the free plan&apos;s own dashboard. Before any ad loads, you are
        asked whether you agree, and refusing is one click, the same as
        accepting. There are never ads for Pro or Academy, never on the exam
        runner, and never on links shared with students.
      </p>
      <p>
        To change your answer, clear the <code>speakgen_ad_consent</code> cookie
        in your browser and you will be asked again.
      </p>

      <h2>Site statistics</h2>
      <p>
        We count page views with Vercel Web Analytics, which uses no cookies and
        stores nothing on your device, so it is not in the table above and does
        not need your consent. Links shared with students are not counted.
      </p>

      <h2>No local storage</h2>
      <p>
        SpeakGen does not keep anything else in your browser&apos;s storage.
        Fonts are served from our own site rather than a third party, so loading
        a page does not tell anyone else you visited.
      </p>

      <p>
        More about how we handle data is in the{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </LegalPage>
  );
}
