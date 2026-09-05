"use client";

import Link from "next/link";
import { ArrowRight, Menu, X, Users, SlidersHorizontal, Repeat, ShieldCheck, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import LiveChatBot from "@/components/LiveChatBot";

function AxiMark() {
  return (
    <span className="inline-flex items-center gap-2" aria-label="Axi">
      <span className="axi-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="text-[28px] font-extrabold tracking-[-0.07em] text-[#e4002e]">axi</span>
    </span>
  );
}

const steps: Array<[string, string, string, LucideIcon]> = [
  ["01", "Follow a trader", "Browse top trading portfolios and choose a trader whose strategy fits your goals.", Users],
  ["02", "Set size & risk", "Set your trade size and risk preferences — you stay in control at all times.", SlidersHorizontal],
  ["03", "Mirror automatically", "Your account automatically mirrors their trades in real time.", Repeat],
];

const traders = [
  ["Liam Sterling", "78.45", "62.3", "1378"],
  ["Ava Goldsmith", "79.67", "61.8", "4437"],
  ["Noah Silver", "77.89", "63.2", "467"],
  ["Mia Bronson", "80.12", "64.5", "247"],
  ["Sophia Chalice", "75.12", "65.5", "762"],
  ["Emily Brown", "74.36", "77.0", "1439"],
];

export default function CopyTradingPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-[#282424]">
      <div className="bg-[#0b0b0c] px-5 py-2 text-center text-[10px] leading-4 text-white/50">Over-the-counter derivatives are leveraged products and carry a high level of risk to your capital. Past performance is not indicative of future results.</div>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="shrink-0"><AxiMark /></Link>
          <nav className="hidden items-center gap-8 lg:flex">
            <Link href="/markets/" className="text-sm font-semibold text-black/70 hover:text-[#e4002e]">Markets</Link>
            <Link href="/trading/" className="text-sm font-semibold text-black/70 hover:text-[#e4002e]">Trading</Link>
            <Link href="/copy-trading/" className="text-sm font-bold text-[#e4002e]">Copy Trading</Link>
            <Link href="/helpcenter/" className="text-sm font-semibold text-black/70 hover:text-[#e4002e]">Help</Link>
            <Link href="/login/" className="text-sm font-bold">Login</Link>
            <Link href="/register/" className="rounded-md bg-[#e4002e] px-5 py-3 text-xs font-extrabold uppercase tracking-[.12em] text-white hover:bg-[#b20024]">Open account</Link>
          </nav>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(v => !v)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="border-t border-black/10 bg-white px-5 py-5 lg:hidden"><div className="mx-auto grid max-w-[1280px] gap-4"><Link href="/markets/" className="font-semibold">Markets</Link><Link href="/trading/" className="font-semibold">Trading</Link><Link href="/login/" className="font-semibold">Login</Link><Link href="/register/" className="rounded-md bg-[#e4002e] px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[.12em] text-white">Open account</Link></div></div>}
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0b0b0c] text-white">
          <div className="absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-[#e4002e]/20 blur-3xl" />
          <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-24">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-white/60">/// Copy trading</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-[1.0] tracking-[-.045em] sm:text-6xl lg:text-[76px]">Find top trading portfolios and <span className="text-[#e4002e]">mirror them</span> in real time.</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg">Automatically replicate the trades of top traders from around the globe. Connect your MT4 or MT5 account, pick your traders, and let the platform do the rest.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register/" className="inline-flex items-center gap-2 rounded-md bg-[#e4002e] px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-[#b20024]">Start copy trading <ArrowRight size={16} /></Link>
              <Link href="#how" className="rounded-md border border-white/20 px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:border-white/50">How it works</Link>
            </div>
            <p className="mt-6 text-[11px] text-white/35">Past performance is not indicative of future results.</p>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-white/50">
              <span className="inline-flex items-center gap-2"><Smartphone size={16} className="text-[#e4002e]" /> MT4 · MT5 connect</span>
              <span className="inline-flex items-center gap-2"><Repeat size={16} className="text-[#e4002e]" /> Real-time mirroring</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#e4002e]" /> You control risk</span>
            </div>
          </div>
        </section>

        <section id="how" className="bg-white">
          <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-black/40">/// How it works</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-.035em] sm:text-5xl">How does copy trading work?</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map(([num, title, desc, Icon]) => (
                <div key={num} className="rounded-[24px] border border-black/10 bg-[#fafafa] p-7">
                  <div className="flex items-center justify-between"><span className="text-[11px] font-extrabold tracking-[.2em] text-[#e4002e]">{num}</span><span className="grid h-11 w-11 place-items-center rounded-full bg-[#e4002e]/10 text-[#e4002e]"><Icon size={20} /></span></div>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-[-.02em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/55">{desc}</p>
                </div>
              ))}
            </div>
            <Link href="/register/" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#171717] px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-black">Start copy trading <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="bg-[#0b0b0c] text-white">
          <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-white/40">/// Top traders</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-.035em] sm:text-5xl">Automate. Imitate. Copy trade.</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/55">Copy trading lets you automatically replicate the trades of top traders — a social, engaging way to trade without late-night chart monitoring.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {traders.map(([name, profit, win, copiers]) => (
                <div key={name} className="rounded-[24px] border border-white/10 bg-white/[.04] p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e4002e]/15 text-lg font-extrabold text-[#e4002e]">{name.split(" ").map(w => w[0]).join("")}</span>
                    <div><p className="font-extrabold">{name}</p><p className="text-[11px] text-white/40">{copiers} copiers</p></div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[.05] p-4"><p className="text-2xl font-extrabold text-[#22c55e]">{profit}%</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-white/40">30D profit</p></div>
                    <div className="rounded-xl bg-white/[.05] p-4"><p className="text-2xl font-extrabold">{win}%</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-white/40">Win rate</p></div>
                  </div>
                  <Link href="/register/" className="mt-5 flex items-center justify-center gap-2 rounded-md bg-[#e4002e] px-5 py-3 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-[#b20024]">Copy <ArrowRight size={15} /></Link>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-white/35">Illustrative trader profiles. Past performance is not indicative of future results. Trading involves risk — you may lose more than you invest.</p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-black/40">/// Risk control</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-.035em] sm:text-5xl">Control your risk.</h2>
              <p className="mt-4 max-w-lg leading-7 text-black/55">Copy trading doesn&apos;t rely on a managed fund — you stay in charge of your money and your risk, on your own terms.</p>
              <ul className="mt-6 space-y-3 text-sm font-semibold">
                {["Stop copying any trader at any time", "Set trade sizes and risk limits per trader", "Filter traders by profit, win rate and copiers", "Your funds stay in your own account"].map(t => (
                  <li key={t} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e4002e]/10 text-[#e4002e]"><ShieldCheck size={15} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] bg-[#0b0b0c] p-8 text-white sm:p-10">
              <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-white/40">A smarter way to trade</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-[-.03em]">Trade like an expert.</h3>
              <p className="mt-4 leading-7 text-white/55">When you copy a top trader, your account replicates their trades in real time — informed entries without needing years of expertise.</p>
              <Link href="/register/" className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#e4002e] px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-[#b20024]">Start copy trading <ArrowRight size={16} /></Link>
              <p className="mt-5 text-[11px] leading-5 text-white/35">Trading involves risk. Past performance is not indicative of future results.</p>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 pb-14 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-7 rounded-[28px] bg-[#e4002e] p-8 text-white sm:p-12 lg:flex-row lg:items-center"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/65">Ready when you are</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] sm:text-4xl">Mirror your first trader today.</h2></div><Link href="/register/" className="rounded-md bg-white px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-[#e4002e]">Open account</Link></div></section>
      </main>

      <section className="border-t border-black/10 bg-white"><div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8"><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-black/50">Risk warning</h2><p className="mt-3 max-w-4xl text-xs leading-5 text-black/45">Trading leveraged products carries a high level of risk and may not be suitable for all investors. Copy trading does not guarantee profits — copied traders can and do lose money, and you may get back less than you put in. Past performance is not a reliable indicator of future results. Nothing on this platform is intended as investment advice.</p></div></section>
      <footer className="bg-[#0b0b0c] text-white"><div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© AxiTrades. All rights reserved.</span><span>www.axitrades.com</span></div></footer>
      <LiveChatBot />
    </div>
  );
}
