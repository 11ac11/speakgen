"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Input } from "@/app/components/ui/index";
import useDebounce from "../utils/hooks/useDebounce";

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
  min-height: 500px;
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

const ImageGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 5px;
  margin: 20px 0;
  max-width: 100%;

  & > div > img {
    border-radius: 5px;
  }
`;

const ImageSearchModal = ({
  setImage,
  closeModal,
}: {
  setImage: React.Dispatch<any>;
  closeModal: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [imageResults, setImageResults] = useState([]);

  const debouncedSearchTerm = useDebounce(searchQuery, 300); // 300ms delay

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      const fetchImages = async () => {
        const res = await fetch(`/api/pexels?query=${debouncedSearchTerm}`);
        const data = await res.json();
        console.log("data:", data);
        setImageResults(data.photos);
      };
      fetchImages();
    }
  }, [debouncedSearchTerm]);

  const handleOnClick = (image: any) => {
    // TODO: fix any type
    setImage(image);
    closeModal();
    setSearchQuery("");
  };

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
          <h2>Search images</h2>
          <Input
            type="text"
            placeholder="nature"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e)}
          />
          <ImageGrid>
            {imageResults.map((image: any, index) => {
              // TODO: fix any type
              if (image) {
                return (
                  <div
                    style={{ height: "100px", width: "100px" }}
                    key={index}
                    onClick={() => handleOnClick(image)}
                  >
                    <Image
                      src={image.src.medium}
                      style={{
                        width: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      height={100}
                      width={100}
                      alt={image.alt}
                    />
                  </div>
                );
              }
            })}
          </ImageGrid>
          {/* <Button onClick={closeModal} text="Confirm image" type="button" /> */}
        </Modal>
      </ModalWrap>
    </>
  );
};

export default ImageSearchModal;
