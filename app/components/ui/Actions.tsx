"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const MENU_WIDTH = 168;
const MENU_GAP = 6;

/* Revealed by the row's hover rule in Table, and held open while its menu is:
   without that, moving the pointer towards the menu leaves the row, the wrap
   fades out, and the menu goes with it because it is this button's menu. */
const ActionsWrap = styled.div<{ $open: boolean }>`
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: opacity 0.1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

/* Fixed and in a portal because the table scrolls: Scroller sets
   overflow-x: auto, which computes overflow-y to auto as well, so a menu
   positioned inside the row would be clipped by it. */
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

const Item = styled.button<{ $danger?: boolean }>`
  appearance: none;
  border: none;
  background: none;
  text-align: left;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
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

// part is no longer needed: a question id identifies it, and the edit URL is
// level-scoped rather than part-scoped.
export default function Actions({
  questionId,
  level,
  handleDelete
}: {
  questionId: number;
  level: string;
  handleDelete: (id: number) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setAt(null);
  }, []);

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Right edges line up, and it flips above when the row is near the bottom.
    const estimatedHeight = 92;
    const below = rect.bottom + MENU_GAP;
    const flip = below + estimatedHeight > window.innerHeight;

    setAt({
      top: flip ? rect.top - MENU_GAP - estimatedHeight : below,
      left: Math.max(8, rect.right - MENU_WIDTH)
    });
  }, []);

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
    // The menu is positioned from a rectangle read once, so it would drift.
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
    <ActionsWrap className="actions" $open={open}>
      <Trigger
        ref={triggerRef}
        type="button"
        $open={open}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Question actions"
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
              <Item
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  router.push(`/${level}/questions/${questionId}`);
                }}
              >
                Edit
              </Item>
              <Item
                type="button"
                role="menuitem"
                $danger
                onClick={() => {
                  close();
                  handleDelete(questionId);
                }}
              >
                Delete
              </Item>
            </Menu>,
            document.body
          )
        : null}
    </ActionsWrap>
  );
}
