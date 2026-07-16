"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Home, Compass, ArrowLeftRight, Monitor, Download, ExternalLink, Copy,
  BarChart3, Clock, Bell, Settings, ChevronRight, Eye, EyeOff, Shield,
  Users, Check, X, Search, Filter, FileText, AlertTriangle
} from "lucide-react";
import { PLATFORMS } from "@/lib/countries";
import {
  getUser, setUser, getBalance, setBalance, getTrades, setTrades,
  getTransactions, setTransactions, formatMoney, seedDemoData
} from "@/lib/backend";
import { getAuthToken, removeAuthToken, clearClientAuth } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUserState] = useState<any>(null);
  const [balance, setBalanceState] = useState(0);
  const [trades, setTradesState] = useState<any[]>([]);
  const [transactions, setTransactionsState] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState("mt5");
  const [hideBalance, setHideBalance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<"overview" | "users" | "transactions" | "kyc">("overview");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedDemoData();

    const token = getAuthToken();
    const localUser = getUser();

    if (!token && !localUser) {
      router.push("/login/");
      return;
    }

    // If we have a token, verify with API
    if (token) {
      fetch("/api/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUserState(data.user);
            setUser(data.user);
          } else {
            // Token invalid, fallback to localStorage
            setUserState(localUser);
          }
          setLoading(false);
        })
        .catch(() => {
          setUserState(localUser);
          setLoading(false);
        });
    } else {
      setUserState(localUser);
      setLoading(false);
    }

    setBalanceState(getBalance());
    setTradesState(getTrades());
    setTransactionsState(getTransactions());
  }, [router]);

  // Admin data fetch
  useEffect(() => {
    if (!showAdminPanel || !user?.role === "admin") return;
    const token = getAuthToken();
    if (!token) return;

    setAdminLoading(true);
    if (adminTab === "users") {
      fetch("/api/admin/users/", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setAllUsers(d.users || []))
        .finally(() => setAdminLoading(false));
    } else if (adminTab === "transactions") {
      fetch("/api/admin/transactions/", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setAllTransactions(d.transactions || []))
        .finally(() => setAdminLoading(false));
    } else {
      setAdminLoading(false);
    }
  }, [showAdminPanel, adminTab, user]);

  function handleLogout() {
    clearClientAuth();
    removeAuthToken();
    router.push("/login/");
  }

  function isAdmin(): boolean {
    return user?.role === "admin" || user?.email === "admin@axi.com";
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D31C2B]"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login/");
    return null;
  }

  const equity = user?.equity || balance + trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const freeMargin = user?.freeMargin || equity - (user?.margin || 0);
  const marginLevel = user?.marginLevel || (user?.margin > 0 ? (equity / user.margin) * 100 : 0);

  return (
    <div className="min-h-screen bg-[#F5F2ED]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D3CB] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black text-[#D31C2B] tracking-tight">axi</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard/" className="text-sm font-semibold text-[#D31C2B]">Dashboard</Link>
              <Link href="/markets/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B]">Markets</Link>
              <Link href="/trading/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B]">Trade</Link>
              <Link href="/copy-trading/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B]">Copy</Link>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin() && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-lg hover:bg-[#2D2D2D]"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </button>
              )}
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-[#F5F2ED] rounded-lg">
                <Bell className="w-5 h-5 text-[#1A1A1A]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D31C2B] rounded-full"></span>
              </button>
              <button onClick={handleLogout} className="text-sm font-semibold text-[#6B6560] hover:text-[#D31C2B]">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-[#D9D3CB]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6B6560] uppercase">Balance</span>
              <button onClick={() => setHideBalance(!hideBalance)} className="text-[#9B9590]">
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-2xl font-black text-[#1A1A1A]">
              {hideBalance ? "****" : formatMoney(balance, user?.currency || "USD")}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#D9D3CB]">
            <span className="text-xs font-semibold text-[#6B6560] uppercase block mb-2">Equity</span>
            <div className="text-2xl font-black text-[#1A1A1A]">{hideBalance ? "****" : formatMoney(equity, user?.currency || "USD")}</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#D9D3CB]">
            <span className="text-xs font-semibold text-[#6B6560] uppercase block mb-2">Free Margin</span>
            <div className="text-2xl font-black text-[#1A1A1A]">{hideBalance ? "****" : formatMoney(freeMargin, user?.currency || "USD")}</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#D9D3CB]">
            <span className="text-xs font-semibold text-[#6B6560] uppercase block mb-2">Margin Level</span>
            <div className={`text-2xl font-black ${marginLevel < 100 ? "text-[#D31C2B]" : "text-[#22A958]"}`}>
              {marginLevel.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Platform Selector + Quick Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex bg-white rounded-lg border border-[#D9D3CB] p-1">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activePlatform === p.id
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#6B6560] hover:text-[#1A1A1A]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Link href="/deposit/" className="flex items-center gap-2 px-4 py-2.5 bg-[#22A958] text-white text-sm font-bold rounded-lg hover:bg-[#1E8A4A]">
              <ArrowDownRight className="w-4 h-4" /> Deposit
            </Link>
            <Link href="/withdraw/" className="flex items-center gap-2 px-4 py-2.5 bg-[#D31C2B] text-white text-sm font-bold rounded-lg hover:bg-[#B91623]">
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </Link>
            <Link href="/trading/" className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-sm font-bold rounded-lg hover:bg-[#2D2D2D]">
              <BarChart3 className="w-4 h-4" /> Trade
            </Link>
          </div>
        </div>

        {/* Open Trades */}
        <div className="bg-white rounded-xl border border-[#D9D3CB] mb-8">
          <div className="px-6 py-4 border-b border-[#D9D3CB] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Open Positions</h2>
            <span className="text-sm text-[#6B6560]">{trades.length} active</span>
          </div>
          <div className="overflow-x-auto">
            {trades.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B6560]">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[#D9D3CB]" />
                <p className="text-sm">No open positions. Start trading now.</p>
                <Link href="/trading/" className="inline-block mt-3 text-[#D31C2B] font-semibold text-sm hover:underline">
                  Open Trade
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#F5F2ED]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#6B6560]">Symbol</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#6B6560]">Type</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#6B6560]">Volume</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#6B6560]">Open Price</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#6B6560]">Current</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#6B6560]">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-t border-[#D9D3CB]">
                      <td className="px-6 py-3 font-semibold">{trade.symbol}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          trade.type === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">{trade.volume.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right">{trade.openPrice?.toFixed(5) || "—"}</td>
                      <td className="px-6 py-3 text-right">{trade.currentPrice?.toFixed(5) || "—"}</td>
                      <td className={`px-6 py-3 text-right font-bold ${trade.profit >= 0 ? "text-[#22A958]" : "text-[#D31C2B]"}`}>
                        {trade.profit >= 0 ? "+" : ""}{formatMoney(trade.profit, user?.currency || "USD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-[#D9D3CB]">
          <div className="px-6 py-4 border-b border-[#D9D3CB] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Recent Transactions</h2>
            <Link href="/wallet/" className="text-sm text-[#D31C2B] font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#6B6560] text-sm">No transactions yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#F5F2ED]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#6B6560]">Type</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#6B6560]">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#6B6560]">Method</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#6B6560]">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#6B6560]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="border-t border-[#D9D3CB]">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          tx.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"
                        }`}>
                          {tx.type === "deposit" ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold">{formatMoney(tx.amount, tx.currency)}</td>
                      <td className="px-6 py-3 text-[#6B6560]">{tx.method}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          tx.status === "approved" ? "bg-green-100 text-green-700" :
                          tx.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[#6B6560]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {showAdminPanel && isAdmin() && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl border-l border-[#D9D3CB] z-50 overflow-y-auto"
          >
            <div className="p-6 border-b border-[#D9D3CB] flex items-center justify-between">
              <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D31C2B]" /> Admin Panel
              </h2>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 hover:bg-[#F5F2ED] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-[#D9D3CB]">
              {(["overview", "users", "transactions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${
                    adminTab === tab ? "border-[#D31C2B] text-[#D31C2B]" : "border-transparent text-[#6B6560]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {adminLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D31C2B]"></div>
                </div>
              ) : adminTab === "users" ? (
                <div className="space-y-3">
                  {allUsers.length === 0 ? (
                    <p className="text-center text-[#6B6560] py-8">No users found.</p>
                  ) : (
                    allUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-lg">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{u.name || u.email}</p>
                          <p className="text-xs text-[#6B6560]">{u.email} · {u.country || "N/A"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>{u.status}</span>
                          <span className="text-sm font-semibold">{formatMoney(u.balance || 0, u.currency || "USD")}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : adminTab === "transactions" ? (
                <div className="space-y-3">
                  {allTransactions.length === 0 ? (
                    <p className="text-center text-[#6B6560] py-8">No transactions found.</p>
                  ) : (
                    allTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-lg">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{tx.type.toUpperCase()} · {tx.user?.name || tx.user?.email || "Unknown"}</p>
                          <p className="text-xs text-[#6B6560]">{tx.method} · {tx.currency}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{formatMoney(tx.amount, tx.currency)}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            tx.status === "approved" ? "bg-green-100 text-green-700" :
                            tx.status === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>{tx.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F2ED] rounded-xl p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-[#D31C2B]" />
                    <p className="text-3xl font-black">{allUsers.length}</p>
                    <p className="text-sm text-[#6B6560]">Total Users</p>
                  </div>
                  <div className="bg-[#F5F2ED] rounded-xl p-6 text-center">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-[#22A958]" />
                    <p className="text-3xl font-black">{allTransactions.filter((t) => t.status === "approved").length}</p>
                    <p className="text-sm text-[#6B6560]">Approved Transactions</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LiveChatBot />
    </div>
  );
}
