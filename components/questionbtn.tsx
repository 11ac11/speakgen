import { MouseEventHandler } from 'react';

export default function Questionbtn({
  onClick,
  text = 'Get Question',
}: {
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  text?: String;
}) {
  return <button onClick={onClick}>{text}</button>;
}
