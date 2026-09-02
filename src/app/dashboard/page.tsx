"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ArrowDownRight, ArrowUpRight, Shield, Bell, Eye, EyeOff } from "lucide-react";
import { formatMoney } from "@/lib/backend";
import { getAuthToken, removeAuthToken, clearClientAuth } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [executionEnabled, setExecutionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { router.replace("/login/"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/user/portfolio/", { headers }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Session expired"); return d; }),
      fetch("/api/trades/", { headers }).then(r => r.json()),
    ]).then(([portfolio, tradeData]) => {
      setUser(portfolio.user); setTransactions(portfolio.transactions || []); setTrades(portfolio.trades || []); setExecutionEnabled(Boolean(tradeData.executionEnabled));
    }).catch(e => { setError(e.message); if (/session|unauthorized/i.test(e.message)) { clearClientAuth(); removeAuthToken(); router.replace("/login/"); } }).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D31C2B]"/></div>;
  if (!user) return null;
  const balance = Number(user.balance || 0), equity = Number(user.equity ?? balance), freeMargin = Number(user.freeMargin ?? equity - Number(user.margin || 0)), marginLevel = Number(user.marginLevel || 0);
  const logout = () => { clearClientAuth(); removeAuthToken(); router.replace("/login/"); };

  return <div className="min-h-screen bg-[#F5F2ED]"><header className="sticky top-0 z-40 bg-white border-b border-[#D9D3CB]"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><Link href="/" className="text-2xl font-black text-[#D31C2B]">axi</Link><nav className="hidden md:flex gap-6 text-sm font-semibold"><Link href="/dashboard/" className="text-[#D31C2B]">Dashboard</Link><Link href="/markets/">Markets</Link><Link href="/trading/">Trade</Link><Link href="/copy-trading/">Copy</Link></nav><div className="flex items-center gap-3">{user.role === "admin" && <Link href="/admin/" className="px-3 py-2 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold"><Shield className="inline w-3 h-3 mr-1"/>Admin</Link>}<Bell className="w-5 h-5"/><button onClick={logout} className="text-sm font-semibold text-[#6B6560]">Logout</button></div></div></header><main className="max-w-7xl mx-auto px-4 py-8">{error && <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{error}</div>}{!executionEnabled && <div className="mb-5 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm"><strong>Trading execution is unavailable.</strong> No broker execution gateway is configured, so the platform will not claim to have filled trades.</div>}<div className="mb-6"><p className="text-sm text-[#6B6560]">Welcome back</p><h1 className="text-3xl font-black">{user.name}</h1><p className="text-xs text-[#6B6560]">{user.email} · KYC: {user.kycStatus}</p></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">{[["Balance",balance],["Equity",equity],["Free Margin",freeMargin],["Margin Level",marginLevel]].map(([label,value]: any)=><div key={label} className="bg-white rounded-xl p-5 border border-[#D9D3CB]"><div className="flex justify-between"><span className="text-xs font-bold text-[#6B6560] uppercase">{label}</span>{label === "Balance" && <button onClick={()=>setHideBalance(!hideBalance)}>{hideBalance?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>}</div><p className="text-2xl font-black mt-2">{hideBalance?"****":label === "Margin Level"?`${Number(value).toFixed(1)}%`:formatMoney(Number(value),user.currency||"USD")}</p></div>)}</div><div className="flex flex-wrap gap-3 mb-8"><Link href="/deposit/" className="px-5 py-3 rounded-lg bg-[#22A958] text-white text-sm font-bold"><ArrowDownRight className="inline w-4 h-4"/> Deposit</Link><Link href="/withdraw/" className="px-5 py-3 rounded-lg bg-[#D31C2B] text-white text-sm font-bold"><ArrowUpRight className="inline w-4 h-4"/> Withdraw</Link><Link href="/trading/" className="px-5 py-3 rounded-lg bg-[#1A1A1A] text-white text-sm font-bold"><BarChart3 className="inline w-4 h-4"/> Trade</Link></div><section className="bg-white rounded-xl border border-[#D9D3CB] mb-6"><div className="px-5 py-4 border-b border-[#D9D3CB] flex justify-between"><h2 className="font-bold">Open Positions</h2><span className="text-xs text-[#6B6560]">{trades.length}</span></div>{trades.length===0?<div className="p-10 text-center text-sm text-[#6B6560]">No open positions.</div>:trades.map(t=><div key={t.id} className="px-5 py-4 border-t border-[#D9D3CB] flex justify-between"><span className="font-bold">{t.symbol} · {t.type} · {t.volume}</span><span>{formatMoney(Number(t.profit||0),user.currency||"USD")}</span></div>)}</section><section className="bg-white rounded-xl border border-[#D9D3CB]"><div className="px-5 py-4 border-b border-[#D9D3CB]"><h2 className="font-bold">Recent Transactions</h2></div>{transactions.length===0?<div className="p-8 text-center text-sm text-[#6B6560]">No transactions yet.</div>:transactions.map(t=><div key={t.id} className="px-5 py-4 border-t border-[#D9D3CB] flex justify-between"><div><p className="text-sm font-bold">{t.type}</p><p className="text-xs text-[#6B6560]">{t.method} · {new Date(t.createdAt).toLocaleString()}</p></div><div className="text-right"><p className="font-bold">{formatMoney(Number(t.amount),t.currency)}</p><p className="text-xs uppercase">{t.status}</p></div></div>)}</section></main><LiveChatBot/></div>;
}
