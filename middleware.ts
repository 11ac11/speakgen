import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (token) {
    // Signed in
    // console.log("JSON Web Token", JSON.stringify(token, null, 2));
  } else {
    // console.log("not signed in");
  }

  // Define protected routes
  const protectedPaths = ["/dashboard", "/profile"];
  const url = new URL(req.url);

  // If the user is NOT authenticated and trying to access a protected route, redirect to login
  if (protectedPaths.includes(url.pathname) && !token) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to protected pages
export const config = {
  matcher: ["/dashboard", "/profile"], // Add other protected pages here
};
