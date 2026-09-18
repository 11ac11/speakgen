"use client";

import React, { useEffect } from "react";
import styled from "styled-components";

/* Fixed, not absolute: absolute positioning is relative to the document, so
   on a scrolled page the backdrop began below the viewport and the panel was
   placed against a top the reader had long since passed. */
const ModalShading = styled.div`
  position: fixed;
  inset: 0;
  background-color: #00000055;
  z-index: 50;
`;

const ModalWrap = styled.div`
  position: fixed;
  inset: 0;
  z-index: 51;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
`;

const Modal = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  /* Narrow screens had a 600px floor to fit into and could not. */
  width: min(680px, 100%);
  max-height: min(86vh, 100%);
  /* The panel scrolls rather than the page behind it, so a form taller than
     the screen is still reachable. */
  overflow-y: auto;
  overscroll-behavior: contain;
  background-color: #fff;
  border-radius: var(--radius-card);
  padding: 2rem;
`;

const XIcon = styled.svg`
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
  color: var(--text-muted);

  &:hover {
    color: var(--text-heading);
  }
`;

const ImageSearchModal = ({
  children,
  closeModal,
  label
}: {
  children: React.ReactNode;
  closeModal: () => void;
  /** Names the dialog for anyone not looking at it. */
  label?: string;
}) => {
  useEffect(() => {
    // disable scrolling when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Escape is the way out of a dialog, and it was not one.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeModal]);

  return (
    <>
      <ModalShading onClick={closeModal} />
      <ModalWrap
        onMouseDown={(event) => {
          // Only the backdrop itself, so a drag that ends outside the panel
          // does not dismiss what is being filled in.
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <Modal role="dialog" aria-modal="true" aria-label={label}>
          <XIcon
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
            onClick={closeModal}
          >
            <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59 7.1 5.7a1 1 0 1 0-1.4 1.42L10.59 12l-4.9 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.42z" />
          </XIcon>
          {children}
        </Modal>
      </ModalWrap>
    </>
  );
};

export default ImageSearchModal;
