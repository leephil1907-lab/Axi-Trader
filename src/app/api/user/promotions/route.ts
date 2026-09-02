import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivePromotionsForUser, isPromotionEligible } from "@/lib/promotions";

function getUserId(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = token ? verifyToken(token) : null;
  return decoded?.userId || null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, country: true, accountType: true, currency: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const promotions = await getActivePromotionsForUser(user);
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Promotion list error", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { code } = await req.json();
    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode) return NextResponse.json({ error: "Promo code is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, country: true, accountType: true, currency: true } });
    const promotion = await prisma.promotion.findUnique({ where: { code: normalizedCode } });
    if (!user || !promotion) return NextResponse.json({ error: "Promo code is invalid" }, { status: 404 });

    const now = new Date();
    if (!promotion.active || promotion.startsAt > now || (promotion.endsAt && promotion.endsAt < now)) return NextResponse.json({ error: "This promotion is not currently available" }, { status: 409 });
    if (!isPromotionEligible(user, promotion)) return NextResponse.json({ error: "You are not eligible for this promotion" }, { status: 403 });

    if (promotion.firstDepositOnly) {
      const priorDeposit = await prisma.transaction.findFirst({ where: { userId, type: "deposit", status: "completed" }, select: { id: true } });
      if (priorDeposit) return NextResponse.json({ error: "This promotion is for first deposits only" }, { status: 409 });
    }

    const existing = await prisma.promotionEnrollment.findUnique({ where: { userId_promotionId: { userId, promotionId: promotion.id } } });
    if (existing) return NextResponse.json({ error: "This promo code has already been activated on your account", enrollment: existing }, { status: 409 });

    const enrollment = await prisma.promotionEnrollment.create({
      data: { userId, promotionId: promotion.id, status: "active", expiresAt: promotion.endsAt },
      include: { promotion: true },
    });
    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("Promotion activation error", error);
    return NextResponse.json({ error: "Failed to activate promotion" }, { status: 500 });
  }
}
