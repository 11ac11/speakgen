"use client";

import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 800px;
  color: grey;

  h2 {
    margin: 0 0 1rem 0;
    color: var(--slategrey);
  }

  p {
    margin: 0 0 2rem 0;
  }

  ul {
    margin: 0 0 2rem 0;
  }
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

export default function Faqs() {
  return (
    <Container className={"container"}>
      <Section>
        <h2>What is Speakgen?</h2>
        <p>
          Speakgen is an app that simulates Cambridge-style speaking exams. It's
          designed for both teachers guiding their students and individuals
          studying on their own.
        </p>
      </Section>
      <Section>
        <h2>Do I need an account?</h2>
        <p>
          You can explore Speakgen and use its basic features without an
          account. However, if you want to create your own questions or build
          question sets, you’ll need to sign up.
        </p>
      </Section>
      <Section>
        <h2>What extra features do I unlock with an account?</h2>
        <ul>
          <li>
            Create your own questions—tailored to your lesson plans or personal
            study needs.
          </li>
          <li>
            Build question sets—combine individual questions into cohesive sets
            for structured practice.
          </li>
        </ul>
      </Section>
      <Section>
        <h2>What is a question set?</h2>
        <p style={{ marginBottom: "0.5rem" }}>
          A question set is a curated grouping of speaking prompts designed to
          mimic Cambridge exam formats:
        </p>
        <ul>
          <li>Full exam style: Covers Parts 1–4.</li>
          <li>
            Single-part focus: For example, a set with only Part 2 questions.
            These sets can also be theme-based, allowing you to focus on topics
            you’re currently studying.
          </li>
        </ul>
      </Section>
    </Container>
  );
}
