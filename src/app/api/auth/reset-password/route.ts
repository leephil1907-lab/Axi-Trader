import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimit("auth-reset", ip, 10, 60 * 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "").slice(0, 6) : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (!email || code.length !== 6) return NextResponse.json({ error: "Email and a 6-digit code are required" }, { status: 400 });
    if (newPassword.length < 8 || newPassword.length > 128) return NextResponse.json({ error: "Password must be 8-128 characters" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } });
    if (!user || user.status !== "active") return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });

    const record = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const candidate = createHash("sha256").update(code).digest();
    const matches = record !== null && record.attempts < 5 && record.expiresAt.getTime() > Date.now() &&
      (() => {
        try {
          const expected = Buffer.from(record.codeHash, "hex");
          return expected.length === candidate.length && timingSafeEqual(expected, candidate);
        } catch { return false; }
      })();

    if (!record || !matches) {
      if (record && record.expiresAt.getTime() > Date.now() && !record.usedAt) {
        await prisma.passwordResetToken.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      }
      await writeAuditLog({ actorUserId: user.id, action: "auth.password_reset.failed", resource: "user", resourceId: user.id, outcome: "failure", ipAddress: ip, userAgent: req.headers.get("user-agent"), requestId: req.headers.get("x-request-id") });
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null, id: { not: record.id } } }),
    ]);
    await writeAuditLog({ actorUserId: user.id, action: "auth.password_reset.completed", resource: "user", resourceId: user.id, outcome: "success", ipAddress: ip, userAgent: req.headers.get("user-agent"), requestId: req.headers.get("x-request-id") });
    return NextResponse.json({ ok: true, message: "Password updated. You can now sign in." });
  } catch (error) {
    console.error("Reset password error", error);
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
