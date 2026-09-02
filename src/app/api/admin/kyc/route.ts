import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendKycDecisionEmail } from "@/lib/email";
import { requireAdmin, requestAuditContext } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const documents = await prisma.kycDocument.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { id: "desc" },
  });
  return NextResponse.json({ documents });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await rateLimit("admin-kyc", admin.id, 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many KYC review requests" }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000))) } });

  const body = await req.json();
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = body.status;
  const rejectionReason = typeof body.rejectionReason === "string" ? body.rejectionReason.trim().slice(0, 500) : undefined;
  if (!id || !["approved", "rejected", "pending"].includes(status)) return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });

  try {
    const result = await prisma.$transaction(async tx => {
      const document = await tx.kycDocument.findUnique({ where: { id } });
      if (!document) throw new Error("KYC_NOT_FOUND");
      const userStatus = status === "approved" ? "verified" : status === "rejected" ? "rejected" : "pending";
      const updated = await tx.kycDocument.update({ where: { id }, data: { status, rejectionReason: status === "rejected" ? rejectionReason || "Rejected by compliance" : null, reviewedAt: new Date(), reviewedBy: admin.id } });
      await tx.user.update({ where: { id: document.userId }, data: { kycStatus: userStatus } });
      await writeAuditLog({ actorUserId: admin.id, action: `kyc.${status}`, resource: "kyc_document", resourceId: id, ...requestAuditContext(req), metadata: { userId: document.userId, previousStatus: document.status, newStatus: status } }, tx);
      return { document: updated, userStatus, userId: document.userId };
    });

    const user = await prisma.user.findUnique({ where: { id: result.userId }, select: { email: true, firstName: true } });
    if (user) void sendKycDecisionEmail(user, status, rejectionReason);
    return NextResponse.json({ document: result.document, kycStatus: result.userStatus });
  } catch (error: any) {
    if (error?.message === "KYC_NOT_FOUND") return NextResponse.json({ error: "KYC document not found" }, { status: 404 });
    console.error("Admin KYC update error", error);
    return NextResponse.json({ error: "Failed to update KYC" }, { status: 500 });
  }
}
