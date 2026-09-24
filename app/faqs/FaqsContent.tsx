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
    question: "What is SpeakGen?",
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
    id: "a1-a2",
    question: "Why are A1 and A2 not included?",
    answer: (
      <>
        <p>
          {`Because at those levels the speaking test is a different kind of task, and we would rather leave it out than offer a version that does not match what your students will face.`}
        </p>
        <p>
          {`From B1 to C2 the tests share a shape: candidates talk about photographs, discuss a set of written ideas together, and answer broader questions. SpeakGen is built around exactly those tasks. At A1 and A2 it changes. The young learners' tests — Pre A1 Starters, A1 Movers and A2 Flyers — take one child at a time with the examiner, and the tasks are built on pictures: pointing to things in a scene, spotting the differences between two pictures, telling a story from a sequence of drawings. A2 Key is taken in pairs, but its main task is a conversation around a set of pictures rather than written prompts.`}
        </p>
        <p>
          {`Doing those properly means new kinds of question and illustrations drawn for the purpose, not B1 questions with the level changed. It is on the list. If your school needs A1 or A2, `}
          <Link href="/contact">{`tell us`}</Link>
          {` — knowing who is waiting for it is what moves it up.`}
        </p>
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
          {`The free plan keeps one saved exam and three saved practices, with unlimited questions, and shows ads. Pro is €5 a month or €49 a year: no limits on saved exams and practices, PDF export, and no ads.`}
        </p>
        <p>
          {`Academy is for schools: €29 a month or €290 a year for up to five teachers, with a shared question bank and your school's name and colours on the links and PDFs you share. Full detail is on the `}
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
        {`No. SpeakGen is independent and is not affiliated with or endorsed by Cambridge University Press & Assessment. Cambridge English, B2 First, C1 Advanced and C2 Proficiency are their trademarks. The exam formats are followed as published so that practice is realistic, but the questions are written for this app.`}
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
        {` — pick what it is about, write what happened, and it comes straight to me. SpeakGen is built by one person, so a feature request is read by the person who would build it.`}
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
        {`Everything about what SpeakGen does, what it costs, and what you can do without signing up.`}
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
