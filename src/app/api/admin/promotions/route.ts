import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function admin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = token ? verifyToken(token) : null;
  return decoded?.role === "admin" ? decoded : null;
}

export async function GET(req: NextRequest) {
  if (!admin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const promotions = await prisma.promotion.findMany({ include: { _count: { select: { enrollments: true, bonusLedger: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Admin promotion list error", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!admin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const bonusPercent = Number(body.bonusPercent);
    const minDeposit = Number(body.minDeposit || 0);
    const maxBonus = body.maxBonus === null || body.maxBonus === "" || body.maxBonus === undefined ? null : Number(body.maxBonus);
    const startsAt = new Date(body.startsAt || Date.now());
    const endsAt = body.endsAt ? new Date(body.endsAt) : null;
    if (!code || !name || !description || !Number.isFinite(bonusPercent) || bonusPercent < 0 || !Number.isFinite(minDeposit) || minDeposit < 0 || (maxBonus !== null && (!Number.isFinite(maxBonus) || maxBonus < 0)) || Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) return NextResponse.json({ error: "Invalid promotion fields" }, { status: 400 });
    const promotion = await prisma.promotion.create({ data: { code, name, description, bonusPercent, minDeposit, maxBonus, currency: String(body.currency || "USD").toUpperCase(), eligibleCountries: body.eligibleCountries || null, eligibleAccountTypes: body.eligibleAccountTypes || null, firstDepositOnly: Boolean(body.firstDepositOnly), requiresTrade: Boolean(body.requiresTrade), active: Boolean(body.active), startsAt, endsAt } });
    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error: any) {
    console.error("Admin promotion create error", error);
    return NextResponse.json({ error: error?.code === "P2002" ? "Promo code already exists" : "Failed to create promotion" }, { status: error?.code === "P2002" ? 409 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!admin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Promotion id is required" }, { status: 400 });
    const data: Record<string, unknown> = {};
    for (const key of ["name", "description", "eligibleCountries", "eligibleAccountTypes", "currency"]) if (body[key] !== undefined) data[key] = body[key] === null ? null : String(body[key]);
    for (const key of ["bonusPercent", "minDeposit", "maxBonus"]) if (body[key] !== undefined) data[key] = body[key] === null || body[key] === "" ? null : Number(body[key]);
    for (const key of ["active", "firstDepositOnly", "requiresTrade"]) if (body[key] !== undefined) data[key] = Boolean(body[key]);
    for (const key of ["startsAt", "endsAt"]) if (body[key] !== undefined) data[key] = body[key] === null || body[key] === "" ? null : new Date(body[key]);
    const promotion = await prisma.promotion.update({ where: { id: String(body.id) }, data });
    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Admin promotion update error", error);
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 });
  }
}
