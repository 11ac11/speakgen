import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        // If validation fails, log errors and return null
        if (!parsedCredentials.success) {
          console.error("Validation failed:", parsedCredentials.error.errors);
          return null; // or throw an error depending on your error handling
        }

        const { email, password } = parsedCredentials.data;

        // Here you should authenticate the user, e.g., by checking credentials against your DB
        const user = await getUser(email);

        if (!user) {
          console.error("Invalid credentials for:", email);
          return null;
        }

        return user; // Return the user object to be used in NextAuth session
      },
    }),
  ],
  pages: {
    signIn: "/login", // Custom login page
  },
});
