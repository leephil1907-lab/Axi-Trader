import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard", "/trading", "/deposit", "/withdraw", "/wallet", "/settings", "/copy-trading",
];
const adminRoutes = ["/admin"];

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) return null;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]))) as { userId?: string; role?: string; exp?: number };
    if (!payload.userId || !payload.role || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: payload.userId, role: payload.role };
  } catch { return null; }
}

function corsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const configured = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  try {
    return new URL(origin).origin === new URL(configured).origin ? origin : null;
  } catch { return null; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdmin = adminRoutes.some(route => pathname.startsWith(route));
  const origin = corsOrigin(request);

  if (isApi && request.method === "OPTIONS") {
    if (!origin) return new NextResponse(null, { status: 403 });
    return new NextResponse(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
      "Vary": "Origin",
    }});
  }

  const token = request.cookies.get("axi_token")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if ((isProtected || isAdmin) && !token) {
    const loginUrl = new URL("/login/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isAdmin && token) {
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") return NextResponse.redirect(new URL("/dashboard/", request.url));
  }
  if (token && (pathname === "/login/" || pathname === "/register/")) {
    const decoded = await verifyToken(token);
    if (decoded) return NextResponse.redirect(new URL("/dashboard/", request.url));
  }

  const response = NextResponse.next();
  if (isApi) {
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID");
      response.headers.set("Vary", "Origin");
    }
    response.headers.set("Cache-Control", "no-store");
  }
  response.headers.set("X-Request-ID", request.headers.get("x-request-id") || crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
