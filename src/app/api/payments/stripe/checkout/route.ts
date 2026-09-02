import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  try {
    const { amount, currency = "USD", methodKey } = await req.json();
    const value = Number(amount); const cur = String(currency).toLowerCase();
    if (!Number.isFinite(value) || value <= 0 || !/^[a-z]{3}$/.test(cur)) return NextResponse.json({ error: "Invalid amount or currency" }, { status: 400 });
    const method = await prisma.fundingMethod.findFirst({ where: { key: String(methodKey || "card"), enabled: true, type: "card", stripeEnabled: true } });
    if (!method) return NextResponse.json({ error: "Stripe card funding is currently unavailable" }, { status: 409 });
    if (method.minAmount !== null && value < method.minAmount) return NextResponse.json({ error: `Minimum amount is ${method.minAmount} ${cur.toUpperCase()}` }, { status: 400 });
    if (method.maxAmount !== null && value > method.maxAmount) return NextResponse.json({ error: `Maximum amount is ${method.maxAmount} ${cur.toUpperCase()}` }, { status: 400 });
    const tx = await prisma.transaction.create({ data: { userId: decoded.userId, type: "deposit", amount: value, currency: cur.toUpperCase(), method: method.key, status: "pending", paymentDetails: JSON.stringify({ fundingMethodId: method.id, name: method.name, provider: "stripe" }) } });
    const stripe = new Stripe(secret);
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({ mode: "payment", payment_method_types: ["card"], line_items: [{ price_data: { currency: cur, product_data: { name: "AxiTrades account funding" }, unit_amount: Math.round(value * 100) }, quantity: 1 }], metadata: { transactionId: tx.id, userId: decoded.userId }, success_url: `${origin}/deposit/?payment=success`, cancel_url: `${origin}/deposit/?payment=cancelled` });
    await prisma.transaction.update({ where: { id: tx.id }, data: { paymentReference: session.id } });
    return NextResponse.json({ url: session.url, transactionId: tx.id });
  } catch (error) { console.error("Stripe checkout error", error); return NextResponse.json({ error: "Unable to start Stripe checkout" }, { status: 500 }); }
}
