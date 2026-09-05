// Built-in live market data provider (Yahoo Finance, no API key required).
//
// Priority:
//   1. MARKET_DATA_URL — a custom provider endpoint (JSON) takes precedence.
//   2. Built-in Yahoo Finance aggregation below (real, public quotes).
//   3. Honest failure — the caller returns 503 instead of invented prices.
//
// Nothing here is simulated: every quote comes from a live upstream response.
// Responses are cached briefly (30s) to respect upstream rate limits.

export type LiveQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  updatedAt: string;
};

type Instrument = { symbol: string; name: string; yahoo: string };

const INSTRUMENTS: Instrument[] = [
  // Forex majors & crosses
  { symbol: "EURUSD", name: "Euro / US Dollar", yahoo: "EURUSD=X" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", yahoo: "GBPUSD=X" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", yahoo: "JPY=X" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", yahoo: "CHF=X" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", yahoo: "AUDUSD=X" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", yahoo: "CAD=X" },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", yahoo: "NZDUSD=X" },
  { symbol: "EURGBP", name: "Euro / British Pound", yahoo: "EURGBP=X" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", yahoo: "EURJPY=X" },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen", yahoo: "GBPJPY=X" },
  { symbol: "USDNGN", name: "US Dollar / Nigerian Naira", yahoo: "USDNGN=X" },
  // Metals & energy (futures track spot closely)
  { symbol: "XAUUSD", name: "Gold Spot", yahoo: "GC=F" },
  { symbol: "XAGUSD", name: "Silver Spot", yahoo: "SI=F" },
  { symbol: "USOIL", name: "US Crude Oil (WTI)", yahoo: "CL=F" },
  { symbol: "UKOIL", name: "Brent Crude Oil", yahoo: "BZ=F" },
  // Indices
  { symbol: "US500", name: "US S&P 500", yahoo: "^GSPC" },
  { symbol: "US30", name: "US Dow Jones 30", yahoo: "^DJI" },
  { symbol: "NAS100", name: "US Nasdaq 100", yahoo: "^IXIC" },
  { symbol: "GER40", name: "Germany DAX 40", yahoo: "^GDAXI" },
  { symbol: "UK100", name: "UK FTSE 100", yahoo: "^FTSE" },
  { symbol: "JPN225", name: "Japan Nikkei 225", yahoo: "^N225" },
  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", yahoo: "BTC-USD" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", yahoo: "ETH-USD" },
  { symbol: "SOLUSD", name: "Solana / US Dollar", yahoo: "SOL-USD" },
  // Equities
  { symbol: "AAPL", name: "Apple Inc", yahoo: "AAPL" },
  { symbol: "NVDA", name: "NVIDIA Corp", yahoo: "NVDA" },
  { symbol: "TSLA", name: "Tesla Inc", yahoo: "TSLA" },
  { symbol: "MSFT", name: "Microsoft Corp", yahoo: "MSFT" },
  { symbol: "AMZN", name: "Amazon.com Inc", yahoo: "AMZN" },
  { symbol: "META", name: "Meta Platforms Inc", yahoo: "META" },
];

const CACHE_TTL_MS = 30_000;
const UPSTREAM_TIMEOUT_MS = 8_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

let cache: { at: number; quotes: LiveQuote[] } | null = null;
let inflight: Promise<LiveQuote[]> | null = null;

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function fetchYahoo(symbol: string): Promise<LiveQuote | null> {
  const { signal, clear } = withTimeout(UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`,
      { signal, headers: { "User-Agent": UA, Accept: "application/json" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = Number(meta?.regularMarketPrice);
    if (!Number.isFinite(price)) return null;
    const prevClose = Number(meta?.chartPreviousClose ?? meta?.previousClose);
    const change = Number.isFinite(prevClose) ? price - prevClose : 0;
    const changePercent = Number.isFinite(prevClose) && prevClose !== 0 ? (change / prevClose) * 100 : 0;
    const stamp = Number(meta?.regularMarketTime);
    return {
      symbol: "",
      name: "",
      price,
      change,
      changePercent,
      currency: String(meta?.currency || "USD"),
      updatedAt: Number.isFinite(stamp) ? new Date(stamp * 1000).toISOString() : new Date().toISOString(),
    };
  } catch {
    return null;
  } finally {
    clear();
  }
}

async function loadLive(): Promise<LiveQuote[]> {
  // Custom allow-list via env (comma separated platform symbols), else full universe.
  const allow = (process.env.MARKET_SYMBOLS || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const universe = allow.length
    ? INSTRUMENTS.filter((i) => allow.includes(i.symbol))
    : INSTRUMENTS;
  const results = await Promise.all(
    universe.map(async (instrument) => {
      const quote = await fetchYahoo(instrument.yahoo);
      if (!quote) return null;
      return { ...quote, symbol: instrument.symbol, name: instrument.name };
    })
  );
  return results.filter((q): q is LiveQuote => q !== null);
}

export async function getLiveQuotes(): Promise<{ quotes: LiveQuote[]; cached: boolean }> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { quotes: cache.quotes, cached: true };
  }
  if (!inflight) {
    inflight = loadLive().finally(() => {
      inflight = null;
    });
  }
  const quotes = await inflight;
  // Cache partial results too (better than hammering upstream); caller decides
  // liveness from whether any quotes came back.
  if (quotes.length > 0) cache = { at: Date.now(), quotes };
  return { quotes, cached: false };
}

export function quoteRecord(quote: LiveQuote): Record<string, unknown> {
  // Key order matters: generic table renderers show the first values.
  return {
    symbol: quote.symbol,
    price: quote.price,
    changePercent: Math.round(quote.changePercent * 100) / 100,
    change: Math.round(quote.change * 100000) / 100000,
    name: quote.name,
    currency: quote.currency,
    updatedAt: quote.updatedAt,
  };
}
