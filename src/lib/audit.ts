import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export type AuditContext = {
  actorUserId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  outcome?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type AuditClient = typeof prisma | Prisma.TransactionClient;

/** Audit writes are server-side only and may also be committed inside a DB transaction. */
export async function writeAuditLog(context: AuditContext, db: AuditClient = prisma) {
  return db.auditLog.create({
    data: {
      actorUserId: context.actorUserId ?? null,
      action: context.action,
      resource: context.resource,
      resourceId: context.resourceId ?? null,
      outcome: context.outcome ?? "success",
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      requestId: context.requestId ?? null,
      metadata: context.metadata,
    },
  });
}
