"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Wallet, Clock, Shield, Check, X, Search, RefreshCw } from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";
import { getAuthToken } from "@/lib/client-auth";

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "users" | "transactions" | "kyc">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const api = async (path: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error("Admin authentication required");
    const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [u, t, k] = await Promise.all([
        api("/api/admin/users/"),
        api("/api/admin/transactions/"),
        api("/api/admin/kyc/"),
      ]);
      setUsers(u.users || []); setTransactions(t.transactions || []); setDocuments(k.documents || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const reviewTransaction = async (id: string, status: "completed" | "rejected") => {
    try { await api("/api/admin/transactions/", { method: "PATCH", body: JSON.stringify({ id, status }) }); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const reviewKyc = async (id: string, status: "approved" | "rejected") => {
    try { await api("/api/admin/kyc/", { method: "PATCH", body: JSON.stringify({ id, status }) }); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const filteredUsers = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  const pendingTx = transactions.filter((t) => t.status === "pending");
  const pendingKyc = documents.filter((d) => d.status === "pending");
  const totalBalance = users.reduce((sum, u) => sum + Number(u.balance || 0), 0);

  return (
    <div className="min-h-screen bg-axi-cream flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-axi-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/" className="p-2 -ml-2 rounded-lg hover:bg-axi-cream"><ArrowLeft size={20} /></Link>
          <div><h1 className="text-lg font-bold text-axi-text">Admin Dashboard</h1><p className="text-[10px] text-axi-text-muted">Live database management</p></div>
          <button onClick={load} className="ml-auto p-2 rounded-lg hover:bg-axi-cream" aria-label="Refresh"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
          <span className="px-2 py-1 bg-axi-red/10 text-axi-red text-[10px] font-bold rounded">ADMIN</span>
        </div>
      </header>

      <div className="px-4 py-3 bg-white border-b border-axi-border overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {(["overview", "users", "transactions", "kyc"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${tab === t ? "bg-axi-red text-white" : "bg-axi-cream text-axi-text-muted"}`}>{t}</button>)}
        </div>
      </div>

      <main className="flex-1 px-4 py-5 pb-24">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{error}</div>}

        {tab === "overview" && <div className="grid grid-cols-2 gap-3">
          {[
            [Users, "Users", users.length], [Wallet, "Balance", `$${totalBalance.toLocaleString()}`],
            [Clock, "Pending Tx", pendingTx.length], [Shield, "Pending KYC", pendingKyc.length],
          ].map(([Icon, label, value]: any) => <div key={label} className="p-4 bg-white rounded-2xl border border-axi-border"><Icon size={18} className="text-axi-red mb-2"/><p className="text-[10px] text-axi-text-muted uppercase font-bold">{label}</p><p className="text-2xl font-black text-axi-text">{value}</p></div>)}
          <div className="col-span-2 p-4 bg-white rounded-2xl border border-axi-border"><p className="text-sm font-bold mb-3">Pending transactions</p>{pendingTx.slice(0,5).map((t) => <div key={t.id} className="py-3 border-t border-axi-border flex justify-between"><div><p className="text-xs font-bold">{t.user?.name || t.user?.email || t.userId}</p><p className="text-[10px] text-axi-text-muted">{t.type} · {t.method}</p></div><p className="text-xs font-bold">{t.amount} {t.currency}</p></div>)}</div>
        </div>}

        {tab === "users" && <section><div className="relative mb-4"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-axi-text-muted"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search live users..." className="w-full pl-9 pr-3 py-3 bg-white rounded-xl border border-axi-border text-sm"/></div><div className="space-y-2">{filteredUsers.map((u) => <div key={u.id} className="p-4 bg-white rounded-xl border border-axi-border"><div className="flex justify-between"><div><p className="text-sm font-bold">{u.name}</p><p className="text-[10px] text-axi-text-muted">{u.email} · {u.country || "—"}</p></div><span className="text-[9px] font-bold uppercase">{u.status}</span></div><div className="grid grid-cols-3 mt-3 text-center"><div><p className="text-[9px] text-axi-text-muted">Balance</p><p className="text-xs font-bold">{u.currency} {Number(u.balance || 0).toFixed(2)}</p></div><div><p className="text-[9px] text-axi-text-muted">KYC</p><p className="text-xs font-bold">{u.kycStatus}</p></div><div><p className="text-[9px] text-axi-text-muted">Joined</p><p className="text-xs font-bold">{new Date(u.createdAt).toLocaleDateString()}</p></div></div></div>)}</div></section>}

        {tab === "transactions" && <section className="space-y-2">{transactions.map((t) => <div key={t.id} className="p-4 bg-white rounded-xl border border-axi-border"><div className="flex justify-between"><div><p className="text-sm font-bold">{t.user?.name || t.user?.email || t.userId}</p><p className="text-[10px] text-axi-text-muted">{t.type} · {t.method} · {new Date(t.createdAt).toLocaleString()}</p></div><p className="text-sm font-black">{t.amount} {t.currency}</p></div>{t.status === "pending" ? <div className="flex gap-2 mt-3"><button onClick={() => reviewTransaction(t.id,"completed")} className="flex-1 py-2 rounded-lg bg-axi-success text-white text-[10px] font-bold"><Check size={12} className="inline mr-1"/>Approve</button><button onClick={() => reviewTransaction(t.id,"rejected")} className="flex-1 py-2 rounded-lg bg-axi-red text-white text-[10px] font-bold"><X size={12} className="inline mr-1"/>Reject</button></div> : <span className="text-[9px] font-bold uppercase">{t.status}</span>}</div>)}</section>}

        {tab === "kyc" && <section className="space-y-2">{documents.map((d) => <div key={d.id} className="p-4 bg-white rounded-xl border border-axi-border"><p className="text-sm font-bold">{d.user?.name || d.user?.email || d.userId}</p><p className="text-[10px] text-axi-text-muted">{d.type} · {d.fileName}</p>{d.status === "pending" && <div className="flex gap-2 mt-3"><button onClick={() => reviewKyc(d.id,"approved")} className="flex-1 py-2 rounded-lg bg-axi-success text-white text-[10px] font-bold">Approve</button><button onClick={() => reviewKyc(d.id,"rejected")} className="flex-1 py-2 rounded-lg bg-axi-red text-white text-[10px] font-bold">Reject</button></div>}<span className="text-[9px] font-bold uppercase">{d.status}</span></div>)}</section>}
      </main>
      <LiveChatBot />
    </div>
  );
}
