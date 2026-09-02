import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
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
