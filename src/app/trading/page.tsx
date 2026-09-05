"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, BarChart3, ShieldCheck } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import { AxiAppShell } from "@/components/AxiAppShell";

export default function TradingPage() {
  const params = useSearchParams();
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [volume, setVolume] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { const requested = params.get("symbol"); if (requested) setSymbol(requested); }, [params]);

  async function submit() {
    setMessage("");
    if (!symbol.trim() || !volume || Number(volume) <= 0) { setMessage("Select an instrument and enter a valid trade size."); return; }
    const token = getAuthToken();
    if (!token) { setMessage("Please sign in before placing an order."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/trades/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ symbol: symbol.trim(), type: side, volume: Number(volume) }) });
      const data = await response.json();
      setMessage(data.error || "The order service did not return an execution confirmation.");
    } catch { setMessage("The trading service could not be reached."); }
    finally { setBusy(false); }
  }

  return <AxiAppShell active="">
    <section className="bg-[#d61f2c] text-white"><div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/65">Trading</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em]">Trade from the market factsheet</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Choose an instrument, select Buy or Sell, enter your trade size and review the order before sending it to the execution service.</p></div></section>
    <div className="mx-auto grid max-w-[1400px] gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-10">
      <section className="rounded-md border border-[#dedbd5] bg-white p-6 sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#d61f2c]">Order ticket</p><h2 className="mt-2 text-2xl font-black">Open position</h2></div><div className="grid h-10 w-10 place-items-center rounded-md bg-[#17191a] text-white"><BarChart3 className="h-5 w-5" /></div></div>
        <div className="mt-7"><label htmlFor="instrument" className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#777a7b]">Instrument</label><input id="instrument" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="Search or enter instrument" className="mt-2 h-12 w-full rounded-md border border-[#cfd0ce] bg-white px-4 text-sm outline-none focus:border-[#d61f2c]" /></div>
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-md bg-[#f0ede7] p-1"><button type="button" onClick={() => setSide("buy")} className={`rounded py-3 text-xs font-extrabold uppercase tracking-wider ${side === "buy" ? "bg-white text-[#d61f2c] shadow-sm" : "text-[#777a7b]"}`}>Buy / Long</button><button type="button" onClick={() => setSide("sell")} className={`rounded py-3 text-xs font-extrabold uppercase tracking-wider ${side === "sell" ? "bg-white text-[#d61f2c] shadow-sm" : "text-[#777a7b]"}`}>Sell / Short</button></div>
        <div className="mt-5"><label htmlFor="volume" className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#777a7b]">Trade size</label><input id="volume" type="number" min="0" step="any" value={volume} onChange={(event) => setVolume(event.target.value)} placeholder="Enter trade size" className="mt-2 h-12 w-full rounded-md border border-[#cfd0ce] bg-white px-4 text-sm outline-none focus:border-[#d61f2c]" /></div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[#e5e3df] py-5 text-xs"><div><span className="block text-[10px] font-bold uppercase text-[#888b8c]">Order</span><strong className="mt-1 block">Market</strong></div><div><span className="block text-[10px] font-bold uppercase text-[#888b8c]">Direction</span><strong className="mt-1 block uppercase">{side}</strong></div><div><span className="block text-[10px] font-bold uppercase text-[#888b8c]">Size</span><strong className="mt-1 block">{volume || "—"}</strong></div></div>
        {message && <div role="alert" className="mt-5 rounded-md border border-[#efc5c8] bg-[#fff5f5] p-4 text-sm text-[#9f1722]">{message}</div>}
        <button type="button" disabled={busy} onClick={submit} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#17191a] text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#2a2c2d] disabled:opacity-50">{busy ? "Sending order…" : `Place ${side === "buy" ? "Buy" : "Sell"} Order`}<ArrowRight className="h-4 w-4" /></button>
      </section>
      <aside className="space-y-4"><div className="rounded-md bg-[#17191a] p-6 text-white"><div className="flex items-center gap-3"><ShieldCheck className="text-[#f5c842]" /><h2 className="font-black">Execution controls</h2></div><p className="mt-4 text-sm leading-6 text-white/55">An order is only considered executed after the configured broker gateway returns an authoritative confirmation.</p></div><div className="rounded-md border border-[#dedbd5] bg-white p-6"><div className="flex items-center gap-3"><AlertTriangle className="text-[#d61f2c]" /><h2 className="font-black">Risk disclosure</h2></div><p className="mt-3 text-xs leading-5 text-[#777a7b]">Leveraged trading can result in losses. Review the applicable product terms, margin requirements and risk disclosures before placing a trade.</p></div></aside>
    </div>
  </AxiAppShell>;
}
