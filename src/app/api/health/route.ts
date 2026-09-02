import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const response = NextResponse.json({
      status: "ok",
      database: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", service: "axi-trader", event: "health.database_failure", error: error instanceof Error ? error.message : "unknown" }));
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
