import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { completeTransaction } from "@/lib/complete-transaction";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  try {
    const raw = await req.text();
    const stripe = new Stripe(secret);
    const event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") return NextResponse.json({ received: true });
      const transactionId = session.metadata?.transactionId;
      if (!transactionId) return NextResponse.json({ error: "Missing transaction metadata" }, { status: 400 });
      const transaction = await completeTransaction(transactionId, "stripe_webhook");
      if (transaction.paymentReference !== session.id) console.warn("Stripe session reference differs from transaction reference", transactionId);
    }
    return NextResponse.json({ received: true });
  } catch (error) { console.error("Stripe webhook error", error); return NextResponse.json({ error: "Invalid Stripe webhook" }, { status: 400 }); }
}
