import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
  try {
    const take = Math.min(Math.max(Number(new URL(req.url).searchParams.get("take") || 50), 1), 200);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { actor: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Admin audit error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
