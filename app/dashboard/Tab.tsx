"use client";

import styled from "styled-components";

type StyledTabProps = {
  $isActive?: Boolean; // Optional secondary prop
};

const StyledTab = styled.div<StyledTabProps>`
  border-bottom: ${({ $isActive }) =>
    $isActive ? "2px solid var(--leafgreen)" : ""};
  width: 250px;
  padding-bottom: 5px;
  text-align: center;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 700;
`;

export default function Tab({
  isActive,
  text,
  onClick,
}: {
  isActive: Boolean;
  text: String;
  onClick: any;
}) {
  return (
    <StyledTab $isActive={isActive} onClick={onClick}>
      {text}
    </StyledTab>
  );
}
