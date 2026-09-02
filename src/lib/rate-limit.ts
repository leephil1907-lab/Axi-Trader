import { prisma } from "./prisma";

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

function safeKeyPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._:@/-]/g, "_").slice(0, 180);
}

/**
 * PostgreSQL-backed fixed-window limiter. The upsert is atomic, so limits are
 * shared across Railway replicas/processes rather than stored in memory.
 */
export async function rateLimit(
  namespace: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const resetAt = new Date(windowStart.getTime() + windowMs);
  const key = `${safeKeyPart(namespace)}:${safeKeyPart(identifier)}`;

  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "windowStart", "count", "updatedAt")
    VALUES (${key}, ${windowStart}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "windowStart" = CASE
        WHEN "RateLimitBucket"."windowStart" = ${windowStart}
          THEN "RateLimitBucket"."windowStart"
        ELSE ${windowStart}
      END,
      "count" = CASE
        WHEN "RateLimitBucket"."windowStart" = ${windowStart}
          THEN "RateLimitBucket"."count" + 1
        ELSE 1
      END,
      "updatedAt" = ${now}
    RETURNING "count"
  `;

  const count = Number(rows[0]?.count ?? limit + 1);
  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}
