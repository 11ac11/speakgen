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
  ) : loading ? (
    <LoadingSpinner />
  ) : (
    <EmptyImageContainer onClick={() => openModal(setImage)}>
      Select image
    </EmptyImageContainer>
  );

const ImageSelectors = ({
  imageIds,
  setImageIds,
}: // imageOneId,
// setImageOneId,
// imageTwoId,
// setImageTwoId,
{
  imageIds: string[] | null[] | [];
  setImageIds: any;
  // imageOneId: number | undefined;
  // imageTwoId: number | undefined;
  // setImageOneId: any; // TODO: fix any
  // setImageTwoId: any;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImageSetter, setSelectedImageSetter] = useState<
    ((image: any) => void) | null
  >(null);
  const [imageOne, setImageOne] = useState<any>(null); // TODO: Fix `any`
  const [imageTwo, setImageTwo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!imageIds?.length);

  useDisableScroll(showModal);

  const openModal = (setImage: (image: any) => void) => {
    setSelectedImageSetter(() => setImage);
    setShowModal(true);
  };

  // useEffect(() => {
  //   const fetchImage = async (id: number) => {
  //     const res = await fetch(`/api/pexels/${id}`);
  //     const data = await res.json();
  //     return data;
  //   };

  //   const fetchData = async () => {
  //     try {
  //       if (imageOneId) {
  //         const imageOneData = await fetchImage(imageOneId);
  //         setImageOne(imageOneData);
  //       }

  //       if (imageTwoId) {
  //         const imageTwoData = await fetchImage(imageTwoId);
  //         setImageTwo(imageTwoData);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [imageOneId, imageTwoId]);

  // useEffect(() => {
  //   if (!!imageOne) {
  //     if (imageOne?.id !== imageOneId) {
  //       setImageOneId(imageOne.id);
  //     }
  //   }
  // }, [imageOne]);

  // useEffect(() => {
  //   if (!!imageTwo) {
  //     if (imageTwo?.id !== imageTwoId) {
  //       setImageTwoId(imageTwo.id);
  //     }
  //   }
  // }, [imageTwo]);

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
          {imageIds?.map((id, index) => {
            return (
              <ImageSelector
                key={index}
                image={id}
                setImage={(id) => handleSetImageId(id, index)}
                openModal={openModal}
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
