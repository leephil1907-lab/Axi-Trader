import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/trading",
  "/deposit",
  "/withdraw",
  "/wallet",
  "/settings",
  "/copy-trading",
];

// Routes that require admin role
const adminRoutes = ["/admin"];

// Public routes (no auth needed)
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/markets",
  "/helpcenter",
  "/help",
  "/mt4-webtrader",
  "/mt5-webtrader",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  // Get token from cookie or header
  const token =
    request.cookies.get("axi_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // If protected route and no token, redirect to login
  if ((isProtected || isAdmin) && !token) {
    const loginUrl = new URL("/login/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If admin route, verify admin role
  if (isAdmin && token) {
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/", request.url));
    }
  }

  // If already logged in and trying to access login/register, redirect to dashboard
  if (token && (pathname === "/login/" || pathname === "/register/")) {
    const decoded = verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL("/dashboard/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
