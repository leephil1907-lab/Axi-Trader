"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpRight, Eye, EyeOff, LineChart, ShieldCheck, WalletCards } from "lucide-react";
import { formatMoney } from "@/lib/backend";
import { clearClientAuth, getAuthToken, removeAuthToken } from "@/lib/client-auth";
import { AxiAppShell } from "@/components/AxiAppShell";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const token = getAuthToken();
      if (!token) { router.replace("/login/"); return; }
      try {
        const response = await fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load account");
        if (mounted) setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load account";
        if (mounted) setError(message);
        if (/unauthorized|session/i.test(message)) { clearClientAuth(); removeAuthToken(); router.replace("/login/"); }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [router]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#f0ede7]"><div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d61f2c] border-t-transparent" /></div>;
  if (!data) return <div className="min-h-screen grid place-items-center bg-[#f0ede7] p-6"><div className="max-w-md rounded-lg border border-[#dedbd5] bg-white p-7 text-center"><h1 className="text-xl font-black">Account unavailable</h1><p className="mt-2 text-sm text-[#6c6f70]">{error || "We could not load your account."}</p><Link href="/login/" className="mt-5 inline-flex rounded-md bg-[#d61f2c] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white">Sign in</Link></div></div>;

  const user = data.user;
  const trades = data.trades || [];
  const transactions = data.transactions || [];
  const currency = user.currency || "USD";
  const balance = Number(user.balance || 0);
  const equity = Number(user.equity ?? balance);
  const freeMargin = Number(user.freeMargin ?? 0);

  function logout() { clearClientAuth(); removeAuthToken(); router.replace("/login/"); }

  return <AxiAppShell active="Dashboard">
    <section className="bg-[#d61f2c] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/65">Trading dashboard</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Welcome, {user.firstName || user.name}</h1><p className="mt-1 text-xs text-white/65">{user.email} · {user.accountType || "Trading account"}</p></div>
          <div className="flex gap-2"><Link href="/deposit/" className="rounded-md border border-white/35 px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider hover:bg-white/10">Deposit</Link><Link href="/trading/" className="rounded-md bg-[#f5c842] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-[#17191a]">New trade</Link></div>
        </div>
      </div>
    </section>

    <div className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      {error && <div className="mb-5 rounded-md border border-[#efc5c8] bg-[#fff5f5] px-4 py-3 text-sm text-[#9f1722]">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: "Balance", value: balance, eye: true }, { label: "Equity", value: equity }, { label: "Free margin", value: freeMargin }, { label: "Open positions", value: trades.length, count: true }].map((item) => <div key={item.label} className="rounded-md border border-[#dedbd5] bg-white p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]">{item.label}</span>{item.eye && <button type="button" aria-label={hideBalance ? "Show balance" : "Hide balance"} onClick={() => setHideBalance((v) => !v)}>{hideBalance ? <EyeOff className="h-4 w-4 text-[#777a7b]" /> : <Eye className="h-4 w-4 text-[#777a7b]" />}</button>}</div><p className="mt-3 text-2xl font-black tracking-[-0.03em]">{item.count ? item.value : hideBalance && item.eye ? "••••••" : formatMoney(Number(item.value), currency)}</p></div>)}
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_340px]">
        <section className="rounded-md border border-[#dedbd5] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e3df] px-5 py-4"><div><h2 className="font-black">My positions</h2><p className="mt-1 text-[11px] text-[#777a7b]">Open positions from your trading account</p></div><Link href="/positions/" className="text-[10px] font-extrabold uppercase tracking-wider text-[#d61f2c]">See all</Link></div>
          {trades.length === 0 ? <div className="p-12 text-center"><LineChart className="mx-auto h-8 w-8 text-[#b4b6b6]" /><p className="mt-3 text-sm font-bold">No open positions</p><p className="mt-1 text-xs text-[#777a7b]">When your account has open trades, they will appear here.</p><Link href="/markets/" className="mt-5 inline-flex rounded-md bg-[#17191a] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-white">Explore markets</Link></div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#f6f4f0] text-[10px] font-extrabold uppercase tracking-wider text-[#777a7b]"><tr><th className="px-5 py-3">Instrument</th><th className="px-5 py-3">Side</th><th className="px-5 py-3">Size</th><th className="px-5 py-3 text-right">P/L</th></tr></thead><tbody>{trades.map((trade: any) => <tr key={trade.id} className="border-t border-[#e5e3df]"><td className="px-5 py-4 font-bold">{trade.symbol}</td><td className="px-5 py-4">{trade.type}</td><td className="px-5 py-4">{trade.volume}</td><td className="px-5 py-4 text-right font-bold">{formatMoney(Number(trade.profit || 0), currency)}</td></tr>)}</tbody></table></div>}
        </section>

        <aside className="space-y-4">
          <div className="rounded-md border border-[#dedbd5] bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#d61f2c]" /><h2 className="font-black">Account status</h2></div><div className="mt-4 flex items-center justify-between border-t border-[#e5e3df] pt-4"><span className="text-xs text-[#777a7b]">Identity verification</span><span className="rounded-full bg-[#f0f4ef] px-2.5 py-1 text-[10px] font-bold uppercase text-[#32734d]">{user.kycStatus || "Pending"}</span></div><Link href="/settings/" className="mt-4 block text-xs font-bold text-[#d61f2c]">Manage account →</Link></div>
          <div className="rounded-md bg-[#17191a] p-5 text-white"><WalletCards className="h-5 w-5 text-[#f5c842]" /><h2 className="mt-4 font-black">Funding</h2><p className="mt-2 text-xs leading-5 text-white/50">Deposit or withdraw through the funding methods enabled for your account.</p><div className="mt-5 grid grid-cols-2 gap-2"><Link href="/deposit/" className="rounded-md bg-[#f5c842] px-3 py-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-[#17191a]">Deposit</Link><Link href="/withdraw/" className="rounded-md border border-white/15 px-3 py-3 text-center text-[10px] font-extrabold uppercase tracking-wider">Withdraw</Link></div></div>
        </aside>
      </div>

      <section className="mt-7 rounded-md border border-[#dedbd5] bg-white"><div className="flex items-center justify-between border-b border-[#e5e3df] px-5 py-4"><div><h2 className="font-black">Recent activity</h2><p className="mt-1 text-[11px] text-[#777a7b]">Funding and account transactions</p></div><Link href="/deposit/" className="text-[10px] font-extrabold uppercase tracking-wider text-[#d61f2c]">Funding</Link></div>{transactions.length === 0 ? <div className="p-8 text-center text-sm text-[#777a7b]">No account transactions yet.</div> : transactions.slice(0, 6).map((transaction: any) => <div key={transaction.id} className="flex items-center justify-between gap-4 border-t border-[#e5e3df] px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f6f4f0]"><ArrowDownToLine className="h-4 w-4 text-[#d61f2c]" /></span><div><p className="text-xs font-bold">{transaction.type}</p><p className="text-[10px] text-[#777a7b]">{transaction.method || "Account transaction"}</p></div></div><div className="text-right"><p className="text-xs font-bold">{formatMoney(Number(transaction.amount || 0), transaction.currency || currency)}</p><p className="text-[10px] uppercase text-[#777a7b]">{transaction.status}</p></div></div>)}</section>
    </div>
    <button type="button" onClick={logout} className="sr-only">Logout</button>
  </AxiAppShell>;
}
