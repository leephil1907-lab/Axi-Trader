"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ArrowDownRight, ArrowUpRight, Shield, Bell, Eye, EyeOff, Gift } from "lucide-react";
import { formatMoney } from "@/lib/backend";
import { getAuthToken, removeAuthToken, clearClientAuth } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null), [transactions, setTransactions] = useState<any[]>([]), [trades, setTrades] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]), [bonusLedger, setBonusLedger] = useState<any[]>([]), [executionEnabled, setExecutionEnabled] = useState(false);
  const [loading, setLoading] = useState(true), [hideBalance, setHideBalance] = useState(false), [promoCode, setPromoCode] = useState(""), [promoMessage, setPromoMessage] = useState(""), [promoBusy, setPromoBusy] = useState(false), [error, setError] = useState("");

  const load = async () => {
    const token = getAuthToken();
    if (!token) { router.replace("/login/"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [portfolioRes, tradesRes] = await Promise.all([fetch("/api/user/portfolio/", { headers }), fetch("/api/trades/", { headers })]);
      const portfolio = await portfolioRes.json(), tradeData = await tradesRes.json();
      if (!portfolioRes.ok) throw new Error(portfolio.error || "Session expired");
      setUser(portfolio.user); setTransactions(portfolio.transactions || []); setTrades(portfolio.trades || []); setPromotions(portfolio.promotions || []); setBonusLedger(portfolio.bonusLedger || []); setExecutionEnabled(Boolean(tradeData.executionEnabled));
    } catch (e: any) { setError(e.message); if (/session|unauthorized/i.test(e.message)) { clearClientAuth(); removeAuthToken(); router.replace("/login/"); } }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [router]);

  const activatePromo = async () => {
    setPromoMessage(""); setPromoBusy(true);
    try {
      const res = await fetch("/api/user/promotions/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` }, body: JSON.stringify({ code: promoCode }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Unable to activate promotion");
      setPromoMessage("Promotion activated. Make your qualifying deposit from Funds → Deposit."); setPromoCode(""); await load();
    } catch (e: any) { setPromoMessage(e.message); } finally { setPromoBusy(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D31C2B]"/></div>;
  if (!user) return null;
  const balance = Number(user.balance || 0), equity = Number(user.equity ?? balance), freeMargin = Number(user.freeMargin ?? equity - Number(user.margin || 0)), marginLevel = Number(user.marginLevel || 0);
  const bonusTotal = bonusLedger.filter(b => b.status === "credited").reduce((s, b) => s + Number(b.amount || 0), 0);
  const logout = () => { clearClientAuth(); removeAuthToken(); router.replace("/login/"); };

  return <div className="min-h-screen bg-[#F5F2ED]"><header className="sticky top-0 z-40 bg-white border-b border-[#D9D3CB]"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><Link href="/" className="text-2xl font-black text-[#D31C2B]">axi</Link><nav className="hidden md:flex gap-6 text-sm font-semibold"><Link href="/dashboard/" className="text-[#D31C2B]">Dashboard</Link><Link href="/markets/">Markets</Link><Link href="/trading/">Trade</Link><Link href="/copy-trading/">Copy</Link></nav><div className="flex items-center gap-3">{user.role === "admin" && <Link href="/admin/" className="px-3 py-2 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold"><Shield className="inline w-3 h-3 mr-1"/>Admin</Link>}<Bell className="w-5 h-5"/><button onClick={logout} className="text-sm font-semibold text-[#6B6560]">Logout</button></div></div></header><main className="max-w-7xl mx-auto px-4 py-8">{error && <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{error}</div>}{!executionEnabled && <div className="mb-5 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm"><strong>Trading execution is unavailable.</strong> No broker execution gateway is configured, so the platform will not claim to have filled trades.</div>}<div className="mb-6"><p className="text-sm text-[#6B6560]">Welcome back</p><h1 className="text-3xl font-black">{user.name}</h1><p className="text-xs text-[#6B6560]">{user.email} · KYC: {user.kycStatus}</p></div><div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">{[["Balance",balance],["Equity",equity],["Free Margin",freeMargin],["Margin Level",marginLevel],["Bonus",bonusTotal]].map(([label,value]: any)=><div key={label} className="bg-white rounded-xl p-5 border border-[#D9D3CB]"><div className="flex justify-between"><span className="text-xs font-bold text-[#6B6560] uppercase">{label}</span>{label === "Balance" && <button onClick={()=>setHideBalance(!hideBalance)}>{hideBalance?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>}</div><p className="text-2xl font-black mt-2">{hideBalance && label === "Balance" ? "****" : label === "Margin Level" ? `${Number(value).toFixed(1)}%` : formatMoney(Number(value),user.currency||"USD")}</p></div>)}</div>

<section className="bg-white rounded-xl border border-[#D9D3CB] p-5 mb-6"><div className="flex items-center gap-2 mb-3"><Gift className="w-5 h-5 text-[#D31C2B]"/><h2 className="font-bold">Promotions & deposit bonus</h2></div>{promotions.length > 0 ? promotions.map(p => { const e=p.enrollments?.[0]; return <div key={p.id} className="border-t pt-4 mt-3"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-bold">{p.name} · {p.bonusPercent}% Deposit Bonus</p><p className="text-xs text-[#6B6560]">Minimum deposit: {p.minDeposit} {p.currency}{p.maxBonus ? ` · Maximum bonus: ${p.maxBonus} ${p.currency}` : ""}</p><p className="text-xs text-[#6B6560] mt-1">{p.description}</p></div><span className="text-xs font-bold uppercase">{e?.status === "active" ? "Activated" : "Available"}</span></div>{e?.status !== "active" && <div className="mt-3 flex gap-2"><input value={promoCode} onChange={x=>setPromoCode(x.target.value.toUpperCase())} placeholder="Enter promo code" className="flex-1 px-3 py-2 rounded-lg border"/><button disabled={promoBusy || !promoCode} onClick={activatePromo} className="px-4 py-2 rounded-lg bg-[#D31C2B] text-white text-xs font-bold">{promoBusy?"Activating…":"Activate"}</button></div>}</div> }) : <p className="text-sm text-[#6B6560]">No eligible promotions are currently available for this account.</p>}{promoMessage && <p className="text-xs font-semibold mt-3 text-[#D31C2B]">{promoMessage}</p>}<p className="text-[11px] text-[#6B6560] mt-4">Promotion eligibility, qualifying deposits, bonus limits and expiry are enforced server-side. A bonus is credited only after the qualifying deposit is authorized.</p></section>

<div className="flex flex-wrap gap-3 mb-8"><Link href="/deposit/" className="px-5 py-3 rounded-lg bg-[#22A958] text-white text-sm font-bold"><ArrowDownRight className="inline w-4 h-4"/> Deposit</Link><Link href="/withdraw/" className="px-5 py-3 rounded-lg bg-[#D31C2B] text-white text-sm font-bold"><ArrowUpRight className="inline w-4 h-4"/> Withdraw</Link><Link href="/trading/" className="px-5 py-3 rounded-lg bg-[#1A1A1A] text-white text-sm font-bold"><BarChart3 className="inline w-4 h-4"/> Trade</Link></div><section className="bg-white rounded-xl border border-[#D9D3CB] mb-6"><div className="px-5 py-4 border-b border-[#D9D3CB] flex justify-between"><h2 className="font-bold">Bonus ledger</h2><span className="text-xs text-[#6B6560]">{bonusLedger.length}</span></div>{bonusLedger.length===0?<div className="p-8 text-center text-sm text-[#6B6560]">No bonus credits yet.</div>:bonusLedger.map(b=><div key={b.id} className="px-5 py-4 border-t border-[#D9D3CB] flex justify-between"><div><p className="text-sm font-bold">{b.promotion?.name || "Promotion bonus"}</p><p className="text-xs text-[#6B6560]">{new Date(b.createdAt).toLocaleString()}</p></div><p className="font-bold">+{formatMoney(Number(b.amount),b.currency)}</p></div>)}</section><section className="bg-white rounded-xl border border-[#D9D3CB] mb-6"><div className="px-5 py-4 border-b border-[#D9D3CB] flex justify-between"><h2 className="font-bold">Open Positions</h2><span className="text-xs text-[#6B6560]">{trades.length}</span></div>{trades.length===0?<div className="p-10 text-center text-sm text-[#6B6560]">No open positions.</div>:trades.map(t=><div key={t.id} className="px-5 py-4 border-t border-[#D9D3CB] flex justify-between"><span className="font-bold">{t.symbol} · {t.type} · {t.volume}</span><span>{formatMoney(Number(t.profit||0),user.currency||"USD")}</span></div>)}</section><section className="bg-white rounded-xl border border-[#D9D3CB]"><div className="px-5 py-4 border-b border-[#D9D3CB]"><h2 className="font-bold">Recent Transactions</h2></div>{transactions.length===0?<div className="p-8 text-center text-sm text-[#6B6560]">No transactions yet.</div>:transactions.map(t=><div key={t.id} className="px-5 py-4 border-t border-[#D9D3CB] flex justify-between"><div><p className="text-sm font-bold">{t.type}</p><p className="text-xs text-[#6B6560]">{t.method} · {new Date(t.createdAt).toLocaleString()}</p></div><div className="text-right"><p className="font-bold">{formatMoney(Number(t.amount),t.currency)}</p><p className="text-xs uppercase">{t.status}</p></div></div>)}</section></main><LiveChatBot/></div>;
}
