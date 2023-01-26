export default function Instructions({
  instructions,
  speakTo,
}: {
  instructions: string;
  speakTo: string;
}) {
  return (
    <div className="instructionBox glass">
      <h3>Instructions:</h3>
      <p>{instructions}</p>
      <h3>Speak to:</h3>
      <p>{speakTo}</p>
    </div>
  );
}
