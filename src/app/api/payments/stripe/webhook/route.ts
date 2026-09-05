import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";

// Stripe is the card-payment PROCESSOR only. A confirmed card payment lands in
// the Stripe balance and marks the funding transaction as "paid" — it NEVER
// credits the user's platform balance. Crediting happens only when an admin
// reviews the transaction in /admin and approves it (completeTransaction).
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

      const transaction = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { user: { select: { id: true, email: true, firstName: true, name: true } } } });
      if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

      if (transaction.status === "pending") {
        const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "paid", paymentReference: session.id, paymentDetails: JSON.stringify({ ...(safeParse(transaction.paymentDetails)), stripeSessionId: session.id, stripePaymentIntentId: paymentIntent, stripeAmountTotal: session.amount_total, stripeCurrency: session.currency }) },
        });
        await writeAuditLog({ actorUserId: null, action: "transaction.deposit.stripe_paid", resource: "transaction", resourceId: transaction.id, outcome: "success", metadata: { amount: Number(transaction.amount), currency: transaction.currency, stripeSessionId: session.id, paymentIntent, userId: transaction.userId } });
        const user = transaction.user;
        void sendAdminNotification(
          `Card payment received — ${Number(transaction.amount).toFixed(2)} ${transaction.currency}`,
          "A card payment cleared in Stripe and is awaiting your review.",
          "Stripe confirms the money is in your Stripe balance. No platform balance was changed. Review the transaction in the admin dashboard and approve it to credit the user.",
          [
            ["User", `${user?.name || user?.firstName || "—"} (${user?.email || transaction.userId})`],
            ["Amount", `${Number(transaction.amount).toFixed(2)} ${transaction.currency}`],
            ["Method", String(transaction.method)],
            ["Transaction ID", transaction.id],
            ["Stripe session", session.id],
            ["Stripe payment", paymentIntent || "—"],
          ]
        );
      } else if (transaction.paymentReference !== session.id) {
        console.warn("Stripe session reference differs from transaction reference", transactionId);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const transactionId = session.metadata?.transactionId;
      if (transactionId) await writeAuditLog({ actorUserId: null, action: "transaction.deposit.stripe_expired", resource: "transaction", resourceId: transactionId, outcome: "success", metadata: { stripeSessionId: session.id } });
    }

    return NextResponse.json({ received: true });
  } catch (error) { console.error("Stripe webhook error", error); return NextResponse.json({ error: "Invalid Stripe webhook" }, { status: 400 }); }
}

function safeParse(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try { const parsed: unknown = JSON.parse(value); return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : {}; }
  catch { return {}; }
}
