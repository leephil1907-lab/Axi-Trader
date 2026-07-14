"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ArrowLeftRight, Star, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { realMarkets, categoryFilters } from "@/lib/data";
import AssetIcon from "@/components/AssetIcon";
import LiveChatBot from "@/components/LiveChatBot";

export default function MarketsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("CFDs");
  const [activeCategory, setActiveCategory] = useState("all");
  const [markets, setMarkets] = useState(realMarkets);
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "change" | "spread">("symbol");
  const [watchlist, setWatchlist] = useState<string[]>(["EUR/USD", "BTC/USD", "XAU/USD"]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const volatility = m.category === "crypto" ? 0.002 : m.category === "forex" ? 0.0001 : 0.001;
          const change = (Math.random() - 0.5) * volatility * m.price;
          const newPrice = Math.max(0, m.price + change);
          const newChange = m.change + change;
          const base = m.price - m.change;
          const newChangePercent = base !== 0 ? (newChange / base) * 100 : 0;
          return { ...m, price: newPrice, change: newChange, changePercent: newChangePercent };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]);
  };

  const filtered = markets
    .filter((m) => {
      const matchesSearch = m.symbol.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || activeCategory === "popular" ? true : m.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "change") return b.changePercent - a.changePercent;
      if (sortBy === "spread") return (a.spread || 0) - (b.spread || 0);
      return a.symbol.localeCompare(b.symbol);
    });

  const formatPrice = (price: number, category: string) => {
    if (category === "crypto" && price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 10) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(5);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB]">
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9590]" />
            <input
              type="text"
              placeholder="Search for Instruments"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2ED] rounded-2xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20 placeholder:text-[#9B9590]"
            />
          </div>
        </div>
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["CFDs", "Perpetuals", "Buy Crypto"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === tab ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[{ id: "all", label: "All" }, { id: "popular", label: "Popular" }, ...categoryFilters].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeCategory === cat.id ? "bg-[#D31C2B] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F2ED] rounded-lg text-[10px] font-bold text-[#9B9590] uppercase">
              <Filter size={12} /> Sort
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-[#D9D3CB] rounded-xl shadow-xl z-50 overflow-hidden">
                {(["symbol", "price", "change", "spread"] as const).map((s) => (
                  <button key={s} onClick={() => { setSortBy(s); setShowSortDropdown(false); }} className={`w-full px-3 py-2 text-left text-xs capitalize hover:bg-[#F5F2ED] transition-colors ${sortBy === s ? "text-[#D31C2B] font-bold" : "text-[#1A1A1A]"}`}>
                    {s === "symbol" ? "Name" : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market List */}
      <div className="flex-1 px-4 py-3 space-y-1 overflow-y-auto pb-24">
        <AnimatePresence>
          {filtered.map((m) => {
            const isUp = m.changePercent >= 0;
            const isWatched = watchlist.includes(m.symbol);
            return (
              <motion.div
                key={m.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
              >
                <button onClick={() => toggleWatchlist(m.symbol)} className="shrink-0">
                  <Star size={16} className={isWatched ? "text-[#F5C842] fill-[#F5C842]" : "text-[#D9D3CB]"} />
                </button>
                <Link href={`/trading/?symbol=${encodeURIComponent(m.symbol)}`} className="flex-1 flex items-center gap-3">
                  <AssetIcon symbol={m.symbol} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#1A1A1A]">{m.symbol}</p>
                      <span className="px-1.5 py-0.5 bg-[#F5F2ED] rounded text-[9px] font-bold text-[#9B9590] uppercase">{m.category}</span>
                    </div>
                    <p className="text-[10px] text-[#9B9590] truncate">{m.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <motion.p
                      key={m.price}
                      initial={{ scale: 1.02 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-black font-mono-axi"
                    >
                      {formatPrice(m.price, m.category)}
                    </motion.p>
                    <div className={`flex items-center justify-end gap-1 text-xs font-bold ${isUp ? "text-[#22A958]" : "text-[#D31C2B]"}`}>
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isUp ? "+" : ""}{m.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </Link>
                <Link href={`/trading/?symbol=${encodeURIComponent(m.symbol)}`} className="shrink-0">
                  <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1.5 bg-[#1A1A1A] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Trade
                  </motion.button>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#9B9590] text-sm">No instruments found matching "{search}"</p>
          </div>
        )}
      </div>

      <LiveChatBot />
    </div>
  );
}
