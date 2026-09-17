import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Label } from "./Label";

const Wrap = styled.div<{ width: string | undefined }>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => (width ? width : "100%")};
`;

const StyledInput = styled.input<{ error: string | undefined }>`
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-base);
  color: var(--text-body);
  background: #fff;
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  outline: none;
  padding: 0.75rem 0.9rem;
  min-height: 48px;
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease;

  &::placeholder {
    color: var(--text-faint);
  }

  &:hover {
    border-color: var(--field-edge-hover);
  }

  /* Focus is the one place the bright brand green earns its keep. */
  &:focus {
    border-color: var(--green-600);
    box-shadow: 0 0 0 4px rgba(98, 204, 84, 0.28);
  }

  &:disabled {
    background: var(--off-bg);
    color: var(--off-text);
    border-color: var(--off-edge);
    box-shadow: var(--off-inset);
    cursor: not-allowed;
    user-select: none;
  }

  &:disabled:hover {
    border-color: var(--off-edge);
  }

  ${({ error }) =>
    !!error &&
    `
    border-color: var(--danger);
    box-shadow: 0 0 0 4px rgba(198, 64, 47, 0.14);
  `}
`;

const StyledTextArea = styled.textarea<{ error: string | undefined }>`
  border-radius: var(--radius-control);
  border: 1.5px solid var(--field-edge);
  outline: none;
  padding: 0.75rem 0.9rem;
  font-size: var(--text-base);
  color: var(--text-body);
  background: #fff;
  /* Was "Sofia Sans", which the font import never loaded — it has been
     falling back to the default sans all along. */
  font-family: var(--font-body), sans-serif;

  &:hover {
    border-color: var(--field-edge-hover);
  }

  &:focus {
    border-color: var(--green-600);
    box-shadow: 0 0 0 4px rgba(98, 204, 84, 0.28);
  }

  &:disabled {
    background: var(--off-bg);
    color: var(--off-text);
    border-color: var(--off-edge);
    box-shadow: var(--off-inset);
    cursor: not-allowed;
  }

  ${({ error }) =>
    !!error &&
    `
    border-color: var(--danger);
    box-shadow: 0 0 5px 2px rgba(255, 65, 80, 0.5);
  `}
  transition: border-color 0.3s, box-shadow 0.3s;
`;

const ErrorMessage = styled.span`
  margin-top: 10px;
  color: var(--danger);
  font-size: var(--text-sm);
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
  isTextArea
}) => {
  const [inputError, setInputError] = useState<string | undefined>(error);
  const [inputPlaceholder, setInputPlaceholder] = useState<string | undefined>(
    placeholder
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
      | React.ChangeEvent<HTMLTextAreaElement>
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

  const handleBlur = () => onBlur?.();

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
          onBlur={() => {
            handleBlur?.(); // optional chaining if `handleBlur` exists
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
          onBlur={() => {
            handleBlur?.(); // optional chaining if `handleBlur` exists
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
