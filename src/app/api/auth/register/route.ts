import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, country, phone } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || "",
        country: country || "US",
        language: "en",
        currency: "USD",
        accountType: "standard",
        platform: "mt5",
        role: "user",
        status: "active",
        kycStatus: "not_started",
        balance: 0,
        equity: 0,
        margin: 0,
        freeMargin: 0,
        marginLevel: 0,
        totalProfit: 0,
        totalLoss: 0,
      },
    });

    const token = generateToken(user.id, user.role);
    return NextResponse.json({
      token,
      user: {
        id: user.id, email: user.email, name: user.name,
        firstName: user.firstName, lastName: user.lastName,
        role: user.role, status: user.status, balance: user.balance,
        currency: user.currency, country: user.country,
      }
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed", detail: err.message }, { status: 500 });
  }
}
