"use client";

import Link from "next/link";
import styled from "styled-components";
import { SUPPORTED_LEVELS } from "@/constants";

/* margin-top: auto so the footer is pushed to the bottom of short pages rather
   than floating halfway up one. */
const Wrapper = styled.footer`
  width: 100%;
  margin-top: auto;
  border-top: 1px solid var(--field-edge);
  background: #fff;
`;

const Inner = styled.div`
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 2.75rem 1.5rem 2rem;
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 2rem;

  @media only screen and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.75rem;
    padding: 2rem 1.25rem 1.5rem;
  }

  @media only screen and (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Brand = styled.div`
  p {
    margin: 0.6rem 0 0;
    max-width: 26ch;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

const BrandName = styled(Link)`
  font-family: var(--font-display), sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--text-heading);

  &:hover {
    color: var(--green-600);
  }
`;

/* h2 rather than a styled div: each column is a labelled section of the page,
   and the label is what a screen reader reads before the links. */
const ColumnHeading = styled.h2`
  margin: 0 0 0.75rem;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-faint);
`;

const Links = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;

  a {
    font-size: var(--text-sm);
    color: var(--text-body);
  }

  a:hover {
    color: var(--green-600);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const Legal = styled.div`
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 1.25rem 1.5rem 2rem;
  border-top: 1px solid var(--green-edge);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;

  p {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--text-faint);
  }

  /* The trademark note is the long one, so it gets the room and wraps under
     the copyright on a narrow screen rather than squeezing it. */
  p:last-child {
    max-width: 62ch;
  }

  @media only screen and (max-width: 768px) {
    padding: 1.25rem 1.25rem 2rem;
  }
`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Wrapper>
      <Inner>
        <Brand>
          <BrandName href="/">Speakgen</BrandName>
          <p>
            Cambridge speaking exam practice for teachers. Build an exam, or run
            a free one straight from the page.
          </p>
        </Brand>

        <nav aria-labelledby="footer-practise">
          <ColumnHeading id="footer-practise">Practise</ColumnHeading>
          <Links>
            {SUPPORTED_LEVELS.map((level) => (
              <li key={`exams-${level}`}>
                <Link href={`/${level.toLowerCase()}/exams`}>
                  {`${level} exams`}
                </Link>
              </li>
            ))}
            {SUPPORTED_LEVELS.map((level) => (
              <li key={`random-${level}`}>
                <Link href={`/${level.toLowerCase()}/questions/random/1`}>
                  {`${level} questions`}
                </Link>
              </li>
            ))}
          </Links>
        </nav>

        <nav aria-labelledby="footer-product">
          <ColumnHeading id="footer-product">Speakgen</ColumnHeading>
          <Links>
            <li>
              <Link href="/pricing">Plans and pricing</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/faqs">FAQs</Link>
            </li>
          </Links>
        </nav>

        <nav aria-labelledby="footer-account">
          <ColumnHeading id="footer-account">Account</ColumnHeading>
          <Links>
            <li>
              <Link href="/signup">Create an account</Link>
            </li>
            <li>
              <Link href="/login">Log in</Link>
            </li>
            <li>
              <Link href="/settings">Settings</Link>
            </li>
          </Links>
        </nav>
      </Inner>

      <Legal>
        <p>{`© ${year} Speakgen`}</p>
        <p>
          Cambridge English, B2 First and C1 Advanced are trademarks of
          Cambridge University Press &amp; Assessment. Speakgen is an
          independent practice tool and is not affiliated with or endorsed by
          them.
        </p>
      </Legal>
    </Wrapper>
  );
}
