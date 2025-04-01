"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Button } from "@/app/components/ui/index";
import ImageSearchModal from "./ImageSearchModal";

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;

  & > * {
    border-radius: 5px;
  }
`;

const SubmitQuestionForm = ({
  imageOneUrl,
  imageTwoUrl,
}: {
  imageOneUrl: string | undefined;
  imageTwoUrl: string | undefined;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [imageOne, setImageOne] = useState<any>(""); // TODO: fix any types
  const [imageTwo, setImageTwo] = useState<any>("");

  return (
    <>
      {showModal && (
        <ImageSearchModal
          setImageOne={setImageOne}
          setImageTwo={setImageTwo}
          closeModal={() => setShowModal(false)}
        /> // TODO: sort this logic out
      )}
      <ImagesContainer>
        {imageOne ? (
          <>
            <Image
              src={imageOne?.src?.landscape}
              width={200}
              height={150}
              alt={imageOne?.alt || ""}
            />
            <Button onClick={() => setImageOne(null)} text="remove" />
          </>
        ) : (
          <Button
            onClick={() => setShowModal(true)}
            text="choose photo"
            type="button"
          />
        )}
        {imageTwo ? (
          <>
            <Image
              src={imageTwo?.src?.landscape}
              width={200}
              height={150}
              alt={imageOne?.alt || ""}
            />
            <Button onClick={() => setImageTwo(null)} text="remove" />
          </>
        ) : (
          <Button
            onClick={() => setShowModal(true)}
            text="choose photo"
            type="button"
          />
        )}
      </ImagesContainer>
    </>
  );
};

export default SubmitQuestionForm;
