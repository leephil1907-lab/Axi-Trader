"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Wallet, Clock, Shield, Check, X, Search, RefreshCw, Gift, Activity, CreditCard, Eye } from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";
import { getAuthToken } from "@/lib/client-auth";

type Tab = "overview" | "users" | "transactions" | "kyc" | "funding" | "promotions" | "activity";

const fmtDate = (v: any) => { try { return new Date(v).toLocaleString(); } catch { return "—"; } };
const fmtMoney = (v: any, cur = "") => `${Number(v || 0).toFixed(2)}${cur ? ` ${cur}` : ""}`;

function parseDetails(raw: any): any {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(String(raw)); } catch { return { note: String(raw) }; }
}

function DocPreview({ doc }: { doc: any }) {
  const url: string = doc.fileUrl || "";
  if (url.startsWith("data:image/")) {
    return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={doc.fileName || "KYC document"} className="mt-3 max-h-56 rounded-xl border border-axi-border object-contain" /></a>;
  }
  if (url) {
    return <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#e4002e]"><Eye size={14} /> Open document ({doc.fileName || doc.type})</a>;
  }
  return <p className="mt-3 text-xs text-axi-text-muted">No file attached.</p>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "WELCOME100", name: "100% Deposit Bonus", description: "Receive a bonus equal to 100% of an eligible qualifying deposit, subject to the promotion terms.", bonusPercent: "100", minDeposit: "100", maxBonus: "1000", currency: "USD", firstDepositOnly: true, active: false });
  // Detail + workflow state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [adjust, setAdjust] = useState({ open: false, userId: "", delta: "", reason: "" });
  const [adjusting, setAdjusting] = useState(false);

  const api = async (path: string, options: RequestInit = {}) => {
    const token = getAuthToken(); if (!token) throw new Error("Admin authentication required");
    const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`); return data;
  };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [u, t, k, p, m, a] = await Promise.all([
        api("/api/admin/users/"), api("/api/admin/transactions/"), api("/api/admin/kyc/"),
        api("/api/admin/promotions/"), api("/api/admin/funding-methods/"), api("/api/admin/audit/?take=60"),
      ]);
      setUsers(u.users || []); setTransactions(t.transactions || []); setDocuments(k.documents || []);
      setPromotions(p.promotions || []); setMethods(m.methods || []); setAudit(a.logs || []);
      if (selectedUserId) {
        const d = await api(`/api/admin/users/?id=${encodeURIComponent(selectedUserId)}`);
        setDetail(d);
      }
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openUser = async (id: string) => {
    setSelectedUserId(id); setDetail(null); setDetailLoading(true); setError("");
    try { setDetail(await api(`/api/admin/users/?id=${encodeURIComponent(id)}`)); }
    catch (e: any) { setError(e.message); } finally { setDetailLoading(false); }
  };
  const closeUser = () => { setSelectedUserId(null); setDetail(null); };

  const setUserStatus = async (id: string, status: "active" | "suspended") => {
    if (!confirm(`${status === "active" ? "Activate" : "Suspend"} this account?`)) return;
    try { await api("/api/admin/users/", { method: "PATCH", body: JSON.stringify({ id, status }) }); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const submitAdjust = async () => {
    const delta = Number(adjust.delta);
    if (!adjust.userId || !Number.isFinite(delta) || delta === 0) return setError("Enter a non-zero adjustment amount.");
    if (adjust.reason.trim().length < 3) return setError("A reason (min 3 chars) is required for every manual adjustment.");
    setAdjusting(true); setError("");
    try {
      await api("/api/admin/users/adjust-balance/", { method: "POST", body: JSON.stringify({ userId: adjust.userId, delta, reason: adjust.reason.trim() }) });
      setAdjust({ open: false, userId: "", delta: "", reason: "" });
      await load();
    } catch (e: any) { setError(e.message); } finally { setAdjusting(false); }
  };

  const reviewTransaction = async (id: string, status: "completed" | "rejected") => {
    const reason = (rejectReason[id] || "").trim();
    if (status === "rejected" && reason.length < 3) return setError("Enter a rejection reason (min 3 chars) before rejecting.");
    try {
      await api("/api/admin/transactions/", { method: "PATCH", body: JSON.stringify({ id, status, rejectionReason: reason || undefined }) });
      setRejectReason((p) => ({ ...p, [id]: "" })); await load();
    } catch (e: any) { setError(e.message); }
  };

  const reviewKyc = async (id: string, status: "approved" | "rejected") => {
    const reason = (rejectReason[id] || "").trim();
    if (status === "rejected" && reason.length < 3) return setError("Enter a rejection reason (min 3 chars) before rejecting.");
    try {
      await api("/api/admin/kyc/", { method: "PATCH", body: JSON.stringify({ id, status, rejectionReason: reason || undefined }) });
      setRejectReason((p) => ({ ...p, [id]: "" })); await load();
    } catch (e: any) { setError(e.message); }
  };

  const createPromotion = async () => {
    setCreatingPromo(true); setError("");
    try {
      await api("/api/admin/promotions/", { method: "POST", body: JSON.stringify({ ...promoForm, bonusPercent: Number(promoForm.bonusPercent), minDeposit: Number(promoForm.minDeposit), maxBonus: Number(promoForm.maxBonus), startsAt: new Date().toISOString() }) });
      await load();
    } catch (e: any) { setError(e.message); } finally { setCreatingPromo(false); }
  };
  const togglePromotion = async (p: any) => {
    try { await api("/api/admin/promotions/", { method: "PATCH", body: JSON.stringify({ id: p.id, active: !p.active }) }); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const jumpToUser = (id: string) => { setTab("users"); void openUser(id); };

  const filteredUsers = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  // "pending" = manual request awaiting verification; "paid" = Stripe confirmed
  // the money is in our Stripe balance — still needs admin approval to credit.
  const pendingTx = transactions.filter((t) => t.status === "pending" || t.status === "paid");
  const paidLabel = (t: any) => t.status === "paid" ? "Paid · approve to credit" : t.status;
  const pendingKyc = documents.filter((d) => d.status === "pending");
  const totalBalance = users.reduce((s, u) => s + Number(u.balance || 0), 0);
  const enabledMethods = methods.filter((m) => m.enabled);

  const tabs: Tab[] = ["overview", "users", "transactions", "kyc", "funding", "promotions", "activity"];
  const badge = (t: Tab) => t === "transactions" && pendingTx.length ? ` (${pendingTx.length})` : t === "kyc" && pendingKyc.length ? ` (${pendingKyc.length})` : "";

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
          {tabs.map((t) => <button key={t} onClick={() => { setTab(t); if (t !== "users") closeUser(); }} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${tab === t ? "bg-axi-red text-white" : "bg-axi-cream text-axi-text-muted"}`}>{t}{badge(t)}</button>)}
        </div>
      </div>

      <main className="flex-1 px-4 py-5 pb-24 max-w-5xl w-full mx-auto">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{error}</div>}

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-3">
            {[[Users, "Users", users.length, "users"], [Wallet, "Balance", `$${totalBalance.toLocaleString()}`, null], [Clock, "Pending Tx", pendingTx.length, "transactions"], [Shield, "Pending KYC", pendingKyc.length, "kyc"]].map(([Icon, label, value, go]: any) => (
              <button key={label} onClick={() => go && setTab(go)} className="p-4 bg-white rounded-2xl border border-axi-border text-left">
                <Icon size={18} className="text-axi-red mb-2" /><p className="text-[10px] text-axi-text-muted uppercase font-bold">{label}</p><p className="text-2xl font-black text-axi-text">{value}</p>
              </button>
            ))}
            <button onClick={() => setTab("funding")} className="p-4 bg-white rounded-2xl border border-axi-border text-left">
              <CreditCard size={18} className="text-axi-red mb-2" /><p className="text-[10px] text-axi-text-muted uppercase font-bold">Funding methods</p><p className="text-2xl font-black text-axi-text">{enabledMethods.length}/{methods.length} on</p>
            </button>
            <button onClick={() => setTab("activity")} className="p-4 bg-white rounded-2xl border border-axi-border text-left">
              <Activity size={18} className="text-axi-red mb-2" /><p className="text-[10px] text-axi-text-muted uppercase font-bold">Audit events</p><p className="text-2xl font-black text-axi-text">{audit.length}</p>
            </button>
            <div className="col-span-2 p-4 bg-white rounded-2xl border border-axi-border">
              <p className="text-sm font-bold mb-3">Pending transactions</p>
              {pendingTx.length === 0 && <p className="text-xs text-axi-text-muted">Nothing awaiting review.</p>}
              {pendingTx.slice(0, 5).map((t) => (
                <button key={t.id} onClick={() => setTab("transactions")} className="w-full py-3 border-t border-axi-border flex justify-between text-left">
                  <div><p className="text-xs font-bold">{t.user?.name || t.user?.email || t.userId}</p><p className="text-[10px] text-axi-text-muted">{t.type} · {t.method}</p></div>
                  <p className="text-xs font-bold">{t.amount} {t.currency}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && !selectedUserId && (
          <section>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-axi-text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users by name or email..." className="w-full pl-9 pr-3 py-3 bg-white rounded-xl border border-axi-border text-sm" />
            </div>
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <button key={u.id} onClick={() => openUser(u.id)} className="w-full p-4 bg-white rounded-xl border border-axi-border text-left hover:shadow-sm">
                  <div className="flex justify-between">
                    <div><p className="text-sm font-bold">{u.name}</p><p className="text-[10px] text-axi-text-muted">{u.email} · {u.country || "—"} · {u.role}</p></div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded h-fit ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.status}</span>
                  </div>
                  <div className="grid grid-cols-3 mt-3 text-center">
                    <div><p className="text-[9px] text-axi-text-muted">Balance</p><p className="text-xs font-bold">{u.currency} {Number(u.balance || 0).toFixed(2)}</p></div>
                    <div><p className="text-[9px] text-axi-text-muted">KYC</p><p className="text-xs font-bold">{u.kycStatus}</p></div>
                    <div><p className="text-[9px] text-axi-text-muted">Joined</p><p className="text-xs font-bold">{new Date(u.createdAt).toLocaleDateString()}</p></div>
                  </div>
                </button>
              ))}
              {filteredUsers.length === 0 && <p className="text-sm text-axi-text-muted text-center py-8">No users found.</p>}
            </div>
          </section>
        )}

        {tab === "users" && selectedUserId && (
          <section>
            <button onClick={closeUser} className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-axi-text-muted"><ArrowLeft size={14} /> Back to users</button>
            {detailLoading && <p className="text-sm text-axi-text-muted py-8 text-center">Loading full profile…</p>}
            {detail && (() => { const u = detail.user; return (
              <div className="space-y-4">
                <div className="p-5 bg-[#1A1A1A] rounded-2xl text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div><h2 className="text-xl font-black">{u.name}</h2><p className="text-xs text-white/50">{u.email} · {u.phone || "no phone"}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.status === "active" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{u.status}</span>
                        <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase">{u.role}</span>
                        <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase">KYC: {u.kycStatus}</span>
                      </div>
                    </div>
                    <div className="text-right"><p className="text-[10px] text-white/40 uppercase">Balance</p><p className="text-2xl font-black">{u.currency} {Number(u.balance || 0).toFixed(2)}</p></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[["Country", u.country || "—"], ["Account", u.accountType || "—"], ["Platform", u.platform || "—"], ["Currency", u.currency || "—"], ["Equity", fmtMoney(u.equity, u.currency)], ["Free margin", fmtMoney(u.freeMargin, u.currency)], ["Joined", fmtDate(u.createdAt)], ["Last login", u.lastLogin ? fmtDate(u.lastLogin) : "never"]].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-white/5 p-2.5"><p className="text-[9px] text-white/40 uppercase">{k}</p><p className="font-bold truncate">{String(v)}</p></div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => setAdjust({ open: true, userId: u.id, delta: "", reason: "" })} className="px-4 py-2.5 rounded-xl bg-[#F5C842] text-black text-xs font-bold">Adjust balance</button>
                    {u.status === "active"
                      ? <button onClick={() => setUserStatus(u.id, "suspended")} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold">Suspend account</button>
                      : <button onClick={() => setUserStatus(u.id, "active")} className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold">Reactivate account</button>}
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-axi-border">
                  <h3 className="font-black mb-3">KYC documents ({detail.documents?.length || 0})</h3>
                  {(detail.documents || []).length === 0 && <p className="text-xs text-axi-text-muted">No documents submitted.</p>}
                  {(detail.documents || []).map((d: any) => (
                    <div key={d.id} className="py-3 border-t border-axi-border first:border-0">
                      <div className="flex justify-between text-xs"><p className="font-bold">{d.type} · {d.fileName}</p><span className="font-bold uppercase">{d.status}</span></div>
                      <p className="text-[10px] text-axi-text-muted">{fmtDate(d.createdAt)}{d.rejectionReason ? ` · Reason: ${d.rejectionReason}` : ""}</p>
                      <DocPreview doc={d} />
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white rounded-2xl border border-axi-border">
                  <h3 className="font-black mb-3">Transactions ({detail.transactions?.length || 0})</h3>
                  {(detail.transactions || []).length === 0 && <p className="text-xs text-axi-text-muted">No transactions.</p>}
                  {(detail.transactions || []).slice(0, 15).map((t: any) => (
                    <div key={t.id} className="py-3 border-t border-axi-border first:border-0 flex justify-between text-xs">
                      <div><p className="font-bold capitalize">{t.type} · {t.method}</p><p className="text-[10px] text-axi-text-muted">{fmtDate(t.createdAt)}</p></div>
                      <div className="text-right"><p className="font-black">{t.amount} {t.currency}</p><p className="text-[10px] uppercase">{t.status}</p></div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white rounded-2xl border border-axi-border">
                  <h3 className="font-black mb-3">Trades ({detail.trades?.length || 0})</h3>
                  {(detail.trades || []).length === 0 && <p className="text-xs text-axi-text-muted">No trades.</p>}
                  {(detail.trades || []).slice(0, 15).map((t: any) => (
                    <div key={t.id} className="py-3 border-t border-axi-border first:border-0 flex justify-between text-xs">
                      <div><p className="font-bold">{t.symbol} · {t.type} · {t.volume}</p><p className="text-[10px] text-axi-text-muted">Opened {fmtDate(t.openedAt)}{t.closedAt ? ` · Closed ${fmtDate(t.closedAt)}` : " · Open"}</p></div>
                      <p className="font-black">{fmtMoney(t.profit, u.currency)}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white rounded-2xl border border-axi-border">
                  <h3 className="font-black mb-3">Promotions & bonuses</h3>
                  {(detail.enrollments || []).length === 0 && (detail.bonusLedger || []).length === 0 && <p className="text-xs text-axi-text-muted">None.</p>}
                  {(detail.enrollments || []).map((e: any) => <p key={e.id} className="text-xs py-1.5 border-t border-axi-border first:border-0"><b>{e.promotion?.code}</b> · {e.status}{e.qualifyingDepositId ? " · qualified" : ""}</p>)}
                  {(detail.bonusLedger || []).map((b: any) => <p key={b.id} className="text-xs py-1.5 border-t border-axi-border first:border-0 text-green-700 font-bold">+{b.amount} {b.currency} · {b.promotion?.code} · {b.status}</p>)}
                </div>

                <div className="p-5 bg-white rounded-2xl border border-axi-border">
                  <h3 className="font-black mb-3">Account audit trail</h3>
                  {(detail.auditLogs || []).length === 0 && <p className="text-xs text-axi-text-muted">No audit events by this account.</p>}
                  {(detail.auditLogs || []).map((l: any) => <p key={l.id} className="text-xs py-1.5 border-t border-axi-border first:border-0"><b>{l.action}</b> · {l.resource}{l.resourceId ? ` ${String(l.resourceId).slice(0, 8)}…` : ""} · <span className="text-axi-text-muted">{fmtDate(l.createdAt)}</span></p>)}
                </div>
              </div>
            ); })()}
          </section>
        )}

        {tab === "transactions" && (
          <section className="space-y-2">
            {transactions.length === 0 && <p className="text-sm text-axi-text-muted text-center py-8">No transactions yet.</p>}
            {transactions.map((t) => {
              const d = parseDetails(t.paymentDetails);
              const open = expandedTx === t.id;
              return (
                <div key={t.id} className="p-4 bg-white rounded-xl border border-axi-border">
                  <button onClick={() => setExpandedTx(open ? null : t.id)} className="w-full flex justify-between text-left">
                    <div><p className="text-sm font-bold">{t.user?.name || t.user?.email || t.userId}</p><p className="text-[10px] text-axi-text-muted capitalize">{t.type} · {t.method} · {fmtDate(t.createdAt)}</p></div>
                    <div className="text-right"><p className="text-sm font-black">{t.amount} {t.currency}</p><span className="text-[9px] font-bold uppercase">{t.status}</span></div>
                  </button>
                  {open && (
                    <div className="mt-3 pt-3 border-t border-axi-border text-xs space-y-1.5">
                      <p className="text-[10px] text-axi-text-muted break-all">ID: {t.id}</p>
                      {d?.destination && <p><b>Destination:</b> {d.destination}</p>}
                      {d?.name && <p><b>Method snapshot:</b> {d.name}{d.type ? ` (${d.type})` : ""}</p>}
                      {d?.direction && <p><b>Manual adjustment:</b> {d.direction} {d.delta} — {d.reason}</p>}
                      {d?.walletAddress && <p className="break-all"><b>Wallet:</b> {d.walletAddress}</p>}
                      {d?.bankAccount && <p><b>Bank:</b> {d.bankName || ""} {d.bankAccount}</p>}
                      {t.paymentReference && <p className="break-all"><b>Payment ref:</b> {t.paymentReference}</p>}
                      {t.rejectionReason && <p className="text-red-700"><b>Rejection reason:</b> {t.rejectionReason}</p>}
                      {t.reviewedAt && <p className="text-axi-text-muted">Reviewed {fmtDate(t.reviewedAt)}{t.reviewedBy ? ` by ${String(t.reviewedBy).slice(0, 8)}…` : ""}</p>}
                      {t.user?.email && <button onClick={() => jumpToUser(t.userId)} className="text-[#e4002e] font-bold">Open user profile →</button>}
                      {t.status === "paid" && <p className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-3 py-2">Stripe confirmed this card payment — the money is in your Stripe balance. Approve to credit the user's platform balance, or reject if the payment is not genuine.</p>}
                      {(t.status === "pending" || t.status === "paid") && (
                        <div className="pt-2 space-y-2">
                          <input value={rejectReason[t.id] || ""} onChange={(e) => setRejectReason((p) => ({ ...p, [t.id]: e.target.value }))} placeholder="Rejection reason (required to reject)" className="w-full px-3 py-2.5 rounded-lg border border-axi-border text-xs" />
                          <div className="flex gap-2">
                            <button onClick={() => reviewTransaction(t.id, "completed")} className="flex-1 py-2 rounded-lg bg-axi-success text-white text-[10px] font-bold"><Check size={12} className="inline mr-1" />Approve</button>
                            <button onClick={() => reviewTransaction(t.id, "rejected")} className="flex-1 py-2 rounded-lg bg-axi-red text-white text-[10px] font-bold"><X size={12} className="inline mr-1" />Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {tab === "kyc" && (
          <section className="space-y-2">
            {documents.length === 0 && <p className="text-sm text-axi-text-muted text-center py-8">No KYC submissions yet.</p>}
            {documents.map((d) => (
              <div key={d.id} className="p-4 bg-white rounded-xl border border-axi-border">
                <div className="flex justify-between gap-3">
                  <div><button onClick={() => d.userId && jumpToUser(d.userId)} className="text-sm font-bold text-left hover:underline">{d.user?.name || d.user?.email || d.userId}</button>
                    <p className="text-[10px] text-axi-text-muted">{d.type} · {d.fileName} · {fmtDate(d.createdAt || d.id)}</p></div>
                  <span className="text-[9px] font-bold uppercase h-fit">{d.status}</span>
                </div>
                {d.rejectionReason && <p className="mt-1 text-xs text-red-700">Reason: {d.rejectionReason}</p>}
                <DocPreview doc={d} />
                {d.status === "pending" && (
                  <div className="mt-3 space-y-2">
                    <input value={rejectReason[d.id] || ""} onChange={(e) => setRejectReason((p) => ({ ...p, [d.id]: e.target.value }))} placeholder="Rejection reason (required to reject)" className="w-full px-3 py-2.5 rounded-lg border border-axi-border text-xs" />
                    <div className="flex gap-2">
                      <button onClick={() => reviewKyc(d.id, "approved")} className="flex-1 py-2 rounded-lg bg-axi-success text-white text-[10px] font-bold">Approve</button>
                      <button onClick={() => reviewKyc(d.id, "rejected")} className="flex-1 py-2 rounded-lg bg-axi-red text-white text-[10px] font-bold">Reject</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {tab === "funding" && (
          <section className="space-y-3">
            <div className="p-5 bg-white rounded-2xl border border-axi-border">
              <div className="flex items-center gap-2"><CreditCard size={18} className="text-axi-red" /><h2 className="font-bold">Payment methods</h2></div>
              <p className="mt-2 text-xs text-axi-text-muted leading-5">{enabledMethods.length} of {methods.length} methods enabled. Add methods, edit wallet addresses, bank details, limits and regions on the funding page.</p>
              <Link href="/admin/funding/" className="inline-block mt-4 px-5 py-3 rounded-xl bg-axi-red text-white text-xs font-bold">Manage payment methods →</Link>
            </div>
            {methods.map((m) => (
              <div key={m.id} className="p-4 bg-white rounded-xl border border-axi-border flex justify-between gap-3">
                <div className="min-w-0"><p className="text-sm font-bold truncate">{m.name}</p><p className="text-[10px] text-axi-text-muted">{m.key} · {m.type} · {m.countries?.trim() ? m.countries : "GLOBAL"} · {m.currencies || "all"}</p>
                  {m.type === "crypto" && <p className="text-[10px] text-axi-text-muted break-all">{m.asset || ""} {m.network || ""} {m.walletAddress || "wallet not set"}</p>}</div>
                <span className={`h-fit px-2 py-1 rounded-full text-[10px] font-bold ${m.enabled ? "bg-green-100 text-green-700" : "bg-axi-cream text-axi-text-muted"}`}>{m.enabled ? "Enabled" : "Disabled"}</span>
              </div>
            ))}
          </section>
        )}

        {tab === "promotions" && (
          <section className="space-y-4">
            <div className="p-5 bg-white rounded-2xl border border-axi-border">
              <div className="flex items-center gap-2 mb-4"><Gift size={18} className="text-axi-red" /><h2 className="font-bold">Create deposit promotion</h2></div>
              <div className="grid md:grid-cols-2 gap-3">
                {[["code", "Promo code"], ["name", "Name"], ["description", "Description"], ["bonusPercent", "Bonus %"], ["minDeposit", "Minimum deposit"], ["maxBonus", "Maximum bonus"]].map(([key, label]: any) => (
                  <input key={key} value={(promoForm as any)[key]} onChange={(e) => setPromoForm({ ...promoForm, [key]: e.target.value })} placeholder={label} className="px-3 py-3 rounded-lg border border-axi-border text-sm" />
                ))}
                <select value={promoForm.currency} onChange={(e) => setPromoForm({ ...promoForm, currency: e.target.value })} className="px-3 py-3 rounded-lg border"><option>USD</option><option>EUR</option><option>GBP</option></select>
              </div>
              <label className="flex items-center gap-2 text-xs mt-3"><input type="checkbox" checked={promoForm.firstDepositOnly} onChange={(e) => setPromoForm({ ...promoForm, firstDepositOnly: e.target.checked })} /> First qualifying deposit only</label>
              <button disabled={creatingPromo} onClick={createPromotion} className="mt-4 px-5 py-3 rounded-lg bg-axi-red text-white text-xs font-bold">{creatingPromo ? "Creating…" : "Create promotion"}</button>
            </div>
            <div className="space-y-2">
              {promotions.map((p) => (
                <div key={p.id} className="p-4 bg-white rounded-xl border border-axi-border">
                  <div className="flex justify-between gap-3">
                    <div><p className="font-bold">{p.name} · {p.code}</p><p className="text-xs text-axi-text-muted">{p.bonusPercent}% · min {p.minDeposit} {p.currency}{p.maxBonus ? ` · max ${p.maxBonus}` : ""}</p><p className="text-xs text-axi-text-muted mt-1">{p.description}</p></div>
                    <button onClick={() => togglePromotion(p)} className={`h-fit px-3 py-2 rounded-lg text-xs font-bold ${p.active ? "bg-axi-success text-white" : "bg-axi-cream text-axi-text-muted"}`}>{p.active ? "Active" : "Inactive"}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "activity" && (
          <section className="space-y-2">
            {audit.length === 0 && <p className="text-sm text-axi-text-muted text-center py-8">No audit events yet.</p>}
            {audit.map((l) => (
              <div key={l.id} className="p-3 bg-white rounded-xl border border-axi-border text-xs">
                <p className="font-bold">{l.action} <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] uppercase ${l.outcome === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{l.outcome}</span></p>
                <p className="text-[10px] text-axi-text-muted mt-0.5">{l.actor?.email || "system"} · {l.resource}{l.resourceId ? ` ${String(l.resourceId).slice(0, 8)}…` : ""} · {fmtDate(l.createdAt)}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      {adjust.open && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-4" onClick={() => setAdjust({ open: false, userId: "", delta: "", reason: "" })}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-black">Manual balance adjustment</h2>
            <p className="mt-1 text-xs text-axi-text-muted leading-5">Use a positive amount to credit, negative to debit. A ledger transaction and audit record are created automatically — nothing is silent.</p>
            <label className="mt-4 block text-xs font-bold uppercase text-axi-text-muted">Amount (signed)</label>
            <input type="number" step="0.01" value={adjust.delta} onChange={(e) => setAdjust({ ...adjust, delta: e.target.value })} placeholder="+500.00 or -200.00" className="mt-2 w-full px-4 py-3 rounded-xl border text-sm font-bold" />
            <label className="mt-4 block text-xs font-bold uppercase text-axi-text-muted">Reason (required)</label>
            <textarea value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })} placeholder="e.g. Goodwill credit for failed deposit TXN-123" className="mt-2 w-full px-4 py-3 rounded-xl border text-sm min-h-24" />
            <div className="mt-5 flex gap-2">
              <button onClick={() => setAdjust({ open: false, userId: "", delta: "", reason: "" })} className="px-5 py-3 rounded-xl border font-bold text-sm">Cancel</button>
              <button disabled={adjusting} onClick={submitAdjust} className="flex-1 py-3 rounded-xl bg-axi-red text-white font-bold text-sm disabled:opacity-50">{adjusting ? "Applying…" : "Apply adjustment"}</button>
            </div>
          </div>
        </div>
      )}

      <LiveChatBot />
    </div>
  );
}
