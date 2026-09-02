import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeTransaction } from "@/lib/complete-transaction";
import type { Prisma } from "@prisma/client";

function getAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const decoded = token ? verifyToken(token) : null;
  return decoded?.role === "admin" ? decoded : null;
}

export async function GET(req: NextRequest) {
  try {
    if (!getAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const transactions = await prisma.transaction.findMany({ include: { user: { select: { id: true, name: true, email: true, currency: true } }, promotionEnrollment: { include: { promotion: true } }, bonusLedger: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ transactions });
  } catch (error) { console.error("Admin transaction list error", error); return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, status, rejectionReason } = await req.json();
    if (!id || !["completed", "rejected", "pending"].includes(status)) return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    if (status === "completed") return NextResponse.json({ transaction: await completeTransaction(String(id), admin.userId) });
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const transaction = await tx.transaction.findUnique({ where: { id: String(id) } });
      if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");
      if (transaction.status !== "pending") throw new Error("TRANSACTION_ALREADY_REVIEWED");
      return tx.transaction.update({ where: { id: String(id) }, data: { status, rejectionReason: status === "rejected" ? rejectionReason || "Rejected by admin" : null, reviewedAt: new Date(), reviewedBy: admin.userId } });
    });
    return NextResponse.json({ transaction: result });
  } catch (error: any) {
    const message = error?.message;
    const status = message === "TRANSACTION_NOT_FOUND" ? 404 : ["TRANSACTION_ALREADY_REVIEWED", "INSUFFICIENT_BALANCE"].includes(message) ? 409 : 500;
    console.error("Admin transaction update error", error);
    return NextResponse.json({ error: message || "Failed to update transaction" }, { status });
  }
}
