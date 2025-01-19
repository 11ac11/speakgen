import React from "react";
import styles from "../styles/nav.module.css";
import Link from "next/link";

export default function Nav() {
  return (
    <div className={`${styles.navbar} glass`}>
      <div className={styles.navCont}>
        <div className={styles.leftNav}>
          <h1>First Certificate Speaking</h1>
        </div>
        <div className={styles.rightNav}>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/speaking1">Part 1</Link>
            </li>
            <li>
              <Link href="/speaking2">Part 2</Link>
            </li>
            <li>
              <Link href="/speaking3">Part 3</Link>
            </li>
            <li>
              <Link href="/speaking4">Part 4</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
