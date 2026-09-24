"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import type { Photo } from "pexels";
import { Input, Modal } from "@/app/components/ui/index";
import useDebounce from "../utils/hooks/useDebounce";
import { PexelsLink } from "./PexelsCredit";

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
  closeModal
}: {
  setImage: (image: Photo) => void;
  closeModal: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Photo is the pexels package's own type, so the shape here is the shape the
  // API actually returns rather than a guess restated as `any`.
  const [imageResults, setImageResults] = useState<Photo[]>([]);

  const debouncedSearchTerm = useDebounce(searchQuery, 300); // 300ms delay

  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      const fetchImages = async () => {
        const res = await fetch(`/api/pexels?query=${debouncedSearchTerm}`);
        const data = await res.json();
        setImageResults(data.photos);
      };
      fetchImages();
    }
  }, [debouncedSearchTerm]);

  const handleOnClick = (image: Photo) => {
    setImage(image);
    closeModal();
    setSearchQuery("");
  };

  return (
    <>
      <Modal closeModal={closeModal}>
        <h2 style={{ marginBottom: "0.2rem" }}>Search images</h2>
        {/* Where the search actually calls Pexels, so this is where their
            guidelines most want the link. */}
        <div style={{ marginBottom: "0.9rem" }}>
          <PexelsLink />
        </div>
        <Input
          type="text"
          placeholder="(e.g. nature)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e)}
        />
        <ImageGrid>
          {imageResults.map((image, index) => {
            if (image) {
              return (
                <div
                  style={{ height: "100px", width: "100px" }}
                  key={index}
                  onClick={() => handleOnClick(image)}
                  title={`Photo by ${image.photographer} on Pexels`}
                >
                  <Image
                    src={image.src.medium}
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      cursor: "pointer"
                    }}
                    height={100}
                    width={100}
                    alt={image.alt ?? "Search result"}
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
