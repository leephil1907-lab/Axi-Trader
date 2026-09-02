import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return token ? verifyToken(token) : null;
}

export async function POST(req: NextRequest) {
  try {
    const decoded = auth(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { type, amount, currency, method, promoCode } = await req.json();
    const numericAmount = Number(amount);
    const normalizedCurrency = String(currency || "").trim().toUpperCase();
    const normalizedMethod = String(method || "").trim().toLowerCase();
    if (!["deposit", "withdrawal"].includes(type)) return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    if (!normalizedCurrency || !normalizedMethod) return NextResponse.json({ error: "Currency and method are required" }, { status: 400 });

    let paymentDetails: string | undefined;
    let fundingMethod: any = null;
    if (type === "deposit") {
      fundingMethod = await prisma.fundingMethod.findFirst({ where: { key: normalizedMethod, enabled: true } });
      if (!fundingMethod) return NextResponse.json({ error: "This funding method is currently unavailable" }, { status: 409 });
      if (fundingMethod.minAmount !== null && numericAmount < fundingMethod.minAmount) return NextResponse.json({ error: `Minimum amount is ${fundingMethod.minAmount} ${normalizedCurrency}` }, { status: 400 });
      if (fundingMethod.maxAmount !== null && numericAmount > fundingMethod.maxAmount) return NextResponse.json({ error: `Maximum amount is ${fundingMethod.maxAmount} ${normalizedCurrency}` }, { status: 400 });
      paymentDetails = JSON.stringify({ fundingMethodId: fundingMethod.id, name: fundingMethod.name, type: fundingMethod.type, asset: fundingMethod.asset, network: fundingMethod.network, walletAddress: fundingMethod.walletAddress, bankName: fundingMethod.bankName, bankAccountName: fundingMethod.bankAccountName, bankAccount: fundingMethod.bankAccount, bankRouting: fundingMethod.bankRouting, bankSwift: fundingMethod.bankSwift, instructions: fundingMethod.instructions });
    }

    let promotionEnrollmentId: string | undefined;
    if (type === "deposit" && promoCode) {
      const code = String(promoCode).trim().toUpperCase();
      const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { country: true, accountType: true, currency: true } });
      const promotion = await prisma.promotion.findUnique({ where: { code } });
      if (!user || !promotion) return NextResponse.json({ error: "Promo code is invalid" }, { status: 404 });
      const now = new Date();
      if (!promotion.active || promotion.startsAt > now || (promotion.endsAt && promotion.endsAt < now)) return NextResponse.json({ error: "Promotion is not active" }, { status: 409 });
      if (promotion.currency.toUpperCase() !== normalizedCurrency) return NextResponse.json({ error: "Deposit currency does not match the promotion" }, { status: 400 });
      const countries = (promotion.eligibleCountries || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
      if (countries.length && !countries.includes((user.country || "").trim().toLowerCase())) return NextResponse.json({ error: "You are not eligible for this promotion" }, { status: 403 });
      const accounts = (promotion.eligibleAccountTypes || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
      if (accounts.length && !accounts.includes(user.accountType.toLowerCase())) return NextResponse.json({ error: "Your account type is not eligible" }, { status: 403 });
      if (numericAmount < promotion.minDeposit) return NextResponse.json({ error: `Minimum qualifying deposit is ${promotion.minDeposit} ${promotion.currency}` }, { status: 400 });
      const enrollment = await prisma.promotionEnrollment.findUnique({ where: { userId_promotionId: { userId: decoded.userId, promotionId: promotion.id } } });
      if (!enrollment || enrollment.status !== "active") return NextResponse.json({ error: "Activate this promo code before depositing" }, { status: 409 });
      if (enrollment.expiresAt && enrollment.expiresAt < now) return NextResponse.json({ error: "Promotion has expired" }, { status: 409 });
      if (enrollment.qualifyingDepositId) return NextResponse.json({ error: "This promotion already has a qualifying deposit" }, { status: 409 });
      promotionEnrollmentId = enrollment.id;
    }

    const tx = await prisma.transaction.create({ data: { userId: decoded.userId, type, amount: numericAmount, currency: normalizedCurrency, method: normalizedMethod, status: "pending", promotionEnrollmentId, paymentDetails } });

    if (type === "deposit" && fundingMethod?.type === "card" && fundingMethod.stripeEnabled) {
      if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
      try {
        const session = await stripe.checkout.sessions.create({ mode:"payment", payment_method_types:["card"], line_items:[{price_data:{currency:normalizedCurrency.toLowerCase(),product_data:{name:"AxiTrades account funding"},unit_amount:Math.round(numericAmount*100)},quantity:1}], metadata:{transactionId:tx.id,userId:decoded.userId}, success_url:`${origin}/deposit/?payment=success`, cancel_url:`${origin}/deposit/?payment=cancelled` });
        await prisma.transaction.update({ where:{id:tx.id}, data:{paymentReference:session.id} });
        return NextResponse.json({ transaction:{...tx,paymentReference:session.id}, url:session.url }, { status:201 });
      } catch (stripeError) {
        await prisma.transaction.update({ where:{id:tx.id}, data:{status:"rejected",rejectionReason:"Unable to initialize Stripe checkout"} });
        console.error("Stripe checkout initialization error", stripeError);
        return NextResponse.json({ error:"Unable to start card payment" }, { status:502 });
      }
    }
    return NextResponse.json({ transaction: tx }, { status: 201 });
  } catch (error) { console.error("User transaction create error", error); return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 }); }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = auth(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const transactions = await prisma.transaction.findMany({ where: { userId: decoded.userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ transactions });
  } catch (error) { console.error("User transaction list error", error); return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 }); }
}
