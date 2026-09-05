import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requestAuditContext } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

const SAFE_USER_SELECT = {
  id: true, email: true, name: true, firstName: true, lastName: true,
  phone: true, country: true, language: true, currency: true,
  accountType: true, platform: true, role: true, status: true,
  kycStatus: true, balance: true, equity: true, margin: true,
  freeMargin: true, marginLevel: true, totalProfit: true, totalLoss: true,
  createdAt: true, updatedAt: true, lastLogin: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });

    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const user = await prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const [documents, transactions, trades, enrollments, bonusLedger, auditLogs] = await Promise.all([
        prisma.kycDocument.findMany({ where: { userId: id }, orderBy: { id: "desc" } }),
        prisma.transaction.findMany({
          where: { userId: id }, orderBy: { createdAt: "desc" }, take: 50,
          include: { promotionEnrollment: { include: { promotion: true } }, bonusLedger: true },
        }),
        prisma.trade.findMany({ where: { userId: id }, orderBy: { openedAt: "desc" }, take: 50 }),
        prisma.promotionEnrollment.findMany({ where: { userId: id }, include: { promotion: true } }),
        prisma.bonusLedger.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 50, include: { promotion: true } }),
        prisma.auditLog.findMany({ where: { actorUserId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
      ]);
      return NextResponse.json({ user, documents, transactions, trades, enrollments, bonusLedger, auditLogs });
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, firstName: true, lastName: true, role: true, status: true, balance: true, equity: true, kycStatus: true, country: true, currency: true, createdAt: true, lastLogin: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = requestAuditContext(req);
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });

    const rl = await rateLimit("admin-users", admin.id, 30, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Too many admin requests" }, { status: 429 });

    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const status = body.status;
    if (!id || !["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid id or status (active|suspended)" }, { status: 400 });
    }
    if (id === admin.id) return NextResponse.json({ error: "You cannot change your own status" }, { status: 400 });

    const previous = await prisma.user.findUnique({ where: { id }, select: { status: true } });
    if (!previous) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const user = await prisma.user.update({ where: { id }, data: { status }, select: SAFE_USER_SELECT });
    await writeAuditLog({
      actorUserId: admin.id, action: `user.status.${status}`, resource: "user",
      resourceId: id, ...ctx, metadata: { previousStatus: previous.status, newStatus: status },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
