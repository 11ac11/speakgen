import { getPhoto } from "@/lib/pexels";

/**
 * Images for a PDF, fetched on the server before rendering.
 *
 * The renderer can fetch a URL itself, but one slow or missing photograph then
 * fails the whole document. Fetched here, each image has its own timeout and a
 * failure costs that one picture rather than the teacher's download.
 */

export type PdfImage = { data: Buffer; format: "png" | "jpg" };

const TIMEOUT_MS = 8000;

function formatOf(bytes: Buffer): PdfImage["format"] | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  // WebP, SVG and the rest: the renderer cannot embed them, so they are left
  // out rather than breaking the page.
  return null;
}

/** An https URL or a data: URL, as a logo may be either. Null on any failure. */
export async function loadImage(url: string): Promise<PdfImage | null> {
  try {
    let bytes: Buffer;

    if (url.startsWith("data:")) {
      const comma = url.indexOf(",");
      if (comma < 0 || !url.slice(0, comma).endsWith(";base64")) return null;
      bytes = Buffer.from(url.slice(comma + 1), "base64");
    } else if (url.startsWith("https://")) {
      // No Accept header asking for WebP, so image CDNs answer with JPEG.
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) return null;
      bytes = Buffer.from(await res.arrayBuffer());
    } else {
      return null;
    }

    const format = formatOf(bytes);
    return format ? { data: bytes, format } : null;
  } catch {
    return null;
  }
}

/** A photograph for a PDF, with who took it, for the credit under it. */
export type PdfPhoto = PdfImage & {
  photographer: string | null;
  /** The photograph's page on Pexels, which the credit links to. */
  pageUrl: string | null;
};

/**
 * A question's photographs, in order, skipping any that cannot be loaded.
 * The landscape crop, which is what the runner shows. Looked up through
 * lib/pexels.ts, which caches, so a PDF of a popular exam does not spend a
 * Pexels call per photograph each time it is downloaded.
 */
export async function loadQuestionPhotos(
  imageIds: number[]
): Promise<PdfPhoto[]> {
  if (!imageIds?.length) return [];

  const photos = await Promise.all(
    imageIds.map(async (id): Promise<PdfPhoto | null> => {
      const photo = await getPhoto(id);
      if (!photo?.src?.landscape) return null;
      const image = await loadImage(photo.src.landscape);
      return image
        ? {
            ...image,
            photographer: photo.photographer ?? null,
            pageUrl: photo.url ?? null
          }
        : null;
    })
  );

  return photos.filter((photo): photo is PdfPhoto => photo !== null);
}
