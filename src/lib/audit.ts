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
  // Local sqlite preview stores JSON as string; production Postgres uses Json.
  metadata?: unknown;
};

type AuditClient = typeof prisma | Prisma.TransactionClient;

/** Audit writes are server-side only and may also be committed inside a DB transaction. */
export async function writeAuditLog(context: AuditContext, db: AuditClient = prisma) {
  // Production Postgres uses a native Json column (pass the value through);
  // local SQLite preview stores it stringified (no Json type there).
  const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");
  const metadata =
    context.metadata == null
      ? null
      : isPostgres
        ? (context.metadata as Prisma.InputJsonValue)
        : typeof context.metadata === "string"
          ? context.metadata
          : JSON.stringify(context.metadata);
  return (db as any).auditLog.create({
    data: {
      actorUserId: context.actorUserId ?? null,
      action: context.action,
      resource: context.resource,
      resourceId: context.resourceId ?? null,
      outcome: context.outcome ?? "success",
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      requestId: context.requestId ?? null,
      metadata,
    },
  });
}
