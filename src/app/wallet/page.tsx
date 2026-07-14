"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown,
  Clock, Check, X, Bitcoin, CreditCard, Landmark, Copy, Eye, EyeOff
} from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";

const transactions = [
  { id: "t1", type: "deposit", amount: 5000, currency: "EUR", method: "Bank Transfer", status: "completed", date: "2025-07-14 14:32", txId: "TXN-20250714-001" },
  { id: "t2", type: "withdrawal", amount: 1200, currency: "EUR", method: "Crypto Wallet", status: "pending", date: "2025-07-13 09:15", txId: "TXN-20250713-002" },
  { id: "t3", type: "deposit", amount: 2500, currency: "EUR", method: "Credit Card", status: "completed", date: "2025-07-10 16:45", txId: "TXN-20250710-003" },
  { id: "t4", type: "withdrawal", amount: 800, currency: "EUR", method: "Skrill", status: "completed", date: "2025-07-08 11:20", txId: "TXN-20250708-004" },
  { id: "t5", type: "deposit", amount: 10000, currency: "EUR", method: "Bank Transfer", status: "completed", date: "2025-07-01 08:00", txId: "TXN-20250701-005" },
  { id: "t6", type: "withdrawal", amount: 3000, currency: "EUR", method: "Bank Transfer", status: "rejected", date: "2025-06-28 15:30", txId: "TXN-20250628-006" },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"all" | "deposit" | "withdrawal">("all");
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const filtered = transactions.filter((t) => activeTab === "all" || t.type === activeTab);

  const totalDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalDeposits - totalWithdrawals;

  const tx = transactions.find((t) => t.id === selectedTx);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => selectedTx ? setSelectedTx(null) : window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">{selectedTx ? "Transaction Details" : "Wallet"}</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {!selectedTx && (
            <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Balance Card */}
              <div className="p-6 bg-[#1A1A1A] rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Total Balance</p>
                  <button onClick={() => setHideBalance(!hideBalance)} className="text-white/40 hover:text-white transition-colors">
                    {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-3xl font-black text-white font-mono-abi">{hideBalance ? "••••••" : `€${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase">Total Deposits</p>
                    <p className="text-sm font-bold text-[#22A958]">+€{totalDeposits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase">Total Withdrawals</p>
                    <p className="text-sm font-bold text-[#D31C2B]">-€{totalWithdrawals.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Link href="/deposit/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm flex items-center justify-center gap-2"><ArrowUpRight size={16} /> Deposit</motion.button></Link>
                <Link href="/withdraw/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl border-2 border-[#D31C2B] text-[#D31C2B] font-bold text-sm flex items-center justify-center gap-2"><ArrowDownRight size={16} /> Withdraw</motion.button></Link>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4">
                {(["all", "deposit", "withdrawal"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${activeTab === tab ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}>
                    {tab === "all" ? "All" : tab}
                  </button>
                ))}
              </div>

              {/* Transaction List */}
              <div className="space-y-2">
                {filtered.map((t) => (
                  <motion.button key={t.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedTx(t.id)} className="w-full p-4 bg-[#F5F2ED] rounded-xl text-left flex items-center gap-3 hover:shadow-sm transition-shadow">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "deposit" ? "bg-[#22A958]/10" : "bg-[#D31C2B]/10"}`}>
                      {t.type === "deposit" ? <ArrowUpRight size={18} className="text-[#22A958]" /> : <ArrowDownRight size={18} className="text-[#D31C2B]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1A1A1A] capitalize">{t.type}</p>
                      <p className="text-[10px] text-[#9B9590]">{t.method} · {t.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${t.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{t.type === "deposit" ? "+" : "-"}€{t.amount.toLocaleString()}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${t.status === "completed" ? "bg-[#22A958]/10 text-[#22A958]" : t.status === "pending" ? "bg-[#F5C842]/10 text-[#F5C842]" : "bg-[#D31C2B]/10 text-[#D31C2B]"}`}>
                        {t.status}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTx && tx && (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="p-6 bg-[#1A1A1A] rounded-2xl mb-6 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${tx.type === "deposit" ? "bg-[#22A958]/10" : "bg-[#D31C2B]/10"}`}>
                  {tx.type === "deposit" ? <ArrowUpRight size={28} className="text-[#22A958]" /> : <ArrowDownRight size={28} className="text-[#D31C2B]" />}
                </div>
                <p className={`text-3xl font-black ${tx.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{tx.type === "deposit" ? "+" : "-"}€{tx.amount.toLocaleString()}</p>
                <p className="text-sm text-white/50 mt-1 capitalize">{tx.type}</p>
                <span className={`inline-block mt-3 px-3 py-1 rounded-lg text-xs font-bold uppercase ${tx.status === "completed" ? "bg-[#22A958]/20 text-[#22A958]" : tx.status === "pending" ? "bg-[#F5C842]/20 text-[#F5C842]" : "bg-[#D31C2B]/20 text-[#D31C2B]"}`}>
                  {tx.status}
                </span>
              </div>

              <div className="p-4 bg-[#F5F2ED] rounded-2xl space-y-3">
                <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Transaction ID</span><span className="font-mono-abi font-bold text-[#1A1A1A]">{tx.txId}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Method</span><span className="font-bold text-[#1A1A1A]">{tx.method}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Currency</span><span className="font-bold text-[#1A1A1A]">{tx.currency}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Date</span><span className="font-bold text-[#1A1A1A]">{tx.date}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Amount</span><span className={`font-bold ${tx.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{tx.type === "deposit" ? "+" : "-"}€{tx.amount.toLocaleString()}</span></div>
              </div>

              <div className="mt-4 p-4 bg-[#F5F2ED] rounded-2xl">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-[#9B9590] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B6560] leading-relaxed">
                    {tx.status === "pending" ? "This transaction is being processed. You will receive a notification once it is completed." : tx.status === "completed" ? "This transaction has been completed successfully." : "This transaction was rejected. Please contact support for more information."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveChatBot />
    </div>
  );
}
