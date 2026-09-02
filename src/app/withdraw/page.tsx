"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import { formatMoney } from "@/lib/backend";
import LiveChatBot from "@/components/LiveChatBot";

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { const token = getAuthToken(); if (!token) return; fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(d=>{ if(d.user){setBalance(Number(d.user.balance||0));setCurrency(d.user.currency||"USD");} }); }, []);

  const submit = async () => {
    setError(""); const value=Number(amount), token=getAuthToken();
    if(!token) return setError("Please sign in again.");
    if(!Number.isFinite(value)||value<=0) return setError("Enter a valid amount.");
    if(value>balance) return setError("Withdrawal exceeds your available balance.");
    if(!details.trim()) return setError("Enter the destination details.");
    try { const res=await fetch("/api/user/transactions/",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({type:"withdrawal",amount:value,currency,method})}); const d=await res.json(); if(!res.ok) throw new Error(d.error||"Withdrawal request failed"); setSubmitted(true); } catch(e:any){setError(e.message);}
  };

  if(submitted) return <div className="min-h-screen flex items-center justify-center p-6"><div className="max-w-md text-center"><Check className="mx-auto w-16 h-16 text-[#22A958] mb-5"/><h1 className="text-2xl font-black">Withdrawal request submitted</h1><p className="text-sm text-[#6B6560] mt-2">The request is pending review. No balance is removed by the frontend; the server controls the final transaction.</p><Link href="/dashboard/" className="inline-block mt-6 px-5 py-3 bg-[#1A1A1A] text-white rounded-lg font-bold">Back to Dashboard</Link></div></div>;

  return <div className="min-h-screen bg-white"><header className="sticky top-0 bg-white border-b border-[#D9D3CB] px-4 py-3"><Link href="/dashboard/" className="flex items-center gap-2 font-bold"><ArrowLeft size={20}/> Withdraw Funds</Link></header><main className="max-w-xl mx-auto p-6"><div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6"><AlertTriangle className="inline w-4 h-4 mr-1"/> Withdrawals require server-side review. The client cannot alter your balance.</div><p className="text-sm text-[#6B6560]">Available balance</p><p className="text-3xl font-black mb-6">{formatMoney(balance,currency)}</p><label className="text-xs font-bold uppercase text-[#6B6560]">Method</label><select value={method} onChange={e=>setMethod(e.target.value)} className="w-full mt-2 mb-4 px-4 py-3 rounded-xl border"><option value="bank">Bank Transfer</option><option value="crypto">Crypto Wallet</option><option value="card">Card</option><option value="skrill">Skrill</option></select><label className="text-xs font-bold uppercase text-[#6B6560]">Amount</label><input type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-[#F5F2ED]" placeholder="0.00"/><label className="text-xs font-bold uppercase text-[#6B6560]">Destination details</label><textarea value={details} onChange={e=>setDetails(e.target.value)} className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-[#F5F2ED] min-h-28" placeholder="Bank account, wallet address, or payment details"/>{error&&<p className="text-sm text-red-600 mb-4">{error}</p>}<button onClick={submit} className="w-full py-4 rounded-xl bg-[#D31C2B] text-white font-bold">Submit Withdrawal Request</button></main><LiveChatBot/></div>;
}
