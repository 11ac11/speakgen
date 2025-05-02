import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";

type StyledButtonProps = {
  $secondary?: boolean; // Optional secondary prop
};

const Wrap = styled.div``;

const StyledButton = styled.button<StyledButtonProps>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background: ${({ $secondary }) =>
    $secondary ? "transparent" : "rgba(255, 255, 255, 0.8)"};
  border-radius: 1rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8.2px);
  -webkit-backdrop-filter: blur(8.2px);
  border: 1px solid rgba(255, 255, 255, 0.27);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  ${({ $secondary }) =>
    $secondary &&
    `
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: 1px solid rgba(0, 0, 0, 0);
  `}

  transition: color 0.3s linear, opacity 0.1s linear;

  &:active {
    ${({ disabled }) => !disabled && "background: rgba(255, 255, 255, 0.4)"};
  }

  &:hover {
    opacity: 0.9;
  }
`;

type ButtonProps = {
  onClick: () => Promise<void> | void; // Can be either async or sync
  text: string; // The text to be displayed on the button
  loadingText?: string; // Optional text to show when loading
  isAsync?: boolean; // Determines whether the button is asynchronous
  disabled?: boolean; // Optional prop to manually disable the button
  secondary?: boolean; // Optional to use secondary styles
  type?: "button" | "submit" | "reset" | undefined;
  className?: "text" | undefined;
  iconUrl?: "text" | undefined;
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  loadingText = "Loading...",
  isAsync = false,
  disabled = false,
  secondary,
  type,
  className,
  iconUrl,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    if (isAsync) {
      setIsLoading(true);
      setError(null);

      try {
        await onClick(); // Trigger the async function
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false); // Reset loading state after async operation completes
      }
    } else {
      onClick(); // Trigger the normal (sync) function
    }
  };

  return (
    <Wrap className={className}>
      <StyledButton
        onClick={handleClick}
        disabled={isLoading || disabled}
        $secondary={secondary}
        type={type}
      >
        {iconUrl && <Image src={iconUrl} alt="" width={16} height={16} />}
        {isLoading ? loadingText : text}
      </StyledButton>
      {error && <p className="error-message">{error}</p>}
    </Wrap>
  );
};

export default Button;
