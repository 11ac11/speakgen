import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  throw new Error("Missing NEON_AUTH_BASE_URL in environment variables");
}

if (!cookieSecret) {
  throw new Error("Missing NEON_AUTH_COOKIE_SECRET in environment variables");
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret
  }
});