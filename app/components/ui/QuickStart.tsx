import React, { useState } from "react";
import { Button, Modal } from "./";

export default function QuickStart({}: {}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleModal = () => {
    setIsOpen(true);
  };
  return (
    <>
      {isOpen && <Modal closeModal={() => setIsOpen(false)}>modal</Modal>}
      <Button text="Quick start" onClick={handleModal} isBigButton />
    </>
  );
}
