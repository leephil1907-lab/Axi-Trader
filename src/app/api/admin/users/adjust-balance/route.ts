import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requestAuditContext } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Manual admin balance adjustment. Creates a completed "adjustment" ledger
 * transaction (visible in the user's wallet history) and an audit record.
 * Never credits/debits silently.
 */
export async function POST(req: NextRequest) {
  const ctx = requestAuditContext(req);
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });

    const rl = await rateLimit("admin-adjust-balance", admin.id, 30, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many adjustment requests" }, { status: 429 });

    const body = await req.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const delta = Number(body.delta);
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 100000000) {
      return NextResponse.json({ error: "delta must be a non-zero amount within limits" }, { status: 400 });
    }
    if (Math.round(delta * 100) !== delta * 100) {
      return NextResponse.json({ error: "delta may contain at most 2 decimal places" }, { status: 400 });
    }
    if (reason.length < 3) return NextResponse.json({ error: "A reason (min 3 chars) is required" }, { status: 400 });

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if ((process.env.DATABASE_URL || "").startsWith("postgres")) {
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
      }
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("USER_NOT_FOUND");
      if (user.status !== "active") throw new Error("USER_NOT_ACTIVE");
      const nextBalance = Math.round((user.balance + delta) * 100) / 100;
      if (nextBalance < 0) throw new Error("INSUFFICIENT_BALANCE");
      const direction = delta > 0 ? "credit" : "debit";
      const transaction = await tx.transaction.create({
        data: {
          userId, type: "adjustment", amount: Math.abs(delta), currency: user.currency,
          method: "admin", status: "completed", reviewedAt: new Date(), reviewedBy: admin.id,
          paymentDetails: JSON.stringify({
            direction, delta, reason, previousBalance: user.balance,
            newBalance: nextBalance, adminId: admin.id,
          }),
        },
      });
      const updated = await tx.user.update({
        where: { id: userId },
        data: { balance: nextBalance, equity: nextBalance, freeMargin: nextBalance },
      });
      await writeAuditLog({
        actorUserId: admin.id, action: "transaction.adjustment.completed",
        resource: "transaction", resourceId: transaction.id, ...ctx,
        metadata: { userId, delta, reason, previousBalance: user.balance, newBalance: nextBalance },
      }, tx);
      return { user: updated, transaction };
    });

    return NextResponse.json({
      user: { id: result.user.id, balance: result.user.balance, equity: result.user.equity },
      transaction: result.transaction,
    });
  } catch (error: any) {
    const message = error?.message;
    const status = message === "USER_NOT_FOUND" ? 404
      : ["USER_NOT_ACTIVE", "INSUFFICIENT_BALANCE"].includes(message) ? 409 : 500;
    console.error("Admin adjust-balance error", error);
    return NextResponse.json({ error: message || "Failed to adjust balance" }, { status });
  }
}
