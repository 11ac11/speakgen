"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styled from "styled-components";
import ImageSearchModal from "./ImageSearchModal";
import { Label } from "./ui";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import useDisableScroll from "../utils/hooks/useDisableScroll";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;

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
  loading: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  image,
  setImage,
  openModal,
  loading,
}) => {
  return image ? (
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
  ) : loading ? (
    <LoadingSpinner />
  ) : (
    <EmptyImageContainer onClick={() => openModal(setImage)}>
      Select image
    </EmptyImageContainer>
  );
};

const ImageSelectors = ({
  imageIds,
  setImageIds,
  level,
}: {
  imageIds: (string | null)[];
  setImageIds: any;
  level: string;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImageSetter, setSelectedImageSetter] = useState<
    ((image: any) => void) | null
  >(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(!!imageIds?.length);

  const minimumAmountOfImages = (() => {
    switch (level) {
      case "B1":
        return 1;
      case "B2":
        return 2;
      case "C1":
        return 3;
      case "C2":
        return 4;
      default:
        return 2;
    }
  })();

  useDisableScroll(showModal);

  const openModal = (index: number) => {
    setSelectedImageSetter(() => (image: any) => {
      const updated = [...images];
      updated[index] = image;
      setImages(updated);
    });
    setShowModal(true);
  };

  useEffect(() => {
    const fetchImage = async (id: string | null) => {
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
    const updatedIds = images.map((img) => img?.id || null);
    if (JSON.stringify(updatedIds) !== JSON.stringify(imageIds)) {
      setImageIds(updatedIds);
    }
  }, [images]);

  const handleSetImageId = (id: string, index: number) => {
    const newImageIds = [...imageIds];
    newImageIds[index] = id;
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
        <Label text={"Images"} />
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
