import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivePromotionsForUser } from "@/lib/promotions";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, email: true, name: true, firstName: true, lastName: true,
        role: true, status: true, kycStatus: true, currency: true, country: true, accountType: true,
        balance: true, equity: true, margin: true, freeMargin: true,
        marginLevel: true, totalProfit: true, totalLoss: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const [transactions, trades, promotions, bonusLedger] = await Promise.all([
      prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20, include: { promotionEnrollment: { include: { promotion: true } }, bonusLedger: true } }),
      prisma.trade.findMany({ where: { userId: user.id, closedAt: null }, orderBy: { openedAt: "desc" } }),
      getActivePromotionsForUser(user),
      prisma.bonusLedger.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20, include: { promotion: true } }),
    ]);

    return NextResponse.json({ user, transactions, trades, promotions, bonusLedger });
  } catch (error) {
    console.error("Portfolio error", error);
    return NextResponse.json({ error: "Failed to load portfolio" }, { status: 500 });
  }
}
