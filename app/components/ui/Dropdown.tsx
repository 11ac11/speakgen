"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Input, Button } from "./";

const DropdownWrap = styled.div<{
  width?: string;
  $disabled?: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  ${({ width }) => width && `width: ${width};`}
  ${({ $disabled }) =>
    $disabled &&
    `
      cursor: not-allowed;
      pointer-actions: none;

      input {
        background-color: var(--verylightgrey);
        border-color: var(--verylightgrey);
        color: var(--text-muted);
      }
      input:hover {
        border: 1px solid var(--verylightgrey);
      }
      svg {
        color: var(--text-muted);
      }
      * {
        cursor: not-allowed !important;
      }
  `}
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-label);
`;

const DropdownOptions = styled.div`
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  background-color: white;
  color: var(--text-body);
  box-shadow: 0 10px 24px -12px rgba(23, 30, 25, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
  margin-top: 2px;
  max-height: 200px;
  overflow-y: auto;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.7rem 0.9rem;
      cursor: pointer;
      border-bottom: 1px solid #eef0ec;
      font-size: var(--text-base);
      min-height: 44px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      transition:
        background-color 0.12s ease,
        color 0.12s ease;

      /* The tint, not the full lime: a whole row of saturated green is loud,
         and the selected row needs somewhere louder to go. */
      &:hover {
        color: var(--green-600);
        background-color: var(--green-tint);
      }
    }

    li:last-child {
      border-bottom: none;
    }
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledInput = styled(Input)<{
  disabled: boolean | undefined;
  $compact?: boolean;
}>`
  & input {
    text-align: center;
    caret-color: transparent;
    overflow: hidden;
    text-overflow: ellipsis;

    /* The toolbar height, not the form height. A dropdown in a form sits in a
       column of 48px fields and matches them; in the dashboard toolbar it sits
       beside 44px buttons and a 44px multi-select, and being the only 48px
       thing there left its bottom edge proud of everything next to it. */
    ${({ $compact }) =>
      $compact &&
      `
        min-height: 44px;
        padding: 0.6rem 0.9rem;
      `}
  }

  ${({ disabled }) =>
    !disabled &&
    `
      & input:hover,
      & input:focus {
        cursor: pointer;
        border: 1px solid var(--lightgrey);
      }
    `}
`;

const Arrow = styled.span<{ $isOpen: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%)
    rotate(${({ $isOpen }) => ($isOpen ? "180deg" : "0deg")});
  transition: transform 0.3s ease-in-out;
  pointer-events: none;
  width: 16px;
  height: 16px;
`;

// Types
interface DropdownProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (option: string) => void;
  placeholder?: string;
  className?: string;
  width?: string | undefined;
  inputAsButton?: boolean | undefined;
  isDashboardButton?: boolean | undefined;
  /** Toolbar sizing: 44px to sit level with the buttons beside it. */
  compact?: boolean | undefined;
  secondary?: boolean | undefined;
  disabled?: boolean | undefined;
}

// Dropdown Component
export const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "",
  className,
  width,
  inputAsButton,
  isDashboardButton,
  secondary,
  disabled,
  compact
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DropdownWrap ref={ref} width={width} $disabled={disabled}>
      {
        <>
          {label && <Label>{label}</Label>}
          <InputWrapper>
            {inputAsButton ? (
              <Button
                text={placeholder}
                onClick={toggleDropdown}
                width={width}
                secondary={secondary}
                isDashboardButton={isDashboardButton}
              />
            ) : (
              <StyledInput
                $compact={compact}
                onClick={toggleDropdown}
                value={value}
                onChange={() => {}}
                isDropdown={true}
                placeholder={placeholder}
                type={"select"}
                className={className}
                disabled={disabled}
              />
            )}
            <Arrow $isOpen={isOpen}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Arrow>
          </InputWrapper>
        </>
      }
      {isOpen && !disabled && (
        <DropdownOptions>
          <ul>
            {options.map((option, index) => (
              <li
                key={index}
                className="dropdown-item"
                onClick={() => handleSelectOption(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </DropdownOptions>
      )}
    </DropdownWrap>
  );
};
