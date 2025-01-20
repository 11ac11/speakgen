"use client";

import { useState, useRef, useEffect, RefObject } from "react";
import styled from "styled-components";
import { Input } from "./";

const DropdownWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
`;

const DropdownOptions = styled.div`
  border: 1px solid var(--slategrey);
  border-radius: 1rem;
  background-color: white;
  color: grey;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 2;
  width: 300px;
  box-sizing: border-box;
  margin-top: 2px;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.5rem;
      cursor: pointer;
      border-bottom: 1px solid var(--slategrey);
      text-align: center;

      &:hover {
        color: black;
      }
    }

    li:last-child {
      border-bottom: none;
    }
  }
`;

const StyledInput = styled(Input)`
  text-align: center;
  caret-color: transparent;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100px;

  &:hover {
    cursor: pointer;
    border: 1px solid var(--slategrey);
    outline: 1px solid var(--slategrey);
  }

  &:focus {
    border: 1px solid var(--slategrey);
    outline: 1px solid var(--slategrey);
  }
`;

// Types
interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (option: string) => void;
  placeholder?: string;
  className?: string;
}

// Dropdown Component
export const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "",
  className,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    toggleDropdown();
  };

  return (
    <DropdownWrap ref={ref}>
      <StyledInput
        label={label}
        onClick={toggleDropdown}
        value={value}
        onChange={() => {}}
        isDropdown={true}
        placeholder={placeholder}
        type={"select"}
        className={className}
      />
      {isOpen && (
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
