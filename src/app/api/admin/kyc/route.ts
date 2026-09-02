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
  const documents = await prisma.kycDocument.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { id: "desc" },
  });
  return NextResponse.json({ documents });
}

export async function PATCH(req: NextRequest) {
  const decoded = admin(req);
  if (!decoded) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, status, rejectionReason } = await req.json();
  if (!id || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
  }

  const document = await prisma.kycDocument.update({
    where: { id },
    data: { status, rejectionReason: status === "rejected" ? rejectionReason || "Rejected by compliance" : null, reviewedAt: new Date(), reviewedBy: decoded.userId },
  });

  const userStatus = status === "approved" ? "verified" : status === "rejected" ? "rejected" : "pending";
  await prisma.user.update({ where: { id: document.userId }, data: { kycStatus: userStatus } });
  return NextResponse.json({ document, kycStatus: userStatus });
}
