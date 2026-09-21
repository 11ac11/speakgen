"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Prose, Lead } from "@/app/components/Prose";

/* No bottom margin: the h2 inside the next Section owns the gap between
   sections, so the two were stacking and pushing headings a long way from the
   paragraph they follow. */
const Section = styled.div`
  margin-bottom: 0;
`;

export default function FaqsContent() {
  return (
    <Prose className={"container"}>
      <h1>Frequently asked questions</h1>
      <Lead>
        {`Everything about what Speakgen does, what it costs, and what you can do without signing up.`}
      </Lead>

      <Section>
        <h2>{`What is Speakgen?`}</h2>
        <p>
          {`A tool for running Cambridge-style speaking exams. It gives you the questions, the structure and a timer for each part, so you can run a realistic speaking test without printing anything.`}
        </p>
        <p>
          {`It is built for teachers running a class, but nothing stops a student using it alone — the free exams and random questions need no account at all.`}
        </p>
      </Section>

      <Section>
        <h2>{`Which exams does it cover?`}</h2>
        <p>{`Three levels, each following the real format:`}</p>
        <ul>
          <li>
            <strong>{`B2 First`}</strong>
            {` — four parts, about 14 minutes for a pair of candidates.`}
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
      </Section>

      <Section>
        <h2>{`Do I need an account?`}</h2>
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
      </Section>

      <Section>
        <h2>{`What is the difference between an exam, a practice and a random question?`}</h2>
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
      </Section>

      <Section>
        <h2>{`Can I write my own questions?`}</h2>
        <p>
          {`Yes, and there is no limit on any plan — including the free one. Your question bank is the thing you build up over time, so capping it would be the wrong thing to charge for.`}
        </p>
        <p>
          {`You write the same fields the real task has: the photographs for a long turn, the prompts for a collaborative task, the follow-up question the other candidate answers, and the decision the pair have to reach.`}
        </p>
      </Section>

      <Section>
        <h2>{`What are themes for?`}</h2>
        <p>
          {`Every question can carry one or more of eighteen topics — technology, the environment, work and education, and so on. Tag your questions as you write them and you can then filter your bank by theme, or build a practice that draws only from one or two of them when your class is working on a topic.`}
        </p>
      </Section>

      <Section>
        <h2>{`What does it cost?`}</h2>
        <p>
          {`The free plan keeps one saved exam and three saved practices, with unlimited questions, and shows ads. Pro is €5 a month or €49 a year, and lifts the limits on saved exams and practices with no ads.`}
        </p>
        <p>
          {`There is an Academy plan for schools in the works, which is not open for sign-ups yet. Full detail is on the `}
          <Link href="/pricing">{`plans page`}</Link>
          {`.`}
        </p>
      </Section>

      <Section>
        <h2>{`Is this an official Cambridge product?`}</h2>
        <p>
          {`No. Speakgen is independent and is not affiliated with or endorsed by Cambridge University Press & Assessment. Cambridge English, B2 First, C1 Advanced and C2 Proficiency are their trademarks. The exam formats are followed as published so that practice is realistic, but the questions are written for this app.`}
        </p>
      </Section>

      <Section>
        <h2>{`Can I use it with a whole class?`}</h2>
        <p>
          {`Yes. An exam or a practice runs on screen one question at a time, with the timer for that part, so you can put it on a projector and work through it with a pair of candidates while the rest follow along.`}
        </p>
      </Section>
    </Prose>
  );
}
