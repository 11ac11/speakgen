"use client";

import React, { useEffect, useState } from "react";
import { stackClientApp } from "@/stack/client";
import Link from "next/link";
import styled from "styled-components";

const Navbar = styled.nav`
  padding: 1rem;
  display: flex;
  border-radius: 0;
  border: none;
  background: linear-gradient(to right, var(--leafgreen), var(--limegreen));

  @media only screen and (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 70%;
  max-width: 1200px;
  margin: auto;

  @media only screen and (max-width: 1200px) {
    width: 90%;
  }

  @media only screen and (max-width: 768px) {
    width: 100%;
  }

  @media only screen and (max-width: 600px) {
    flex-direction: column;
    justify-content: space-around;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  text-transform: uppercase;
  font-weight: 700;
  margin: 0;

  @media only screen and (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const RightNav = styled.div``;

const NavList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  gap: 4rem;
  justify-content: space-evenly;
  align-items: center;

  @media only screen and (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavItem = styled.li`
  a {
    font-size: 1rem;
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 700;

    @media only screen and (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
`;

export default function Nav() {
  const [user, setUser] = useState<any | null>(null); // state to hold the user

  useEffect(() => {
    // fetch user asynchronously
    stackClientApp.getUser().then((fetchedUser) => {
      setUser(fetchedUser);
    });
  }, []);

  // const isAuthenticated = status === "authenticated"
  const isAuthenticated = !!user;

  return (
    <Navbar>
      <NavContainer>
        <div>
          <Title>
            <Link href="/">Speakgen</Link>
          </Title>
        </div>
        <RightNav>
          <NavList>
            {/* <NavItem>
              <Link href="/">Home</Link>
            </NavItem>
            <NavItem>
              <Link href="/speaking1">Part 1</Link>
            </NavItem>
            <NavItem>
              <Link href="/speaking2">Part 2</Link>
            </NavItem>
            <NavItem>
              <Link href="/speaking3">Part 3</Link>
            </NavItem>
            <NavItem>
              <Link href="/speaking4">Part 4</Link> */}
            {/* </NavItem> */}
            {isAuthenticated ? (
              <>
                <NavItem>
                  <Link href="/dashboard">Dashboard</Link>
                </NavItem>
                <NavItem
                  onClick={async () => {
                    await stackClientApp.signOut();
                  }}
                >
                  <Link href="">Sign Out</Link>
                </NavItem>
              </>
            ) : (
              <>
                <NavItem>
                  <Link href="/about">About</Link>
                </NavItem>
                <NavItem>
                  <Link href="/faqs">FAQs</Link>
                </NavItem>
                <NavItem>
                  <Link href="/handler/sign-in">Log in</Link>
                </NavItem>
                <NavItem>
                  <Link href="/handler/sign-up">Sign up</Link>
                </NavItem>
              </>
            )}
          </NavList>
        </RightNav>
      </NavContainer>
    </Navbar>
  );
}
