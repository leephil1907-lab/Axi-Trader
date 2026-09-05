"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import { formatMoney } from "@/lib/backend";
import LiveChatBot from "@/components/LiveChatBot";

type Transaction = { id: string; type: string; amount: number; currency: string; method: string; status: string; createdAt: string; paymentReference?: string | null };
type Portfolio = { user: { balance: number; currency: string }; transactions: Transaction[] };

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"all" | "deposit" | "withdrawal">("all");
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    const token = getAuthToken();
    if (!token) { window.location.href = "/login/?redirect=/wallet/"; return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load wallet");
      setPortfolio(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load wallet"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const transactions = portfolio?.transactions || [];
  const filtered = transactions.filter((t) => activeTab === "all" || t.type === activeTab);
  const tx = transactions.find((t) => t.id === selectedTx);
  const currency = portfolio?.user.currency || "USD";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={() => selectedTx ? setSelectedTx(null) : window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED]"><ArrowLeft size={20}/></button><h1 className="text-lg font-bold">{selectedTx ? "Transaction Details" : "Wallet"}</h1></div>{!selectedTx && <button onClick={() => void load()} className="p-2 rounded-lg hover:bg-[#F5F2ED]" aria-label="Refresh wallet"><RefreshCw size={17}/></button>}</div></header>
      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        {error && <div className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>}
        {loading ? <div className="p-8 text-center text-sm text-[#6B6560]">Loading account records…</div> : !selectedTx ? <>
          <div className="p-6 bg-[#1A1A1A] rounded-2xl mb-6"><div className="flex items-center justify-between mb-2"><p className="text-xs text-white/40 font-bold uppercase tracking-wider">Available Balance</p><button onClick={() => setHideBalance(!hideBalance)} className="text-white/50">{hideBalance ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div><p className="text-3xl font-black text-white">{hideBalance ? "••••••" : formatMoney(Number(portfolio?.user.balance || 0), currency)}</p><p className="mt-2 text-xs text-white/40">Source: authenticated PostgreSQL account record</p></div>
          <div className="grid grid-cols-2 gap-3 mb-6"><Link href="/deposit/"><button className="w-full py-3.5 rounded-xl bg-[#F5C842] font-bold text-sm flex items-center justify-center gap-2"><ArrowUpRight size={16}/>Deposit</button></Link><Link href="/withdraw/"><button className="w-full py-3.5 rounded-xl border-2 border-[#D31C2B] text-[#D31C2B] font-bold text-sm flex items-center justify-center gap-2"><ArrowDownRight size={16}/>Withdraw</button></Link></div>
          <div className="flex gap-2 mb-4">{(["all","deposit","withdrawal"] as const).map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${activeTab === tab ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}>{tab}</button>)}</div>
          {filtered.length === 0 ? <div className="p-6 rounded-2xl bg-[#F5F2ED] text-sm text-[#6B6560]">No account transactions have been recorded.</div> : <div className="space-y-2">{filtered.map(t => <motion.button key={t.id} whileTap={{scale:.98}} onClick={() => setSelectedTx(t.id)} className="w-full p-4 bg-[#F5F2ED] rounded-xl text-left flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "deposit" ? "bg-[#22A958]/10" : "bg-[#D31C2B]/10"}`}>{t.type === "deposit" ? <ArrowUpRight size={18} className="text-[#22A958]"/> : <ArrowDownRight size={18} className="text-[#D31C2B]"/>}</div><div className="flex-1"><p className="text-sm font-bold capitalize">{t.type}</p><p className="text-[10px] text-[#9B9590]">{t.method} · {new Date(t.createdAt).toLocaleString()}</p></div><div className="text-right"><p className={`text-sm font-bold ${t.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{t.type === "deposit" ? "+" : "-"}{formatMoney(Number(t.amount), t.currency)}</p><span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-white">{t.status === "paid" ? "payment received" : t.status}</span></div></motion.button>)}</div>}
        </> : tx ? <div><div className="p-6 bg-[#1A1A1A] rounded-2xl mb-6 text-center"><p className={`text-3xl font-black ${tx.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{tx.type === "deposit" ? "+" : "-"}{formatMoney(Number(tx.amount), tx.currency)}</p><p className="text-sm text-white/50 mt-1 capitalize">{tx.type}</p><span className="inline-block mt-3 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-white/10 text-white">{tx.status === "paid" ? "payment received" : tx.status}</span></div><div className="p-4 bg-[#F5F2ED] rounded-2xl space-y-3"><div className="flex justify-between text-sm"><span className="text-[#9B9590]">Transaction ID</span><span className="font-mono font-bold">{tx.id}</span></div><div className="flex justify-between text-sm"><span className="text-[#9B9590]">Method</span><span className="font-bold">{tx.method}</span></div><div className="flex justify-between text-sm"><span className="text-[#9B9590]">Currency</span><span className="font-bold">{tx.currency}</span></div><div className="flex justify-between text-sm"><span className="text-[#9B9590]">Date</span><span className="font-bold">{new Date(tx.createdAt).toLocaleString()}</span></div></div></div> : <div className="p-6 text-sm text-[#6B6560]">Transaction not found.</div>}
      </div><LiveChatBot />
    </div>
  );
}
