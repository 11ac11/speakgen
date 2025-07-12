"use client";

import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 800px;
  color: var(--lightgrey);
  font-size: 18px;

  h2 {
    margin: 0 0 1rem 0;
    color: var(--slategrey);
  }

  p {
    font-size: 18px;
    margin: 0 0 2rem 0;
  }

  ul {
    margin: 0 0 2rem 0;
  }
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

export default function About() {
  return (
    <Container className={"container"}>
      <Section>
        <h2>{`👋 About Speakgen`}</h2>
        <p>
          {`Hi! I’m the creator of `}
          <span style={{ fontWeight: "600" }}>{`Speakgen`}</span>
          {`—a simple, modern tool built to help teachers and students prepare for English speaking exams more effectively.`}
        </p>
        <p>
          {`Before I became a software developer, I worked as an `}
          <span style={{ fontWeight: "600" }}>{`English teacher`}</span>
          {`. Like many others, I relied heavily on printouts, photocopies, and a growing pile of paper resources just to simulate speaking exams like the `}
          <span style={{ fontWeight: "600" }}>{`Cambridge First (FCE)`}</span>
          {` or `}
          <span style={{ fontWeight: "600" }}>{`Advanced (CAE)`}</span>
          {`. It worked—but it was clunky, time-consuming, and hard to personalize.`}
        </p>
      </Section>

      <Section>
        <h2>{`💡 Why I Built Speakgen`}</h2>
        <p>
          {`After switching careers into tech, I saw a clear opportunity: `}
          <br />
          <span
            style={{ fontWeight: "600" }}
          >{`Why not build a digital tool`}</span>
          {` that makes it easy to generate and organize realistic speaking practice—without the admin hassle?`}
        </p>
        <p>{`Speakgen is the result:`}</p>
        <ul>
          <li>
            {`A platform where `}
            <span
              style={{ fontWeight: "600" }}
            >{`students can self-practice`}</span>
          </li>
          <li>
            {`A tool for `}
            <span
              style={{ fontWeight: "600" }}
            >{`teachers to build tailored question sets`}</span>
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
          <span style={{ fontWeight: "600" }}>
            {`speaking exam practice accessible, flexible, and paper-free`}
          </span>
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
        <span style={{ fontWeight: "600" }}>
          {`Support for more exam types`}
        </span>
        {` (e.g., IELTS, CAE, CPE)`}
      </li>
      <li>
        <span style={{ fontWeight: "600" }}>
          {`Audio recording and feedback tools`}
        </span>
      </li>
      <li>
        <span style={{ fontWeight: "600" }}>
          {`Teacher-student collaboration features`}
        </span>
      </li>
      <li>
        <span style={{ fontWeight: "600" }}>
          {`Progress tracking and analytics`}
        </span>
      </li>
    </ul>
  </Section> */}

      {/* <Section>
    <p>
      <em>{`Have a feature request? Want to get involved?`}</em>
      <br />
      <a href="#">{`Reach out here →`}</a>
    </p>
  </Section> */}

      <Section>
        <h2>{`🤝 Thanks for Visiting`}</h2>
      </Section>

      <p>
        {`Whether you're a teacher prepping your class or a student working on your own, I hope Speakgen helps make your journey to fluency a little smoother—and a lot more efficient.`}
      </p>
    </Container>
  );
}
