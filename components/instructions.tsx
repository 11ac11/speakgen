import styles from '../styles/speaking4.module.css';

export default function Instructions({
  instructions,
  speakTo,
}: {
  instructions: string;
  speakTo: string;
}) {
  return (
    <div className={styles.instructionBox}>
      <h3>Instructions:</h3>
      <p>{instructions}</p>
      <h3>Speak to:</h3>
      <p>{speakTo}</p>
    </div>
  );
}
