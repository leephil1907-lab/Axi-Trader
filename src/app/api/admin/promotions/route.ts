import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requestAuditContext } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

async function adminWithLimit(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return null;
  const rl = await rateLimit("admin-promotions", admin.id, 60, 60_000);
  return rl.allowed ? admin : null;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { return NextResponse.json({ promotions: await prisma.promotion.findMany({ include: { _count: { select: { enrollments: true, bonusLedger: true } } }, orderBy: { createdAt: "desc" } }) }); }
  catch (error) { console.error("Admin promotion list error", error); return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const admin = await adminWithLimit(req);
  if (!admin) return NextResponse.json({ error: "Forbidden or rate limit exceeded" }, { status: 403 });
  try {
    const b = await req.json();
    const code = String(b.code || "").trim().toUpperCase().slice(0, 64);
    const name = String(b.name || "").trim().slice(0, 160);
    const description = String(b.description || "").trim().slice(0, 5000);
    const bonusPercent = Number(b.bonusPercent), minDeposit = Number(b.minDeposit || 0);
    const maxBonus = b.maxBonus === null || b.maxBonus === "" || b.maxBonus === undefined ? null : Number(b.maxBonus);
    const startsAt = new Date(b.startsAt || Date.now()), endsAt = b.endsAt ? new Date(b.endsAt) : null;
    if (!code || !name || !description || !Number.isFinite(bonusPercent) || bonusPercent < 0 || bonusPercent > 1000 || !Number.isFinite(minDeposit) || minDeposit < 0 || (maxBonus !== null && (!Number.isFinite(maxBonus) || maxBonus < 0)) || Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) return NextResponse.json({ error: "Invalid promotion fields" }, { status: 400 });
    const promotion = await prisma.promotion.create({ data: { code, name, description, bonusPercent, minDeposit, maxBonus, currency: String(b.currency || "USD").toUpperCase(), eligibleCountries: b.eligibleCountries || null, eligibleAccountTypes: b.eligibleAccountTypes || null, firstDepositOnly: Boolean(b.firstDepositOnly), requiresTrade: Boolean(b.requiresTrade), active: Boolean(b.active), startsAt, endsAt } });
    await writeAuditLog({ actorUserId: admin.id, action: "promotion.create", resource: "promotion", resourceId: promotion.id, ...requestAuditContext(req), metadata: { code, active: promotion.active } });
    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error: any) { console.error("Admin promotion create error", error); return NextResponse.json({ error: error?.code === "P2002" ? "Promo code already exists" : "Failed to create promotion" }, { status: error?.code === "P2002" ? 409 : 500 }); }
}

export async function PATCH(req: NextRequest) {
  const admin = await adminWithLimit(req);
  if (!admin) return NextResponse.json({ error: "Forbidden or rate limit exceeded" }, { status: 403 });
  try {
    const b = await req.json();
    if (!b.id) return NextResponse.json({ error: "Promotion id is required" }, { status: 400 });
    const data: Record<string, unknown> = {};
    for (const key of ["name", "description", "eligibleCountries", "eligibleAccountTypes", "currency"]) if (b[key] !== undefined) data[key] = b[key] === null ? null : String(b[key]).slice(0, 5000);
    for (const key of ["bonusPercent", "minDeposit", "maxBonus"]) if (b[key] !== undefined) data[key] = b[key] === null || b[key] === "" ? null : Number(b[key]);
    for (const key of ["active", "firstDepositOnly", "requiresTrade"]) if (b[key] !== undefined) data[key] = Boolean(b[key]);
    for (const key of ["startsAt", "endsAt"]) if (b[key] !== undefined) data[key] = b[key] === null || b[key] === "" ? null : new Date(b[key]);
    const promotion = await prisma.promotion.update({ where: { id: String(b.id) }, data });
    await writeAuditLog({ actorUserId: admin.id, action: "promotion.update", resource: "promotion", resourceId: promotion.id, ...requestAuditContext(req), metadata: { fields: Object.keys(data) } });
    return NextResponse.json({ promotion });
  } catch (error) { console.error("Admin promotion update error", error); return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 }); }
}
