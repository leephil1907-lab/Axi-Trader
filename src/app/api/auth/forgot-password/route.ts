import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_OK = { ok: true, message: "If an account exists for this email, a reset code has been sent." };

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimit("auth-forgot", ip, 5, 60 * 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many reset requests. Try again later." }, { status: 429 });

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json(GENERIC_OK);

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, firstName: true, status: true } });
    // Generic response either way: never reveal whether the email is registered.
    if (!user || user.status !== "active") return NextResponse.json(GENERIC_OK);

    const rlEmail = await rateLimit(`auth-forgot-email:${user.id}`, user.id, 3, 60 * 60_000);
    if (!rlEmail.allowed) return NextResponse.json(GENERIC_OK);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    const code = String(randomInt(0, 1000000)).padStart(6, "0");
    const codeHash = createHash("sha256").update(code).digest("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 15 * 60_000) },
    });
    await writeAuditLog({ actorUserId: user.id, action: "auth.password_reset.requested", resource: "user", resourceId: user.id, outcome: "success", ipAddress: ip, userAgent: req.headers.get("user-agent"), requestId: req.headers.get("x-request-id") });
    const sent = await sendPasswordResetEmail(user, code);
    if (!sent) console.error("Password reset email failed to send for", user.id);
    return NextResponse.json(GENERIC_OK);
  } catch (error) {
    console.error("Forgot password error", error);
    return NextResponse.json(GENERIC_OK);
  }
}
