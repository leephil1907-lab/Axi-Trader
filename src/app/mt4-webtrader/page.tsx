"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Monitor, Play, Pause, BarChart3, TrendingUp, TrendingDown,
  Grid3X3, List, Settings, Plus, Minus, Clock, Volume2, Bell, Download
} from "lucide-react";
import { realMarkets } from "@/lib/data";
import AssetIcon from "@/components/AssetIcon";
import LiveChatBot from "@/components/LiveChatBot";

export default function MT4WebTraderPage() {
  const [activeSymbol, setActiveSymbol] = useState("EUR/USD");
  const [chartTimeframe, setChartTimeframe] = useState("H1");
  const [chartType, setChartType] = useState<"candle" | "line" | "bar">("candle");
  const [isLive, setIsLive] = useState(true);
  const [market, setMarket] = useState(realMarkets.find((m) => m.symbol === activeSymbol) || realMarkets[0]);
  const [watchlist, setWatchlist] = useState(["EUR/USD", "GBP/USD", "USD/JPY", "BTC/USD", "XAU/USD"]);
  const [showIndicators, setShowIndicators] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarket((prev) => {
        const volatility = prev.category === "crypto" ? 0.002 : prev.category === "forex" ? 0.0001 : 0.001;
        const change = (Math.random() - 0.5) * volatility * prev.price;
        return { ...prev, price: Math.max(0, prev.price + change) };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const m = realMarkets.find((m) => m.symbol === activeSymbol);
    if (m) setMarket(m);
  }, [activeSymbol]);

  const isUp = market.changePercent >= 0;
  const chartData = Array.from({ length: 60 }, (_, i) => {
    const base = market.price;
    const volatility = market.category === "crypto" ? base * 0.008 : base * 0.002;
    return base + (Math.random() - 0.5) * volatility * (1 - i / 60);
  });

  const minPrice = Math.min(...chartData);
  const maxPrice = Math.max(...chartData);
  const chartHeight = 300;

  const timeframes = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"];

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Header */}
      <header className="bg-[#2D2D2D] border-b border-[#333] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/" className="p-1.5 rounded hover:bg-[#444] transition-colors">
            <ArrowLeft size={18} className="text-white/60" />
          </Link>
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-[#F5C842]" />
            <span className="text-sm font-bold text-white">MetaTrader 4</span>
            <span className="px-1.5 py-0.5 bg-[#22A958]/20 text-[#22A958] text-[9px] font-bold rounded uppercase">Web</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLive(!isLive)} className={`p-1.5 rounded transition-colors ${isLive ? "bg-[#22A958]/20 text-[#22A958]" : "bg-[#D31C2B]/20 text-[#D31C2B]"}`}>
            {isLive ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button className="p-1.5 rounded hover:bg-[#444] transition-colors text-white/60">
            <Settings size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-[#444] transition-colors text-white/60">
            <Download size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Watchlist Sidebar */}
        <div className="w-full lg:w-64 bg-[#2D2D2D] border-r border-[#333] overflow-y-auto">
          <div className="p-3 border-b border-[#333]">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Market Watch</p>
          </div>
          <div className="space-y-0.5">
            {watchlist.map((sym) => {
              const m = realMarkets.find((m) => m.symbol === sym) || realMarkets[0];
              const up = m.changePercent >= 0;
              return (
                <button
                  key={sym}
                  onClick={() => setActiveSymbol(sym)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${activeSymbol === sym ? "bg-[#D31C2B]/10 border-l-2 border-[#D31C2B]" : "hover:bg-[#333]"}`}
                >
                  <AssetIcon symbol={sym} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{sym}</p>
                    <p className="text-[9px] text-white/40 truncate">{m.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono-axi text-white">{m.price >= 1000 ? m.price.toFixed(2) : m.price.toFixed(4)}</p>
                    <p className={`text-[9px] font-bold ${up ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{up ? "+" : ""}{m.changePercent.toFixed(2)}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col">
          {/* Symbol Info Bar */}
          <div className="px-4 py-2 bg-[#1A1A1A] border-b border-[#333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AssetIcon symbol={market.symbol} size={32} />
              <div>
                <p className="text-sm font-bold text-white">{market.symbol}</p>
                <p className="text-[10px] text-white/40">{market.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-lg font-black font-mono-axi ${isUp ? "text-[#22A958]" : "text-[#D31C2B]"}`}>
                  {market.price >= 1000 ? market.price.toFixed(2) : market.price.toFixed(4)}
                </p>
                <p className={`text-[10px] font-bold ${isUp ? "text-[#22A958]" : "text-[#D31C2B]"}`}>
                  {isUp ? "+" : ""}{market.changePercent.toFixed(2)}% · {isUp ? <TrendingUp size={10} className="inline" /> : <TrendingDown size={10} className="inline" />}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Toolbar */}
          <div className="px-4 py-2 bg-[#1A1A1A] border-b border-[#333] flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chartTimeframe === tf ? "bg-[#D31C2B] text-white" : "text-white/40 hover:text-white hover:bg-[#333]"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-[#333] mx-2" />
            <div className="flex items-center gap-1">
              {(["candle", "line", "bar"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`p-1 rounded transition-colors ${chartType === t ? "bg-[#D31C2B] text-white" : "text-white/40 hover:text-white"}`}
                >
                  {t === "candle" ? <BarChart3 size={14} /> : t === "line" ? <TrendingUp size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-[#333] mx-2" />
            <button onClick={() => setShowIndicators(!showIndicators)} className={`p-1 rounded transition-colors ${showIndicators ? "text-[#F5C842]" : "text-white/40 hover:text-white"}`}>
              <Grid3X3 size={14} />
            </button>
          </div>

          {/* Chart */}
          <div className="flex-1 relative bg-[#1A1A1A] p-4">
            <div className="w-full h-full relative">
              <svg viewBox={`0 0 800 ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Grid */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={i} x1="0" y1={i * (chartHeight / 5)} x2="800" y2={i * (chartHeight / 5)} stroke="#333" strokeWidth="0.5" />
                ))}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <line key={`v${i}`} x1={i * (800 / 7)} y1="0" x2={i * (800 / 7)} y2={chartHeight} stroke="#333" strokeWidth="0.5" />
                ))}
                {/* Price line */}
                <polyline
                  fill="none"
                  stroke={isUp ? "#22A958" : "#D31C2B"}
                  strokeWidth="2"
                  points={chartData.map((p, i) => `${(i / (chartData.length - 1)) * 800},${chartHeight - ((p - minPrice) / (maxPrice - minPrice)) * chartHeight}`).join(" ")}
                />
                {/* Area fill */}
                <polygon
                  fill={isUp ? "rgba(34,169,88,0.08)" : "rgba(211,28,43,0.08)"}
                  points={`0,${chartHeight} ${chartData.map((p, i) => `${(i / (chartData.length - 1)) * 800},${chartHeight - ((p - minPrice) / (maxPrice - minPrice)) * chartHeight}`).join(" ")} 800,${chartHeight}`}
                />
                {/* Current price line */}
                <line
                  x1="0"
                  y1={chartHeight - ((market.price - minPrice) / (maxPrice - minPrice)) * chartHeight}
                  x2="800"
                  y2={chartHeight - ((market.price - minPrice) / (maxPrice - minPrice)) * chartHeight}
                  stroke={isUp ? "#22A958" : "#D31C2B"}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
              </svg>
              {/* Price labels */}
              <div className="absolute right-2 top-2 text-[10px] text-white/40 font-mono-axi">{maxPrice.toFixed(market.price >= 1000 ? 2 : 4)}</div>
              <div className="absolute right-2 bottom-2 text-[10px] text-white/40 font-mono-axi">{minPrice.toFixed(market.price >= 1000 ? 2 : 4)}</div>
            </div>
          </div>

          {/* Order Panel */}
          <div className="px-4 py-3 bg-[#2D2D2D] border-t border-[#333]">
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} className="py-3 rounded-xl bg-[#D31C2B] text-white font-bold text-sm flex items-center justify-center gap-2">
                <TrendingDown size={14} /> SELL
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} className="py-3 rounded-xl bg-[#22A958] text-white font-bold text-sm flex items-center justify-center gap-2">
                <TrendingUp size={14} /> BUY
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <LiveChatBot />
    </div>
  );
}
