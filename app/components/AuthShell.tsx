"use client";

import styled from "styled-components";

/**
 * The shell every auth page sits in: log in, sign up, forgot password, reset
 * password.
 *
 * Login and signup each carried their own copy of these six, byte for byte
 * identical, and the two new pages would have made it four. One definition,
 * because a sign-in page and a password reset page looking like two different
 * products is exactly the moment somebody decides the reset link was a
 * phishing attempt.
 */

export const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  margin: 4rem auto 0;
  padding: 0 1rem;
`;

export const Heading = styled.h1`
  font-size: var(--text-2xl);
  margin: 0 0 0.4rem;
  align-self: flex-start;
`;

export const Sub = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
  margin: 0 0 1.75rem;
  align-self: flex-start;
`;

/** The "new here?" line under the form. */
export const Alt = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 1.75rem 0 0;

  a {
    color: var(--green-600);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

export const FormError = styled.p`
  color: var(--danger);
  font-size: var(--text-sm);
  margin: 0;
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  width: 100%;
`;

/* The confirmation after a reset email is requested, and after a password is
   changed. Green rather than plain text: both are the end of a flow, and "did
   that work?" is the only question left. */
export const Confirmation = styled.div`
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--green-edge);
  border-radius: var(--radius-card);
  background: var(--green-tint);

  p {
    margin: 0 0 0.6rem;
    color: var(--text-body);
    font-size: var(--text-sm);
  }

  p:last-child {
    margin-bottom: 0;
    color: var(--text-muted);
  }
`;
