"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, RefreshCw } from "lucide-react";
import { AxiAppShell } from "@/components/AxiAppShell";
import { getAuthToken } from "@/lib/client-auth";
import { formatMoney } from "@/lib/backend";

export default function PositionsPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const token = getAuthToken();
      if (!token) { window.location.assign("/login/"); return; }
      try {
        const response = await fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load positions");
        if (mounted) { setTrades(data.trades || []); setCurrency(data.user?.currency || "USD"); }
      } catch (err) { if (mounted) setError(err instanceof Error ? err.message : "Unable to load positions"); }
      finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  return <AxiAppShell active="Positions">
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#d61f2c]">Positions</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em]">Open positions</h1><p className="mt-2 text-sm text-[#6c6f70]">Review your open positions from the connected trading account.</p></div><button type="button" onClick={() => window.location.reload()} className="rounded-md border border-[#d4d3d0] bg-white p-3" aria-label="Refresh positions"><RefreshCw className="h-4 w-4" /></button></div>
      {error && <div className="mt-6 rounded-md border border-[#efc5c8] bg-[#fff5f5] p-4 text-sm text-[#9f1722]">{error}</div>}
      <div className="mt-7 overflow-hidden rounded-md border border-[#dedbd5] bg-white">{loading ? <div className="p-14 text-center text-sm text-[#777a7b]">Loading positions…</div> : trades.length === 0 ? <div className="p-14 text-center"><BarChart3 className="mx-auto h-9 w-9 text-[#b9bbba]" /><h2 className="mt-4 font-black">No open positions</h2><p className="mt-2 text-sm text-[#777a7b]">Open positions will appear here when trades are actually present in your account.</p><Link href="/markets/" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#17191a] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-white">Explore markets <ArrowRight className="h-4 w-4" /></Link></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#f6f4f0] text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]"><tr><th className="px-5 py-3">Instrument</th><th className="px-5 py-3">Direction</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Open price</th><th className="px-5 py-3">Current P/L</th><th className="px-5 py-3 text-right">Status</th></tr></thead><tbody>{trades.map((trade) => <tr key={trade.id} className="border-t border-[#e5e3df]"><td className="px-5 py-4 font-bold">{trade.symbol}</td><td className="px-5 py-4">{trade.type}</td><td className="px-5 py-4">{trade.volume}</td><td className="px-5 py-4 font-mono">{trade.openPrice == null ? "—" : String(trade.openPrice)}</td><td className="px-5 py-4 font-bold">{formatMoney(Number(trade.profit || 0), currency)}</td><td className="px-5 py-4 text-right"><span className="rounded-full bg-[#f6f4f0] px-2.5 py-1 text-[10px] font-bold uppercase">Open</span></td></tr>)}</tbody></table></div>}</div>
    </div>
  </AxiAppShell>;
}
