import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Wrap = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width || "100%"};
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

  &:checked {
    background-color: var(--leafgreen);
    border-color: var(--leafgreen);
  }

  &:checked::after {
    content: "";
    display: block;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin: 0 3px;
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
  color: rgb(255, 65, 80);
  font-size: 14px;
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
}) => {
  const [inputError, setInputError] = useState<string | undefined>(error);

  useEffect(() => {
    setInputError(error);
  }, [error]);

  return (
    <Wrap className={className} width={width}>
      <CheckboxContainer disabled={disabled}>
        <StyledCheckbox
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onClick={onClick}
          onBlur={onBlur}
          required={required}
          error={inputError}
          disabled={disabled}
        />
        <span>{label}</span>
      </CheckboxContainer>
      {inputError && <ErrorMessage>{inputError}</ErrorMessage>}
    </Wrap>
  );
};

export default Checkbox;
