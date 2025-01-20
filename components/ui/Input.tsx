import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Label = styled.label`
  margin-bottom: 5px;
`;

type StyledInputProps = {
  error?: string;
};

const StyledInput = styled.input<StyledInputProps>`
  border-radius: 1rem;
  border-style: solid;
  border-width: 1px;
  outline: none;
  padding: 0.5rem 1rem;
  font-size: 20px;

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
  label: string;
  type: "text" | "password" | "email" | "number" | "select"; // Support for more input types
  value: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  error?: string;
  isDropdown?: boolean;
};

const SecureInput: React.FC<SecureInputProps> = ({
  className,
  label,
  type,
  value,
  onChange,
  onClick,
  onBlur,
  required = false,
  placeholder = "",
  minLength,
  maxLength,
  error,
  isDropdown,
}) => {
  const [inputError, setInputError] = useState<string | undefined>(error);

  // Utility function to sanitize the input value to prevent XSS attacks
  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>/g, ""); // Remove any HTML tags
  };

  useEffect(() => {
    setInputError(error);
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) =>
    !!onBlur ? onBlur() : null;

  return (
    <Wrap>
      <Label>{label}</Label>
      <StyledInput
        type={type}
        value={value}
        onChange={handleChange}
        onClick={onClick}
        onBlur={handleBlur}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        error={inputError}
        className={`${className} shadow`}
      />
      {inputError && (
        <ErrorMessage className="error-message">{inputError}</ErrorMessage>
      )}
    </Wrap>
  );
};

export default SecureInput;
