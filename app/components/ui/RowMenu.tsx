"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import styled from "styled-components";

const MENU_WIDTH = 190;
const MENU_GAP = 6;

const Wrap = styled.div`
  display: inline-flex;
`;

const Trigger = styled.button<{ $open: boolean }>`
  appearance: none;
  border: none;
  background: ${({ $open }) => ($open ? "var(--green-tint)" : "transparent")};
  color: var(--text-muted);
  border-radius: var(--radius-control);
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    color 0.12s ease;

  &:hover {
    background: var(--green-tint);
    color: var(--text-heading);
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 1px;
  }
`;

/* Fixed and in a portal: a menu drawn inside a scrolling table is clipped by
   it, and one drawn inside a card is clipped by the card's own rounding. */
const Menu = styled.div`
  position: fixed;
  z-index: 60;
  width: ${MENU_WIDTH}px;
  padding: 0.3rem;
  background: #fff;
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  box-shadow: 0 12px 28px -14px rgba(23, 30, 25, 0.45);
  display: flex;
  flex-direction: column;
`;

const itemStyles = `
  appearance: none;
  border: none;
  background: none;
  text-align: left;
  display: block;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
`;

const ItemButton = styled.button<{ $danger?: boolean }>`
  ${itemStyles}
  color: ${({ $danger }) => ($danger ? "var(--danger)" : "var(--text-body)")};

  &:hover {
    background: ${({ $danger }) =>
      $danger ? "rgba(198, 64, 47, 0.08)" : "var(--green-tint)"};
  }

  &:focus-visible {
    outline: 2px solid
      ${({ $danger }) => ($danger ? "var(--danger)" : "var(--green-600)")};
    outline-offset: -2px;
  }
`;

const ItemLink = styled(Link)`
  ${itemStyles}
  color: var(--text-body);

  &:hover,
  &:focus-visible {
    color: var(--text-body);
    background: var(--green-tint);
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: -2px;
  }
`;

const Question = styled.p`
  margin: 0;
  padding: 0.55rem 0.7rem 0.35rem;
  font-size: var(--text-sm);
  color: var(--text-body);
`;

function KebabIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

export type RowMenuItem = {
  label: string;
  /** Navigates. Mutually exclusive with onSelect. */
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
  /** Asks this before running onSelect, for anything that cannot be undone. */
  confirm?: string;
};

/**
 * The kebab a row or a card carries its actions behind, shared so the two do
 * not drift apart.
 */
export default function RowMenu({
  items,
  ariaLabel,
  className
}: {
  items: RowMenuItem[];
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setConfirming(null);
    setAt(null);
  }, []);

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Right edges line up, and it flips above when there is no room below.
    const estimatedHeight = 44 * items.length + 12;
    const below = rect.bottom + MENU_GAP;
    const flip = below + estimatedHeight > window.innerHeight;

    setAt({
      top: flip ? rect.top - MENU_GAP - estimatedHeight : below,
      left: Math.max(8, rect.right - MENU_WIDTH)
    });
  }, [items.length]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    // Placed from a rectangle read once, so it would otherwise drift.
    const onMove = () => close();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, close]);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    place();
    setOpen(true);
  };

  return (
    <Wrap className={className} data-open={open}>
      <Trigger
        ref={triggerRef}
        type="button"
        $open={open}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
      >
        <KebabIcon />
      </Trigger>

      {open && at
        ? createPortal(
            <Menu
              ref={menuRef}
              role="menu"
              style={{ top: at.top, left: at.left }}
            >
              {confirming !== null ? (
                <>
                  <Question>{items[confirming].confirm}</Question>
                  <ItemButton
                    type="button"
                    role="menuitem"
                    onClick={() => setConfirming(null)}
                  >
                    Cancel
                  </ItemButton>
                  <ItemButton
                    type="button"
                    role="menuitem"
                    $danger={items[confirming].danger}
                    onClick={() => {
                      const item = items[confirming];
                      close();
                      item.onSelect?.();
                    }}
                  >
                    {`Yes, ${items[confirming].label.toLowerCase()}`}
                  </ItemButton>
                </>
              ) : (
                items.map((item, index) =>
                  item.href ? (
                    <ItemLink
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      onClick={close}
                    >
                      {item.label}
                    </ItemLink>
                  ) : (
                    <ItemButton
                      key={item.label}
                      type="button"
                      role="menuitem"
                      $danger={item.danger}
                      onClick={() => {
                        if (item.confirm) {
                          setConfirming(index);
                          return;
                        }
                        close();
                        item.onSelect?.();
                      }}
                    >
                      {item.label}
                    </ItemButton>
                  )
                )
              )}
            </Menu>,
            document.body
          )
        : null}
    </Wrap>
  );
}
