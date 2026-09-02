import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const decoded = token ? verifyToken(token) : null;
  return decoded?.role === "admin";
}

const text = (v: unknown) => v === null || v === undefined ? null : String(v).trim();
const num = (v: unknown) => v === null || v === undefined || v === "" ? null : Number(v);

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { return NextResponse.json({ methods: await prisma.fundingMethod.findMany({ orderBy: { sortOrder: "asc" } }) }); }
  catch (error) { console.error("Admin funding methods error", error); return NextResponse.json({ error: "Failed to load funding methods" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = await req.json();
    const key = String(b.key || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const name = String(b.name || "").trim();
    const type = String(b.type || "").trim().toLowerCase();
    if (!key || !name || !["card", "crypto", "bank", "wallet", "other"].includes(type)) return NextResponse.json({ error: "Key, name and a valid method type are required" }, { status: 400 });
    const method = await prisma.fundingMethod.create({ data: { key, name, type, enabled: Boolean(b.enabled), countries: text(b.countries), currencies: text(b.currencies), minAmount: num(b.minAmount), maxAmount: num(b.maxAmount), instructions: text(b.instructions), asset: text(b.asset), network: text(b.network), walletAddress: text(b.walletAddress), bankName: text(b.bankName), bankAccountName: text(b.bankAccountName), bankAccount: text(b.bankAccount), bankRouting: text(b.bankRouting), bankSwift: text(b.bankSwift), stripeEnabled: Boolean(b.stripeEnabled), stripePublicKey: text(b.stripePublicKey), sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 0 } });
    return NextResponse.json({ method }, { status: 201 });
  } catch (error: any) { console.error("Admin funding method create error", error); return NextResponse.json({ error: error?.code === "P2002" ? "Method key already exists" : "Failed to create funding method" }, { status: error?.code === "P2002" ? 409 : 500 }); }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = await req.json();
    if (!b.id) return NextResponse.json({ error: "Method id is required" }, { status: 400 });
    const data: Record<string, unknown> = {};
    for (const k of ["name", "type", "countries", "currencies", "instructions", "asset", "network", "walletAddress", "bankName", "bankAccountName", "bankAccount", "bankRouting", "bankSwift", "stripePublicKey"]) if (b[k] !== undefined) data[k] = text(b[k]);
    for (const k of ["minAmount", "maxAmount", "sortOrder"]) if (b[k] !== undefined) data[k] = k === "sortOrder" ? Number(b[k]) : num(b[k]);
    for (const k of ["enabled", "stripeEnabled"]) if (b[k] !== undefined) data[k] = Boolean(b[k]);
    const method = await prisma.fundingMethod.update({ where: { id: String(b.id) }, data });
    return NextResponse.json({ method });
  } catch (error) { console.error("Admin funding method update error", error); return NextResponse.json({ error: "Failed to update funding method" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { const id = new URL(req.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Method id is required" }, { status: 400 }); await prisma.fundingMethod.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch (error) { console.error("Admin funding method delete error", error); return NextResponse.json({ error: "Failed to delete funding method" }, { status: 500 }); }
}
