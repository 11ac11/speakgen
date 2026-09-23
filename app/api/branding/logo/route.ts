import { NextRequest, NextResponse } from "next/server";
import {
  assertCanBrand,
  BrandingForbiddenError,
  setLogoUrl
} from "@/lib/branding";
import {
  getLogoStorage,
  LogoStorageUnavailableError,
  MAX_LOGO_BYTES,
  sniffLogoType
} from "@/lib/logoStorage";
import { getAuthenticatedUserId } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function failure(error: unknown) {
  if (error instanceof BrandingForbiddenError) {
    return NextResponse.json(
      { error: error.message, reason: error.reason },
      { status: error.reason === "not_entitled" ? 402 : 403 }
    );
  }
  if (error instanceof LogoStorageUnavailableError) {
    return NextResponse.json(
      { error: error.message, reason: "storage_unavailable" },
      { status: 503 }
    );
  }
  console.error("Logo change failed:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

/**
 * Replaces a school's logo. Multipart, with the organisation id and the file.
 *
 * The browser has already resized it to fit 512px and re-encoded it, so this
 * only has to check that it did: a size cap, and the first bytes of a PNG or a
 * JPEG. Permission is checked before anything is stored, so a refused upload
 * leaves nothing behind in the store.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const form = await req.formData().catch(() => null);
    const organizationId = String(form?.get("organizationId") ?? "");
    const file = form?.get("file");

    if (!UUID.test(organizationId) || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }

    if (file.size > MAX_LOGO_BYTES) {
      return NextResponse.json(
        { error: "That image is too large. Logos can be up to 200 KB." },
        { status: 413 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = sniffLogoType(bytes);
    if (!type) {
      return NextResponse.json(
        { error: "Logos have to be a PNG or a JPEG." },
        { status: 415 }
      );
    }

    // Storage first so an unconfigured store answers 503 before anything
    // else, then permission, and only then is anything written.
    const storage = getLogoStorage();
    await assertCanBrand(userId, organizationId);

    const url = await storage.put(organizationId, bytes, type);
    const previous = await setLogoUrl(userId, organizationId, url);
    if (previous && previous !== url)
      await storage.remove(previous).catch(() => {});

    return NextResponse.json({ logoUrl: url });
  } catch (error) {
    return failure(error);
  }
}

/** Removes the logo. The name and colour stay. */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const organizationId = req.nextUrl.searchParams.get("organizationId") ?? "";
    if (!UUID.test(organizationId)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const previous = await setLogoUrl(userId, organizationId, null);
    // Removing from storage is best effort, and possible without storage
    // configured: an inline logo has nothing to remove.
    if (previous) {
      try {
        await getLogoStorage().remove(previous);
      } catch {
        // Unconfigured storage cannot hold the old file either.
      }
    }

    return NextResponse.json({ logoUrl: null });
  } catch (error) {
    return failure(error);
  }
}
