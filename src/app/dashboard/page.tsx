"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Home, Compass, ArrowLeftRight, Monitor, Download, ExternalLink, Copy,
  BarChart3, Clock, Bell, Settings, ChevronRight, Eye, EyeOff, Shield,
  Users, Check, X, Search, Filter, FileText, AlertTriangle
} from "lucide-react";
import { PLATFORMS } from "@/lib/countries";
import { getUser, getBalance, getTrades, getTransactions, isAdmin, getAllUsers, getAllTransactions, adminUpdateTransactionStatus, adminUpdateUserStatus, formatMoney } from "@/lib/backend";
import LiveChatBot from "@/components/LiveChatBot";

export default function DashboardPage() {
  const [user, setUser] = useState(getUser());
  const [balance, setBalance] = useState(getBalance());
  const [trades, setTrades] = useState(getTrades());
  const [transactions, setTransactions] = useState(getTransactions());
  const [activePlatform, setActivePlatform] = useState("mt5");
  const [hideBalance, setHideBalance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<"overview" | "users" | "transactions" | "kyc">("overview");
  const [allUsers, setAllUsers] = useState(getAllUsers());
  const [allTransactions, setAllTransactions] = useState(getAllTransactions());
  const [searchQuery, setSearchQuery] = useState("");

  const isUserAdmin = isAdmin();

  const notifications = [
    { id: "n1", title: "Deposit Confirmed", desc: "€5,000 deposited via Bank Transfer", time: "2h ago", read: false },
    { id: "n2", title: "Price Alert", desc: "BTC/USD reached $64,000", time: "5h ago", read: false },
    { id: "n3", title: "Trade Executed", desc: "EUR/USD Buy 0.5 lots at 1.1388", time: "5h ago", read: true },
  ];

  useEffect(() => {
    setUser(getUser());
    setBalance(getBalance());
    setTrades(getTrades());
    setTransactions(getTransactions());
    if (isAdmin()) {
      setAllUsers(getAllUsers());
      setAllTransactions(getAllTransactions());
    }
  }, []);

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

  // Admin functions
  const handleApproveTx = (txId: string) => {
    adminUpdateTransactionStatus(txId, "approved");
    setAllTransactions(getAllTransactions());
  };

  const handleRejectTx = (txId: string) => {
    adminUpdateTransactionStatus(txId, "rejected");
    setAllTransactions(getAllTransactions());
  };

  const handleSuspendUser = (userId: string) => {
    adminUpdateUserStatus(userId, "suspended");
    setAllUsers(getAllUsers());
  };

  const handleActivateUser = (userId: string) => {
    adminUpdateUserStatus(userId, "active");
    setAllUsers(getAllUsers());
  };

  const filteredUsers = allUsers.filter((u) => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTransactions = allTransactions.filter((t) => t.status === "pending");
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.status === "active").length;
  const totalBalanceAll = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);

  return (
    <div className="min-h-screen bg-axi-cream flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-axi-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-axi-text">Dashboard</h1>
            <p className="text-xs text-axi-text-muted">Account: {user?.id?.slice(-8) || "60332183"} | {user?.accountType ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1) : "Standard"} ({user?.currency || "EUR"})</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Hidden admin toggle - only visible to admin, disguised as settings icon */}
            {isUserAdmin && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)} 
                className={`p-2 rounded-lg transition-colors ${showAdminPanel ? "bg-axi-red text-white" : "hover:bg-axi-cream text-axi-text-muted"}`}
                title="Admin Panel"
              >
                <Shield size={18} />
              </button>
            )}
            <span className="px-2 py-1 bg-axi-success/10 text-axi-success text-[10px] font-bold rounded-lg uppercase">{user?.status === "active" ? "Verified" : "Pending"}</span>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-axi-cream transition-colors">
                <Bell size={18} className="text-axi-text" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-axi-red rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 mt-2 w-80 bg-white border border-axi-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-axi-cream flex items-center justify-between">
                      <h3 className="text-sm font-bold">Notifications</h3>
                      <span className="text-[10px] text-axi-text-muted">{notifications.filter((n) => !n.read).length} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-axi-cream ${n.read ? "" : "bg-axi-cream/50"}`}>
                          <div className="flex items-center gap-2">
                            {!n.read && <span className="w-2 h-2 bg-axi-red rounded-full shrink-0" />}
                            <p className="text-xs font-bold text-axi-text">{n.title}</p>
                          </div>
                          <p className="text-[10px] text-axi-text-muted mt-1">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/settings/">
              <div className="w-9 h-9 rounded-full bg-axi-black flex items-center justify-center text-white text-xs font-black cursor-pointer hover:bg-axi-red transition-colors">
                {user?.name?.split(" ").map((n: string) => n[0]).join("") || "JD"}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ADMIN PANEL - Hidden overlay, only for admin */}
      <AnimatePresence>
        {showAdminPanel && isUserAdmin && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-axi-black border-b border-axi-border overflow-hidden"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-axi-red" />
                  <h2 className="text-white font-bold text-sm">Admin Control Panel</h2>
                  <span className="px-2 py-0.5 bg-axi-red/20 text-axi-red text-[10px] font-bold rounded uppercase">ADMIN</span>
                </div>
                <button onClick={() => setShowAdminPanel(false)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Admin Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {(["overview", "users", "transactions", "kyc"] as const).map((tab) => (
                  <button key={tab} onClick={() => setAdminTab(tab)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${adminTab === tab ? "bg-axi-red text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Admin Content */}
              <div className="space-y-3">
                {adminTab === "overview" && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase">Total Users</p>
                      <p className="text-xl font-black text-white">{totalUsers}</p>
                      <p className="text-[10px] text-axi-success">{activeUsers} active</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase">Total Balance</p>
                      <p className="text-xl font-black text-axi-gold">€{totalBalanceAll.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase">Pending TX</p>
                      <p className="text-xl font-black text-axi-red">{pendingTransactions.length}</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase">KYC Pending</p>
                      <p className="text-xl font-black text-white">0</p>
                    </div>
                  </div>
                )}

                {adminTab === "users" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Search users..." 
                        className="w-full pl-9 pr-3 py-2 bg-white/10 rounded-lg text-xs text-white placeholder:text-white/40 outline-none border border-white/10"
                      />
                    </div>
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-axi-red flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0)}</div>
                          <div>
                            <p className="text-xs text-white font-bold">{u.name}</p>
                            <p className="text-[10px] text-white/40">{u.email} · {u.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${u.status === "active" ? "bg-axi-success/20 text-axi-success" : "bg-axi-red/20 text-axi-red"}`}>{u.status}</span>
                          {u.status === "active" ? (
                            <button onClick={() => handleSuspendUser(u.id)} className="p-1 rounded hover:bg-white/20 text-white/40 hover:text-axi-red transition-colors">
                              <X size={12} />
                            </button>
                          ) : (
                            <button onClick={() => handleActivateUser(u.id)} className="p-1 rounded hover:bg-white/20 text-white/40 hover:text-axi-success transition-colors">
                              <Check size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {adminTab === "transactions" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pendingTransactions.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-4">No pending transactions</p>
                    ) : (
                      pendingTransactions.map((t) => (
                        <div key={t.id} className="p-3 bg-white/10 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${t.type === "deposit" ? "bg-axi-success/20" : "bg-axi-red/20"}`}>
                                {t.type === "deposit" ? <ArrowUpRight size={12} className="text-axi-success" /> : <ArrowDownRight size={12} className="text-axi-red" />}
                              </div>
                              <div>
                                <p className="text-xs text-white font-bold">{t.userId}</p>
                                <p className="text-[10px] text-white/40">{t.type} · {t.method} · €{t.amount}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveTx(t.id)} className="flex-1 py-1.5 bg-axi-success text-white text-[10px] font-bold rounded-lg uppercase">Approve</button>
                            <button onClick={() => handleRejectTx(t.id)} className="flex-1 py-1.5 bg-axi-red text-white text-[10px] font-bold rounded-lg uppercase">Reject</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === "kyc" && (
                  <div className="p-4 bg-white/10 rounded-xl text-center">
                    <FileText size={24} className="mx-auto text-white/40 mb-2" />
                    <p className="text-xs text-white/40">KYC verification system</p>
                    <p className="text-[10px] text-white/30 mt-1">Document review and verification management</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto pb-24">
        {/* Account Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Balance", value: formatMoney(balance), icon: Wallet, color: "#1A1A1A" },
            { label: "Equity", value: formatMoney(equity), icon: TrendingUp, color: "#F5C842" },
            { label: "Margin", value: formatMoney(marginUsed), icon: TrendingDown, color: "#D31C2B" },
            { label: "Free Margin", value: formatMoney(freeMargin), icon: TrendingUp, color: "#22A958" },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-white rounded-2xl border border-axi-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-axi-text-muted font-bold uppercase tracking-wider">{s.label}</p>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <p className="text-lg font-black text-axi-text font-mono-abi">{hideBalance ? "••••••" : s.value}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setHideBalance(!hideBalance)} className="flex items-center gap-1 text-[10px] text-axi-text-muted font-bold">
          {hideBalance ? <Eye size={12} /> : <EyeOff size={12} />} {hideBalance ? "Show Balance" : "Hide Balance"}
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/deposit/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl bg-axi-gold text-axi-black font-bold text-sm flex items-center justify-center gap-2"><ArrowUpRight size={16} /> Deposit</motion.button></Link>
          <Link href="/withdraw/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl border-2 border-axi-red text-axi-red font-bold text-sm flex items-center justify-center gap-2"><ArrowDownRight size={16} /> Withdraw</motion.button></Link>
        </div>

        {/* Platform Selector */}
        <div className="p-5 bg-white rounded-2xl border border-axi-border">
          <h2 className="text-xs font-bold text-axi-text-muted uppercase tracking-wider mb-4">Trading Platforms</h2>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => setActivePlatform(p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${activePlatform === p.id ? "bg-axi-cream border border-axi-red" : "hover:bg-axi-cream border border-transparent"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activePlatform === p.id ? "bg-axi-red" : "bg-axi-border"}`}>
                  <Monitor size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-axi-text">{p.label}</p>
                  <p className="text-[10px] text-axi-text-muted">{p.description}</p>
                </div>
                {activePlatform === p.id && (
                  <Link href={p.id === "mt4" ? "/mt4-webtrader/" : p.id === "mt5" ? "/mt5-webtrader/" : "/trading/"}>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1.5 bg-axi-red text-white text-[10px] font-bold rounded-lg uppercase">Launch</motion.button>
                  </Link>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-axi-text-muted uppercase tracking-wider">Open Positions ({trades.length})</h2>
            <Link href="/trading/" className="text-[10px] text-axi-red font-bold">View All</Link>
          </div>
          {trades.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-axi-border text-center">
              <p className="text-sm text-axi-text-muted">No open positions</p>
              <Link href="/trading/"><motion.button whileTap={{ scale: 0.97 }} className="mt-3 px-4 py-2 bg-axi-red text-white text-xs font-bold rounded-lg">Start Trading</motion.button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              {trades.slice(0, 3).map((t) => (
                <div key={t.id} className="p-4 bg-white rounded-2xl border border-axi-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.type === "buy" ? "bg-axi-success/10 text-axi-success" : "bg-axi-red/10 text-axi-red"}`}>{t.type}</span>
                      <p className="text-sm font-bold text-axi-text">{t.symbol}</p>
                      <p className="text-[10px] text-axi-text-muted">{t.volume} lots</p>
                    </div>
                    <p className={`text-sm font-black font-mono-abi ${t.profit >= 0 ? "text-axi-success" : "text-axi-red"}`}>{t.profit >= 0 ? "+" : ""}€{t.profit.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-axi-text-muted">
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
            <h2 className="text-xs font-bold text-axi-text-muted uppercase tracking-wider">Recent Activity</h2>
            <Link href="/wallet/" className="text-[10px] text-axi-red font-bold">View All</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-axi-border text-center">
              <p className="text-sm text-axi-text-muted">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-axi-border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.type === "deposit" ? "bg-axi-success/10" : "bg-axi-red/10"}`}>
                    {a.type === "deposit" ? <ArrowUpRight size={14} className="text-axi-success" /> : <ArrowDownRight size={14} className="text-axi-red" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-axi-text">{a.desc}</p>
                    <p className="text-[10px] text-axi-text-muted">{a.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${a.type === "deposit" ? "text-axi-success" : "text-axi-red"}`}>{a.type === "deposit" ? "+" : "-"}€{a.amount.toLocaleString()}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${a.status === "completed" ? "bg-axi-success/10 text-axi-success" : a.status === "pending" ? "bg-axi-gold/10 text-axi-gold" : "bg-axi-red/10 text-axi-red"}`}>
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
          <Link href="/markets/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-axi-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Compass size={14} /> Markets</motion.button></Link>
          <Link href="/copy-trading/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-axi-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Copy size={14} /> Copy Trading</motion.button></Link>
          <Link href="/helpcenter/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-axi-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><BarChart3 size={14} /> Help Center</motion.button></Link>
          <Link href="/settings/"><motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 bg-axi-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Settings size={14} /> Settings</motion.button></Link>
        </div>
      </div>

      <LiveChatBot />
    </div>
  );
}
