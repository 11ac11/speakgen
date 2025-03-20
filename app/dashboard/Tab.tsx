"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";

const StyledTab = styled.div`
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
