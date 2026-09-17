import { auth } from "@/lib/auth/server";
import { getSeatUsage, isAdmin } from "@/lib/organizations";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const handlers = auth.handler();

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
export const PATCH = handlers.PATCH;

/** Better Auth's endpoint for inviting somebody to an organisation. */
const INVITE_ROUTE = "organization/invite-member";

/**
 * Organisation calls go through this proxy on their way to Neon Auth, which
 * makes it the one place seat limits can actually be enforced. Checking in the
 * browser would only be a suggestion.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  if (path.join("/") !== INVITE_ROUTE) {
    return handlers.POST(req, context);
  }

  // Cloned, so the body is still readable by the proxy afterwards.
  const body = (await req
    .clone()
    .json()
    .catch(() => null)) as { organizationId?: string } | null;

  const organizationId = body?.organizationId;
  if (!organizationId) return handlers.POST(req, context);

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!(await isAdmin(userId, organizationId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Pending invitations count. A seat that has been offered is spent, or a
  // school could invite twenty teachers against five seats and let them race.
  const seats = await getSeatUsage(organizationId);
  if (seats.used >= seats.seats) {
    return NextResponse.json(
      {
        error:
          seats.seats === 0
            ? "This school has no seats. Subscribe to Academy to add teachers."
            : "No seats left. Remove a teacher or add seats to invite another.",
        used: seats.used,
        seats: seats.seats
      },
      { status: 402 }
    );
  }

  return handlers.POST(req, context);
}
