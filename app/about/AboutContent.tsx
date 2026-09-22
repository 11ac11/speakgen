"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Prose } from "@/app/components/Prose";

/* No bottom margin: the h2 inside the next Section owns the gap between
   sections, so the two were stacking and pushing headings a long way from the
   paragraph they follow. */
const Section = styled.div`
  margin-bottom: 0;
`;

export default function AboutContent() {
  return (
    <Prose className={"container"}>
      <h1>About Speakgen</h1>
      <Section>
        <h2>{`Why this exists`}</h2>
        <p>
          {`Hi! I’m the creator of `}
          <strong>{`Speakgen`}</strong>
          {`—a simple, modern tool built to help teachers and students prepare for English speaking exams more effectively.`}
        </p>
        <p>
          {`Before I became a software developer, I worked as an `}
          <strong>{`English teacher`}</strong>
          {`. Like many others, I relied heavily on printouts, photocopies, and a growing pile of paper resources just to simulate speaking exams like the `}
          <strong>{`Cambridge First (FCE)`}</strong>
          {` or `}
          <strong>{`Advanced (CAE)`}</strong>
          {`. It worked—but it was clunky, time-consuming, and hard to personalize.`}
        </p>
      </Section>

      <Section>
        <h2>{`💡 Why I Built Speakgen`}</h2>
        <p>
          {`After switching careers into tech, I saw a clear opportunity: `}
          <br />
          <strong>{`Why not build a digital tool`}</strong>
          {` that makes it easy to generate and organize realistic speaking practice—without the admin hassle?`}
        </p>
        <p>{`Speakgen is the result:`}</p>
        <ul>
          <li>
            {`A platform where `}
            <strong>{`students can self-practice`}</strong>
          </li>
          <li>
            {`A tool for `}
            <strong>{`teachers to build tailored question sets`}</strong>
          </li>
          <li>
            {`A clean, focused experience with no fluff—just what you need to simulate the exam`}
          </li>
        </ul>
      </Section>

      <Section>
        <h2>{`🎯 The Mission`}</h2>
        <p>
          {`To make `}
          <strong>
            {`speaking exam practice accessible, flexible, and paper-free`}
          </strong>
          {`, for learners and educators everywhere.`}
        </p>
      </Section>

      {/* <Section>
    <h2>{`🛠️ What’s Next`}</h2>
    <p>
      {`This is just the beginning! Here are some features and ideas in the pipeline:`}
    </p>
    <ul>
      <li>
        <strong>
          {`Support for more exam types`}
        </strong>
        {` (e.g., IELTS, CAE, CPE)`}
      </li>
      <li>
        <strong>
          {`Audio recording and feedback tools`}
        </strong>
      </li>
      <li>
        <strong>
          {`Teacher-student collaboration features`}
        </strong>
      </li>
      <li>
        <strong>
          {`Progress tracking and analytics`}
        </strong>
      </li>
    </ul>
  </Section> */}

      {/* This sat commented out with href="#" because there was nowhere for it
          to go. There is now. */}
      <Section>
        <h2>{`✉️ Get in touch`}</h2>
        <p>
          {`Have a feature request, found something broken, or want to get involved? `}
          <Link href="/contact">{`Send me a message`}</Link>
          {`. It is one person reading.`}
        </p>
      </Section>

      {/* The closing paragraph sat outside this Section, so its heading was
          orphaned above a section break and the two drifted apart. */}
      <Section>
        <h2>{`🤝 Thanks for Visiting`}</h2>
        <p>
          {`Whether you're a teacher prepping your class or a student working on your own, I hope Speakgen helps make your journey to fluency a little smoother—and a lot more efficient.`}
        </p>
      </Section>
    </Prose>
  );
}
