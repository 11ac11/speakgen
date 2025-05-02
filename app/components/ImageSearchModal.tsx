"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Input, Modal } from "@/app/components/ui/index";
import useDebounce from "../utils/hooks/useDebounce";

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
      <Modal closeModal={closeModal}>
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
    </>
  );
};

export default ImageSearchModal;
