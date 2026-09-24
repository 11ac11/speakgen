"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styled from "styled-components";
import type { Photo } from "pexels";
import ImageSearchModal from "./ImageSearchModal";
import { Label } from "./ui";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import useDisableScroll from "../utils/hooks/useDisableScroll";
import { PhotoCredit } from "./PexelsCredit";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;

  & > div,
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
  color: var(--text-faint);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border: 1px dotted #a1a1a1;

  &:hover {
    background-color: rgb(251, 251, 251);
  }
`;

interface ImageSelectorProps {
  image: Photo | null;
  /* Only ever called with null, by the X that clears the slot. Choosing a
     photograph goes through the modal, which the parent wires up itself. */
  setImage: (image: Photo | null) => void;
  openModal: () => void;
  loading: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  image,
  setImage,
  openModal,
  loading
}) => {
  return image ? (
    <div style={{ position: "relative", width: "45%" }}>
      <Image
        src={image?.src?.landscape}
        width={200}
        height={150}
        style={{
          width: "100%",
          objectFit: "cover"
        }}
        alt={image?.alt || "Selected image"}
      />
      <PhotoCredit photo={image} />
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
  ) : loading ? (
    <div style={{ position: "relative", width: "45%" }}>
      <LoadingSpinner />
    </div>
  ) : (
    <EmptyImageContainer onClick={openModal}>Select image</EmptyImageContainer>
  );
};

const ImageSelectors = ({
  imageIds,
  setImageIds,
  level
}: {
  /* A slot a teacher has not filled yet is a null in place, so the array keeps
     its shape while it is being edited. Ids arrive from the database as
     numbers and from the picker as whatever Photo.id is, hence both. */
  imageIds: (number | string | null)[];
  setImageIds: (ids: (number | null)[]) => void;
  level: string;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImageSetter, setSelectedImageSetter] = useState<
    ((image: Photo) => void) | null
  >(null);
  const [images, setImages] = useState<(Photo | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(!!imageIds?.length);

  const minimumAmountOfImages = (() => {
    switch (level) {
      case "b1":
        return 1;
      case "b2":
        return 2;
      case "c1":
        return 3;
      case "c2":
        return 4;
      default:
        return 2;
    }
  })();

  useDisableScroll(showModal);

  const openModal = (index: number) => {
    setSelectedImageSetter(() => (image: Photo) => {
      const updated = [...images];
      updated[index] = image;
      setImages(updated);
    });
    setShowModal(true);
  };

  useEffect(() => {
    const fetchImage = async (id: number | string | null) => {
      if (!id) return null;
      const numId = Number(id);
      if (isNaN(numId)) return null;

      const res = await fetch(`/api/pexels/${numId}`);
      return await res.json();
    };

    const fetchData = async () => {
      try {
        const imageData = await Promise.all(imageIds.map(fetchImage));
        setImages(imageData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (imageIds?.length) {
      setLoading(true);
      fetchData();
    }
  }, [imageIds]);

  useEffect(() => {
    const updatedIds = images.map((img) => img?.id ?? null);
    if (JSON.stringify(updatedIds) !== JSON.stringify(imageIds)) {
      setImageIds(updatedIds);
    }
  }, [images]);

  /* Takes the photograph rather than an id, because the only caller is the
     clear button handing back null. Typing it as a string hid that. */
  const handleSetImageId = (image: Photo | null, index: number) => {
    const newImageIds = imageIds.map((id) =>
      id === null || id === undefined ? null : Number(id)
    );
    newImageIds[index] = image ? image.id : null;
    setImageIds(newImageIds);
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
        <Label text={"Images"} htmlFor="images" />
        <ImagesContainer>
          {Array.from({ length: minimumAmountOfImages }).map((_, index) => {
            const image = images?.[index] ?? null;

            return (
              <ImageSelector
                key={index}
                image={image}
                setImage={(newImage) => handleSetImageId(newImage, index)}
                openModal={() => openModal(index)}
                loading={loading}
              />
            );
          })}
        </ImagesContainer>
      </Wrap>
    </>
  );
};

export default ImageSelectors;
