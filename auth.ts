import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import type { User } from "./lib/definitions";
import bcrypt from "bcrypt";
import { sql } from "./lib/db";

async function getUser(email: string): Promise<User | undefined> {
  try {
    const users =
      (await sql`SELECT * FROM public.users WHERE email = ${email}`) as User[];

    return users.length > 0 ? users[0] : undefined;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials using Zod
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.error("Validation failed:", parsedCredentials.error.errors);
          return null;
        }

        const { email, password } = parsedCredentials.data;
        console.log("email:", email);
        const user = await getUser(email);

        if (!user) {
          console.error("User not found:", email);
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          console.error("Invalid password for:", email);
          return null;
        }

        // Omit password before returning user
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Uses JSON Web Tokens instead of database sessions
  },
  secret: process.env.AUTH_SECRET, // Required for JWT encryption
});
