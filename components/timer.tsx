import styles from '../styles/timer.module.css';

export default function Timer({ time = 10 }: { time: number }) {
  return (
    <div className={styles.timerBox}>
      <p className={styles.timerFont}>{time}</p>
    </div>
  );
}
