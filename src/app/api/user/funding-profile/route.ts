import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { country } = await req.json();
    const normalized = String(country || "").trim().toUpperCase();
    if (!/^[A-Z]{2,3}$/.test(normalized)) return NextResponse.json({ error: "Select a valid country" }, { status: 400 });
    const user = await prisma.user.update({ where: { id: decoded.userId }, data: { country: normalized }, select: { country: true, currency: true } });
    return NextResponse.json({ country: user.country, currency: user.currency });
  } catch (error) {
    console.error("Funding profile update error", error);
    return NextResponse.json({ error: "Failed to save country" }, { status: 500 });
  }
}
