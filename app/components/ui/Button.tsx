import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";

type StyledButtonProps = {
  $secondary?: boolean; // Optional secondary prop
  $danger?: boolean;
  $isBigButton?: boolean;
  $isDashboardButton?: boolean;
  $width?: string | number;
};

const Wrap = styled.div`
  display: flex;
  align-items: flex-end;
`;

const StyledButton = styled.button<StyledButtonProps>`
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-base);
  font-weight: 500;
  min-height: var(--control-height);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-control);
  border: 1.5px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  overflow: hidden;
  cursor: pointer;
  ${({ $width }) => $width && `width: ${$width};`}

  /* The whole personality of the system is here: a hard shadow gives the
     button a physical edge, hover lifts it, pressing pushes it down. */
  transition:
    transform 0.12s var(--lift),
    box-shadow 0.12s ease,
    background-color 0.12s ease,
    border-color 0.12s ease;

  background: var(--green-600);
  color: #fff;
  box-shadow: 0 3px 0 0 var(--green-800);

  &:hover {
    background: var(--green-500);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 0 var(--green-800);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 0 var(--green-800);
  }

  &:focus-visible {
    outline: 3px solid var(--leafgreen);
    outline-offset: 2px;
  }

  ${({ $secondary }) =>
    $secondary &&
    `
    background: #fff;
    color: var(--green-600);
    border-color: var(--green-edge);
    box-shadow: 0 3px 0 0 #e4ebe2;

    &:hover {
      background: var(--green-tint);
      border-color: var(--leafgreen);
      box-shadow: 0 5px 0 0 #e4ebe2;
    }

    &:active {
      box-shadow: 0 1px 0 0 #e4ebe2;
    }
  `}

  /* For the step that cannot be undone — stopping a share link, say — once the
     teacher has been asked and is confirming. Red on the confirm, not on the
     first click, so the colour means "this is the one that does it". */
  ${({ $danger }) =>
    $danger &&
    `
    background: var(--danger);
    color: #fff;
    box-shadow: 0 3px 0 0 #8f2c20;

    &:hover {
      background: #d4513f;
      box-shadow: 0 5px 0 0 #8f2c20;
    }

    &:active {
      box-shadow: 0 1px 0 0 #8f2c20;
    }

    &:focus-visible {
      outline-color: var(--danger);
    }
  `}

  ${({ $isBigButton }) =>
    $isBigButton &&
    `
    font-size: var(--text-base);
    font-weight: 600;
    padding: 0.9rem 1.9rem;
  `}

  ${({ $isDashboardButton }) =>
    $isDashboardButton &&
    `
    min-height: var(--control-height);
    padding: 0.6rem 1.2rem;
    font-size: var(--text-base);
  `}

  /* Off is off: primary and secondary collapse to the same look. Declared last
     so it wins, and its own hover and active rules stop the live styles
     reasserting on a dead button. */
  &:disabled {
    background: var(--off-bg);
    color: var(--off-text);
    border-color: var(--off-edge);
    box-shadow: var(--off-inset);
    cursor: not-allowed;
    transform: none;
    font-weight: 400;
  }

  &:disabled:hover,
  &:disabled:active {
    background: var(--off-bg);
    color: var(--off-text);
    border-color: var(--off-edge);
    box-shadow: var(--off-inset);
    transform: none;
  }
`;

type ButtonProps = {
  onClick: () => Promise<void> | void; // Can be either async or sync
  text: string; // The text to be displayed on the button
  loadingText?: string; // Optional text to show when loading
  isAsync?: boolean; // Determines whether the button is asynchronous
  disabled?: boolean; // Optional prop to manually disable the button
  secondary?: boolean; // Optional to use secondary styles
  /** Red, for confirming something that cannot be undone. */
  danger?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
  className?: "text" | undefined;
  iconUrl?: "text" | undefined;
  isBigButton?: boolean | undefined;
  width?: string | number;
  isDashboardButton?: boolean | undefined;
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  loadingText = "Loading...",
  isAsync = false,
  disabled = false,
  secondary,
  danger,
  type,
  className,
  iconUrl,
  isBigButton,
  isDashboardButton,
  width
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
      } catch {
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
        $danger={danger}
        type={type}
        $isBigButton={isBigButton}
        $width={width}
        $isDashboardButton={isDashboardButton}
      >
        {iconUrl && <Image src={iconUrl} alt="" width={16} height={16} />}
        {isLoading ? loadingText : text}
      </StyledButton>
      {error && <p className="error-message">{error}</p>}
    </Wrap>
  );
};

export default Button;
