import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

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

    // Set HTTP-only cookie for middleware auth
    response.cookies.set("axi_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed", detail: err.message }, { status: 500 });
  }
}
