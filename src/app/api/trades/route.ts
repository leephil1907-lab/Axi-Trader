import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? verifyToken(token) : null;
}

export async function GET(req: NextRequest) {
  const decoded = auth(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trades = await prisma.trade.findMany({ where: { userId: decoded.userId }, orderBy: { openedAt: "desc" } });
  return NextResponse.json({ trades, executionEnabled: Boolean(process.env.BROKER_EXECUTION_URL) });
}

export async function POST(req: NextRequest) {
  const decoded = auth(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Never manufacture fills. Until a real broker execution adapter is configured,
  // the platform must not claim that an order was executed.
  if (!process.env.BROKER_EXECUTION_URL) {
    return NextResponse.json({
      error: "Trading execution is not enabled",
      code: "EXECUTION_GATEWAY_NOT_CONFIGURED",
    }, { status: 503 });
  }

  return NextResponse.json({
    error: "Broker execution adapter is configured but not implemented in this deployment",
    code: "EXECUTION_ADAPTER_UNAVAILABLE",
  }, { status: 503 });
}
