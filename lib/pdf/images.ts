import { createClient } from "pexels";

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

let pexels: ReturnType<typeof createClient> | null = null;

/**
 * A question's photographs, in order, skipping any that cannot be loaded.
 * The landscape crop, which is what the runner shows.
 */
export async function loadQuestionPhotos(imageIds: number[]) {
  if (!imageIds?.length || !process.env.PEXELS_API_KEY) return [];

  pexels ??= createClient(process.env.PEXELS_API_KEY);
  const client = pexels;

  const photos = await Promise.all(
    imageIds.map(async (id) => {
      try {
        const photo = await client.photos.show({ id });
        const src = "src" in photo ? photo.src.landscape : null;
        return src ? await loadImage(src) : null;
      } catch {
        return null;
      }
    })
  );

  return photos.filter((photo): photo is PdfImage => photo !== null);
}
