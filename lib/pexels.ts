import { createClient, type Photo, type PhotosWithTotalResults } from "pexels";

/**
 * The one way the server talks to Pexels, cached.
 *
 * Pexels allows 200 requests an hour and 20,000 a month. Every photograph on
 * every runner, preview and PDF used to be a fresh API call, so one class
 * opening a two-photograph task spent 60 of the hour's 200. A photograph's
 * details — its image URLs, photographer, page — do not change, so each is
 * fetched once and kept: here, in the memory of the server instance, which
 * Fluid Compute reuses across requests, and at Vercel's edge through the
 * Cache-Control the routes send.
 *
 * Failures are not cached, so a brief outage does not blank a photograph for
 * a day.
 */

const PHOTO_TTL_MS = 24 * 60 * 60 * 1000;
const SEARCH_TTL_MS = 60 * 60 * 1000;
const MAX_PHOTOS = 2000;
const MAX_SEARCHES = 300;

type Entry<T> = { value: T; expires: number };

let client: ReturnType<typeof createClient> | null = null;
function pexels() {
  if (!process.env.PEXELS_API_KEY) return null;
  client ??= createClient(process.env.PEXELS_API_KEY);
  return client;
}

/** Insertion-ordered, so the oldest entry is the first one dropped. */
function remember<T>(
  cache: Map<string, Entry<T>>,
  key: string,
  value: T,
  ttl: number,
  max: number
) {
  if (cache.size >= max) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { value, expires: Date.now() + ttl });
}

function recall<T>(cache: Map<string, Entry<T>>, key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

const photos = new Map<string, Entry<Photo>>();
const searches = new Map<string, Entry<PhotosWithTotalResults>>();
// Requests already on their way, so twenty students opening the same exam at
// once wait on one call rather than making twenty.
const inFlight = new Map<string, Promise<Photo | null>>();

export async function getPhoto(id: number | string): Promise<Photo | null> {
  const key = String(id);
  const cached = recall(photos, key);
  if (cached) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const api = pexels();
  if (!api) return null;

  const request = api.photos
    .show({ id: key })
    .then((result) => {
      if (!result || "error" in result) return null;
      remember(photos, key, result, PHOTO_TTL_MS, MAX_PHOTOS);
      return result;
    })
    .catch(() => null)
    .finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
}

export async function searchPhotos(
  query: string
): Promise<PhotosWithTotalResults | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;

  const cached = recall(searches, key);
  if (cached) return cached;

  const api = pexels();
  if (!api) return null;

  try {
    const result = await api.photos.search({ query: key, per_page: 20 });
    if (!result || "error" in result) return null;
    remember(searches, key, result, SEARCH_TTL_MS, MAX_SEARCHES);
    // A search already returns each photograph's details, so a teacher who
    // picks one does not cost a second call to look it up.
    for (const photo of result.photos) {
      remember(photos, String(photo.id), photo, PHOTO_TTL_MS, MAX_PHOTOS);
    }
    return result;
  } catch {
    return null;
  }
}
