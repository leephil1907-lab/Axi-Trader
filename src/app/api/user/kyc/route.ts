import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendKycSubmittedEmail } from "@/lib/email";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return token ? verifyToken(token) : null;
}

export async function GET(req: NextRequest) {
  const decoded = auth(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const documents = await prisma.kycDocument.findMany({ where: { userId: decoded.userId }, orderBy: { id: "desc" } });
  const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { kycStatus: true } });
  return NextResponse.json({ kycStatus: user?.kycStatus ?? "not_started", documents });
}

export async function POST(req: NextRequest) {
  const decoded = auth(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, fileUrl, fileName } = await req.json();
  if (!type || !fileUrl || !fileName) return NextResponse.json({ error: "type, fileUrl and fileName are required" }, { status: 400 });

  const document = await prisma.kycDocument.create({
    data: { userId: decoded.userId, type, fileUrl, fileName, status: "pending" },
  });
  await prisma.user.update({ where: { id: decoded.userId }, data: { kycStatus: "pending" } });
  const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { email: true, firstName: true } });
  if (user) void sendKycSubmittedEmail(user);
  return NextResponse.json({ document, kycStatus: "pending" }, { status: 201 });
}
