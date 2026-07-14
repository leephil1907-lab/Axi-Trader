"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, TrendingDown, Users, Star, BarChart3, Clock,
  Shield, AlertTriangle, Copy, ChevronDown, Search, Filter, ArrowUpRight
} from "lucide-react";
import { copyTraders } from "@/lib/data";
import LiveChatBot from "@/components/LiveChatBot";

export default function CopyTradingPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"return" | "risk" | "followers">("return");
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [copiedTraders, setCopiedTraders] = useState<string[]>([]);

  const filtered = copyTraders
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.strategy.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "return") return b.totalReturn - a.totalReturn;
      if (sortBy === "risk") return a.riskScore - b.riskScore;
      return b.followers - a.followers;
    });

  const toggleCopy = (id: string) => {
    setCopiedTraders((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const trader = copyTraders.find((t) => t.id === selectedTrader);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => selectedTrader ? setSelectedTrader(null) : window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">{selectedTrader ? "Trader Profile" : "Copy Trading"}</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {!selectedTrader && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Hero */}
              <div className="p-5 bg-[#1A1A1A] rounded-2xl mb-6">
                <h2 className="text-xl font-black text-white mb-2">Copy Top Traders</h2>
                <p className="text-white/50 text-sm mb-4">Automatically replicate the trades of proven professionals. Set your risk limits and let them trade for you.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center"><p className="text-lg font-black text-[#F5C842]">500+</p><p className="text-[10px] text-white/40">Traders</p></div>
                  <div className="text-center"><p className="text-lg font-black text-[#F5C842]">12.4K</p><p className="text-[10px] text-white/40">Copiers</p></div>
                  <div className="text-center"><p className="text-lg font-black text-[#F5C842]">$2.1M</p><p className="text-[10px] text-white/40">Copied</p></div>
                </div>
              </div>

              {/* Search & Sort */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search traders..." className="w-full pl-9 pr-3 py-2.5 bg-[#F5F2ED] rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20 placeholder:text-[#9B9590]" />
                </div>
                <div className="relative">
                  <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-1 px-3 py-2.5 bg-[#F5F2ED] rounded-xl text-xs font-bold text-[#9B9590]">
                    <Filter size={12} /> Sort
                  </button>
                  {showSortDropdown && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-[#D9D3CB] rounded-xl shadow-xl z-50 overflow-hidden">
                      {(["return", "risk", "followers"] as const).map((s) => (
                        <button key={s} onClick={() => { setSortBy(s); setShowSortDropdown(false); }} className={`w-full px-3 py-2 text-left text-xs capitalize hover:bg-[#F5F2ED] ${sortBy === s ? "text-[#D31C2B] font-bold" : "text-[#1A1A1A]"}`}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trader Cards */}
              <div className="space-y-3">
                {filtered.map((t) => (
                  <motion.div key={t.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedTrader(t.id)} className="p-4 bg-[#F5F2ED] rounded-2xl cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-sm font-black">{t.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#1A1A1A]">{t.name}</p>
                          {t.isPro && <span className="px-1.5 py-0.5 bg-[#F5C842] text-[#1A1A1A] text-[9px] font-black rounded uppercase">PRO</span>}
                        </div>
                        <p className="text-[10px] text-[#9B9590]">{t.strategy} · {t.avgTradeDuration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#22A958]">+{t.totalReturn}%</p>
                        <p className="text-[10px] text-[#9B9590]">All time</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="text-center"><p className="text-xs font-bold text-[#1A1A1A]">{t.winRate}%</p><p className="text-[9px] text-[#9B9590]">Win Rate</p></div>
                      <div className="text-center"><p className="text-xs font-bold text-[#1A1A1A]">{t.profitFactor}</p><p className="text-[9px] text-[#9B9590]">Profit Factor</p></div>
                      <div className="text-center"><p className="text-xs font-bold text-[#1A1A1A]">{t.tradesCount}</p><p className="text-[9px] text-[#9B9590]">Trades</p></div>
                      <div className="text-center"><p className="text-xs font-bold text-[#1A1A1A]">{t.followers.toLocaleString()}</p><p className="text-[9px] text-[#9B9590]">Followers</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#D9D3CB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D31C2B] rounded-full" style={{ width: `${(t.riskScore / 10) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-[#9B9590] font-bold">Risk {t.riskScore}/10</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTrader && trader && (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-lg font-black">{trader.avatar}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#1A1A1A]">{trader.name}</h2>
                    {trader.isPro && <span className="px-2 py-0.5 bg-[#F5C842] text-[#1A1A1A] text-[10px] font-black rounded uppercase">PRO TRADER</span>}
                  </div>
                  <p className="text-sm text-[#9B9590]">{trader.strategy} · {trader.avgTradeDuration} avg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-[#F5F2ED] rounded-2xl text-center">
                  <p className="text-2xl font-black text-[#22A958]">+{trader.totalReturn}%</p>
                  <p className="text-[10px] text-[#9B9590] font-bold uppercase">Total Return</p>
                </div>
                <div className="p-4 bg-[#F5F2ED] rounded-2xl text-center">
                  <p className="text-2xl font-black text-[#1A1A1A]">{trader.winRate}%</p>
                  <p className="text-[10px] text-[#9B9590] font-bold uppercase">Win Rate</p>
                </div>
                <div className="p-4 bg-[#F5F2ED] rounded-2xl text-center">
                  <p className="text-2xl font-black text-[#1A1A1A]">{trader.profitFactor}</p>
                  <p className="text-[10px] text-[#9B9590] font-bold uppercase">Profit Factor</p>
                </div>
                <div className="p-4 bg-[#F5F2ED] rounded-2xl text-center">
                  <p className="text-2xl font-black text-[#1A1A1A]">{trader.tradesCount}</p>
                  <p className="text-[10px] text-[#9B9590] font-bold uppercase">Total Trades</p>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="p-4 bg-[#F5F2ED] rounded-2xl mb-6">
                <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Monthly Performance</h3>
                <div className="flex items-end gap-2 h-32">
                  {trader.performance.map((p, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#D31C2B]/10 rounded-t-lg relative overflow-hidden" style={{ height: `${Math.abs(p.return) * 4}px` }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className={`w-full ${p.return >= 0 ? "bg-[#22A958]" : "bg-[#D31C2B]"}`}
                        />
                      </div>
                      <span className="text-[9px] text-[#9B9590] font-bold">{p.month}</span>
                      <span className={`text-[9px] font-bold ${p.return >= 0 ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{p.return >= 0 ? "+" : ""}{p.return}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Info */}
              <div className="p-4 bg-[#F5F2ED] rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#1A1A1A]">Risk Score</span>
                  <span className={`text-sm font-black ${trader.riskScore > 6 ? "text-[#D31C2B]" : trader.riskScore > 3 ? "text-[#F5C842]" : "text-[#22A958]"}`}>{trader.riskScore}/10</span>
                </div>
                <div className="h-2 bg-[#D9D3CB] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#D31C2B] rounded-full transition-all" style={{ width: `${(trader.riskScore / 10) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#9B9590] leading-relaxed">
                  {trader.riskScore > 6 ? "High risk strategy. Suitable for experienced traders with high risk tolerance." : trader.riskScore > 3 ? "Moderate risk strategy. Balanced approach with controlled risk." : "Low risk strategy. Conservative approach suitable for beginners."}
                </p>
              </div>

              <div className="p-4 bg-[#FFF8F0] rounded-2xl mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-[#F5C842] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#6B6560] leading-relaxed">Past performance is not indicative of future results. Copy trading involves risk. You may lose part or all of your investment. Set your risk limits before copying.</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleCopy(trader.id)}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${copiedTraders.includes(trader.id) ? "bg-[#22A958] text-white" : "bg-[#D31C2B] text-white"}`}
              >
                {copiedTraders.includes(trader.id) ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Trader</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveChatBot />
    </div>
  );
}
