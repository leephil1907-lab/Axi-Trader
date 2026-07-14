"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Plus, Home, Compass,
  ArrowLeftRight, Wallet, Bell, Share2, BarChart3, Clock, AlertTriangle
} from "lucide-react";
import { realMarkets } from "@/lib/data";
import AssetIcon from "@/components/AssetIcon";
import LiveChatBot from "@/components/LiveChatBot";

function TradingContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "EUR/USD";
  const [symbol, setSymbol] = useState(initialSymbol);
  const [volume, setVolume] = useState(0.10);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [market, setMarket] = useState(realMarkets.find((m) => m.symbol === symbol) || realMarkets[0]);
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [priceAlert, setPriceAlert] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState("1H");

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
    const m = realMarkets.find((m) => m.symbol === symbol);
    if (m) setMarket(m);
  }, [symbol]);

  const isUp = market.changePercent >= 0;
  const marginRequired = (market.price * volume * 0.001).toFixed(2);
  const pipValue = (market.price >= 1000 ? 0.01 : 0.0001) * volume * 100000;

  const timeframes = ["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W"];

  // Generate chart data points
  const chartData = Array.from({ length: 50 }, (_, i) => {
    const base = market.price;
    const volatility = market.category === "crypto" ? base * 0.005 : base * 0.001;
    return base + (Math.random() - 0.5) * volatility * (1 - i / 50);
  });

  const minPrice = Math.min(...chartData);
  const maxPrice = Math.max(...chartData);
  const chartHeight = 200;

  const handlePlaceOrder = (side: "buy" | "sell") => {
    setOrderSide(side);
    setShowOrderConfirm(true);
    setTimeout(() => setShowOrderConfirm(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/markets/" className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <div className="flex items-center gap-3">
            <AssetIcon symbol={market.symbol} size={36} />
            <div>
              <h1 className="text-base font-bold text-[#1A1A1A]">{market.symbol}</h1>
              <p className="text-xs text-[#9B9590]">{market.name}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setPriceAlert(!priceAlert)} className={`p-2 rounded-lg transition-colors ${priceAlert ? "bg-[#F5C842]/20 text-[#F5C842]" : "hover:bg-[#F5F2ED] text-[#9B9590]"}`}>
              <Bell size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#F5F2ED] text-[#9B9590] transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-4">
        {/* Price Display */}
        <div className="px-4 py-6 text-center border-b border-[#F5F2ED]">
          <motion.div
            key={market.price}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black tabular-nums tracking-tight"
            style={{ color: isUp ? "#22A958" : "#D31C2B" }}
          >
            {market.price >= 1000
              ? market.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : market.price >= 10
              ? market.price.toFixed(2)
              : market.price.toFixed(4)}
          </motion.div>
          <div className={`flex items-center justify-center gap-2 mt-2 text-sm font-bold ${isUp ? "text-[#22A958]" : "text-[#D31C2B]"}`}>
            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {isUp ? "+" : ""}{market.changePercent.toFixed(2)}%
            <span className="text-[#9B9590] font-normal">Today</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[#9B9590]">
            <span>High: <span className="font-bold text-[#1A1A1A]">{market.high.toFixed(market.price >= 1000 ? 2 : 4)}</span></span>
            <span>Low: <span className="font-bold text-[#1A1A1A]">{market.low.toFixed(market.price >= 1000 ? 2 : 4)}</span></span>
            <span>Vol: <span className="font-bold text-[#1A1A1A]">{market.volume}</span></span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="px-4 py-4 border-b border-[#F5F2ED]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chartTimeframe === tf ? "bg-[#1A1A1A] text-white" : "text-[#9B9590] hover:bg-[#F5F2ED]"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#9B9590]">
              <BarChart3 size={12} /> Candlestick
            </div>
          </div>
          {/* SVG Chart */}
          <div className="relative h-[200px] bg-[#F5F2ED] rounded-xl overflow-hidden">
            <svg viewBox={`0 0 400 ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="0" y1={i * (chartHeight / 4)} x2="400" y2={i * (chartHeight / 4)} stroke="#E8E0D4" strokeWidth="0.5" />
              ))}
              {/* Price line */}
              <polyline
                fill="none"
                stroke={isUp ? "#22A958" : "#D31C2B"}
                strokeWidth="2"
                points={chartData.map((p, i) => `${(i / (chartData.length - 1)) * 400},${chartHeight - ((p - minPrice) / (maxPrice - minPrice)) * chartHeight}`).join(" ")}
              />
              {/* Area fill */}
              <polygon
                fill={isUp ? "rgba(34,169,88,0.1)" : "rgba(211,28,43,0.1)"}
                points={`0,${chartHeight} ${chartData.map((p, i) => `${(i / (chartData.length - 1)) * 400},${chartHeight - ((p - minPrice) / (maxPrice - minPrice)) * chartHeight}`).join(" ")} 400,${chartHeight}`}
              />
            </svg>
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-[#1A1A1A]">
              {chartTimeframe}
            </div>
          </div>
        </div>

        {/* Order Type Selector */}
        <div className="px-4 py-3 border-b border-[#F5F2ED]">
          <div className="flex gap-2">
            {(["market", "limit", "stop"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${orderType === type ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Volume */}
        <div className="px-4 py-4 border-b border-[#F5F2ED]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#9B9590] uppercase tracking-wider">Volume (Lots)</span>
            <span className="text-sm font-black font-mono-axi">{volume.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setVolume(Math.max(0.01, volume - 0.01))} className="w-10 h-10 rounded-xl bg-[#F5F2ED] flex items-center justify-center hover:bg-[#D31C2B]/10 transition-colors">
              <Minus size={16} className="text-[#1A1A1A]" />
            </motion.button>
            <input
              type="range"
              min="0.01"
              max="10"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[#D9D3CB] rounded-full appearance-none cursor-pointer accent-[#D31C2B]"
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setVolume(Math.min(10, volume + 0.01))} className="w-10 h-10 rounded-xl bg-[#F5F2ED] flex items-center justify-center hover:bg-[#22A958]/10 transition-colors">
              <Plus size={16} className="text-[#1A1A1A]" />
            </motion.button>
          </div>
          <div className="flex gap-2 mt-2">
            {[0.01, 0.1, 0.5, 1, 2, 5].map((v) => (
              <button key={v} onClick={() => setVolume(v)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${volume === v ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* SL / TP */}
        <div className="px-4 py-4 border-b border-[#F5F2ED] space-y-3">
          <div>
            <label className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-1.5 block">Stop Loss</label>
            <div className="relative">
              <input
                type="number"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                placeholder={`e.g. ${(market.price * 0.99).toFixed(4)}`}
                className="w-full px-4 py-3 bg-[#F5F2ED] rounded-xl text-sm font-bold text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9B9590]">Price</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-1.5 block">Take Profit</label>
            <div className="relative">
              <input
                type="number"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                placeholder={`e.g. ${(market.price * 1.01).toFixed(4)}`}
                className="w-full px-4 py-3 bg-[#F5F2ED] rounded-xl text-sm font-bold text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#22A958]/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9B9590]">Price</span>
            </div>
          </div>
        </div>

        {/* Trade Info */}
        <div className="px-4 py-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Margin Required</span><span className="font-bold font-mono-axi">€{marginRequired}</span></div>
          <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Pip Value</span><span className="font-bold font-mono-axi">€{pipValue.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Leverage</span><span className="font-bold font-mono-axi">{market.leverage}</span></div>
          <div className="flex justify-between text-sm"><span className="text-[#9B9590]">Spread</span><span className="font-bold font-mono-axi">{market.spread} pips</span></div>
        </div>

        {/* Risk Warning */}
        <div className="px-4 py-3 bg-[#F5F2ED] mx-4 rounded-xl mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#F5C842] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#6B6560] leading-relaxed">
              Margin trading is complex and comes with a high risk of losing money rapidly due to leverage.
              <strong> 55.1% of retail client accounts lose money when margin trading.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Order Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-[#D9D3CB] px-4 py-3 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePlaceOrder("sell")}
            className="py-4 rounded-xl bg-[#D31C2B] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <TrendingDown size={16} /> SELL {market.price >= 1000 ? market.price.toFixed(2) : market.price.toFixed(4)}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePlaceOrder("buy")}
            className="py-4 rounded-xl bg-[#22A958] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <TrendingUp size={16} /> BUY {market.price >= 1000 ? (market.price + 0.01).toFixed(2) : (market.price + 0.0001).toFixed(4)}
          </motion.button>
        </div>
      </div>

      {/* Order Confirmation Toast */}
      <AnimatePresence>
        {showOrderConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${orderSide === "buy" ? "bg-[#22A958]" : "bg-[#D31C2B]"}`}>
              {orderSide === "buy" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              <p className="text-sm font-bold">Order Placed Successfully</p>
              <p className="text-xs text-white/60">{orderSide.toUpperCase()} {volume.toFixed(2)} lots of {market.symbol} at market price</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LiveChatBot />
    </div>
  );
}

export default function TradingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D31C2B] border-t-transparent rounded-full animate-spin" /></div>}>
      <TradingContent />
    </Suspense>
  );
}
