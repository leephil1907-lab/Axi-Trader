import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimit("auth-register", ip, 5, 60 * 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000))) } });

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 100) : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim().slice(0, 100) : "";
    const country = typeof body.country === "string" ? body.country.trim().slice(0, 100) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";

    if (!email || !password || !firstName || !lastName || !country) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Password must be 8-128 characters" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: {
      email, password: hashed, firstName, lastName, name: `${firstName} ${lastName}`,
      phone, country, language: "en", currency: "USD", accountType: "standard", platform: "mt5",
      role: "user", status: "active", kycStatus: "not_started", balance: 0, equity: 0,
      margin: 0, freeMargin: 0, marginLevel: 0, totalProfit: 0, totalLoss: 0,
    }});

    await writeAuditLog({ actorUserId: user.id, action: "auth.register", resource: "user", resourceId: user.id, outcome: "success", ipAddress: ip, userAgent: req.headers.get("user-agent"), requestId: req.headers.get("x-request-id") });
    try { await sendWelcomeEmail({ email: user.email, firstName: user.firstName }); } catch (emailError) { console.error("Welcome email delivery failed:", emailError); }

    const token = generateToken(user.id, user.role);
    const response = NextResponse.json({ token, user: {
      id: user.id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName,
      role: user.role, status: user.status, balance: user.balance, currency: user.currency, country: user.country,
    }});
    response.cookies.set("axi_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
