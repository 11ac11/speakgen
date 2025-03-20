"use client";

import styled from "styled-components";

type StyledTabProps = {
  $isActive?: boolean; // Optional secondary prop
};

const StyledTab = styled.div<StyledTabProps>`
  border-bottom: ${({ $isActive }) => ($isActive ? "2px solid #62cc54" : "")};
  width: 250px;
  padding-bottom: 5px;
  text-align: center;
  cursor: pointer;
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
