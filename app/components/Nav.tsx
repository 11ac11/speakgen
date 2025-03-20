"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import styled from "styled-components";

const Navbar = styled.nav`
  padding: 1rem;
  display: flex;
  border-radius: 0;
  border: none;
  background: linear-gradient(to right, #62cc54, #bfe285);

  @media only screen and (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 70%;
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
  gap: 1rem;
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

    @media only screen and (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
`;

export default function Nav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <Navbar>
      <NavContainer>
        <div>
          <Title>Speakgen</Title>
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
              <NavItem onClick={() => signOut()}>
                <Link href="/login">Sign Out</Link>
              </NavItem>
            ) : (
              <>
                <NavItem>
                  <Link href="/login">Log in</Link>
                </NavItem>
                <NavItem>
                  <Link href="/signup">Sign up</Link>
                </NavItem>
              </>
            )}
            {/* <NavItem>
              <Link href="/create-question">Create</Link>
            </NavItem> */}
          </NavList>
        </RightNav>
      </NavContainer>
    </Navbar>
  );
}
