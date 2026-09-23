"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Pill } from "./";
import type { PillOption } from "@/constants";

/* Deliberately the same shell as Dropdown — the same border, radius, chevron
   and popup — because the two sit next to each other in the dashboard toolbar
   and reading as one control family matters more than saving the duplication.
   What differs is inside: rows toggle rather than choose and close, each row
   carries its theme's own pill colours, and the closed control summarises a set
   rather than showing one value. */

const Wrap = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  ${({ width }) => width && `width: ${width};`}
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-label);
`;

/* The field's own styles, not an approximation of them. It sits in a row with
   two Dropdowns whose control is an Input, so it borrows that: the white
   ground, the 1.5px edge, the hover token and — the part that was missing —
   the green focus ring. An open menu counts as focus here, because the control
   is doing the same job as a focused field while its list is showing.

   No tinted background when themes are chosen. The summary already reads "2
   themes" rather than "Any", which says the filter is on without making this
   the one control in the row that changes colour. */
const Control = styled.button<{ $open: boolean }>`
  appearance: none;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: var(--control-height);
  padding: 0.6rem 1.9rem 0.6rem 0.9rem;
  cursor: pointer;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-base);
  text-align: center;
  color: var(--text-body);
  background: #fff;
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  outline: none;
  /* The same lift the Input gets from the global .shadow class it sets on
     itself, so this does not sit flat between two raised fields. Focus
     replaces it with the ring, exactly as it does on an Input. */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease;

  &:hover {
    border-color: var(--field-edge-hover);
  }

  /* Focus is the one place the bright brand green earns its keep. */
  &:focus-visible {
    border-color: var(--green-600);
    box-shadow: 0 0 0 4px rgba(98, 204, 84, 0.28);
  }

  ${(p) =>
    p.$open &&
    `
      border-color: var(--green-600);
      box-shadow: 0 0 0 4px rgba(98, 204, 84, 0.28);
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

const Options = styled.div`
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  background: #fff;
  box-shadow: 0 10px 24px -12px rgba(23, 30, 25, 0.35);
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 3;
  /* Wider than the control it hangs from: theme names are long, and a 100%
     popup wrapped every one of them onto two lines. */
  min-width: 230px;
  margin-top: 2px;
  max-height: 280px;
  overflow-y: auto;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const Option = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  min-height: var(--control-height);
  box-sizing: border-box;
  border-bottom: 1px solid #eef0ec;
  background: ${(p) => (p.$selected ? "var(--green-tint)" : "transparent")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--green-tint);
  }

  input {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--green-600);
    pointer-events: none;
  }
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-top: 1px solid var(--field-edge);

  button {
    appearance: none;
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    font-family: inherit;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--green-600);

    &:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
`;

export const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Any",
  width
}: {
  label?: string;
  options: PillOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  width?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Escape closes it, which a click-outside handler alone does not give anyone
  // working from the keyboard.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );

  /* One chosen theme names itself; more than one becomes a count, because the
     control is 150px wide and two names do not fit in it. */
  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? "1 theme")
        : `${selected.length} themes`;

  return (
    <Wrap ref={ref} width={width}>
      {label && <Label>{label}</Label>}
      <Control
        type="button"
        $open={isOpen}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {summary}
        </span>
        {/* No count badge beside the summary: it already says "2 themes", and
            the badge made that read "2 themes 2". */}
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
      </Control>

      {isOpen && (
        <Options>
          <ul role="listbox" aria-multiselectable="true">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <Option
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  $selected={isSelected}
                  onClick={() => toggle(option.value)}
                >
                  <input type="checkbox" readOnly checked={isSelected} />
                  <Pill
                    text={option.label}
                    bgColor={option.colors.bg}
                    textColor={option.colors.text}
                  />
                </Option>
              );
            })}
          </ul>
          {selected.length > 0 ? (
            <Footer>
              <button type="button" onClick={() => onChange([])}>
                Clear
              </button>
            </Footer>
          ) : null}
        </Options>
      )}
    </Wrap>
  );
};

export default MultiSelect;
