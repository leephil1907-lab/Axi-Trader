"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BarChart3, RefreshCw, Search, Star, TrendingUp } from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";

type MarketRecord = Record<string, unknown>;

function recordsFromPayload(value: unknown): MarketRecord[] {
  if (Array.isArray(value)) return value.filter(item => item && typeof item === "object") as MarketRecord[];
  if (value && typeof value === "object") return Object.entries(value as MarketRecord).filter(([, item]) => item && typeof item === "object").map(([key, item]) => ({ symbol: key, ...(item as MarketRecord) }));
  return [];
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return "Data available";
  return String(value);
}

export default function MarketsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/markets/", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Live market data is unavailable.");
      setData(payload);
    } catch (err: any) { setError(err.message || "Live market data is unavailable."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const records = useMemo(() => recordsFromPayload(data?.data), [data]);
  const filtered = records.filter(record => JSON.stringify(record).toLowerCase().includes(query.toLowerCase())).slice(0, 50);

  return <div className="min-h-screen bg-[#f0ede7] text-[#151718]">
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5"><Link href="/dashboard/" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={18}/> Dashboard</Link><div className="flex items-center gap-3"><span className="hidden text-[10px] font-extrabold uppercase tracking-[.16em] text-black/40 sm:inline">Markets</span><button onClick={load} className="rounded-xl border border-black/10 p-2.5 hover:bg-[#f0ede7]" aria-label="Refresh market data"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/></button></div></div></header>
    <main className="mx-auto max-w-[1200px] px-5 py-8">
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#d61f2c]">Market watch</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-.04em]">Global markets</h1><p className="mt-2 text-sm text-black/50">Provider-backed quotes and market information, when available.</p></div><div className="relative w-full sm:w-[260px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search markets" className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-[#d61f2c]"/></div></div>
      {error ? <div className="rounded-[22px] border border-[#d61f2c]/15 bg-white p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-red-50 p-2 text-[#d61f2c]"><AlertTriangle size={19}/></div><div><h2 className="font-bold">Live market data is unavailable</h2><p className="mt-1 text-sm leading-6 text-black/50">{error}</p></div></div></div> : data && records.length > 0 ? <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#151718] px-5 py-4 text-white"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d61f2c]"><TrendingUp size={15}/></span><div><p className="text-xs font-bold">Live provider feed</p><p className="text-[10px] text-white/45">Source: {String(data.source || "connected provider")}</p></div></div><span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-emerald-300">Connected</span></div>
        <div className="overflow-hidden rounded-[22px] border border-black/10 bg-white"><div className="grid grid-cols-[1.2fr_1fr_1fr_40px] border-b border-black/10 px-5 py-4 text-[10px] font-extrabold uppercase tracking-[.13em] text-black/35"><span>Instrument</span><span>Bid</span><span>Ask / value</span><span /></div>{filtered.map((record, index) => { const keys = Object.keys(record); const symbolKey = keys.find(k => /symbol|ticker|instrument|name/i.test(k)) || keys[0]; const valueKeys = keys.filter(k => k !== symbolKey); return <div key={`${String(record[symbolKey])}-${index}`} className="grid grid-cols-[1.2fr_1fr_1fr_40px] items-center border-b border-black/5 px-5 py-4 last:border-0 hover:bg-[#faf9f7]"><div className="flex items-center gap-3"><button type="button" aria-label="Add to watchlist" className="text-black/25 hover:text-[#d61f2c]"><Star size={15}/></button><div><p className="text-sm font-bold">{displayValue(record[symbolKey])}</p><p className="text-[10px] text-black/35">Live instrument</p></div></div><span className="font-mono text-sm">{displayValue(record[valueKeys[0]])}</span><span className="font-mono text-sm">{displayValue(record[valueKeys[1]])}</span><BarChart3 size={16} className="text-black/25"/></div>})}</div>
      </> : !loading ? <div className="rounded-[22px] border border-black/10 bg-white p-10 text-center"><BarChart3 className="mx-auto text-black/20" size={32}/><h2 className="mt-4 font-bold">No market records are available</h2><p className="mt-2 text-sm text-black/45">Connect an authoritative market data provider to populate this workspace.</p></div> : <div className="rounded-[22px] border border-black/10 bg-white p-10 text-center"><RefreshCw className="mx-auto animate-spin text-[#d61f2c]" size={26}/><p className="mt-4 text-sm font-semibold text-black/50">Connecting to market data…</p></div>}
      {data && records.length > 0 && filtered.length === 0 && <p className="mt-5 text-center text-sm text-black/45">No markets match your search.</p>}
    </main><LiveChatBot/>
  </div>;
}
