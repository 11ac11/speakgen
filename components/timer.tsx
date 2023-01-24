import { useState, useEffect } from 'react';

export default function Timer({ time = 60 }: { time: number }) {
  const [timeLeft, setTimeLeft] = useState(time);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);
  return (
    <div className="timerBox">
      <p className="timerFont">{timeLeft}</p>
    </div>
  );
}
