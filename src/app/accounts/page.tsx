"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, KeyRound, Monitor, Smartphone, WalletCards } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import { AxiAppShell } from "@/components/AxiAppShell";

type Portfolio = { user?: { email?: string; name?: string; currency?: string; balance?: number; equity?: number; platform?: string; accountType?: string } };

const platforms = [
  { key: "axi", name: "Axi Trading Platform", mark: "axi", description: "Axi's in-house trading experience with live markets, portfolio controls and TradingView Advanced Charts.", action: "/dashboard/", icon: Smartphone },
  { key: "mt4", name: "MetaTrader 4", mark: "MT4", description: "Classic MetaTrader environment. Use your broker-issued MT4 account credentials and server.", action: "", icon: Monitor },
  { key: "mt5", name: "MetaTrader 5", mark: "MT5", description: "Multi-asset MetaTrader environment with advanced charting and trading tools.", action: "", icon: Monitor },
];

export default function AccountsPage() {
  const [data, setData] = useState<Portfolio>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { window.location.href = "/login/?redirect=/accounts/"; return; }
    fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setData(payload))
      .finally(() => setLoading(false));
  }, []);

  const user = data.user;
  const currency = user?.currency || "USD";

  return <AxiAppShell active="Accounts">
    <section className="bg-[#e4002e] text-white"><div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/65">Account management</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em]">My accounts</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">One client-portal view for your Axi Trading account and supported MetaTrader accounts, with platform-specific trading kept separate.</p></div></section>

    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <div className="rounded-md bg-[#17191a] p-6 text-white sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/45">Unified client identity</p><h2 className="mt-2 text-2xl font-black">{loading ? "Loading account…" : user?.email || "Authenticated account"}</h2><p className="mt-2 text-sm text-white/55">Your client credentials can be used for the portal; individual trading terminals remain distinct platform accounts.</p></div><div className="grid h-12 w-12 place-items-center rounded-md bg-white/10"><KeyRound className="h-5 w-5 text-[#f5c842]" /></div></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-md bg-white/5 p-4"><span className="text-[9px] font-bold uppercase text-white/40">Account type</span><strong className="mt-1 block text-sm uppercase">{user?.accountType || "—"}</strong></div><div className="rounded-md bg-white/5 p-4"><span className="text-[9px] font-bold uppercase text-white/40">Platform</span><strong className="mt-1 block text-sm uppercase">{user?.platform || "—"}</strong></div><div className="rounded-md bg-white/5 p-4"><span className="text-[9px] font-bold uppercase text-white/40">Currency</span><strong className="mt-1 block text-sm">{currency}</strong></div></div></div>
        <div className="rounded-md border border-[#dedbd5] bg-white p-6"><div className="flex items-center gap-3"><WalletCards className="h-5 w-5 text-[#e4002e]" /><h2 className="font-black">Portfolio</h2></div><div className="mt-6 grid grid-cols-2 gap-4"><div><span className="text-[9px] font-bold uppercase text-[#8a8d8e]">Balance</span><strong className="mt-1 block text-lg">{user?.balance == null ? "—" : `${currency} ${user.balance.toLocaleString()}`}</strong></div><div><span className="text-[9px] font-bold uppercase text-[#8a8d8e]">Equity</span><strong className="mt-1 block text-lg">{user?.equity == null ? "—" : `${currency} ${user.equity.toLocaleString()}`}</strong></div></div><Link href="/dashboard/" className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#e4002e] py-3 text-xs font-extrabold uppercase tracking-wider text-white">Open dashboard <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#e4002e]">Trading terminals</p><h2 className="mt-1 text-2xl font-black">Choose your platform</h2></div><Link href="/helpcenter/" className="hidden text-xs font-bold text-[#66696a] sm:block">Platform help <ExternalLink className="ml-1 inline h-3.5 w-3.5" /></Link></div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {platforms.map(({ key, name, mark, description, action, icon: Icon }) => <article key={key} className="rounded-md border border-[#dedbd5] bg-white p-6"><div className="flex items-center justify-between"><div className={`grid h-11 min-w-11 place-items-center rounded-md ${key === "axi" ? "bg-[#17191a] text-white" : "bg-[#f0ede7] text-[#17191a]"}`}><span className="text-xs font-black">{mark}</span></div><Icon className="h-5 w-5 text-[#777a7b]" /></div><h3 className="mt-5 text-lg font-black">{name}</h3><p className="mt-2 min-h-[72px] text-xs leading-5 text-[#777a7b]">{description}</p>{key === "axi" ? <Link href={action} className="mt-5 flex items-center justify-center gap-2 rounded-md bg-[#17191a] py-3 text-xs font-extrabold uppercase tracking-wider text-white">Open platform <ArrowRight className="h-4 w-4" /></Link> : <div className="mt-5 rounded-md border border-dashed border-[#cfd0ce] bg-[#faf9f7] p-3 text-[10px] leading-4 text-[#777a7b]">No broker terminal credentials are stored in this portal. Connect the real MT4/MT5 gateway before enabling WebTrader or terminal launch.</div>}</article>)}
      </div>

      <section className="mt-8 rounded-md border border-[#dedbd5] bg-white p-6"><h2 className="text-lg font-black">Important platform distinction</h2><p className="mt-2 max-w-4xl text-xs leading-5 text-[#777a7b]">Axi's client portal can present supported accounts together, but MT4, MT5 and the Axi Trading Platform are separate trading environments. The account page therefore acts as the unified control centre without pretending that one platform's positions or credentials automatically become another platform's trades.</p></section>
    </div>
  </AxiAppShell>;
}
