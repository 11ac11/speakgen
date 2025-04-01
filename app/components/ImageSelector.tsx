"use client";

import React, { useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import ImageSearchModal from "./ImageSearchModal";
import { Label } from "./ui";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  & div,
  img {
    border-radius: 5px;
  }
`;

const XIcon = styled.svg`
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
  filter: invert(1);

  &:hover {
    svg,
    path {
      fill: black;
    }
  }
`;

const EmptyImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45%;
  height: 150px;
  background-color: #f1f1f1;
  color: #a1a1a1;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border: 1px dotted #a1a1a1;

  &:hover {
    background-color: rgb(251, 251, 251);
  }
`;

interface ImageSelectorProps {
  image: any; // TODO: Replace `any` with a proper type
  setImage: (image: any) => void;
  openModal: (setImage: (image: any) => void) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  image,
  setImage,
  openModal,
}) =>
  image ? (
    <div style={{ position: "relative", width: "45%" }}>
      <Image
        src={image?.src?.landscape}
        width={200}
        height={150}
        style={{
          width: "100%",
          objectFit: "cover",
        }}
        alt={image?.alt || "Selected image"}
      />
      <XIcon
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
        onClick={() => setImage(null)}
      >
        <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59 7.1 5.7a1 1 0 1 0-1.4 1.42L10.59 12l-4.9 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.42z" />
      </XIcon>
    </div>
  ) : (
    <EmptyImageContainer onClick={() => openModal(setImage)}>
      Select image
    </EmptyImageContainer>
  );

const ImageSelectors = ({
  imageOneUrl,
  imageTwoUrl,
}: {
  imageOneUrl: string | undefined;
  imageTwoUrl: string | undefined;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImageSetter, setSelectedImageSetter] = useState<
    ((image: any) => void) | null
  >(null);
  const [imageOne, setImageOne] = useState<any>(""); // TODO: Fix `any`
  const [imageTwo, setImageTwo] = useState<any>("");

  const openModal = (setImage: (image: any) => void) => {
    setSelectedImageSetter(() => setImage);
    setShowModal(true);
  };

  return (
    <>
      {showModal && selectedImageSetter && (
        <ImageSearchModal
          setImage={selectedImageSetter}
          closeModal={() => setShowModal(false)}
        />
      )}
      <Wrap>
        <Label text={"Images"} />
        <ImagesContainer>
          <ImageSelector
            image={imageOne}
            setImage={setImageOne}
            openModal={openModal}
          />
          <ImageSelector
            image={imageTwo}
            setImage={setImageTwo}
            openModal={openModal}
          />
        </ImagesContainer>
      </Wrap>
    </>
  );
};

export default ImageSelectors;
