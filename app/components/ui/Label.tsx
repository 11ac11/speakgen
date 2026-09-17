import styled from "styled-components";

const StyledLabel = styled.label`
  /* 18px read as body text next to a field and competed with it. A label is
     support for the control, not a heading above it. */
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-label);
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
