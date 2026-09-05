"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, BarChart3, Clock3, Gauge, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import { AxiAppShell } from "@/components/AxiAppShell";
import { TradingViewChart } from "@/components/TradingViewChart";

type Quote = { symbol: string; bid?: number; ask?: number; price?: number; change?: number; changePercent?: number; timestamp?: string };
type RawRecord = Record<string, unknown>;

function normalizeQuotes(value: unknown): Quote[] {
  const records: RawRecord[] = Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object") as RawRecord[]
    : value && typeof value === "object"
      ? Object.entries(value as RawRecord).filter(([, item]) => item && typeof item === "object").map(([symbol, item]) => ({ symbol, ...(item as RawRecord) }))
      : [];
  return records.map((record) => {
    const symbol = String(record.symbol ?? record.ticker ?? record.instrument ?? record.name ?? "").trim();
    const number = (keys: string[]) => { for (const key of keys) { const value = Number(record[key]); if (Number.isFinite(value)) return value; } return undefined; };
    return { symbol, bid: number(["bid", "bidPrice"]), ask: number(["ask", "askPrice"]), price: number(["price", "last", "close", "value"]), change: number(["change", "changeValue"]), changePercent: number(["changePercent", "change_pct", "percentChange"]) };
  }).filter((quote) => quote.symbol);
}

function TradingInner() {
  const params = useSearchParams();
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [volume, setVolume] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { const requested = params.get("symbol"); if (requested) setSymbol(requested); }, [params]);

  useEffect(() => {
    let cancelled = false;
    async function loadQuotes() {
      try {
        const response = await fetch("/api/markets/", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || payload.live !== true) throw new Error();
        const nextQuotes = normalizeQuotes(payload.data);
        if (!cancelled) { setQuotes(nextQuotes); setLive(true); setUpdatedAt(new Date().toISOString()); }
      } catch {
        if (!cancelled) { setLive(false); setQuotes([]); }
      }
    }
    void loadQuotes();
    const timer = window.setInterval(() => void loadQuotes(), 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const selected = useMemo(() => quotes.find((item) => item.symbol.toUpperCase() === symbol.trim().toUpperCase()), [quotes, symbol]);
  const displayPrice = selected?.ask ?? selected?.bid ?? selected?.price;

  async function submit() {
    setMessage("");
    if (!symbol.trim() || !volume || Number(volume) <= 0) { setMessage("Select an instrument and enter a valid trade size."); return; }
    if (!live || !selected) { setMessage("Live market data is unavailable for this instrument. No order was sent."); return; }
    const token = getAuthToken();
    if (!token) { setMessage("Please sign in before placing an order."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/trades/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ symbol: symbol.trim(), type: side, volume: Number(volume), stopLoss: stopLoss ? Number(stopLoss) : undefined, takeProfit: takeProfit ? Number(takeProfit) : undefined }) });
      const data = await response.json();
      setMessage(data.error || "The order service did not return an execution confirmation.");
    } catch { setMessage("The trading service could not be reached."); }
    finally { setBusy(false); }
  }

  return <AxiAppShell active="Markets">
    <section className="bg-[#e4002e] text-white"><div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/65">Axi Trading Platform</p><h1 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">Trade</h1><p className="mt-2 text-sm text-white/70">Analyse live markets, manage risk and send orders through the connected execution service.</p></div><div className="flex items-center gap-2 rounded-full bg-black/15 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider"><span className={`h-2 w-2 rounded-full ${live ? "bg-[#f5c842]" : "bg-white/45"}`} />{live ? "Live market data" : "Live data unavailable"}</div></div></div></section>
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8"><div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
      <aside className="order-2 rounded-md border border-[#dedbd5] bg-white xl:order-1"><div className="border-b border-[#e5e3df] p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-black uppercase tracking-wider">Watchlist</h2><SlidersHorizontal className="h-4 w-4 text-[#777a7b]" /></div><p className="mt-1 text-[10px] text-[#8a8d8e]">Provider-backed prices only</p></div><div className="max-h-[520px] overflow-auto p-2">{quotes.length ? quotes.map((item) => { const price = item.ask ?? item.bid ?? item.price; const active = item.symbol.toUpperCase() === symbol.toUpperCase(); return <button key={item.symbol} type="button" onClick={() => setSymbol(item.symbol)} className={`w-full rounded-md p-3 text-left ${active ? "bg-[#f6f4f0]" : "hover:bg-[#faf9f7]"}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-extrabold">{item.symbol}</span><span className="text-[10px] font-bold text-[#777a7b]">{item.changePercent == null ? "—" : `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`}</span></div><div className="mt-1 text-sm font-black tabular-nums">{price == null ? "—" : price}</div></button>; }) : <div className="p-5 text-xs leading-5 text-[#777a7b]">No live instruments are currently available from the configured market-data provider.</div>}</div></aside>
      <section className="order-1 min-w-0 rounded-md border border-[#dedbd5] bg-white xl:order-2"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e3df] p-4"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]">Market</p><div className="mt-1 flex items-center gap-3"><h2 className="text-xl font-black">{symbol || "Select an instrument"}</h2>{displayPrice != null && <span className="text-sm font-black tabular-nums">{displayPrice}</span>}</div></div><div className="text-right text-[10px] text-[#8a8d8e]"><div className="flex items-center justify-end gap-1"><Clock3 className="h-3.5 w-3.5" />5s market refresh</div><div className="mt-1">{updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : "Waiting for provider"}</div></div></div><div className="p-2"><TradingViewChart symbol={symbol} /></div><div className="grid grid-cols-2 border-t border-[#e5e3df] sm:grid-cols-4"><div className="p-4"><span className="text-[9px] font-extrabold uppercase text-[#8a8d8e]">Bid</span><strong className="mt-1 block text-sm">{selected?.bid ?? "—"}</strong></div><div className="border-l border-[#e5e3df] p-4"><span className="text-[9px] font-extrabold uppercase text-[#8a8d8e]">Ask</span><strong className="mt-1 block text-sm">{selected?.ask ?? "—"}</strong></div><div className="border-t border-[#e5e3df] p-4 sm:border-l sm:border-t-0"><span className="text-[9px] font-extrabold uppercase text-[#8a8d8e]">Change</span><strong className="mt-1 block text-sm">{selected?.changePercent == null ? "—" : `${selected.changePercent.toFixed(2)}%`}</strong></div><div className="border-l border-t border-[#e5e3df] p-4 sm:border-t-0"><span className="text-[9px] font-extrabold uppercase text-[#8a8d8e]">Source</span><strong className="mt-1 block text-sm">{live ? "Live provider" : "Unavailable"}</strong></div></div></section>
      <aside className="order-3 space-y-4"><section className="rounded-md border border-[#dedbd5] bg-white p-5"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-md bg-[#17191a] text-white"><BarChart3 className="h-4 w-4" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]">Order ticket</p><h2 className="text-lg font-black">{symbol || "Select market"}</h2></div></div><div className="mt-5 grid grid-cols-2 gap-1 rounded-md bg-[#f0ede7] p-1"><button type="button" onClick={() => setSide("buy")} className={`rounded py-3 text-xs font-extrabold uppercase tracking-wider ${side === "buy" ? "bg-white text-[#e4002e] shadow-sm" : "text-[#777a7b]"}`}>Buy</button><button type="button" onClick={() => setSide("sell")} className={`rounded py-3 text-xs font-extrabold uppercase tracking-wider ${side === "sell" ? "bg-white text-[#e4002e] shadow-sm" : "text-[#777a7b]"}`}>Sell</button></div><label className="mt-5 block text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]">Trade size<input value={volume} onChange={(e) => setVolume(e.target.value)} type="number" min="0" step="any" placeholder="Enter size" className="mt-2 h-11 w-full rounded-md border border-[#cfd0ce] px-3 text-sm outline-none focus:border-[#e4002e]" /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]">Stop loss<input value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} type="number" step="any" placeholder="Optional" className="mt-2 h-10 w-full rounded-md border border-[#cfd0ce] px-3 text-sm outline-none focus:border-[#e4002e]" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]">Take profit<input value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} type="number" step="any" placeholder="Optional" className="mt-2 h-10 w-full rounded-md border border-[#cfd0ce] px-3 text-sm outline-none focus:border-[#e4002e]" /></label></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-md bg-[#f6f4f0] p-3 text-xs"><div><span className="text-[9px] font-bold uppercase text-[#8a8d8e]">Side</span><strong className="mt-1 block uppercase">{side}</strong></div><div><span className="text-[9px] font-bold uppercase text-[#8a8d8e]">Size</span><strong className="mt-1 block">{volume || "—"}</strong></div></div>{message && <div role="alert" className="mt-4 rounded-md border border-[#efc5c8] bg-[#fff5f5] p-3 text-xs leading-5 text-[#9f1722]">{message}</div>}<button type="button" disabled={busy || !symbol || !live} onClick={submit} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#17191a] text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#2a2c2d] disabled:cursor-not-allowed disabled:opacity-45">{busy ? "Sending order…" : `Place ${side === "buy" ? "Buy" : "Sell"} order`}<ArrowRight className="h-4 w-4" /></button></section><section className="rounded-md bg-[#17191a] p-5 text-white"><div className="flex items-center gap-3"><Gauge className="text-[#f5c842]" /><h2 className="font-black">Risk & execution</h2></div><p className="mt-3 text-xs leading-5 text-white/55">Market orders are submitted only when a live provider quote is available. Execution is confirmed only by the connected broker gateway.</p></section><section className="rounded-md border border-[#dedbd5] bg-white p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-[#e4002e]" /><h2 className="font-black">TradingView analysis</h2></div><p className="mt-3 text-xs leading-5 text-[#777a7b]">TradingView Advanced Charts are integrated into the current Axi Trading Platform experience. Broker execution and account pricing remain separate services.</p><div className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-[#8a8d8e]"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />Charts are for analysis; always verify the executable quote shown by the connected broker.</div></section></aside>
    </div></div>
  </AxiAppShell>;
}

export default function TradingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading trading terminal…</div>}>
      <TradingInner />
    </Suspense>
  );
}
