"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

export default function TradingPage() {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [side, setSide] = useState<"buy"|"sell">("buy");
  const [volume, setVolume] = useState("0.10");
  const [message, setMessage] = useState("");

  const submit = async () => {
    const token=getAuthToken(); if(!token){setMessage("Please sign in again.");return;}
    const res=await fetch("/api/trades/",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({symbol,type:side,volume:Number(volume)})});
    const data=await res.json(); setMessage(data.error||"Order request rejected");
  };

  return <div className="min-h-screen bg-white"><header className="sticky top-0 bg-white border-b border-[#D9D3CB] px-4 py-3"><Link href="/markets/" className="flex items-center gap-2 font-bold"><ArrowLeft size={20}/> Trade</Link></header><main className="max-w-xl mx-auto p-6"><div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 mb-6"><AlertTriangle className="inline w-5 h-5 mr-2"/><strong>Live execution is disabled.</strong><p className="mt-2 text-sm">A broker execution gateway is not configured for this deployment. Orders are not simulated and no order will be represented as filled.</p></div><h1 className="text-2xl font-black mb-5">Order ticket</h1><label className="text-xs font-bold uppercase text-[#6B6560]">Instrument</label><input value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-[#F5F2ED]"/><div className="grid grid-cols-2 gap-3 mb-4"><button onClick={()=>setSide("buy")} className={`py-3 rounded-xl font-bold ${side==="buy"?"bg-[#22A958] text-white":"bg-[#F5F2ED]"}`}>Buy</button><button onClick={()=>setSide("sell")} className={`py-3 rounded-xl font-bold ${side==="sell"?"bg-[#D31C2B] text-white":"bg-[#F5F2ED]"}`}>Sell</button></div><label className="text-xs font-bold uppercase text-[#6B6560]">Volume (lots)</label><input type="number" min="0.01" step="0.01" value={volume} onChange={e=>setVolume(e.target.value)} className="w-full mt-2 mb-5 px-4 py-3 rounded-xl bg-[#F5F2ED]"/>{message&&<p className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{message}</p>}<button onClick={submit} className="w-full py-4 rounded-xl bg-[#1A1A1A] text-white font-bold">Submit order</button></main><LiveChatBot/></div>;
}
