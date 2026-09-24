"use client";

import React from "react";
import NextLink from "next/link";
import styled from "styled-components";
import LogoMark from "@/app/components/ui/LogoMark";
import Button from "@/app/components/ui/Button";

/**
 * The page for when something is not there or has gone wrong: the 404, the
 * dead share link and the error boundary. One layout, so the three read as
 * the same product having a bad moment rather than three different ones, and
 * each only says what happened and where to go next.
 */

const Wrap = styled.div`
  padding-top: 5rem;
  padding-bottom: 4rem;

  h1 {
    margin: 1.25rem 0 0.6rem;
  }

  p {
    color: var(--text-muted);
    max-width: 34rem;
    margin: 0 0 0.75rem;
  }
`;

const Mark = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const Code = styled.span`
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-faint);
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.75rem;
`;

const linkButton = `
  display: inline-flex;
  align-items: center;
  min-height: var(--control-height);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-control);
  font-size: var(--text-base);
  font-weight: 500;
  transition:
    transform 0.12s var(--lift),
    box-shadow 0.12s ease,
    background-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Primary = styled(NextLink)`
  ${linkButton}
  background: var(--green-600);
  color: #fff;
  box-shadow: 0 3px 0 0 var(--green-800);

  &:hover,
  &:active {
    color: #fff;
    background: var(--green-500);
  }
`;

const Secondary = styled(NextLink)`
  ${linkButton}
  background: #fff;
  color: var(--green-600);
  border: 1.5px solid var(--green-edge);
  box-shadow: 0 3px 0 0 #e4ebe2;

  &:hover,
  &:active {
    color: var(--green-600);
    background: var(--green-tint);
  }
`;

const Reference = styled.p`
  && {
    margin-top: 2rem;
    font-size: var(--text-xs);
    color: var(--text-faint);
  }

  code {
    font-family: ui-monospace, monospace;
  }
`;

export type ErrorAction = { label: string; href: string };

export default function ErrorScreen({
  code,
  title,
  children,
  primary,
  secondary,
  onRetry,
  reference
}: {
  /** "404", "Error": a small label beside the mark, not a headline. */
  code: string;
  title: string;
  children: React.ReactNode;
  primary?: ErrorAction;
  secondary?: ErrorAction;
  /** Offers Try again, for an error that a second attempt might clear. */
  onRetry?: () => void;
  /** The error's digest, which matches it to the server's log. */
  reference?: string;
}) {
  return (
    <Wrap className="page page-narrow">
      <Mark>
        <LogoMark size={40} />
        <Code>{code}</Code>
      </Mark>
      <h1>{title}</h1>
      {children}
      <Actions>
        {onRetry ? <Button text="Try again" onClick={onRetry} /> : null}
        {primary ? (
          onRetry ? (
            <Secondary href={primary.href}>{primary.label}</Secondary>
          ) : (
            <Primary href={primary.href}>{primary.label}</Primary>
          )
        ) : null}
        {secondary ? (
          <Secondary href={secondary.href}>{secondary.label}</Secondary>
        ) : null}
      </Actions>
      {reference ? (
        <Reference>
          If you contact us about this, quote <code>{reference}</code>.
        </Reference>
      ) : null}
    </Wrap>
  );
}
