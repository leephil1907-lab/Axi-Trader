"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw, Search, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AxiAppShell } from "@/components/AxiAppShell";

type MarketRecord = Record<string, unknown>;
function records(value: unknown): MarketRecord[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === "object") as MarketRecord[];
  if (value && typeof value === "object") return Object.entries(value as MarketRecord).filter(([, item]) => item && typeof item === "object").map(([symbol, item]) => ({ symbol, ...(item as MarketRecord) }));
  return [];
}
function label(record: MarketRecord) { return String(record.symbol || record.ticker || record.instrument || record.name || "Instrument"); }
function value(record: MarketRecord, skip: string[]) { const entry = Object.entries(record).find(([key, item]) => !skip.includes(key) && item !== null && item !== undefined && typeof item !== "object"); return entry ? String(entry[1]) : "—"; }

export default function MarketsPage() {
  const [data, setData] = useState<any>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/markets/", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Live market data is unavailable.");
      setData(payload);
    } catch (err) { setError(err instanceof Error ? err.message : "Live market data is unavailable."); }
    finally { setLoading(false); }
  }

  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem("axi-watchlist") || "[]")); } catch { setSaved([]); } void load(); }, []);
  const recordsList = useMemo(() => records(data?.data), [data]);
  const filtered = recordsList.filter((record) => JSON.stringify(record).toLowerCase().includes(query.toLowerCase())).slice(0, 100);
  function toggle(symbol: string) { const next = saved.includes(symbol) ? saved.filter((item) => item !== symbol) : [...saved, symbol]; setSaved(next); localStorage.setItem("axi-watchlist", JSON.stringify(next)); }

  return <AxiAppShell active="Markets">
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#d61f2c]">Markets</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em]">Explore global markets</h1><p className="mt-2 text-sm text-[#6c6f70]">Browse provider-backed instruments across the markets enabled for this platform.</p></div><div className="flex gap-2"><Link href="/watchlist/" className="rounded-md border border-[#d4d3d0] bg-white px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider">Watchlist</Link><button type="button" onClick={() => void load()} className="rounded-md border border-[#d4d3d0] bg-white px-4 py-3 text-[#17191a]" aria-label="Refresh markets"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button></div></div>
      <div className="mt-7 flex items-center gap-3 rounded-md bg-[#17191a] px-5 py-4 text-white"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d61f2c]"><TrendingUp className="h-4 w-4" /></span><div className="flex-1"><p className="text-xs font-bold">Live market feed</p><p className="text-[10px] text-white/45">{data?.source ? `Source: ${String(data.source)}` : "Quotes are shown only when an authoritative provider responds."}</p></div>{data && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">Connected</span>}</div>
      <div className="relative mt-5 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858888]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search instruments" className="h-11 w-full rounded-md border border-[#d4d3d0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#d61f2c]" /></div>
      <div className="mt-5 overflow-hidden rounded-md border border-[#dedbd5] bg-white">
        {error ? <div className="p-12 text-center"><BarChart3 className="mx-auto h-8 w-8 text-[#b9bbba]" /><h2 className="mt-4 font-black">Live market data is unavailable</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#777a7b]">{error}</p><button type="button" onClick={() => void load()} className="mt-5 rounded-md bg-[#17191a] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-white">Try again</button></div> : loading ? <div className="p-12 text-center text-sm text-[#777a7b]">Connecting to live market data…</div> : recordsList.length === 0 ? <div className="p-12 text-center"><BarChart3 className="mx-auto h-8 w-8 text-[#b9bbba]" /><h2 className="mt-4 font-black">No instruments available</h2><p className="mt-2 text-sm text-[#777a7b]">Connect an authoritative market data provider to populate this workspace.</p></div> : <><div className="grid grid-cols-[1.3fr_1fr_1fr_50px] border-b border-[#e5e3df] bg-[#f6f4f0] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]"><span>Instrument</span><span>Bid</span><span>Ask / value</span><span /></div>{filtered.map((record, index) => { const symbol = label(record); return <div key={`${symbol}-${index}`} className="grid grid-cols-[1.3fr_1fr_1fr_50px] items-center border-b border-[#e5e3df] px-5 py-4 last:border-0 hover:bg-[#faf9f7]"><div className="flex items-center gap-3"><button type="button" onClick={() => toggle(symbol)} aria-label={`${saved.includes(symbol) ? "Remove" : "Add"} ${symbol} ${saved.includes(symbol) ? "from" : "to"} watchlist`} className={saved.includes(symbol) ? "text-[#d61f2c]" : "text-[#b9bbba] hover:text-[#d61f2c]"}><Star className={`h-4 w-4 ${saved.includes(symbol) ? "fill-current" : ""}`} /></button><div><p className="text-sm font-bold">{symbol}</p><p className="text-[10px] text-[#777a7b]">Live instrument</p></div></div><span className="font-mono text-sm">{value(record, ["symbol", "ticker", "instrument", "name"])}</span><span className="font-mono text-sm">{value(record, ["symbol", "ticker", "instrument", "name"])}</span><Link href={`/trading/?symbol=${encodeURIComponent(symbol)}`} aria-label={`Open ${symbol} trading ticket`} className="text-[#777a7b] hover:text-[#d61f2c]"><BarChart3 className="h-4 w-4" /></Link></div>})}</>}
      </div>
    </div>
  </AxiAppShell>;
}
