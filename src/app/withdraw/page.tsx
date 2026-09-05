"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import { formatMoney } from "@/lib/backend";
import { BrandMark } from "@/components/BrandMark";
import LiveChatBot from "@/components/LiveChatBot";

type FundingMethod = { id: string; key: string; name: string; type: string; asset?: string | null; logoUrl?: string | null };

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [methods, setMethods] = useState<FundingMethod[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.user) { setBalance(Number(d.user.balance || 0)); setCurrency(d.user.currency || "USD"); } })
      .catch(() => undefined);
    fetch("/api/funding/methods/", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(async r => {
        const d = await r.json();
        if (r.ok && Array.isArray(d.methods)) {
          setMethods(d.methods);
          if (d.methods.length > 0) setMethod(d.methods[0].key);
        }
      })
      .catch(() => undefined)
      .finally(() => setMethodsLoading(false));
  }, []);

  const submit = async () => {
    setError(""); const value = Number(amount), token = getAuthToken();
    if (!token) return setError("Please sign in again.");
    if (!method) return setError("No withdrawal method is available for your account right now.");
    if (!Number.isFinite(value) || value <= 0) return setError("Enter a valid amount.");
    if (value > balance) return setError("Withdrawal exceeds your available balance.");
    if (!details.trim()) return setError("Enter the destination details.");
    try {
      const res = await fetch("/api/user/transactions/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "withdrawal", amount: value, currency, method, details: details.trim().slice(0, 500) })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Withdrawal request failed");
      setSubmitted(true);
    } catch (e: any) { setError(e.message); }
  };

  if (submitted) return <div className="min-h-screen flex items-center justify-center p-6"><div className="max-w-md text-center"><Check className="mx-auto w-16 h-16 text-[#22A958] mb-5" /><h1 className="text-2xl font-black">Withdrawal request submitted</h1><p className="text-sm text-[#6B6560] mt-2">The request is pending review. No balance is removed by the frontend; the server controls the final transaction.</p><Link href="/dashboard/" className="inline-block mt-6 px-5 py-3 bg-[#1A1A1A] text-white rounded-lg font-bold">Back to Dashboard</Link></div></div>;

  return <div className="min-h-screen bg-white"><header className="sticky top-0 bg-white border-b border-[#D9D3CB] px-4 py-3"><Link href="/dashboard/" className="flex items-center gap-2 font-bold"><ArrowLeft size={20} /> Withdraw Funds</Link></header><main className="max-w-xl mx-auto p-6"><div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6"><AlertTriangle className="inline w-4 h-4 mr-1" /> Withdrawals require server-side review. The client cannot alter your balance.</div><p className="text-sm text-[#6B6560]">Available balance</p><p className="text-3xl font-black mb-6">{formatMoney(balance, currency)}</p><label className="text-xs font-bold uppercase text-[#6B6560]">Method</label>{methodsLoading ? <p className="mt-2 mb-4 text-sm text-[#6B6560]">Loading enabled withdrawal methods…</p> : methods.length === 0 ? <div className="mt-2 mb-4 p-4 rounded-xl bg-[#F5F2ED] text-sm text-[#6B6560]">No withdrawal methods are currently enabled for your region and currency. Please contact support or try again later.</div> : <div className="mt-2 mb-4 space-y-2">{methods.map(m => <button type="button" key={m.id} onClick={() => setMethod(m.key)} className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${method === m.key ? "border-[#D31C2B] bg-[#fff5f5] ring-1 ring-[#D31C2B]" : "border-[#e5e1da] hover:border-[#bdb6ad]"}`}><span className="w-10 h-10 rounded-lg bg-[#F5F2ED] grid place-items-center shrink-0 overflow-hidden"><BrandMark method={m} size={30} /></span><span className="flex-1"><b className="text-sm block">{m.name}</b><span className="text-[11px] text-[#9B9590] capitalize">{m.type}</span></span><span className={`w-4 h-4 rounded-full border-2 ${method === m.key ? "border-[#D31C2B] bg-[#D31C2B]" : "border-[#bdb6ad]"}`}/></button>)}</div>}<label className="text-xs font-bold uppercase text-[#6B6560]">Amount</label><input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-[#F5F2ED]" placeholder="0.00" /><label className="text-xs font-bold uppercase text-[#6B6560]">Destination details</label><textarea value={details} onChange={e => setDetails(e.target.value)} className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-[#F5F2ED] min-h-28" placeholder="Bank account, wallet address, or payment details" />{error && <p className="text-sm text-red-600 mb-4">{error}</p>}<button onClick={submit} disabled={!methodsLoading && methods.length === 0} className="w-full py-4 rounded-xl bg-[#D31C2B] text-white font-bold disabled:opacity-50">Submit Withdrawal Request</button></main><LiveChatBot /></div>;
}
