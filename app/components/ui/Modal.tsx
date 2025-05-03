"use client";

import React, { useEffect } from "react";
import styled from "styled-components";

const ModalShading = styled.div`
  height: 200vh;
  width: 200vw;
  position: absolute;
  left: 0;
  top: 0;
  background-color: #00000055;
  z-index: 5;
`;

const ModalWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
`;

const Modal = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 500px;
  min-height: 300px;
  max-width: 75%;
  max-height: 75%;
  position: absolute;
  background-color: white;
  z-index: 10;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  padding: 2rem;
`;

const XIcon = styled.svg`
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
`;

const ImageSearchModal = ({
  children,
  closeModal,
}: {
  children: any;
  closeModal: () => void;
}) => {
  useEffect(() => {
    // disable scrolling when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <>
      <ModalShading />
      <ModalWrap>
        <Modal>
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
