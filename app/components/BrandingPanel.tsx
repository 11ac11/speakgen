"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { Notice } from "@/app/components/ui/Notice";
import {
  accentTokens,
  contrastWithWhite,
  isReadableAccent,
  MIN_ACCENT_CONTRAST,
  normalizeHex
} from "@/lib/brandColors";

/**
 * A school's name, colour and logo as its students see them on shared links
 * and exported PDFs. Academy only, and admins only.
 */

const MAX_BYTES = 200 * 1024;
const MAX_PIXELS = 512;
const HOUSE_ACCENT = "#1f6e3c";

const Panel = styled.div`
  width: 100%;
  padding: 1.75rem;
  border-radius: 1rem;
  color: var(--text-body);

  h2 {
    margin-bottom: 0.3rem;
  }

  > p {
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-top: 0;
  }
`;

const Field = styled.label`
  display: block;
  margin-top: 1.25rem;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-heading);

  small {
    display: block;
    font-weight: 400;
    color: var(--text-muted);
    margin-top: 0.15rem;
  }
`;

const inputStyles = `
  font-family: inherit;
  font-size: var(--text-base);
  color: var(--text-body);
  background: #fff;
  padding: 0.55rem 0.7rem;
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-control);
  min-height: 44px;
  box-sizing: border-box;
`;

const TextInput = styled.input`
  ${inputStyles}
  display: block;
  width: 100%;
  margin-top: 0.4rem;
`;

const ColourRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;

  input[type="color"] {
    width: 48px;
    height: 44px;
    padding: 2px;
    border: 1.5px solid var(--field-edge);
    border-radius: var(--radius-control);
    background: #fff;
    cursor: pointer;
  }

  input[type="text"] {
    ${inputStyles}
    width: 8.5rem;
    font-family: ui-monospace, monospace;
  }
`;

const Contrast = styled.span<{ $ok: boolean }>`
  font-size: var(--text-xs);
  font-weight: 400;
  color: ${(p) => (p.$ok ? "var(--text-muted)" : "var(--danger)")};
`;

const LinkButton = styled.button`
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    color: var(--text-body);
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const LogoBox = styled.div`
  width: 96px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed var(--field-edge);
  border-radius: var(--radius-control);
  background: #fff;
  color: var(--text-faint);
  font-size: var(--text-xs);

  img {
    max-width: 88px;
    max-height: 56px;
    object-fit: contain;
  }
`;

const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-control);
  border: 1.5px solid var(--green-edge);
  background: #fff;
  color: var(--green-600);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: var(--green-tint);
  }

  &:focus-within {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }
`;

/* A small version of what a student sees at the top of a shared link, drawn
   with the tokens the real page uses, so the preview cannot flatter. */
const Preview = styled.div`
  margin-top: 1.5rem;
  padding: 1rem 1.1rem 1.2rem;
  border-radius: var(--radius-card);
  background: #fff;
  border: 1px solid var(--verylightgrey);

  > span {
    display: block;
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-faint);
    margin-bottom: 0.7rem;
  }
`;

const PreviewBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.6rem;
  margin-bottom: 0.8rem;
  border-bottom: 3px solid var(--green-600);

  img {
    height: 32px;
    max-width: 120px;
    object-fit: contain;
  }

  strong {
    font-family: var(--font-display), sans-serif;
    color: var(--text-heading);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Status = styled.p<{ $error?: boolean }>`
  margin: 0;
  font-size: var(--text-sm);
  color: ${(p) => (p.$error ? "var(--danger)" : "var(--text-muted)")};
`;

const UpgradeButton = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-top: 1rem;
  padding: 0.5rem 1.1rem;
  border-radius: var(--radius-control);
  background: var(--green-600);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: 0 3px 0 0 var(--green-800);

  &:hover {
    color: #fff;
    background: var(--green-500);
  }
`;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
}

/**
 * Fits the image inside 512px and re-encodes it, in the browser, so that what
 * is uploaded is already the size it will be shown at. PNG first, to keep a
 * transparent background; a photograph of a sign that is still too heavy as a
 * PNG goes to JPEG on white, stepping the quality down until it fits.
 *
 * Anything the browser can draw goes in — SVG and WebP included — and only PNG
 * or JPEG comes out, because those are what the PDF renderer can embed.
 */
async function prepareLogo(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_PIXELS / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round((img.width || MAX_PIXELS) * scale));
  const height = Math.max(1, Math.round((img.height || MAX_PIXELS) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(img, 0, 0, width, height);

  const png = await toBlob(canvas, "image/png");
  if (png && png.size <= MAX_BYTES) return png;

  const flat = document.createElement("canvas");
  flat.width = width;
  flat.height = height;
  const flatCtx = flat.getContext("2d");
  if (!flatCtx) throw new Error("no canvas");
  flatCtx.fillStyle = "#fff";
  flatCtx.fillRect(0, 0, width, height);
  flatCtx.drawImage(canvas, 0, 0);

  for (const quality of [0.9, 0.8, 0.7, 0.6]) {
    const jpeg = await toBlob(flat, "image/jpeg", quality);
    if (jpeg && jpeg.size <= MAX_BYTES) return jpeg;
  }
  throw new Error("too large");
}

export type BrandingPanelProps = {
  organizationId: string;
  organizationName: string;
  /** Whether the school's plan includes branding. */
  entitled: boolean;
  /** Whether logo storage is configured on this deployment. */
  logoStorageEnabled: boolean;
  initial: {
    displayName: string | null;
    accentColor: string | null;
    logoUrl: string | null;
  };
};

export default function BrandingPanel({
  organizationId,
  organizationName,
  entitled,
  logoStorageEnabled,
  initial
}: BrandingPanelProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName ?? "");
  const [colour, setColour] = useState(initial.accentColor ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(
    null
  );
  const [busy, setBusy] = useState<"save" | "logo" | "remove" | null>(null);
  const [status, setStatus] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);

  const normalised = colour.trim() ? normalizeHex(colour) : null;
  const colourInvalid = colour.trim() !== "" && normalised === null;
  const readable = normalised ? isReadableAccent(normalised) : true;
  const ratio = normalised ? contrastWithWhite(normalised) : null;

  const previewStyle = (
    normalised && readable ? accentTokens(normalised) : {}
  ) as React.CSSProperties;

  if (!entitled) {
    return (
      <Panel className="glass">
        <h2>School branding</h2>
        <p>
          Put your school&apos;s name, colour and logo on the links you share
          with students and on the PDFs you print. Part of the Academy plan.
        </p>
        <UpgradeButton href="/pricing">See Academy</UpgradeButton>
      </Panel>
    );
  }

  const save = async () => {
    setBusy("save");
    setStatus(null);
    try {
      const res = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          displayName,
          accentColor: colour
        })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ text: body?.error ?? "Could not save.", error: true });
        return;
      }
      setColour(body.accentColor ?? "");
      setStatus({ text: "Saved." });
      router.refresh();
    } catch {
      setStatus({ text: "Could not save. Please try again.", error: true });
    } finally {
      setBusy(null);
    }
  };

  const pick = async (file: File | undefined) => {
    setStatus(null);
    if (!file) return;
    try {
      const blob = await prepareLogo(file);
      if (pending) URL.revokeObjectURL(pending.url);
      setPending({ blob, url: URL.createObjectURL(blob) });
    } catch (error) {
      setStatus({
        text:
          (error as Error).message === "too large"
            ? "That image is too detailed to fit in 200 KB. Try a simpler version of the logo."
            : "That file could not be read as an image.",
        error: true
      });
    }
  };

  const upload = async () => {
    if (!pending) return;
    setBusy("logo");
    setStatus(null);
    try {
      const form = new FormData();
      form.set("organizationId", organizationId);
      form.set("file", pending.blob, "logo");
      const res = await fetch("/api/branding/logo", {
        method: "POST",
        body: form
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({
          text: body?.error ?? "Could not upload the logo.",
          error: true
        });
        return;
      }
      URL.revokeObjectURL(pending.url);
      setPending(null);
      setLogoUrl(body.logoUrl);
      setStatus({ text: "Logo saved." });
      router.refresh();
    } catch {
      setStatus({ text: "Could not upload the logo.", error: true });
    } finally {
      setBusy(null);
    }
  };

  const removeLogo = async () => {
    setBusy("remove");
    setStatus(null);
    try {
      const res = await fetch(
        `/api/branding/logo?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setStatus({
          text: body?.error ?? "Could not remove the logo.",
          error: true
        });
        return;
      }
      setLogoUrl(null);
      setStatus({ text: "Logo removed." });
      router.refresh();
    } catch {
      setStatus({ text: "Could not remove the logo.", error: true });
    } finally {
      setBusy(null);
    }
  };

  const shownLogo = pending?.url ?? logoUrl;
  const shownName = displayName.trim() || organizationName;

  return (
    <Panel className="glass">
      <h2>School branding</h2>
      <p>
        Students see this at the top of every exam and practice your school
        shares, and it heads the PDFs you download.
      </p>

      <Field>
        Name shown to students
        <small>{`Leave blank to use "${organizationName}".`}</small>
        <TextInput
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={organizationName}
          maxLength={80}
        />
      </Field>

      <Field as="div">
        Accent colour
        <small>
          Used for buttons and headings. It needs to be dark enough to read
          white text on.
        </small>
        <ColourRow>
          <input
            type="color"
            aria-label="Pick an accent colour"
            value={normalised ?? HOUSE_ACCENT}
            onChange={(e) => setColour(e.target.value)}
          />
          <input
            type="text"
            aria-label="Accent colour as a hex value"
            value={colour}
            placeholder={HOUSE_ACCENT}
            onChange={(e) => setColour(e.target.value)}
            maxLength={7}
          />
          {colourInvalid ? (
            <Contrast $ok={false}>Use a hex value such as #1f6e3c.</Contrast>
          ) : ratio !== null ? (
            <Contrast $ok={readable}>
              {readable
                ? `Contrast ${ratio.toFixed(1)}:1 — readable.`
                : `Contrast ${ratio.toFixed(1)}:1 — too light; needs ${MIN_ACCENT_CONTRAST}:1.`}
            </Contrast>
          ) : null}
          {colour ? (
            <LinkButton type="button" onClick={() => setColour("")}>
              Use the default
            </LinkButton>
          ) : null}
        </ColourRow>
      </Field>

      <Field as="div">
        Logo
        <small>
          PNG, JPEG or SVG. It is resized to 512px before uploading.
        </small>
        <LogoRow>
          <LogoBox>
            {shownLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownLogo} alt="Logo preview" />
            ) : (
              "No logo"
            )}
          </LogoBox>
          <FileLabel>
            {logoUrl || pending ? "Choose another" : "Choose a file"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </FileLabel>
          {pending ? (
            <Button
              text={busy === "logo" ? "Uploading…" : "Upload logo"}
              disabled={busy !== null || !logoStorageEnabled}
              onClick={upload}
            />
          ) : null}
          {pending ? (
            <LinkButton
              type="button"
              onClick={() => {
                URL.revokeObjectURL(pending.url);
                setPending(null);
              }}
            >
              Cancel
            </LinkButton>
          ) : logoUrl ? (
            <LinkButton
              type="button"
              disabled={busy !== null}
              onClick={removeLogo}
            >
              {busy === "remove" ? "Removing…" : "Remove logo"}
            </LinkButton>
          ) : null}
        </LogoRow>
        {!logoStorageEnabled ? (
          <div style={{ marginTop: "0.75rem" }}>
            <Notice>
              <p>
                Logo uploads are not switched on yet. You can preview a logo
                here; the name and colour save and show as normal.
              </p>
            </Notice>
          </div>
        ) : null}
      </Field>

      <Preview style={previewStyle}>
        <span>Preview</span>
        <PreviewBrand>
          {shownLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownLogo} alt="" />
          ) : null}
          <strong>{shownName}</strong>
        </PreviewBrand>
        <Button text="Next" onClick={() => {}} />
      </Preview>

      <Actions>
        <Button
          text={busy === "save" ? "Saving…" : "Save branding"}
          disabled={busy !== null || colourInvalid || !readable}
          onClick={save}
        />
        {status ? (
          <Status
            role={status.error ? "alert" : "status"}
            $error={status.error}
          >
            {status.text}
          </Status>
        ) : null}
      </Actions>
    </Panel>
  );
}
