import styles from '../styles/nav.module.css';
import Link from 'next/link';

export default function Nav() {
  return (
    <div className={`${styles.navbar} glass`}>
      <div className={styles.leftNav}>
        <h1>First Certificate Speaking</h1>
      </div>
      <div className={styles.rightNav}>
        <ul>
          <Link href="/">Home</Link>
          <Link href="/speaking1">Part 1</Link>
          <Link href="/speaking2">Part 2</Link>
          <Link href="/speaking3">Part 3</Link>
          <Link href="/speaking4">Part 4</Link>
        </ul>
      </div>
    </div>
  );
}
