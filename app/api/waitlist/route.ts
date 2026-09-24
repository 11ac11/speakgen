import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import {
  hasJoinedWaitlist,
  joinWaitlist,
  WAITLIST_BONUS_EXAMS,
  WAITLIST_PLANS,
  WAITLIST_TRIGGERS
} from "@/lib/waitlist";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const waitlistSchema = z.object({
  plan: z.enum(WAITLIST_PLANS),
  trigger: z.enum(WAITLIST_TRIGGERS),
  /** Only read when signed out; a signed-in teacher joins as themselves. */
  email: z.string().trim().email().max(254).optional(),
  schoolName: optionalText(80),
  teacherCount: z.number().int().min(1).max(1000).nullish(),
  note: optionalText(500),
  newsConsent: z.boolean().default(false),
  /** A field people never see. Anything in it is a bot filling every box. */
  website: z.string().optional()
});

/**
 * Joins the early-access waitlist.
 *
 * Signed in, the account's own email is used and the teacher earns the extra
 * saved exam. Signed out, the email is typed and there is no account to give
 * the exam to, so the response says so and the form suggests signing up.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = waitlistSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the form and try again" },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Pretend it worked, so the bot learns nothing.
    if (body.website) return NextResponse.json({ joined: true, bonus: 0 });

    const { data: session } = await auth.getSession();
    const user = session?.user?.id
      ? { id: session.user.id, email: session.user.email ?? "" }
      : null;

    const email = user?.email || body.email;
    if (!email) {
      return NextResponse.json(
        { error: "An email address is needed to tell you when it opens" },
        { status: 400 }
      );
    }

    // The bonus is once per teacher, not once per list: asked before joining,
    // so the answer is whether this join is the one that earned it.
    const earnsBonus = user ? !(await hasJoinedWaitlist(user.id)) : false;

    const academy = body.plan === "academy";
    await joinWaitlist({
      userId: user?.id ?? null,
      email,
      plan: body.plan,
      trigger: body.trigger,
      schoolName: academy ? body.schoolName : null,
      teacherCount: academy ? (body.teacherCount ?? null) : null,
      note: body.note,
      newsConsent: body.newsConsent
    });

    return NextResponse.json({
      joined: true,
      signedIn: Boolean(user),
      bonus: earnsBonus ? WAITLIST_BONUS_EXAMS : 0
    });
  } catch (error) {
    console.error("Waitlist join failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
