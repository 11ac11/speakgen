import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";
import { z } from "zod";

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { username, email, password } = parsed.data;

    // Check if user already exists
    const existingUser =
      await sql`SELECT * FROM public.users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store new user
    await sql`
      INSERT INTO public.users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
    `;

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
