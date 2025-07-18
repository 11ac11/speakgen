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
        color: grey;
      }
      input:hover {
        border: 1px solid var(--verylightgrey);
      }
      svg {
        color: grey;
      }
      * {
        cursor: not-allowed !important;
      }
  `}
`;

const Label = styled.label`
  margin-bottom: 10px;
  font-size: 18px;
`;

const DropdownOptions = styled.div`
  border: 1px solid var(--verylightgrey);
  border-radius: 8px;
  background-color: white;
  color: grey;
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
      padding: 0.5rem;
      cursor: pointer;
      border-bottom: 1px solid var(--verylightgrey);
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        color: black;
        background-color: var(--limegreen);
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

const StyledInput = styled(Input)<{ disabled: boolean | undefined }>`
  & input {
    text-align: center;
    caret-color: transparent;
    overflow: hidden;
    text-overflow: ellipsis;
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
  disabled,
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
                isBigButton
                width={width}
                isDashboardButton={isDashboardButton}
              />
            ) : (
              <StyledInput
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
