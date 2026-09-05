"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Search, Star } from "lucide-react";
import { AxiAppShell } from "@/components/AxiAppShell";

type RecordValue = Record<string, unknown>;

function records(value: unknown): RecordValue[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === "object") as RecordValue[];
  if (value && typeof value === "object") return Object.entries(value as RecordValue).filter(([, item]) => item && typeof item === "object").map(([symbol, item]) => ({ symbol, ...(item as RecordValue) }));
  return [];
}

export default function WatchlistPage() {
  const [markets, setMarkets] = useState<RecordValue[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("axi-watchlist") || "[]")); } catch { setSaved([]); }
    fetch("/api/markets/", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (response.ok) setMarkets(records(data.data));
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const selected = useMemo(() => markets.filter((item) => {
    const text = JSON.stringify(item).toLowerCase();
    const symbol = String(item.symbol || item.ticker || item.instrument || item.name || "");
    return saved.includes(symbol) && text.includes(query.toLowerCase());
  }), [markets, query, saved]);

  function toggle(symbol: string) {
    const next = saved.includes(symbol) ? saved.filter((value) => value !== symbol) : [...saved, symbol];
    setSaved(next);
    localStorage.setItem("axi-watchlist", JSON.stringify(next));
  }

  return <AxiAppShell active="Watchlist">
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#d61f2c]">Watchlist</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em]">Markets you follow</h1><p className="mt-2 text-sm text-[#6c6f70]">Your selected instruments are stored locally on this device until account-level watchlist storage is connected.</p></div><div className="relative w-full sm:w-[270px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8d8e]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search watchlist" className="h-11 w-full rounded-md border border-[#d4d3d0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#d61f2c]" /></div></div>
      <div className="mt-7 overflow-hidden rounded-md border border-[#dedbd5] bg-white"><div className="grid grid-cols-[1.3fr_1fr_1fr_50px] border-b border-[#e5e3df] bg-[#f6f4f0] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]"><span>Instrument</span><span>Bid</span><span>Ask / value</span><span /></div>{loading ? <div className="p-12 text-center text-sm text-[#777a7b]">Loading market data…</div> : selected.length === 0 ? <div className="p-14 text-center"><Star className="mx-auto h-8 w-8 text-[#c1c2c2]" /><h2 className="mt-4 font-black">Your watchlist is empty</h2><p className="mt-2 text-sm text-[#777a7b]">Add instruments from the Markets page when live provider data is available.</p><Link href="/markets/" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#17191a] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-white">Explore markets <ArrowRight className="h-4 w-4" /></Link></div> : selected.map((record, index) => { const symbol = String(record.symbol || record.ticker || record.instrument || record.name || `Instrument ${index + 1}`); const values = Object.entries(record).filter(([key]) => key !== "symbol" && key !== "ticker" && key !== "instrument" && key !== "name").map(([, value]) => value); return <div key={`${symbol}-${index}`} className="grid grid-cols-[1.3fr_1fr_1fr_50px] items-center border-b border-[#e5e3df] px-5 py-4 last:border-0"><div className="flex items-center gap-3"><button type="button" onClick={() => toggle(symbol)} aria-label={`Remove ${symbol} from watchlist`} className="text-[#d61f2c]"><Star className="h-4 w-4 fill-current" /></button><div><p className="text-sm font-bold">{symbol}</p><p className="text-[10px] text-[#777a7b]">Live instrument</p></div></div><span className="font-mono text-sm">{values[0] == null ? "—" : String(values[0])}</span><span className="font-mono text-sm">{values[1] == null ? "—" : String(values[1])}</span><BarChart3 className="h-4 w-4 text-[#777a7b]" /></div>})}</div>
    </div>
  </AxiAppShell>;
}
