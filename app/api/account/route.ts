import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import {
  AccountDeletionBlockedError,
  deleteAccount,
  planAccountDeletion
} from "@/lib/account";

async function signedInUser() {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  return user?.id ? { id: user.id, email: user.email ?? "" } : null;
}

/** What deleting this account would do, for Settings to show first. */
export async function GET() {
  const user = await signedInUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return NextResponse.json(await planAccountDeletion(user.id));
}

/**
 * Deletes the signed-in user's own account.
 *
 * The body must repeat the account's email address. Typing it is the
 * confirmation, and it works for teachers who sign in with Google and so have
 * no password to re-enter.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await signedInUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      confirm?: string;
    } | null;
    const typed = body?.confirm?.trim().toLowerCase() ?? "";
    if (!typed || typed !== user.email.trim().toLowerCase()) {
      return NextResponse.json(
        {
          error: "Type your email address exactly to confirm.",
          reason: "confirm"
        },
        { status: 400 }
      );
    }

    const plan = await deleteAccount(user.id);
    return NextResponse.json({ deleted: true, schools: plan.schools });
  } catch (error) {
    if (error instanceof AccountDeletionBlockedError) {
      return NextResponse.json(
        { error: error.message, reason: "blocked", blockers: error.blockers },
        { status: 409 }
      );
    }
    console.error("Account deletion failed:", error);
    return NextResponse.json(
      {
        error:
          "Your account could not be deleted. Nothing was changed; please try again or contact us."
      },
      { status: 500 }
    );
  }
}
