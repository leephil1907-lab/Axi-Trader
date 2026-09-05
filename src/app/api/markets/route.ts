import { NextResponse } from "next/server";
import { getLiveQuotes, quoteRecord } from "@/lib/market-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Custom provider endpoint (configured deployments) takes precedence.
  const url = process.env.MARKET_DATA_URL;
  if (url) {
    try {
      const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!res.ok) return NextResponse.json({ error: "Market data provider unavailable", live: false }, { status: 502 });
      const data = await res.json();
      return NextResponse.json({ data, live: true, source: new URL(url).origin });
    } catch (error) {
      console.error("Market provider error", error);
      return NextResponse.json({ error: "Failed to retrieve market data", live: false }, { status: 502 });
    }
  }

  // 2. Built-in live aggregation (Yahoo Finance, no key required).
  try {
    const { quotes } = await getLiveQuotes();
    if (quotes.length === 0) {
      return NextResponse.json({ error: "Live market data is temporarily unavailable", live: false }, { status: 503 });
    }
    const data: Record<string, Record<string, unknown>> = {};
    for (const quote of quotes) data[quote.symbol] = quoteRecord(quote);
    return NextResponse.json({ data, live: true, source: "Yahoo Finance", count: quotes.length });
  } catch (error) {
    console.error("Built-in market provider error", error);
    return NextResponse.json({ error: "Live market data is temporarily unavailable", live: false }, { status: 503 });
  }
}
