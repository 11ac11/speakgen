"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import styled from "styled-components";
import { SUPPORTED_LEVELS } from "@/constants";

const Navbar = styled.nav`
  background: linear-gradient(to right, var(--leafgreen), var(--limegreen));
  padding: 0.75rem 1rem;

  @media only screen and (max-width: 600px) {
    padding: 0.6rem 0.75rem;
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  width: 90%;
  max-width: 1200px;
  margin: auto;

  @media only screen and (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
`;

/* Not an h1: it appears on every page, so it would give each page a second
   top-level heading competing with the one that actually describes it. The
   site name is a landmark, not the page's title. */
const Title = styled.div`
  font-family: var(--font-display), sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--text-heading);

  a:hover {
    color: var(--text-heading);
  }
`;

const NavList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  @media only screen and (max-width: 768px) {
    gap: 0.15rem;
    flex-wrap: wrap;
  }
`;

/* position: relative so each menu hangs off its own item. */
const NavItem = styled.li`
  position: relative;
`;

const triggerStyles = `
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-heading);
  background: transparent;
  border: none;
  border-radius: var(--radius-control);
  padding: 0.5rem 0.75rem;
  min-height: 40px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.12s ease;

  &:hover,
  &:focus-visible {
    color: var(--text-heading);
    background: rgba(255, 255, 255, 0.45);
  }

  &:focus-visible {
    outline: 2px solid var(--green-800);
    outline-offset: 1px;
  }
`;

const NavLink = styled(Link)`
  ${triggerStyles}
`;

const MenuButton = styled.button`
  ${triggerStyles}
`;

const Chevron = styled.svg`
  width: 12px;
  height: 12px;
  transition: transform 0.15s ease;
`;

/* Opens on hover and on keyboard focus. focus-within is what makes it
   reachable by Tab: without it the menu would be mouse-only. */
const Menu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 40;
  margin: 0;
  padding: 0.35rem;
  list-style: none;
  min-width: 235px;
  background: #fff;
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  box-shadow: 0 12px 28px -14px rgba(23, 30, 25, 0.45);

  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition:
    opacity 0.12s ease,
    transform 0.12s ease,
    visibility 0.12s;
`;

const Dropdown = styled(NavItem)`
  &:hover ${Menu}, &:focus-within ${Menu} {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover ${Chevron}, &:focus-within ${Chevron} {
    transform: rotate(180deg);
  }
`;

const MenuLink = styled(Link)`
  display: block;
  padding: 0.55rem 0.7rem;
  border-radius: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-body);

  strong {
    display: block;
    font-weight: 500;
    color: var(--text-heading);
  }

  small {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  &:hover,
  &:focus-visible {
    color: var(--text-body);
    background: var(--green-tint);
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: -2px;
  }
`;

const MenuHeading = styled.li`
  padding: 0.45rem 0.7rem 0.25rem;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-faint);
`;

/* The one call to action in the bar, so it is the only filled thing in it. */
const SignUp = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0.5rem 1rem;
  margin-left: 0.35rem;
  border-radius: var(--radius-control);
  background: var(--green-600);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 3px 0 0 var(--green-800);
  transition:
    transform 0.12s var(--lift),
    box-shadow 0.12s ease,
    background-color 0.12s ease;

  &:hover {
    color: #fff;
    background: var(--green-500);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 0 var(--green-800);
  }

  &:active {
    color: #fff;
    transform: translateY(1px);
    box-shadow: 0 1px 0 0 var(--green-800);
  }
`;

function ChevronIcon() {
  return (
    <Chevron viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Chevron>
  );
}

export default function Nav() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  return (
    <Navbar aria-label="Main">
      <NavContainer>
        <Title>
          <Link href="/">Speakgen</Link>
        </Title>

        <NavList>
          {/* Deliberately first, and present whether or not you are signed in:
              the free content is what brings people in, and a paying teacher
              still uses it every lesson. */}
          <Dropdown>
            <MenuButton type="button" aria-haspopup="true">
              Free
              <ChevronIcon />
            </MenuButton>
            <Menu>
              <MenuHeading>Full practice exams</MenuHeading>
              {SUPPORTED_LEVELS.map((level) => (
                <li key={`exams-${level}`}>
                  <MenuLink href={`/${level.toLowerCase()}/exams`}>
                    <strong>{`${level} exams`}</strong>
                    <small>Run a complete speaking test</small>
                  </MenuLink>
                </li>
              ))}
              <MenuHeading>Single questions</MenuHeading>
              {SUPPORTED_LEVELS.map((level) => (
                <li key={`random-${level}`}>
                  <MenuLink href={`/${level.toLowerCase()}/questions/random/1`}>
                    <strong>{`${level} question practice`}</strong>
                    <small>A random question to work through</small>
                  </MenuLink>
                </li>
              ))}
            </Menu>
          </Dropdown>

          {isAuthenticated ? (
            <>
              <Dropdown>
                <MenuButton type="button" aria-haspopup="true">
                  My work
                  <ChevronIcon />
                </MenuButton>
                <Menu>
                  <li>
                    <MenuLink href="/dashboard?tab=questions">
                      <strong>My questions</strong>
                      <small>Write and edit your own</small>
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/dashboard?tab=exams">
                      <strong>My exams</strong>
                      <small>Exams you have built</small>
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/questions/new">
                      <strong>New question</strong>
                      <small>Add one to your bank</small>
                    </MenuLink>
                  </li>
                </Menu>
              </Dropdown>

              <Dropdown>
                <MenuButton type="button" aria-haspopup="true">
                  Account
                  <ChevronIcon />
                </MenuButton>
                <Menu>
                  <li>
                    <MenuLink href="/dashboard?tab=settings">
                      <strong>Plan and school</strong>
                      <small>Usage, billing and teachers</small>
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/pricing">
                      <strong>Compare plans</strong>
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/" onClick={() => authClient.signOut()}>
                      <strong>Sign out</strong>
                    </MenuLink>
                  </li>
                </Menu>
              </Dropdown>
            </>
          ) : (
            <>
              <NavItem>
                <NavLink href="/pricing">Plans</NavLink>
              </NavItem>

              <Dropdown>
                <MenuButton type="button" aria-haspopup="true">
                  About
                  <ChevronIcon />
                </MenuButton>
                <Menu>
                  <li>
                    <MenuLink href="/about">
                      <strong>About Speakgen</strong>
                      <small>Why it exists</small>
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/faqs">
                      <strong>FAQs</strong>
                    </MenuLink>
                  </li>
                </Menu>
              </Dropdown>

              <NavItem>
                <NavLink href="/login">Log in</NavLink>
              </NavItem>

              <NavItem>
                <SignUp href="/signup">Sign up free</SignUp>
              </NavItem>
            </>
          )}
        </NavList>
      </NavContainer>
    </Navbar>
  );
}
