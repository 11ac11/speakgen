import NextAuth, { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development", // Only enable debug in dev mode
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
          throw new Error("Invalid email or password.");
        }

        const { email, password } = parsedCredentials.data;
        console.log("Attempting login for:", email);

        const user = await getUser(email);
        if (!user) {
          console.error("User not found:", email);
          throw new Error("Invalid email or password.");
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          console.error("Invalid password for:", email);
          throw new Error("Invalid email or password.");
        }

        // Return user (omit password)
        return {
          id: String(user.id), // Ensure `id` is a string
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy, // Use JSON Web Tokens for session management
  },
  secret: process.env.AUTH_SECRET, // Required for JWT encryption
};

// Export handlers for Next.js API routes
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
