"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import Pill from "@/app/components/ui/Pill";
import { THEME_VALUES_FOR_PILLS } from "@/constants";
import { PEXELS_URL } from "@/app/components/PexelsCredit";

const Themes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  margin-top: 0.4rem;
`;

const Credits = styled.p`
  && {
    margin: 0.35rem 0 0;
    font-size: var(--text-xs);
    color: var(--text-faint);
  }

  a {
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const Thumbs = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
`;

const Thumb = styled.div`
  position: relative;
  width: 92px;
  height: 62px;
  border-radius: 0.35rem;
  overflow: hidden;
  background: var(--verylightgrey);
  flex: 0 0 auto;
`;

const Prompts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.6rem;
`;

const Prompt = styled.span`
  font-size: var(--text-xs);
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  background: #f1f5ef;
  border: 1px solid var(--verylightgrey);
  color: var(--text-body);
`;

const Aside = styled.div`
  margin-top: 0.6rem;
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.45;

  strong {
    color: var(--text-body);
    font-weight: 500;
  }
`;

export function ThemePills({ themes }: { themes: string[] }) {
  if (!themes?.length) return null;

  return (
    <Themes>
      {themes.map((theme) => {
        const known = THEME_VALUES_FOR_PILLS.find((t) => t.value === theme);
        return (
          <Pill
            key={theme}
            text={known?.label ?? theme}
            bgColor={known?.colors.bg}
            textColor={known?.colors.text}
          />
        );
      })}
    </Themes>
  );
}

/**
 * Small photographs for a Part 2 question. Fetched through the Pexels proxy the
 * rest of the app uses, at thumbnail size: this is for recognising a picture you
 * chose, not for running the exam.
 */
type PreviewPhoto = {
  src: string;
  photographer?: string | null;
  photographer_url?: string | null;
  url?: string | null;
};

function Photos({ ids }: { ids: number[] }) {
  const [photos, setPhotos] = useState<PreviewPhoto[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/pexels/${id}`);
          if (!res.ok) return null;
          const photo = await res.json();
          const src = photo?.src?.tiny ?? photo?.src?.small ?? null;
          return src
            ? {
                src,
                photographer: photo.photographer,
                photographer_url: photo.photographer_url,
                url: photo.url
              }
            : null;
        } catch {
          return null;
        }
      })
    ).then((found) => {
      if (!cancelled) setPhotos(found.filter(Boolean) as PreviewPhoto[]);
    });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (!ids?.length) return null;

  return (
    <>
      <Thumbs>
        {photos.map((photo, index) => (
          <Thumb
            key={photo.src}
            title={
              photo.photographer
                ? `Photo by ${photo.photographer} on Pexels`
                : undefined
            }
          >
            <Image
              src={photo.src}
              alt={`Photograph ${index + 1}`}
              fill
              style={{ objectFit: "cover" }}
            />
          </Thumb>
        ))}
        {photos.length === 0
          ? ids.map((id) => <Thumb key={id} aria-hidden />)
          : null}
      </Thumbs>
      {/* One line for the set: thumbnails this small have no room for a
          credit each, and naming every photographer is what Pexels asks. */}
      {photos.some((photo) => photo.photographer) ? (
        <Credits>
          {"Photos by "}
          {photos
            .filter((photo) => photo.photographer)
            .map((photo, index, all) => (
              <React.Fragment key={photo.src}>
                <a
                  href={photo.url ?? PEXELS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {photo.photographer}
                </a>
                {index < all.length - 1 ? ", " : ""}
              </React.Fragment>
            ))}
          {" on "}
          <a href={PEXELS_URL} target="_blank" rel="noopener noreferrer">
            Pexels
          </a>
        </Credits>
      ) : null}
    </>
  );
}

export type PreviewQuestion = {
  statement: string;
  statement_two?: string | null;
  follow_up?: string | null;
  decision?: string | null;
  themes: string[];
  image_ids: number[];
  prompts: string[];
};

/** Everything about a chosen question that a teacher would want to confirm. */
export default function QuestionPreview({
  question
}: {
  question: PreviewQuestion;
}) {
  return (
    <>
      <Photos ids={question.image_ids} />

      {question.prompts?.length ? (
        <Prompts>
          {question.prompts.map((prompt) => (
            <Prompt key={prompt}>{prompt}</Prompt>
          ))}
        </Prompts>
      ) : null}

      {question.statement_two ? (
        <Aside>
          <strong>Then: </strong>
          {question.statement_two}
        </Aside>
      ) : null}

      {question.follow_up ? (
        <Aside>
          <strong>Other candidate: </strong>
          {question.follow_up}
        </Aside>
      ) : null}

      {question.decision ? (
        <Aside>
          <strong>Decision: </strong>
          {question.decision}
        </Aside>
      ) : null}
    </>
  );
}
