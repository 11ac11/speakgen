import { NextRequest, NextResponse } from "next/server";
import {
  createShareLink,
  getShareLink,
  parseShareTarget,
  revokeShareLink,
  sharePath
} from "@/lib/shareLinks";
import { getAuthenticatedUserId } from "@/lib/session";

/**
 * The share link for one exam or practice, addressed by ?kind=&id= rather than
 * by token: the teacher managing it thinks in terms of the exam, and the token
 * is the thing they are asking for.
 *
 * A target that is not the caller's to share is a 404 in every method, so this
 * cannot be used to learn which ids exist.
 */

function unauthorised() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 }
  );
}

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function body(link: { token: string; created_at: string } | null) {
  return link
    ? {
        token: link.token,
        path: sharePath(link.token),
        created_at: link.created_at
      }
    : { token: null, path: null, created_at: null };
}

async function targetFrom(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  if (url.has("kind")) return parseShareTarget(url.get("kind"), url.get("id"));

  const json = await req.json().catch(() => null);
  return parseShareTarget(json?.kind, json?.id);
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return unauthorised();

    const target = await targetFrom(req);
    if (!target) return notFound();

    const link = await getShareLink(userId, target);
    if (link === undefined) return notFound();

    return NextResponse.json(body(link));
  } catch (error) {
    console.error("Share link lookup failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/** Returns the live link, making one if there is none. Safe to repeat. */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return unauthorised();

    const target = await targetFrom(req);
    if (!target) return notFound();

    const link = await createShareLink(userId, target);
    if (!link) return notFound();

    return NextResponse.json(body(link), { status: 201 });
  } catch (error) {
    console.error("Share link creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/** Stops the live link working. Sharing again makes a new one. */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return unauthorised();

    const target = await targetFrom(req);
    if (!target) return notFound();

    if (!(await revokeShareLink(userId, target))) return notFound();

    return NextResponse.json(body(null));
  } catch (error) {
    console.error("Share link revocation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
