import styles from '../styles/timer.module.css';

export default function Timer({ time }: { time: number | undefined }) {
  return (
    <div className={styles.timerBox}>
      <p className={styles.timerFont}>{time}</p>
    </div>
  );
}
