import styled from "styled-components";

const StyledLabel = styled.label`
  margin-bottom: 10px;
  font-size: 18px;
`;

export const Label = ({ text }: { text: string }) => {
  return <StyledLabel>{text}</StyledLabel>;
};
