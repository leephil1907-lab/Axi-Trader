"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, TrendingUp, TrendingDown, Check, X, Clock,
  DollarSign, Shield, AlertTriangle, Search, Filter, BarChart3, Wallet
} from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";

const users = [
  { id: "u1", name: "John Doe", email: "john@example.com", status: "active", balance: 12500, equity: 12750, country: "Germany", joined: "2025-01-15" },
  { id: "u2", name: "Sarah Smith", email: "sarah@example.com", status: "active", balance: 8500, equity: 8200, country: "UK", joined: "2025-02-20" },
  { id: "u3", name: "Mike Johnson", email: "mike@example.com", status: "pending", balance: 0, equity: 0, country: "USA", joined: "2025-07-14" },
  { id: "u4", name: "Emma Wilson", email: "emma@example.com", status: "active", balance: 32000, equity: 31500, country: "Australia", joined: "2024-11-10" },
  { id: "u5", name: "David Chen", email: "david@example.com", status: "suspended", balance: 500, equity: 200, country: "Singapore", joined: "2025-03-05" },
];

const transactions = [
  { id: "t1", user: "John Doe", type: "deposit", amount: 5000, method: "Bank Transfer", status: "pending", date: "2025-07-14 14:32" },
  { id: "t2", user: "Sarah Smith", type: "withdrawal", amount: 1200, method: "Crypto", status: "pending", date: "2025-07-13 09:15" },
  { id: "t3", user: "Emma Wilson", type: "deposit", amount: 10000, method: "Card", status: "completed", date: "2025-07-10 16:45" },
  { id: "t4", user: "Mike Johnson", type: "deposit", amount: 500, method: "Skrill", status: "rejected", date: "2025-07-14 10:00" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "transactions">("overview");
  const [search, setSearch] = useState("");
  const [txFilter, setTxFilter] = useState<"all" | "pending" | "completed" | "rejected">("all");

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredTx = transactions.filter((t) => txFilter === "all" || t.status === txFilter);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const pendingTx = transactions.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#1A1A1A] border-b border-[#333] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/" className="p-2 -ml-2 rounded-lg hover:bg-[#333] transition-colors">
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <p className="text-[10px] text-white/40">System Overview & Management</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-1 bg-[#D31C2B]/20 text-[#D31C2B] text-[10px] font-bold rounded uppercase">Admin</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-[#D9D3CB]">
        <div className="flex gap-2">
          {(["overview", "users", "transactions"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${activeTab === tab ? "bg-[#1A1A1A] text-white" : "bg-[#F5F2ED] text-[#9B9590]"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-white rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <Users size={18} className="text-[#D31C2B]" />
                    <span className="text-[10px] text-[#9B9590] font-bold uppercase">Total Users</span>
                  </div>
                  <p className="text-2xl font-black text-[#1A1A1A]">{totalUsers}</p>
                  <p className="text-[10px] text-[#22A958] font-bold">{activeUsers} active</p>
                </div>
                <div className="p-4 bg-white rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <Wallet size={18} className="text-[#F5C842]" />
                    <span className="text-[10px] text-[#9B9590] font-bold uppercase">Total Balance</span>
                  </div>
                  <p className="text-2xl font-black text-[#1A1A1A]">€{totalBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-[#9B9590]">Across all accounts</p>
                </div>
                <div className="p-4 bg-white rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <Clock size={18} className="text-[#F5C842]" />
                    <span className="text-[10px] text-[#9B9590] font-bold uppercase">Pending</span>
                  </div>
                  <p className="text-2xl font-black text-[#1A1A1A]">{pendingTx}</p>
                  <p className="text-[10px] text-[#F5C842] font-bold">Transactions</p>
                </div>
                <div className="p-4 bg-white rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <Shield size={18} className="text-[#22A958]" />
                    <span className="text-[10px] text-[#9B9590] font-bold uppercase">Verified</span>
                  </div>
                  <p className="text-2xl font-black text-[#1A1A1A]">{activeUsers}</p>
                  <p className="text-[10px] text-[#22A958] font-bold">Accounts</p>
                </div>
              </div>

              {/* Recent Activity */}
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.slice(0, 4).map((t) => (
                  <div key={t.id} className="p-3 bg-white rounded-xl flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "deposit" ? "bg-[#22A958]/10" : "bg-[#D31C2B]/10"}`}>
                      {t.type === "deposit" ? <TrendingUp size={14} className="text-[#22A958]" /> : <TrendingDown size={14} className="text-[#D31C2B]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#1A1A1A]">{t.user}</p>
                      <p className="text-[10px] text-[#9B9590]">{t.type} · {t.method} · {t.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${t.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{t.type === "deposit" ? "+" : "-"}€{t.amount.toLocaleString()}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${t.status === "completed" ? "bg-[#22A958]/10 text-[#22A958]" : t.status === "pending" ? "bg-[#F5C842]/10 text-[#F5C842]" : "bg-[#D31C2B]/10 text-[#D31C2B]"}`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9590]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20 placeholder:text-[#9B9590]" />
              </div>
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 bg-white rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black">{u.name.split(" ").map((n) => n[0]).join("")}</div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{u.name}</p>
                          <p className="text-[10px] text-[#9B9590]">{u.email} · {u.country}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${u.status === "active" ? "bg-[#22A958]/10 text-[#22A958]" : u.status === "pending" ? "bg-[#F5C842]/10 text-[#F5C842]" : "bg-[#D31C2B]/10 text-[#D31C2B]"}`}>{u.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-[10px] text-[#9B9590]">Balance</p><p className="text-xs font-bold text-[#1A1A1A]">€{u.balance.toLocaleString()}</p></div>
                      <div><p className="text-[10px] text-[#9B9590]">Equity</p><p className="text-xs font-bold text-[#1A1A1A]">€{u.equity.toLocaleString()}</p></div>
                      <div><p className="text-[10px] text-[#9B9590]">Joined</p><p className="text-xs font-bold text-[#1A1A1A]">{u.joined}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex gap-2 mb-4">
                {(["all", "pending", "completed", "rejected"] as const).map((f) => (
                  <button key={f} onClick={() => setTxFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${txFilter === f ? "bg-[#1A1A1A] text-white" : "bg-white text-[#9B9590]"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredTx.map((t) => (
                  <div key={t.id} className="p-4 bg-white rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "deposit" ? "bg-[#22A958]/10" : "bg-[#D31C2B]/10"}`}>
                          {t.type === "deposit" ? <TrendingUp size={14} className="text-[#22A958]" /> : <TrendingDown size={14} className="text-[#D31C2B]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{t.user}</p>
                          <p className="text-[10px] text-[#9B9590]">{t.type} · {t.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.type === "deposit" ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{t.type === "deposit" ? "+" : "-"}€{t.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#9B9590]">{t.date}</span>
                      <div className="flex gap-2">
                        {t.status === "pending" && (
                          <>
                            <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1 bg-[#22A958] text-white text-[10px] font-bold rounded-lg uppercase flex items-center gap-1"><Check size={10} /> Approve</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1 bg-[#D31C2B] text-white text-[10px] font-bold rounded-lg uppercase flex items-center gap-1"><X size={10} /> Reject</motion.button>
                          </>
                        )}
                        {t.status !== "pending" && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${t.status === "completed" ? "bg-[#22A958]/10 text-[#22A958]" : "bg-[#D31C2B]/10 text-[#D31C2B]"}`}>{t.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveChatBot />
    </div>
  );
}
