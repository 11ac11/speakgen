// import NextAuth, {
//   SessionStrategy,
//   type AuthOptions,
//   type DefaultSession,
//   type JWT,
// } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { StackAdapter } from "@stackframe/next-auth";
// import { z } from "zod";
// import type { User } from "./types/types";
// import bcrypt from "bcrypt";
// import { sql } from "@/lib/db";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: number;
//     } & DefaultSession["user"];
//   }

//   interface JWT {
//     id?: number;
//   }
// }

// async function getUserByEmail(
//   email: string | null | undefined
// ): Promise<User | undefined> {
//   if (!email) return undefined;

//   try {
//     const users =
//       (await sql`SELECT * FROM public.users WHERE email = ${email}`) as User[];
//     return users.length > 0 ? users[0] : undefined;
//   } catch (error) {
//     console.error("Failed to fetch user:", error);
//     throw new Error("Failed to fetch user.");
//   }
// }

// export const authOptions: AuthOptions = {
//   pages: {
//     signIn: "/login",
//   },
//   debug: process.env.NODE_ENV === "development",
//   adapter: StackAdapter(),
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const parsed = z
//           .object({
//             email: z.string().email(),
//             password: z.string().min(6),
//           })
//           .safeParse(credentials);

//         if (!parsed.success) {
//           console.error("Validation failed:", parsed.error.errors);
//           throw new Error("Invalid email or password.");
//         }

//         const { email, password } = parsed.data;
//         const user = await getUserByEmail(email);
//         if (!user) throw new Error("Invalid email or password.");

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) throw new Error("Invalid email or password.");

//         return {
//           id: user.id, // Use number here
//           email: user.email,
//         };
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID || "",
//       clientSecret: process.env.GOOGLE_SECRET || "",
//     }),
//   ],
//   session: {
//     strategy: "jwt" as SessionStrategy,
//   },
//   secret: process.env.AUTH_SECRET,
//   callbacks: {
//     async signIn({ user, account }) {
//       console.log("user:", user);
//       console.log("account:", account);
//       if (account?.provider === "google" && user.email) {
//         const existing = await getUserByEmail(user.email);

//         if (!existing) {
//           const [newUser] = await sql`
//             INSERT INTO users (email, name, image)
//             VALUES (${user.email}, ${user.name}, ${user.image})
//             RETURNING *
//           `;
//           await sql`
//             INSERT INTO accounts (user_id, provider, provider_account_id)
//             VALUES (${newUser.id}, 'google', ${user.id})
//           `;
//         }
//       }
//       return true;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id =
//           typeof user.id === "number"
//             ? user.id
//             : parseInt(user.id as string, 10);
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user && token.id) {
//         session.user.id =
//           typeof token.id === "number"
//             ? token.id
//             : parseInt(token.id as string, 10);
//       }
//       return session;
//     },
//   },
// };

// export default NextAuth(authOptions);

import NextAuth, { type AuthOptions } from "next-auth";
// import { StackAdapter } from "@stackframe/stack/next-auth";

export const authOptions: AuthOptions = {
  // adapter: StackAdapter(),
  session: {
    strategy: "jwt",
  },
  providers: [], // Stack handles the actual auth providers
};

export default NextAuth(authOptions);
