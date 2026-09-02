import { NextRequest } from "next/server";
import { getUserFromToken } from "./auth";

export async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || request.cookies.get("axi_token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user?.role === "admin" ? user : null;
}

export function requestAuditContext(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
  return {
    ipAddress,
    userAgent: request.headers.get("user-agent"),
    requestId: request.headers.get("x-request-id"),
  };
}
