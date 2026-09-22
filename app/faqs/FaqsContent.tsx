"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Prose } from "@/app/components/Prose";
import { Lead } from "@/app/components/Lead";

const Section = styled.section`
  /* No bottom margin: the h2 inside the next section owns the gap between
     sections, so the two were stacking and pushing headings a long way from
     the paragraph they follow. */
  margin-bottom: 0;
  /* The nav is not sticky, so a jump lands cleanly — this is the breathing
     room above a heading you have just been sent to, not a fix for overlap. */
  scroll-margin-top: 1.5rem;
`;

/* A contents list is navigation, not running text, so its links do not carry
   the underline that globals gives a link inside a paragraph: nine underlined
   lines in a row is a thicket. The underline arrives on hover, where it says
   "this is the one you are about to follow". */
const Contents = styled.nav`
  width: 100%;
  margin: 0 0 3rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--green-edge);
  border-radius: var(--radius-card);
  background: var(--green-tint);

  h2 {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 0.75rem;
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  /* ol li a, not a: Prose styles li a for its own lists, and a bare a here
     ties on specificity and loses on source order. */
  ol li a {
    color: var(--green-600);
    font-weight: 500;
    text-decoration: none;
    text-underline-offset: 0.18em;
  }

  ol li a:hover {
    color: var(--green-800);
    text-decoration: underline;
  }

  ol li a:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

/* One list, read twice: once for the contents and once for the page. Keeping
   the questions in two places is how a contents list ends up pointing at an
   anchor that no longer exists, or missing the question added last week. */
const FAQS: { id: string; question: string; answer: React.ReactNode }[] = [
  {
    id: "what-is-speakgen",
    question: "What is Speakgen?",
    answer: (
      <>
        <p>
          {`A tool for running Cambridge-style speaking exams. It gives you the questions, the structure and a timer for each part, so you can run a realistic speaking test without printing anything.`}
        </p>
        <p>
          {`It is built for teachers running a class, but nothing stops a student using it alone — the free exams and random questions need no account at all.`}
        </p>
      </>
    )
  },
  {
    id: "which-exams",
    question: "Which exams does it cover?",
    answer: (
      <>
        <p>{`Four levels, each following the real format:`}</p>
        <ul>
          <li>
            <strong>{`B1 Preliminary`}</strong>
            {` — four parts, about 12 minutes for a pair of candidates. In Part 2 each candidate describes a single photograph on their own, rather than comparing two.`}
          </li>
          <li>
            <strong>{`B2 First`}</strong>
            {` — four parts, about 14 minutes.`}
          </li>
          <li>
            <strong>{`C1 Advanced`}</strong>
            {` — four parts, about 15 minutes.`}
          </li>
          <li>
            <strong>{`C2 Proficiency`}</strong>
            {` — three parts, about 16 minutes. Part 2 is the collaborative task and Part 3 the long turn, which is the other way round from B2 and C1.`}
          </li>
        </ul>
      </>
    )
  },
  {
    id: "do-i-need-an-account",
    question: "Do I need an account?",
    answer: (
      <>
        <p>
          {`Not to practise. The complete exams under `}
          <Link href="/b2/exams">{`Exams`}</Link>
          {` and the single questions under `}
          <Link href="/b2/questions/random/1">{`Practise`}</Link>
          {` are free and open, with no sign-up.`}
        </p>
        <p>
          {`You need a free account to keep anything: to write your own questions, to build an exam, or to save a practice.`}
        </p>
      </>
    )
  },
  {
    id: "exam-practice-random",
    question:
      "What is the difference between an exam, a practice and a random question?",
    answer: (
      <>
        <p>{`They are three different ways to get questions out of the app.`}</p>
        <ul>
          <li>
            <strong>{`An exam`}</strong>
            {` is the whole test, fixed. One question per part, in order, exactly as it runs on the day. You build it once and it stays the same every time you open it.`}
          </li>
          <li>
            <strong>{`A practice`}</strong>
            {` is a rule rather than a list — a level, optionally one part, optionally a theme or two, and how many questions. It draws a fresh set every single time you run it, so the same practice gives your Monday class different questions each week.`}
          </li>
          <li>
            <strong>{`A random question`}</strong>
            {` is one question at a time, with nothing saved. Useful for filling five minutes at the end of a lesson.`}
          </li>
        </ul>
      </>
    )
  },
  {
    id: "my-own-questions",
    question: "Can I write my own questions?",
    answer: (
      <>
        <p>
          {`Yes, and there is no limit on any plan — including the free one. Your question bank is the thing you build up over time, so capping it would be the wrong thing to charge for.`}
        </p>
        <p>
          {`You write the same fields the real task has: the photographs for a long turn, the prompts for a collaborative task, the follow-up question the other candidate answers, and the decision the pair have to reach.`}
        </p>
      </>
    )
  },
  {
    id: "themes",
    question: "What are themes for?",
    answer: (
      <p>
        {`Every question can carry one or more of eighteen topics — technology, the environment, work and education, and so on. Tag your questions as you write them and you can then filter your bank by theme, or build a practice that draws only from one or two of them when your class is working on a topic.`}
      </p>
    )
  },
  {
    id: "cost",
    question: "What does it cost?",
    answer: (
      <>
        <p>
          {`The free plan keeps one saved exam and three saved practices, with unlimited questions, and shows ads. Pro is €5 a month or €49 a year, and lifts the limits on saved exams and practices with no ads.`}
        </p>
        <p>
          {`There is an Academy plan for schools in the works, which is not open for sign-ups yet. Full detail is on the `}
          <Link href="/pricing">{`plans page`}</Link>
          {`.`}
        </p>
      </>
    )
  },
  {
    id: "cambridge",
    question: "Is this an official Cambridge product?",
    answer: (
      <p>
        {`No. Speakgen is independent and is not affiliated with or endorsed by Cambridge University Press & Assessment. Cambridge English, B2 First, C1 Advanced and C2 Proficiency are their trademarks. The exam formats are followed as published so that practice is realistic, but the questions are written for this app.`}
      </p>
    )
  },
  {
    id: "get-in-touch",
    question: "How do I report a bug or ask for something?",
    answer: (
      <p>
        {`There is a `}
        <Link href="/contact">{`contact page`}</Link>
        {` — pick what it is about, write what happened, and it comes straight to me. Speakgen is built by one person, so a feature request is read by the person who would build it.`}
      </p>
    )
  },
  {
    id: "whole-class",
    question: "Can I use it with a whole class?",
    answer: (
      <p>
        {`Yes. An exam or a practice runs on screen one question at a time, with the timer for that part, so you can put it on a projector and work through it with a pair of candidates while the rest follow along.`}
      </p>
    )
  }
];

export default function FaqsContent() {
  return (
    <Prose className={"container"}>
      <h1>Frequently asked questions</h1>
      <Lead>
        {`Everything about what Speakgen does, what it costs, and what you can do without signing up.`}
      </Lead>

      <Contents aria-labelledby="faq-contents">
        <h2 id="faq-contents">On this page</h2>
        <ol>
          {FAQS.map((faq) => (
            <li key={faq.id}>
              <a href={`#${faq.id}`}>{faq.question}</a>
            </li>
          ))}
        </ol>
      </Contents>

      {FAQS.map((faq) => (
        <Section key={faq.id} id={faq.id}>
          <h2>{faq.question}</h2>
          {faq.answer}
        </Section>
      ))}
    </Prose>
  );
}
