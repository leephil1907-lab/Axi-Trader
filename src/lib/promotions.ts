import { prisma } from "@/lib/prisma";

export function isPromotionEligible(user: { country: string | null; accountType: string; currency: string }, promotion: { currency: string; eligibleCountries: string | null; eligibleAccountTypes: string | null }) {
  if (promotion.currency && promotion.currency.toUpperCase() !== user.currency.toUpperCase()) return false;
  const country = (user.country || "").trim().toLowerCase();
  const countries = (promotion.eligibleCountries || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  if (countries.length && !countries.includes(country)) return false;
  const accountTypes = (promotion.eligibleAccountTypes || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  if (accountTypes.length && !accountTypes.includes(user.accountType.toLowerCase())) return false;
  return true;
}

export async function getActivePromotionsForUser(user: { id: string; country: string | null; accountType: string; currency: string }) {
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: { active: true, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    include: { enrollments: { where: { userId: user.id }, select: { id: true, status: true, activatedAt: true, expiresAt: true, qualifyingDepositId: true, completedAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  return promotions.filter(p => isPromotionEligible(user, p));
}

export function calculateBonus(depositAmount: number, bonusPercent: number, maxBonus: number | null) {
  const raw = depositAmount * (bonusPercent / 100);
  const capped = maxBonus == null ? raw : Math.min(raw, maxBonus);
  return Math.max(0, Math.round(capped * 100) / 100);
}
