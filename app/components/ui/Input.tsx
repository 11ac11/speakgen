import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Label } from "./Label";

const Wrap = styled.div<{ width: string | undefined }>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => (width ? width : "100%")};
`;

const StyledInput = styled.input<{ error: string | undefined }>`
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  outline: none;
  padding: 0.5rem 1rem;
  font-size: 16px;
  font-weight: 300;

  &:disabled {
    background-color: var(--verylightgrey);
    cursor: not-allowed;
    user-select: none;
  }

  ${({ error }) =>
    !!error &&
    `
    border-color: rgb(255, 65, 80);
    box-shadow: 0 0 5px 2px rgba(255, 65, 80, 0.5);
  `}
  transition: border-color 0.3s, box-shadow 0.3s;
`;

const StyledTextArea = styled.textarea<{ error: string | undefined }>`
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  outline: none;
  padding: 0.5rem 1rem;
  font-size: 16px;
  font-family: "Sofia Sans", sans-serif;

  ${({ error }) =>
    !!error &&
    `
    border-color: rgb(255, 65, 80);
    box-shadow: 0 0 5px 2px rgba(255, 65, 80, 0.5);
  `}
  transition: border-color 0.3s, box-shadow 0.3s;
`;

const ErrorMessage = styled.span`
  margin-top: 10px;
  color: rgb(255, 65, 80);
  font-size: 14px;
`;

// Types for the component's props
type SecureInputProps = {
  className?: string;
  label?: string;
  type: "text" | "password" | "email" | "number" | "select"; // Support for more input types
  value: string;
  name?: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  error?: string;
  isDropdown?: boolean;
  width?: string;
  children?: any;
  disabled?: boolean | undefined;
  isTextArea?: boolean;
};

const SecureInput: React.FC<SecureInputProps> = ({
  className,
  label,
  type,
  name,
  value,
  onChange,
  onClick,
  onBlur,
  required = false,
  placeholder = "",
  minLength,
  maxLength,
  error,
  width,
  children,
  disabled,
  isTextArea,
}) => {
  const [inputError, setInputError] = useState<string | undefined>(error);
  const [inputPlaceholder, setInputPlaceholder] = useState<string | undefined>(
    placeholder,
  );

  // Utility function to sanitize the input value to prevent XSS attacks
  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>/g, ""); // Remove any HTML tags
  };

  useEffect(() => {
    setInputError(error);
  }, [error]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const sanitizedValue = sanitizeInput(e.target.value); // Sanitize input on change
    onChange(sanitizedValue);

    // // Validation logic (you can add additional validation as needed)
    // if (minLength && sanitizedValue.length < minLength) {
    //   setInputError(`Minimum length is ${minLength}`);
    // } else if (maxLength && sanitizedValue.length > maxLength) {
    //   setInputError(`Maximum length is ${maxLength}`);
    // } else {
    //   setInputError("");
    // }
  };

  const handleBlur = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => (!!onBlur ? onBlur() : null);

  return (
    <Wrap className={className} width={width}>
      {label && <Label text={label} htmlFor={name} />}
      {isTextArea ? (
        <StyledTextArea
          value={value}
          name={name}
          id={name}
          onChange={handleChange}
          onClick={onClick}
          onFocus={() => setInputPlaceholder("")}
          onBlur={(e) => {
            handleBlur?.(e); // optional chaining if `handleBlur` exists
            setInputPlaceholder(placeholder); // restore
          }}
          required={required}
          placeholder={inputPlaceholder}
          minLength={minLength}
          maxLength={maxLength}
          error={inputError}
          className={`${className} shadow`}
          disabled={disabled}
        />
      ) : (
        <StyledInput
          type={type}
          value={value}
          name={name}
          id={name}
          onChange={handleChange}
          onClick={onClick}
          onFocus={() => setInputPlaceholder("")}
          onBlur={(e) => {
            handleBlur?.(e); // optional chaining if `handleBlur` exists
            setInputPlaceholder(placeholder); // restore
          }}
          required={required}
          placeholder={inputPlaceholder}
          minLength={minLength}
          maxLength={maxLength}
          error={inputError}
          className={`${className} shadow`}
          disabled={disabled}
        />
      )}
      {children}
      {inputError && (
        <ErrorMessage className="error-message">{inputError}</ErrorMessage>
      )}
    </Wrap>
  );
};

export default SecureInput;
