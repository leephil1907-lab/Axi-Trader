import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? verifyToken(token) : null;
}

export async function POST(req: NextRequest) {
  try {
    const decoded = auth(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { type, amount, currency, method } = await req.json();
    const numericAmount = Number(amount);
    if (!["deposit", "withdrawal"].includes(type)) return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    if (!currency || !method) return NextResponse.json({ error: "Currency and method are required" }, { status: 400 });

    const tx = await prisma.transaction.create({
      data: { userId: decoded.userId, type, amount: numericAmount, currency, method, status: "pending" },
    });
    return NextResponse.json({ transaction: tx }, { status: 201 });
  } catch (error) {
    console.error("User transaction create error", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = auth(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const transactions = await prisma.transaction.findMany({ where: { userId: decoded.userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("User transaction list error", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
