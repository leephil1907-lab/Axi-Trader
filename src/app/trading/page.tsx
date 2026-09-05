"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BarChart3, ShieldCheck } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

export default function TradingPage() {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [volume, setVolume] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMessage("");
    if (!symbol.trim() || !volume || Number(volume) <= 0) {
      setMessage("Select an instrument and enter a valid order volume.");
      return;
    }
    const token = getAuthToken();
    if (!token) { setMessage("Please sign in again."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/trades/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ symbol: symbol.trim(), type: side, volume: Number(volume) }) });
      const data = await res.json();
      setMessage(data.error || "Order request rejected by the trading service.");
    } catch {
      setMessage("The trading service could not be reached.");
    } finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-[#f0ede7] text-[#151718]">
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[1100px] items-center justify-between px-5"><Link href="/dashboard/" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={18}/> Dashboard</Link><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-black/45">Trading workspace</span></div></header>
    <main className="mx-auto grid max-w-[1100px] gap-6 px-5 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[24px] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#d61f2c]">Order ticket</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em]">Place an order</h1><p className="mt-2 text-sm text-black/50">Orders require a connected broker execution service.</p></div><div className="rounded-2xl bg-[#151718] p-3 text-white"><BarChart3 size={22}/></div></div>
        <div className="mt-8"><label className="text-[10px] font-extrabold uppercase tracking-[.14em] text-black/45">Instrument</label><input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Enter a market symbol" className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5f1] px-4 py-4 text-sm outline-none transition focus:border-[#d61f2c] focus:ring-2 focus:ring-[#d61f2c]/10" /></div>
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-[#f0ede7] p-1"><button type="button" onClick={() => setSide("buy")} className={`rounded-lg py-3 text-xs font-extrabold uppercase tracking-[.12em] transition ${side === "buy" ? "bg-white text-[#d61f2c] shadow-sm" : "text-black/45"}`}>Buy</button><button type="button" onClick={() => setSide("sell")} className={`rounded-lg py-3 text-xs font-extrabold uppercase tracking-[.12em] transition ${side === "sell" ? "bg-white text-[#d61f2c] shadow-sm" : "text-black/45"}`}>Sell</button></div>
        <div className="mt-5"><label className="text-[10px] font-extrabold uppercase tracking-[.14em] text-black/45">Volume</label><input type="number" min="0" step="any" value={volume} onChange={e => setVolume(e.target.value)} placeholder="Enter volume" className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f5f1] px-4 py-4 text-sm outline-none transition focus:border-[#d61f2c] focus:ring-2 focus:ring-[#d61f2c]/10" /></div>
        {message && <div className="mt-5 rounded-xl border border-[#d61f2c]/20 bg-red-50 p-4 text-sm text-[#a81723]">{message}</div>}
        <button type="button" disabled={busy} onClick={submit} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#151718] py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white transition hover:bg-[#292b2c] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Submitting…" : "Submit order"}<ArrowRight size={16}/></button>
      </section>
      <aside className="space-y-4"><div className="rounded-[24px] bg-[#151718] p-6 text-white"><div className="flex items-center gap-3"><ShieldCheck className="text-[#f5c842]" size={22}/><h2 className="font-bold">Execution status</h2></div><p className="mt-4 text-sm leading-6 text-white/55">A broker execution gateway is not configured for this deployment. The platform will not claim that an order was filled without an authoritative execution response.</p></div><div className="rounded-[24px] border border-black/10 bg-white p-6"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-black/40">Need market context?</p><h2 className="mt-2 text-xl font-extrabold">Explore live markets</h2><p className="mt-2 text-sm leading-6 text-black/50">Open the market workspace to view provider-backed instruments when a market data source is connected.</p><Link href="/markets/" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.12em] text-[#d61f2c]">View markets <ArrowRight size={15}/></Link></div><div className="rounded-[24px] border border-black/10 bg-white p-6"><div className="flex items-center gap-3"><AlertTriangle className="text-[#d61f2c]" size={20}/><h2 className="font-bold">Risk notice</h2></div><p className="mt-3 text-xs leading-5 text-black/50">Leveraged trading carries significant risk. Review the applicable product terms and risk disclosures before trading.</p></div></aside>
    </main><LiveChatBot/>
  </div>;
}
