/**
 * Where school logos are kept.
 *
 * A port with one method each way, chosen by LOGO_STORAGE, in the same spirit
 * as lib/billing/provider.ts: the settings page, the upload route and every
 * page that shows a logo are finished, and going live is one adapter.
 *
 *   (unset)  no storage. The upload route answers 503 and the settings page
 *            says uploads are not switched on yet; colour and name still work.
 *   inline   the image is kept in the database as a data: URL. Development
 *            only — it is refused in production — so the whole flow can be
 *            driven locally before any storage exists.
 *   blob     Vercel Blob. Not written yet; see the TODO below.
 *
 * The URL that comes back is stored on content.organization_branding and read
 * from there. Nothing ever lists the store to find a logo.
 */

export const MAX_LOGO_BYTES = 200 * 1024;
export const MAX_LOGO_PIXELS = 512;
export const LOGO_TYPES = ["image/png", "image/jpeg"] as const;
export type LogoType = (typeof LOGO_TYPES)[number];

export class LogoStorageUnavailableError extends Error {
  constructor(message = "Logo uploads are not switched on yet") {
    super(message);
    this.name = "LogoStorageUnavailableError";
  }
}

type LogoStorage = {
  /** Stores the image and returns the URL to save on the branding row. */
  put(
    organizationId: string,
    bytes: Uint8Array,
    contentType: LogoType
  ): Promise<string>;
  /** Removes a logo that has been replaced or cleared. Best effort. */
  remove(url: string): Promise<void>;
};

const inline: LogoStorage = {
  async put(_organizationId, bytes, contentType) {
    return `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  },
  async remove() {
    // Nothing to delete: the image was the column value.
  }
};

/*
 * TODO(vercel-blob): configure storage before offering branding for real.
 *
 * In Vercel: Storage → Create → Blob, as a PUBLIC store (private blobs are
 * served through a Function and bill twice), connected to this project so
 * BLOB_READ_WRITE_TOKEN lands in the environment. Then `npm i @vercel/blob`,
 * set LOGO_STORAGE=blob, add the store's hostname
 * (*.public.blob.vercel-storage.com) to images.remotePatterns in
 * next.config.js if a logo is ever rendered with next/image, and fill this in:
 *
 *   import { put, del } from "@vercel/blob";
 *
 *   async put(organizationId, bytes, contentType) {
 *     const ext = contentType === "image/png" ? "png" : "jpg";
 *     const blob = await put(`logos/${organizationId}.${ext}`, Buffer.from(bytes), {
 *       access: "public",
 *       contentType,
 *       addRandomSuffix: true,   // a new URL per upload, so caches never serve the old logo
 *       cacheControlMaxAge: 60 * 60 * 24 * 365
 *     });
 *     return blob.url;
 *   },
 *   async remove(url) {
 *     if (url.includes(".blob.vercel-storage.com/")) await del(url); // del() is free
 *   }
 *
 * This is a server upload through /api/branding/logo. At 200 KB a logo is
 * a rounding error on Fast Data Transfer; switch to a client upload
 * (@vercel/blob/client with handleUpload) only if the size cap ever grows.
 * Never call list() in a request path — it is an Advanced Operation, and the
 * URL is already on the branding row.
 */
const blob: LogoStorage = {
  async put() {
    throw new LogoStorageUnavailableError(
      "Logo storage is set to Vercel Blob, which is not connected yet"
    );
  },
  async remove() {}
};

function selected(): LogoStorage | null {
  switch (process.env.LOGO_STORAGE) {
    case "inline":
      // A data: URL on every shared page is fine for one developer and wrong
      // for real traffic, so it cannot be turned on by accident in production.
      return process.env.VERCEL_ENV === "production" ? null : inline;
    case "blob":
      return blob;
    default:
      return null;
  }
}

export function isLogoStorageEnabled() {
  // TODO(vercel-blob): drop the blob exclusion once its adapter is written.
  return selected() !== null && process.env.LOGO_STORAGE !== "blob";
}

export function getLogoStorage(): LogoStorage {
  const storage = selected();
  if (!storage) throw new LogoStorageUnavailableError();
  return storage;
}

/**
 * Checks the bytes are the image they claim to be. The type comes from the
 * browser and is only a claim; the first bytes of a PNG or a JPEG are fixed.
 * PNG and JPEG only, because those are what the PDF renderer can embed.
 */
export function sniffLogoType(bytes: Uint8Array): LogoType | null {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((b, i) => bytes[i] === b)) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}
