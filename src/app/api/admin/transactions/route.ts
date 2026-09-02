import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completeTransaction } from "@/lib/complete-transaction";
import { requireAdmin, requestAuditContext } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const transactions = await prisma.transaction.findMany({ include: { user: { select: { id: true, name: true, email: true, currency: true } }, promotionEnrollment: { include: { promotion: true } }, bonusLedger: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ transactions });
  } catch (error) { console.error("Admin transaction list error", error); return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  const ctx = requestAuditContext(req);
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rl = await rateLimit("admin-transactions", admin.id, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many transaction review requests" }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000))) } });
    }

    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const status = body.status;
    const rejectionReason = typeof body.rejectionReason === "string" ? body.rejectionReason.trim().slice(0, 500) : undefined;
    if (!id || !["completed", "rejected", "pending"].includes(status)) return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });

    if (status === "completed") {
      const transaction = await completeTransaction(id, admin.id);
      await writeAuditLog({ actorUserId: admin.id, action: "transaction.complete", resource: "transaction", resourceId: id, ...ctx, metadata: { status: transaction.status } });
      return NextResponse.json({ transaction });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const transaction = await tx.transaction.findUnique({ where: { id } });
      if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");
      if (transaction.status !== "pending") throw new Error("TRANSACTION_ALREADY_REVIEWED");
      const updated = await tx.transaction.update({ where: { id }, data: { status, rejectionReason: status === "rejected" ? rejectionReason || "Rejected by admin" : null, reviewedAt: new Date(), reviewedBy: admin.id } });
      await writeAuditLog({ actorUserId: admin.id, action: `transaction.${status}`, resource: "transaction", resourceId: id, ...ctx, metadata: { previousStatus: transaction.status, newStatus: status } }, tx);
      return updated;
    });
    return NextResponse.json({ transaction: result });
  } catch (error: any) {
    const message = error?.message;
    const status = message === "TRANSACTION_NOT_FOUND" ? 404 : ["TRANSACTION_ALREADY_REVIEWED", "INSUFFICIENT_BALANCE"].includes(message) ? 409 : 500;
    console.error("Admin transaction update error", error);
    return NextResponse.json({ error: message || "Failed to update transaction" }, { status });
  }
}
