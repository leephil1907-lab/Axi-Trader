import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBonus } from "@/lib/promotions";

function getAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = token ? verifyToken(token) : null;
  return decoded?.role === "admin" ? decoded : null;
}

export async function GET(req: NextRequest) {
  try {
    if (!getAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const transactions = await prisma.transaction.findMany({
      include: { user: { select: { id: true, name: true, email: true, currency: true } }, promotionEnrollment: { include: { promotion: true } }, bonusLedger: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Admin transaction list error", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, status, rejectionReason } = await req.json();
    if (!id || !["completed", "rejected", "pending"].includes(status)) return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({ where: { id }, include: { promotionEnrollment: { include: { promotion: true } }, bonusLedger: true } });
      if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");
      if (transaction.status !== "pending") throw new Error("TRANSACTION_ALREADY_REVIEWED");

      if (status === "completed") {
        const user = await tx.user.findUnique({ where: { id: transaction.userId } });
        if (!user) throw new Error("USER_NOT_FOUND");
        const amount = Number(transaction.amount);
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("INVALID_AMOUNT");
        if (transaction.type === "withdrawal" && user.balance < amount) throw new Error("INSUFFICIENT_BALANCE");

        const nextBalance = transaction.type === "deposit" ? user.balance + amount : user.balance - amount;
        await tx.user.update({ where: { id: user.id }, data: { balance: nextBalance, equity: nextBalance, freeMargin: nextBalance } });

        const enrollment = transaction.promotionEnrollment;
        if (transaction.type === "deposit" && enrollment && enrollment.status === "active" && !enrollment.qualifyingDepositId) {
          const promotion = enrollment.promotion;
          const now = new Date();
          const eligible = promotion.active && promotion.startsAt <= now && (!promotion.endsAt || promotion.endsAt >= now) && transaction.currency.toUpperCase() === promotion.currency.toUpperCase() && amount >= promotion.minDeposit;
          const alreadyDeposited = promotion.firstDepositOnly ? Boolean(await tx.transaction.findFirst({ where: { userId: transaction.userId, type: "deposit", status: "completed", id: { not: transaction.id } }, select: { id: true } })) : false;
          if (eligible && !alreadyDeposited) {
            const bonusAmount = calculateBonus(amount, promotion.bonusPercent, promotion.maxBonus);
            if (bonusAmount > 0) {
              await tx.bonusLedger.create({ data: { userId: transaction.userId, promotionId: promotion.id, enrollmentId: enrollment.id, transactionId: transaction.id, type: "credit", status: "credited", amount: bonusAmount, currency: transaction.currency, description: `${promotion.name} — ${promotion.bonusPercent}% deposit bonus` } });
              await tx.user.update({ where: { id: user.id }, data: { balance: nextBalance + bonusAmount, equity: nextBalance + bonusAmount, freeMargin: nextBalance + bonusAmount } });
              await tx.promotionEnrollment.update({ where: { id: enrollment.id }, data: { status: "completed", qualifyingDepositId: transaction.id, completedAt: now } });
            }
          }
        }
      }

      return tx.transaction.update({ where: { id }, data: { status, rejectionReason: status === "rejected" ? rejectionReason || "Rejected by admin" : null, reviewedAt: new Date(), reviewedBy: admin.userId } });
    });
    return NextResponse.json({ transaction: result });
  } catch (error: any) {
    const message = error?.message;
    const status = message === "TRANSACTION_NOT_FOUND" ? 404 : message === "TRANSACTION_ALREADY_REVIEWED" || message === "INSUFFICIENT_BALANCE" ? 409 : 500;
    console.error("Admin transaction update error", error);
    return NextResponse.json({ error: message || "Failed to update transaction" }, { status });
  }
}
