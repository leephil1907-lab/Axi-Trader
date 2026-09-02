import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requestAuditContext } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

const text = (v: unknown) => v === null || v === undefined ? null : String(v).trim().slice(0, 5000);
const num = (v: unknown) => v === null || v === undefined || v === "" ? null : Number(v);

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try { return NextResponse.json({ methods: await prisma.fundingMethod.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }) }); }
  catch (error) { console.error("Admin funding methods error", error); return NextResponse.json({ error: "Failed to load funding methods" }, { status: 500 }); }
}

async function authorized(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return null;
  const rl = await rateLimit("admin-funding-methods", admin.id, 60, 60_000);
  return rl.allowed ? admin : null;
}

export async function POST(req: NextRequest) {
  const admin = await authorized(req);
  if (!admin) return NextResponse.json({ error: "Forbidden or rate limit exceeded" }, { status: 403 });
  try {
    const b = await req.json();
    const key = String(b.key || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 80);
    const name = String(b.name || "").trim().slice(0, 120);
    const type = String(b.type || "").trim().toLowerCase();
    if (!key || !name || !["card", "crypto", "bank", "wallet", "other"].includes(type)) return NextResponse.json({ error: "Key, name and a valid method type are required" }, { status: 400 });
    const method = await prisma.fundingMethod.create({ data: { key, name, type, enabled: Boolean(b.enabled), countries: text(b.countries), currencies: text(b.currencies), minAmount: num(b.minAmount), maxAmount: num(b.maxAmount), instructions: text(b.instructions), asset: text(b.asset), network: text(b.network), walletAddress: text(b.walletAddress), bankName: text(b.bankName), bankAccountName: text(b.bankAccountName), bankAccount: text(b.bankAccount), bankRouting: text(b.bankRouting), bankSwift: text(b.bankSwift), stripeEnabled: Boolean(b.stripeEnabled), stripePublicKey: text(b.stripePublicKey), logoUrl: text(b.logoUrl), sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 0 } });
    await writeAuditLog({ actorUserId: admin.id, action: "funding_method.create", resource: "funding_method", resourceId: method.id, ...requestAuditContext(req), metadata: { key: method.key, type: method.type } });
    return NextResponse.json({ method }, { status: 201 });
  } catch (error: any) { console.error("Admin funding method create error", error); return NextResponse.json({ error: error?.code === "P2002" ? "Method key already exists" : "Failed to create funding method" }, { status: error?.code === "P2002" ? 409 : 500 }); }
}

export async function PATCH(req: NextRequest) {
  const admin = await authorized(req);
  if (!admin) return NextResponse.json({ error: "Forbidden or rate limit exceeded" }, { status: 403 });
  try {
    const b = await req.json();
    if (!b.id) return NextResponse.json({ error: "Method id is required" }, { status: 400 });
    const data: Record<string, unknown> = {};
    for (const k of ["name", "type", "countries", "currencies", "instructions", "asset", "network", "walletAddress", "bankName", "bankAccountName", "bankAccount", "bankRouting", "bankSwift", "stripePublicKey", "logoUrl"]) if (b[k] !== undefined) data[k] = text(b[k]);
    for (const k of ["minAmount", "maxAmount", "sortOrder"]) if (b[k] !== undefined) data[k] = k === "sortOrder" ? Number(b[k]) : num(b[k]);
    for (const k of ["enabled", "stripeEnabled"]) if (b[k] !== undefined) data[k] = Boolean(b[k]);
    const method = await prisma.fundingMethod.update({ where: { id: String(b.id) }, data });
    await writeAuditLog({ actorUserId: admin.id, action: "funding_method.update", resource: "funding_method", resourceId: method.id, ...requestAuditContext(req), metadata: { fields: Object.keys(data) } });
    return NextResponse.json({ method });
  } catch (error) { console.error("Admin funding method update error", error); return NextResponse.json({ error: "Failed to update funding method" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const admin = await authorized(req);
  if (!admin) return NextResponse.json({ error: "Forbidden or rate limit exceeded" }, { status: 403 });
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Method id is required" }, { status: 400 });
    await prisma.fundingMethod.delete({ where: { id } });
    await writeAuditLog({ actorUserId: admin.id, action: "funding_method.delete", resource: "funding_method", resourceId: id, ...requestAuditContext(req) });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Admin funding method delete error", error); return NextResponse.json({ error: "Failed to delete funding method" }, { status: 500 }); }
}
