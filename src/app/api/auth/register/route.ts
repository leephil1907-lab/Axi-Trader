import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, country, phone } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
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

    // The PostgreSQL user record is created before any optional email delivery.
    // Email delivery must never block account creation or admin visibility.
    try {
      await sendWelcomeEmail({ email: user.email, firstName: user.firstName });
    } catch (emailError) {
      console.error("Welcome email delivery failed:", emailError);
    }

    // Issue the same server-authenticated cookie used by login so the newly
    // registered user can enter the dashboard immediately without Firebase.
    const token = generateToken(user.id, user.role);
    const response = NextResponse.json({
      token,
      user: {
        id: user.id, email: user.email, name: user.name,
        firstName: user.firstName, lastName: user.lastName,
        role: user.role, status: user.status, balance: user.balance,
        currency: user.currency, country: user.country,
      }
    });

    response.cookies.set("axi_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed", detail: err.message }, { status: 500 });
  }
}
