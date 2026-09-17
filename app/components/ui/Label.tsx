import styled from "styled-components";

const StyledLabel = styled.label`
  /* 18px read as body text next to a field and competed with it. A label is
     support for the control, not a heading above it. */
  display: block;
  margin-bottom: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #5a625a;
`;

export const Label = ({
  text,
  htmlFor
}: {
  text: string;
  htmlFor?: string | undefined;
}) => {
  return <StyledLabel htmlFor={htmlFor}>{text}</StyledLabel>;
};
