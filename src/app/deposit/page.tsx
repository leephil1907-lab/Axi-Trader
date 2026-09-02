"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Bitcoin, Landmark, Wallet, AlertTriangle, Gift } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

const methods = ["card", "crypto", "bank", "skrill"];

export default function DepositPage() {
  const [method, setMethod] = useState("card"), [amount, setAmount] = useState(""), [currency, setCurrency] = useState("USD"), [promoCode, setPromoCode] = useState(""), [promotions, setPromotions] = useState<any[]>([]), [submitted, setSubmitted] = useState(false), [error, setError] = useState("");
  useEffect(() => { fetch("/api/user/promotions/", { headers: { Authorization: `Bearer ${getAuthToken()}` } }).then(r=>r.ok?r.json():null).then(d=>setPromotions(d?.promotions || [])).catch(()=>{}); }, []);

  const submit = async () => {
    setError("");
    const value = Number(amount), token = getAuthToken();
    if (!token) return setError("Please sign in again.");
    if (!Number.isFinite(value) || value <= 0) return setError("Enter a valid amount.");
    try {
      const res = await fetch("/api/user/transactions/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: "deposit", amount: value, currency, method, promoCode: promoCode.trim() || undefined }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Deposit request failed"); setSubmitted(true);
    } catch (e: any) { setError(e.message); }
  };

  if (submitted) return <div className="min-h-screen bg-white flex items-center justify-center p-6"><div className="max-w-md text-center"><Check className="mx-auto w-16 h-16 text-[#22A958] mb-5"/><h1 className="text-2xl font-black">Deposit request submitted</h1><p className="text-sm text-[#6B6560] mt-2">Your request is recorded in the database. If eligible, the activated promotion will be applied only after the deposit is authorized.</p><Link href="/dashboard/" className="inline-block mt-6 px-5 py-3 rounded-lg bg-[#1A1A1A] text-white text-sm font-bold">Back to Dashboard</Link></div></div>;

  return <div className="min-h-screen bg-white"><header className="sticky top-0 bg-white border-b border-[#D9D3CB] px-4 py-3"><Link href="/dashboard/" className="flex items-center gap-2 font-bold"><ArrowLeft size={20}/> Deposit Funds</Link></header><main className="max-w-xl mx-auto p-6"><div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6"><AlertTriangle className="inline w-4 h-4 mr-1"/> Deposits are recorded as pending. The frontend cannot credit your balance or bonus.</div><h1 className="text-2xl font-black mb-5">Fund your account</h1><div className="grid grid-cols-2 gap-3 mb-5">{methods.map(m=><button key={m} onClick={()=>setMethod(m)} className={`p-4 rounded-xl border text-left ${method===m?"border-[#D31C2B] bg-red-50":"border-[#D9D3CB]"}`}>{m==="card"?<CreditCard/>:m==="crypto"?<Bitcoin/>:m==="bank"?<Landmark/>:<Wallet/>}<p className="mt-2 text-sm font-bold capitalize">{m}</p></button>)}</div><label className="text-xs font-bold uppercase text-[#6B6560]">Amount</label><div className="flex gap-2 mt-2 mb-5"><input type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" className="flex-1 px-4 py-3 rounded-xl bg-[#F5F2ED]"/><select value={currency} onChange={e=>setCurrency(e.target.value)} className="px-3 rounded-xl border"><option>USD</option><option>EUR</option><option>GBP</option></select></div>{promotions.length>0&&<div className="p-4 rounded-xl border border-[#D9D3CB] mb-5"><div className="flex items-center gap-2 mb-2"><Gift className="w-4 h-4 text-[#D31C2B]"/><p className="text-sm font-bold">Active eligible promotion</p></div>{promotions.map(p=><p key={p.id} className="text-xs text-[#6B6560]">{p.name}: {p.bonusPercent}% bonus · minimum {p.minDeposit} {p.currency}</p>)}<input value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())} placeholder="Activated promo code (optional)" className="w-full mt-3 px-3 py-2 rounded-lg border text-sm"/></div>}{error&&<p className="text-sm text-red-600 mb-4">{error}</p>}<button onClick={submit} className="w-full py-4 rounded-xl bg-[#22A958] text-white font-bold">Submit Deposit Request</button></main><LiveChatBot/></div>;
}
