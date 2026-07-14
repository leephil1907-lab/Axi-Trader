"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Bitcoin, CreditCard, Wallet, Landmark, Shield, AlertCircle, Copy, QrCode } from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";

const methods = [
  { id: "crypto", name: "Crypto Wallet", desc: "Up to 15mins, 0% Fee", icon: Bitcoin, color: "#F7931A", bg: "#FFF8F0", supported: ["BTC", "ETH", "USDT", "USDC"] },
  { id: "card", name: "Credit/Debit Card", desc: "Instant, 0% Fee", icon: CreditCard, color: "#1A1A1A", bg: "#F5F2ED", supported: ["Visa", "Mastercard", "Amex"] },
  { id: "skrill", name: "Skrill", desc: "Instant, 0% Fee", icon: Wallet, color: "#862165", bg: "#F3E8F3", supported: ["Skrill Wallet"] },
  { id: "bank", name: "Bank Transfer", desc: "1-3 days, 0% Fee", icon: Landmark, color: "#1A1A1A", bg: "#F5F2ED", supported: ["SEPA", "SWIFT", "Wire"] },
];

const cryptoAddresses: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDT: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDC: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
};

export default function DepositPage() {
  const [step, setStep] = useState<"method" | "details" | "success">("method");
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [cryptoType, setCryptoType] = useState("BTC");
  const [copied, setCopied] = useState(false);

  const method = methods.find((m) => m.id === selected);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoAddresses[cryptoType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => step === "method" ? window.history.back() : setStep("method")} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Deposit Funds</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm font-bold text-[#1A1A1A] mb-4">Select deposit method</p>
              <div className="space-y-3">
                {methods.map((m) => (
                  <motion.button key={m.id} whileTap={{ scale: 0.98 }} onClick={() => { setSelected(m.id); setStep("details"); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:shadow-md" style={{ backgroundColor: m.bg }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm">
                      <m.icon size={24} style={{ color: m.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1A1A1A]">{m.name}</p>
                      <p className="text-xs text-[#9B9590]">{m.desc}</p>
                      <div className="flex gap-1 mt-1">
                        {m.supported.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-white rounded text-[9px] font-bold text-[#9B9590]">{s}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowLeft size={16} className="text-[#D9D3CB] rotate-180" />
                  </motion.button>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[#F5F2ED] rounded-2xl">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-[#22A958] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B6560] leading-relaxed">All deposits are protected by SSL encryption and held in segregated client accounts. Your funds are safe with Axi.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "details" && method && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm font-bold text-[#1A1A1A] mb-4">Enter deposit details</p>

              {method.id === "crypto" && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-2 block">Select Cryptocurrency</label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Object.keys(cryptoAddresses).map((c) => (
                      <button key={c} onClick={() => setCryptoType(c)} className={`py-2 rounded-xl text-xs font-bold transition-colors ${cryptoType === c ? "bg-[#F7931A] text-white" : "bg-[#F5F2ED] text-[#1A1A1A]"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-[#F5F2ED] rounded-2xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#9B9590]">Deposit Address</span>
                      <button onClick={handleCopyAddress} className="flex items-center gap-1 text-xs text-[#D31C2B] font-bold">
                        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                        <QrCode size={32} className="text-[#1A1A1A]" />
                      </div>
                      <p className="text-xs font-mono-axi text-[#1A1A1A] break-all">{cryptoAddresses[cryptoType]}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-2 block">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-[#F5F2ED] rounded-xl text-sm font-bold text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20"
                  />
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-lg text-xs font-bold text-[#1A1A1A] outline-none border border-[#D9D3CB]">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                {["100", "500", "1000", "5000", "10000"].map((a) => (
                  <button key={a} onClick={() => setAmount(a)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${amount === a ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}>
                    {currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"}{a}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-[#F5F2ED] rounded-2xl mb-6 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[#9B9590]">Amount</span><span className="font-bold">{amount ? `${currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"}${amount}` : "—"}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#9B9590]">Fee</span><span className="font-bold text-[#22A958]">€0.00</span></div>
                <div className="border-t border-[#D9D3CB] pt-2 flex justify-between text-sm"><span className="font-bold">Total</span><span className="font-black">{amount ? `${currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"}${amount}` : "—"}</span></div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep("success")} disabled={!amount} className="w-full py-4 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Confirm Deposit
              </motion.button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-[#22A958]/10 flex items-center justify-center mb-6">
                <Check size={40} className="text-[#22A958]" />
              </motion.div>
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-2">Deposit Requested</h2>
              <p className="text-sm text-[#9B9590] mb-2">Your deposit of {currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"}{amount} has been submitted.</p>
              <p className="text-xs text-[#9B9590] mb-8">Transaction ID: <span className="font-mono-axi font-bold">TXN-{Date.now()}</span></p>
              <div className="space-y-3 w-full">
                <Link href="/wallet/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm">View Wallet</motion.button></Link>
                <Link href="/dashboard/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-sm">Back to Dashboard</motion.button></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveChatBot />
    </div>
  );
}
