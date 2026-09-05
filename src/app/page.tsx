"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Bell, ChevronDown, Menu, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";
import { useState } from "react";
import LiveChatBot from "@/components/LiveChatBot";

const navigation = [
  { label: "Markets", href: "/markets/" },
  { label: "Trading", href: "/trading/" },
  { label: "Copy Trading", href: "/copy-trading/" },
  { label: "Help", href: "/helpcenter/" },
];

function AxiMark() {
  return (
    <span className="inline-flex items-center gap-2" aria-label="Axi">
      <span className="axi-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="text-[28px] font-extrabold tracking-[-0.07em] text-[#d61f2c]">axi</span>
    </span>
  );
}

function MarketPreview() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-[#f4f7f8] shadow-[0_35px_90px_rgba(0,0,0,.18)]">
      <div className="flex items-center justify-between border-b border-black/10 bg-white/90 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#d61f2c] grid place-items-center text-white"><BarChart3 size={17} /></div>
          <div><p className="text-xs font-semibold text-black/45">Market overview</p><p className="font-bold">Live markets</p></div>
        </div>
        <button className="rounded-full border border-black/10 p-2" aria-label="Notifications"><Bell size={16} /></button>
      </div>
      <div className="grid grid-cols-[1fr_1.25fr] gap-4 p-5">
        <div className="space-y-3">
          {['Forex','Metals','Indices','Stocks'].map((item, index) => (
            <div key={item} className={`rounded-2xl border p-4 ${index === 0 ? 'border-[#d61f2c]/30 bg-white' : 'border-black/5 bg-white/70'}`}>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-black/45">{item}</span><span className="h-2 w-2 rounded-full bg-emerald-500" /></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5"><div className="h-full w-3/4 rounded-full bg-[#d61f2c]" /></div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-[#151718] p-5 text-white min-h-[330px]">
          <div className="flex items-start justify-between"><div><p className="text-xs text-white/45">Selected market</p><p className="mt-1 text-xl font-bold">Market chart</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[.14em]">Live feed</span></div>
          <div className="mt-8 h-44 relative overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
            <svg viewBox="0 0 420 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-label="Market chart preview">
              <path d="M0 142 C35 133 48 147 75 120 S110 108 132 124 S162 92 188 100 S220 72 246 87 S276 48 302 67 S332 42 350 55 S386 26 420 38" fill="none" stroke="#d61f2c" strokeWidth="4" />
              <path d="M0 150 C35 141 48 155 75 128 S110 116 132 132 S162 100 188 108 S220 80 246 95 S276 56 302 75 S332 50 350 63 S386 34 420 46 V180 H0 Z" fill="rgba(214,31,44,.14)" />
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[.06] p-3"><p className="text-[10px] text-white/40">Bid</p><p className="mt-1 text-sm font-bold">Live quote</p></div><div className="rounded-xl bg-white/[.06] p-3"><p className="text-[10px] text-white/40">Ask</p><p className="mt-1 text-sm font-bold">Live quote</p></div></div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0ede7] text-[#151718]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="shrink-0"><AxiMark /></Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map(item => <Link key={item.href} href={item.href} className="text-sm font-semibold text-black/70 transition hover:text-[#d61f2c]">{item.label}</Link>)}
            <Link href="/login/" className="text-sm font-bold">Login</Link>
            <Link href="/register/" className="rounded-md bg-[#f5c842] px-5 py-3 text-xs font-extrabold uppercase tracking-[.12em] transition hover:bg-[#e7b934]">Open account</Link>
          </nav>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="border-t border-black/10 bg-white px-5 py-5 lg:hidden"><div className="mx-auto grid max-w-[1280px] gap-4">{navigation.map(item => <Link key={item.href} onClick={() => setOpen(false)} href={item.href} className="font-semibold">{item.label}</Link>)}<Link href="/login/" className="font-semibold">Login</Link><Link href="/register/" className="rounded-md bg-[#f5c842] px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[.12em]">Open account</Link></div></div>}
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#dfe9eb]">
          <div className="absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-white/60 blur-3xl" />
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-black/60"><span className="h-2 w-2 rounded-full bg-[#d61f2c]" /> Professional trading platform</div>
              <h1 className="max-w-[650px] text-5xl font-extrabold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-[78px]">Trade global markets with <span className="text-[#d61f2c]">confidence.</span></h1>
              <p className="mt-7 max-w-[560px] text-base leading-7 text-black/60 sm:text-lg">A focused trading experience for monitoring markets, managing accounts and acting on opportunities through connected, verified services.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/register/" className="inline-flex items-center gap-2 rounded-md bg-[#f5c842] px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em]">Open account <ArrowRight size={16} /></Link><Link href="/markets/" className="rounded-md border border-black/15 bg-white/70 px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em]">Explore markets</Link></div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-black/50"><span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#d61f2c]" /> Account controls</span><span className="inline-flex items-center gap-2"><WalletCards size={16} className="text-[#d61f2c]" /> Funding tools</span><span className="inline-flex items-center gap-2"><Sparkles size={16} className="text-[#d61f2c]" /> Advanced charts</span></div>
            </div>
            <div className="relative z-10 lg:pl-4"><MarketPreview /></div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-12 sm:grid-cols-3 lg:px-8">
            {[['01','Markets','Monitor global instruments from one focused workspace.'],['02','Portfolio','Keep account balances, positions and funding activity together.'],['03','Tools','Use charts, alerts and risk controls when live services are connected.']].map(([num,title,desc]) => <div key={num} className="border-l-2 border-[#d61f2c] pl-5"><p className="text-[10px] font-extrabold tracking-[.18em] text-[#d61f2c]">{num}</p><h2 className="mt-2 text-xl font-extrabold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-black/50">{desc}</p></div>)}
          </div>
        </section>

        <section className="bg-[#151718] text-white">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 lg:grid-cols-[1fr_.8fr] lg:px-8 lg:py-20">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#f5c842]">One trading workspace</p><h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight tracking-[-.035em] sm:text-5xl">Everything important, without the clutter.</h2><p className="mt-5 max-w-xl leading-7 text-white/55">The interface is designed around the same principles as the Axi mobile experience: fast access to markets, watchlists, charts, account information and funding — with a responsive web layout for larger screens.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><Link href="/markets/" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-5 hover:bg-white/[.07]"><span><span className="block text-sm font-bold">Market watch</span><span className="mt-1 block text-xs text-white/40">Live provider data when available</span></span><ArrowRight className="transition group-hover:translate-x-1" size={18} /></Link><Link href="/dashboard/" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-5 hover:bg-white/[.07]"><span><span className="block text-sm font-bold">Trading dashboard</span><span className="mt-1 block text-xs text-white/40">Your authenticated account workspace</span></span><ArrowRight className="transition group-hover:translate-x-1" size={18} /></Link><Link href="/helpcenter/" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-5 hover:bg-white/[.07]"><span><span className="block text-sm font-bold">Support</span><span className="mt-1 block text-xs text-white/40">Account and platform assistance</span></span><ArrowRight className="transition group-hover:translate-x-1" size={18} /></Link></div>
          </div>
        </section>

        <section className="bg-[#f0ede7] px-5 py-14 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-7 rounded-[28px] bg-[#d61f2c] p-8 text-white sm:p-12 lg:flex-row lg:items-center"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/65">Ready when you are</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] sm:text-4xl">Build your trading workspace.</h2></div><Link href="/register/" className="rounded-md bg-[#f5c842] px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-black">Open account</Link></div></section>
      </main>

      <footer className="border-t border-black/10 bg-white"><div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-7 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-3"><AxiMark /><span>Trading involves risk. Review the applicable terms before using the platform.</span></div><div className="flex gap-5"><Link href="/helpcenter/">Help</Link><Link href="/login/">Login</Link><Link href="/register/">Register</Link></div></div></footer>
      <LiveChatBot />
    </div>
  );
}
