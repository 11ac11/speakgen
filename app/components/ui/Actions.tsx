import styled from "styled-components";

const ActionsWrap = styled.div`
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

const ActionButton = styled.div`
  background-color: lightgrey;
  color: white;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  width: 25px;
  cursor: pointer;
  transition: background-color 0.1s ease-in-out;

  &:hover {
    background-color: darkgrey;
  }
`;

export default function Actions({
  questionId,
  part,
}: {
  questionId: number;
  part: string;
}) {
  console.log("questionId, part:", questionId, part);

  return (
    <ActionsWrap className="actions">
      <ActionButton>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path d="M3 21h3.75L19.81 7.94l-3.75-3.75L3 17.25V21zm18.71-16.29a1 1 0 000-1.42l-2-2a1 1 0 00-1.42 0l-2.12 2.12 3.75 3.75 2.12-2.12z" />
        </svg>
      </ActionButton>
      <ActionButton>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
        >
          <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59 7.1 5.7a1 1 0 1 0-1.4 1.42L10.59 12l-4.9 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.42z" />
        </svg>
      </ActionButton>
    </ActionsWrap>
  );
}
