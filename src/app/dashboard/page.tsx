"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Home, Compass, ArrowLeftRight, Monitor, Download, ExternalLink, Copy,
  BarChart3, Clock, Bell, Settings, ChevronRight, Eye, EyeOff
} from "lucide-react";
import { PLATFORMS } from "@/lib/countries";
import { getUser, getBalance, getTrades, getTransactions, isLoggedIn } from "@/lib/backend";
import { formatCurrency } from "@/lib/utils";
import LiveChatBot from "@/components/LiveChatBot";

export default function DashboardPage() {
  const [user, setUser] = useState(getUser());
  const [balance, setBalance] = useState(getBalance());
  const [trades, setTrades] = useState(getTrades());
  const [transactions, setTransactions] = useState(getTransactions());
  const [activePlatform, setActivePlatform] = useState("mt5");
  const [hideBalance, setHideBalance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: "n1", title: "Deposit Confirmed", desc: "€5,000 deposited via Bank Transfer", time: "2h ago", read: false },
    { id: "n2", title: "Price Alert", desc: "BTC/USD reached $64,000", time: "5h ago", read: false },
    { id: "n3", title: "Trade Executed", desc: "EUR/USD Buy 0.5 lots at 1.1388", time: "5h ago", read: true },
  ]);

  useEffect(() => {
    // Refresh data on mount
    setUser(getUser());
    setBalance(getBalance());
    setTrades(getTrades());
    setTransactions(getTransactions());
  }, []);

  // Calculate equity, margin, free margin from trades
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const equity = balance + totalProfit;
  const marginUsed = trades.reduce((sum, t) => sum + (t.openPrice * t.volume * 0.001), 0);
  const freeMargin = equity - marginUsed;
  const marginLevel = marginUsed > 0 ? (equity / marginUsed) * 100 : 0;

  const recentActivity = transactions.slice(0, 3).map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    desc: `${t.type === "deposit" ? "Deposit" : "Withdrawal"} via ${t.method}`,
    time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recent",
    status: t.status === "approved" ? "completed" : t.status,
  }));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Dashboard</h1>
            <p className="text-xs text-[#9B9590]">Account: {user?.id?.slice(-8) || "60332183"} | {user?.accountType ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1) : "Standard"} ({user?.currency || "EUR"})</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-[#22A958]/10 text-[#22A958] text-[10px] font-bold rounded-lg uppercase">{user?.status === "active" ? "Verified" : "Pending"}</span>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
                <Bell size={18} className="text-[#1A1A1A]" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#D31C2B] rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 mt-2 w-80 bg-white border border-[#D9D3CB] rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#F5F2ED] flex items-center justify-between">
                      <h3 className="text-sm font-bold">Notifications</h3>
                      <span className="text-[10px] text-[#9B9590]">{notifications.filter((n) => !n.read).length} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-[#F5F2ED] ${n.read ? "" : "bg-[#F5F2ED]/50"}`}>
                          <div className="flex items-center gap-2">
                            {!n.read && <span className="w-2 h-2 bg-[#D31C2B] rounded-full shrink-0" />}
                            <p className="text-xs font-bold text-[#1A1A1A]">{n.title}</p>
                          </div>
                          <p className="text-[10px] text-[#9B9590] mt-1">{n.desc}</p>
                          <p className="text-[10px] text-[#9B9590] mt-0.5">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/settings/">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black cursor-pointer hover:bg-[#D31C2B] transition-colors">
                {user?.name?.split(" ").map((n: string) => n[0]).join("") || "JD"}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto pb-24">
        {/* Account Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Balance", value: formatCurrency(balance), icon: Wallet, color: "#1A1A1A" },
            { label: "Equity", value: formatCurrency(equity), icon: TrendingUp, color: "#F5C842" },
            { label: "Margin", value: formatCurrency(marginUsed), icon: TrendingDown, color: "#D31C2B" },
            { label: "Free Margin", value: formatCurrency(freeMargin), icon: TrendingUp, color: "#22A958" },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-[#F5F2ED] rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[#9B9590] font-bold uppercase tracking-wider">{s.label}</p>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <p className="text-lg font-black text-[#1A1A1A] font-mono-abi">{hideBalance ? "••••••" : s.value}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setHideBalance(!hideBalance)} className="flex items-center gap-1 text-[10px] text-[#9B9590] font-bold">
          {hideBalance ? <Eye size={12} /> : <EyeOff size={12} />} {hideBalance ? "Show Balance" : "Hide Balance"}
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/deposit/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm flex items-center justify-center gap-2"><ArrowUpRight size={16} /> Deposit</motion.button></Link>
          <Link href="/withdraw/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl border-2 border-[#D31C2B] text-[#D31C2B] font-bold text-sm flex items-center justify-center gap-2"><ArrowDownRight size={16} /> Withdraw</motion.button></Link>
        </div>

        {/* Platform Selector */}
        <div className="p-5 bg-[#F5F2ED] rounded-2xl">
          <h2 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-4">Trading Platforms</h2>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => setActivePlatform(p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${activePlatform === p.id ? "bg-white shadow-sm ring-1 ring-[#D31C2B]" : "hover:bg-white/50"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activePlatform === p.id ? "bg-[#D31C2B]" : "bg-[#D9D3CB]"}`}>
                  <Monitor size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1A1A1A]">{p.label}</p>
                  <p className="text-[10px] text-[#9B9590]">{p.description}</p>
                </div>
                {activePlatform === p.id && (
                  <Link href={p.id === "mt4" ? "/mt4-webtrader/" : p.id === "mt5" ? "/mt5-webtrader/" : "/trading/"}>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1.5 bg-[#D31C2B] text-white text-[10px] font-bold rounded-lg uppercase">Launch</motion.button>
                  </Link>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider">Open Positions ({trades.length})</h2>
            <Link href="/trading/" className="text-[10px] text-[#D31C2B] font-bold">View All</Link>
          </div>
          {trades.length === 0 ? (
            <div className="p-6 bg-[#F5F2ED] rounded-2xl text-center">
              <p className="text-sm text-[#9B9590]">No open positions</p>
              <Link href="/trading/"><motion.button whileTap={{ scale: 0.97 }} className="mt-3 px-4 py-2 bg-[#D31C2B] text-white text-xs font-bold rounded-lg">Start Trading</motion.button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              {trades.slice(0, 3).map((t) => (
                <div key={t.id} className="p-4 bg-[#F5F2ED] rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.type === "buy" ? "bg-[#22A958]/10 text-[#22A958]" : "bg-[#D31C2B]/10 text-[#D31C2B]"}`}>{t.type}</span>
                      <p className="text-sm font-bold text-[#1A1A1A]">{t.symbol}</p>
                      <p className="text-[10px] text-[#9B9590]">{t.volume} lots</p>
                    </div>
                    <p className={`text-sm font-black font-mono-abi ${t.profit >= 0 ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{t.profit >= 0 ? "+" : ""}€{t.profit.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#9B9590]">
                    <span>Open: {t.openPrice}</span>
                    <span>Current: {t.currentPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider">Recent Activity</h2>
            <Link href="/wallet/" className="text-[10px] text-[#D31C2B] font-bold">View All</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-4 bg-[#F5F2ED] rounded-2xl text-center">
              <p className="text-sm text-[#9B9590]">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.type === "deposit" ? "bg-[#22A958]/10" : "bg-[#D31C2B]/10"}`}>
                    {a.type === "deposit" ? <ArrowUpRight size={14} className="text-[#22A958]" /> : <ArrowDownRight size={14} className="text-[#D31C2B]" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#1A1A1A]">{a.desc}</p>
                    <p className="text-[10px] text-[#9B9590]">{a.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${a.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{a.type === "deposit" ? "+" : "-"}€{a.amount.toLocaleString()}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${a.status === "completed" ? "bg-[#22A958]/10 text-[#22A958]" : a.status === "pending" ? "bg-[#F5C842]/10 text-[#F5C842]" : "bg-[#D31C2B]/10 text-[#D31C2B]"}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/markets/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Compass size={14} /> Markets</motion.button></Link>
          <Link href="/copy-trading/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Copy size={14} /> Copy Trading</motion.button></Link>
          <Link href="/helpcenter/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><BarChart3 size={14} /> Help Center</motion.button></Link>
          <Link href="/settings/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Settings size={14} /> Settings</motion.button></Link>
        </div>
      </div>

      <LiveChatBot />
    </div>
  );
}
