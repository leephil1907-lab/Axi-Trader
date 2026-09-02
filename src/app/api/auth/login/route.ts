import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimit("auth-login", ip, 10, 15 * 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000))) } });

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || user.status !== "active") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = generateToken(user.id, user.role);
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    await writeAuditLog({ actorUserId: user.id, action: "auth.login", resource: "user", resourceId: user.id, outcome: "success", ipAddress: ip, userAgent: req.headers.get("user-agent"), requestId: req.headers.get("x-request-id") });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id, email: user.email, name: user.name,
        firstName: user.firstName, lastName: user.lastName,
        role: user.role, status: user.status, balance: user.balance,
        equity: user.equity, margin: user.margin, freeMargin: user.freeMargin,
        currency: user.currency, country: user.country, language: user.language,
        accountType: user.accountType, platform: user.platform, kycStatus: user.kycStatus,
      }
    });
    response.cookies.set("axi_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
