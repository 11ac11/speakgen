import React, { useState } from "react";
import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Label = styled.label``;

const StyledInput = styled.input`
  border-radius: 1rem;
  border: none;
  outline: none;
  padding: 0.5rem 1rem;
  font-size: 20px;
`;

const ErrorMessage = styled.span`
  margin-top: 10px;
  color: red;
  font-size: 14px;
`;

// Types for the component's props
type SecureInputProps = {
  label: string;
  type: "text" | "password" | "email" | "number"; // Support for more input types
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
};

const SecureInput: React.FC<SecureInputProps> = ({
  label,
  type,
  value,
  onChange,
  required = false,
  placeholder = "",
  minLength,
  maxLength,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Utility function to sanitize the input value to prevent XSS attacks
  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>/g, ""); // Remove any HTML tags
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value); // Sanitize input on change
    onChange(sanitizedValue);

    // Validation logic (you can add additional validation as needed)
    if (minLength && sanitizedValue.length < minLength) {
      setError(`Minimum length is ${minLength}`);
    } else if (maxLength && sanitizedValue.length > maxLength) {
      setError(`Maximum length is ${maxLength}`);
    } else {
      setError(null);
    }
  };

  return (
    <Wrap>
      <Label>{label}</Label>
      <StyledInput
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
      />
      {error && <ErrorMessage className="error-message">{error}</ErrorMessage>}
    </Wrap>
  );
};

export default SecureInput;
