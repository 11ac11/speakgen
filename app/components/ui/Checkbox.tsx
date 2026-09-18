import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Wrap = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width || "100%"};
`;

/* A box on its own, in a table cell or a toolbar, where the meaning comes from
   the column it sits in rather than from words beside it.
   Block-level flex rather than inline-flex: as an inline box it sat on the
   text baseline, which left it a few pixels below the middle of a table row
   and lower still on a row whose question wrapped to two lines. */
const BareWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const CheckboxContainer = styled.label<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const StyledCheckbox = styled.input<{ error?: string }>`
  width: 18px;
  height: 18px;
  appearance: none;
  border: 2px solid ${({ error }) => (error ? "rgb(255, 65, 80)" : "#ccc")};
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  /* Both marks are placed from the centre rather than pushed into position
     with margins, which is what left the tick sitting low and left of the
     middle of the box. */
  position: relative;

  &:checked {
    background-color: var(--leafgreen);
    border-color: var(--leafgreen);
  }

  &:checked::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    /* The tick is two sides of a square turned 45 degrees, so its ink hangs in
       the lower half of the box it is drawn in. Centring the box alone leaves
       the mark looking low; -58% puts the ink on the middle. */
    transform: translate(-50%, -58%) rotate(45deg);
  }

  &:indeterminate {
    background-color: var(--leafgreen);
    border-color: var(--leafgreen);
  }

  &:indeterminate::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 2px;
    background: #fff;
    border-radius: 1px;
    transform: translate(-50%, -50%);
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: #eee;
    cursor: not-allowed;
  }

  ${({ error }) =>
    error &&
    `
    box-shadow: 0 0 5px 2px rgba(255, 65, 80, 0.5);
  `}
`;

const ErrorMessage = styled.span`
  margin-top: 8px;
  color: var(--danger);
  font-size: var(--text-sm);
`;

type CustomCheckboxProps = {
  className?: string;
  label?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick?: () => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  width?: string;
  disabled?: boolean;
  /** Neither all nor none: some of what this box stands for is selected. */
  indeterminate?: boolean;
  /** For a box with no visible label, which still has to say what it does. */
  ariaLabel?: string;
};

const Checkbox: React.FC<CustomCheckboxProps> = ({
  className,
  label,
  name,
  checked,
  onChange,
  onClick,
  onBlur,
  required = false,
  error,
  width,
  disabled,
  indeterminate,
  ariaLabel
}) => {
  const [inputError, setInputError] = useState<string | undefined>(error);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputError(error);
  }, [error]);

  // Indeterminate has no attribute: it is only reachable as a DOM property.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  const box = (
    <StyledCheckbox
      ref={inputRef}
      type="checkbox"
      name={name}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={onClick}
      onBlur={onBlur}
      required={required}
      error={inputError}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );

  // A label element around a box with nothing to say wraps empty space, which
  // a pointer can then toggle from anywhere in the cell.
  if (!label) {
    return <BareWrap className={className}>{box}</BareWrap>;
  }

  return (
    <Wrap className={className} width={width}>
      <CheckboxContainer disabled={disabled}>
        {box}
        <span>{label}</span>
      </CheckboxContainer>
      {inputError && <ErrorMessage>{inputError}</ErrorMessage>}
    </Wrap>
  );
};

export default Checkbox;
