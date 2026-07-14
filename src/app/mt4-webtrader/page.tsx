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
    <div className="min-h-screen bg-axi-cream flex flex-col">
      {/* Header - White with red accent */}
      <header className="bg-white border-b border-axi-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/" className="p-1.5 rounded hover:bg-axi-cream transition-colors">
            <ArrowLeft size={18} className="text-axi-text-muted" />
          </Link>
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-axi-red" />
            <span className="text-sm font-bold text-axi-text">MetaTrader 4</span>
            <span className="px-1.5 py-0.5 bg-axi-red/10 text-axi-red text-[9px] font-bold rounded uppercase">Web</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLive(!isLive)} className={`p-1.5 rounded transition-colors ${isLive ? "bg-axi-success/10 text-axi-success" : "bg-axi-red/10 text-axi-red"}`}>
            {isLive ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button className="p-1.5 rounded hover:bg-axi-cream transition-colors text-axi-text-muted">
            <Settings size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-axi-cream transition-colors text-axi-text-muted">
            <Download size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Watchlist Sidebar - White */}
        <div className="w-full lg:w-64 bg-white border-r border-axi-border overflow-y-auto">
          <div className="p-3 border-b border-axi-border">
            <p className="text-[10px] font-bold text-axi-text-muted uppercase tracking-wider">Market Watch</p>
          </div>
          <div className="space-y-0.5">
            {watchlist.map((sym) => {
              const m = realMarkets.find((m) => m.symbol === sym) || realMarkets[0];
              const up = m.changePercent >= 0;
              return (
                <button
                  key={sym}
                  onClick={() => setActiveSymbol(sym)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${activeSymbol === sym ? "bg-axi-red/10 border-l-2 border-axi-red" : "hover:bg-axi-cream"}`}
                >
                  <AssetIcon symbol={sym} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-axi-text">{sym}</p>
                    <p className="text-[9px] text-axi-text-muted truncate">{m.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono-abi text-axi-text">{m.price >= 1000 ? m.price.toFixed(2) : m.price.toFixed(4)}</p>
                    <p className={`text-[9px] font-bold ${up ? "text-axi-success" : "text-axi-red"}`}>{up ? "+" : ""}{m.changePercent.toFixed(2)}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col">
          {/* Symbol Info Bar - White */}
          <div className="px-4 py-2 bg-white border-b border-axi-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AssetIcon symbol={market.symbol} size={32} />
              <div>
                <p className="text-sm font-bold text-axi-text">{market.symbol}</p>
                <p className="text-[10px] text-axi-text-muted">{market.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-lg font-black font-mono-abi ${isUp ? "text-axi-success" : "text-axi-red"}`}>
                  {market.price >= 1000 ? market.price.toFixed(2) : market.price.toFixed(4)}
                </p>
                <p className={`text-[10px] font-bold ${isUp ? "text-axi-success" : "text-axi-red"}`}>
                  {isUp ? "+" : ""}{market.changePercent.toFixed(2)}% · {isUp ? <TrendingUp size={10} className="inline" /> : <TrendingDown size={10} className="inline" />}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Toolbar */}
          <div className="px-4 py-2 bg-white border-b border-axi-border flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chartTimeframe === tf ? "bg-axi-red text-white" : "text-axi-text-muted hover:text-axi-text hover:bg-axi-cream"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-axi-border mx-2" />
            <div className="flex items-center gap-1">
              {(["candle", "line", "bar"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`p-1 rounded transition-colors ${chartType === t ? "bg-axi-red text-white" : "text-axi-text-muted hover:text-axi-text"}`}
                >
                  {t === "candle" ? <BarChart3 size={14} /> : t === "line" ? <TrendingUp size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-axi-border mx-2" />
            <button onClick={() => setShowIndicators(!showIndicators)} className={`p-1 rounded transition-colors ${showIndicators ? "text-axi-gold" : "text-axi-text-muted hover:text-axi-text"}`}>
              <Grid3X3 size={14} />
            </button>
          </div>

          {/* Chart - Cream background */}
          <div className="flex-1 relative bg-axi-cream p-4">
            <div className="w-full h-full relative bg-white rounded-xl border border-axi-border overflow-hidden">
              <svg viewBox={`0 0 800 ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={i} x1="0" y1={i * (chartHeight / 5)} x2="800" y2={i * (chartHeight / 5)} stroke="#E8E0D4" strokeWidth="0.5" />
                ))}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <line key={`v${i}`} x1={i * (800 / 7)} y1="0" x2={i * (800 / 7)} y2={chartHeight} stroke="#E8E0D4" strokeWidth="0.5" />
                ))}
                <polyline
                  fill="none"
                  stroke={isUp ? "#22A958" : "#D31C2B"}
                  strokeWidth="2"
                  points={chartData.map((p, i) => `${(i / (chartData.length - 1)) * 800},${chartHeight - ((p - minPrice) / (maxPrice - minPrice)) * chartHeight}`).join(" ")}
                />
                <polygon
                  fill={isUp ? "rgba(34,169,88,0.08)" : "rgba(211,28,43,0.08)"}
                  points={`0,${chartHeight} ${chartData.map((p, i) => `${(i / (chartData.length - 1)) * 800},${chartHeight - ((p - minPrice) / (maxPrice - minPrice)) * chartHeight}`).join(" ")} 800,${chartHeight}`}
                />
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
              <div className="absolute right-2 top-2 text-[10px] text-axi-text-muted font-mono-abi">{maxPrice.toFixed(market.price >= 1000 ? 2 : 4)}</div>
              <div className="absolute right-2 bottom-2 text-[10px] text-axi-text-muted font-mono-abi">{minPrice.toFixed(market.price >= 1000 ? 2 : 4)}</div>
            </div>
          </div>

          {/* Order Panel */}
          <div className="px-4 py-3 bg-white border-t border-axi-border">
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} className="py-3 rounded-xl bg-axi-red text-white font-bold text-sm flex items-center justify-center gap-2">
                <TrendingDown size={14} /> SELL
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} className="py-3 rounded-xl bg-axi-success text-white font-bold text-sm flex items-center justify-center gap-2">
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
