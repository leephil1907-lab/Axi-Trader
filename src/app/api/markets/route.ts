import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.MARKET_DATA_URL;
  if (!url) return NextResponse.json({ error: "MARKET_DATA_URL is not configured", live: false }, { status: 503 });
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
