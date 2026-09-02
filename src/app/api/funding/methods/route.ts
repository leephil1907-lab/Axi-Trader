import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return token ? verifyToken(token) : null;
}

const split = (value?: string | null) => (value || "").split(",").map(v => v.trim().toUpperCase()).filter(Boolean);

type FundingMethodRecord = Awaited<ReturnType<typeof prisma.fundingMethod.findMany>>[number];

export async function GET(req: NextRequest) {
  try {
    const decoded = getUser(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { country: true, currency: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const country = (user.country || "US").trim().toUpperCase();
    const currency = (user.currency || "USD").trim().toUpperCase();
    const methods = await prisma.fundingMethod.findMany({ where: { enabled: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    const available = methods.filter((m: FundingMethodRecord) => {
      const countries = split(m.countries);
      const currencies = split(m.currencies);
      const global = countries.includes("*") || countries.includes("ALL");
      return (global || !countries.length || countries.includes(country)) && (!currencies.length || currencies.includes("*") || currencies.includes("ALL") || currencies.includes(currency));
    }).map((m: FundingMethodRecord) => ({ id: m.id, key: m.key, name: m.name, type: m.type, minAmount: m.minAmount, maxAmount: m.maxAmount, instructions: m.instructions, asset: m.asset, network: m.network, walletAddress: m.walletAddress, bankName: m.bankName, bankAccountName: m.bankAccountName, bankAccount: m.bankAccount, bankRouting: m.bankRouting, bankSwift: m.bankSwift, stripeEnabled: m.stripeEnabled, stripePublicKey: m.stripePublicKey, logoUrl: m.logoUrl }));
    return NextResponse.json({ country, currency, methods: available });
  } catch (error) {
    console.error("Funding methods error", error);
    return NextResponse.json({ error: "Failed to load funding methods" }, { status: 500 });
  }
}
