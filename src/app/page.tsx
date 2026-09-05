"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Menu, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";
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
      <span className="text-[28px] font-extrabold tracking-[-0.07em] text-[#e4002e]">axi</span>
    </span>
  );
}

function MarketPreview() {
  // Honest product visual: shows the workspace layout only.
  // No simulated prices, quotes, or charts are rendered here.
  const rows = [
    { title: "Watchlist", desc: "Instruments you follow" },
    { title: "Portfolio", desc: "Balances from your account" },
    { title: "Positions", desc: "Open trades, when present" },
  ];
  const steps = [
    ["01", "Select an instrument from Markets"],
    ["02", "Set size, stop-loss and take-profit"],
    ["03", "Send only on a live provider quote"],
  ];
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#141415] shadow-[0_35px_90px_rgba(0,0,0,.5)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[.04] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e4002e] text-white"><BarChart3 size={17} /></div>
          <div><p className="text-xs font-semibold text-white/45">Platform preview</p><p className="font-bold text-white">Your workspace</p></div>
        </div>
        <Link href="/markets/" className="rounded-full border border-white/15 px-4 py-2 text-[11px] font-bold text-white hover:border-[#e4002e] hover:text-white" aria-label="Open markets">Open markets</Link>
      </div>
      <div className="grid grid-cols-[1fr_1.25fr] gap-4 p-5">
        <div className="space-y-3">
          {rows.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-white">{item.title}</span><span className="h-2 w-2 rounded-full bg-white/20" /></div>
              <p className="mt-2 text-[11px] leading-4 text-white/45">{item.desc}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/3 rounded-full bg-[#e4002e]" /></div>
            </div>
          ))}
        </div>
        <div className="min-h-[330px] rounded-2xl bg-white/[.05] p-5 text-white">
          <div className="flex items-start justify-between"><div><p className="text-xs text-white/45">Order ticket</p><p className="mt-1 text-xl font-bold">How trading works</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[.14em]">3 steps</span></div>
          <div className="mt-6 space-y-3">
            {steps.map(([num, text]) => (
              <div key={num} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[.04] p-4">
                <span className="text-[10px] font-extrabold tracking-[.14em] text-[#e4002e]">{num}</span>
                <p className="text-sm font-semibold leading-5">{text}</p>
              </div>
            ))}
          </div>
          <Link href="/register/" className="mt-5 flex items-center justify-center gap-2 rounded-md bg-[#e4002e] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-[#b20024]">Open account</Link>
        </div>
      </div>
    </div>
  );
}

const edgeBlocks = [
  ["01", "Your edge in the markets", "Tight spreads, real prices and fast execution across forex, crypto, indices and commodities."],
  ["02", "Copy trading", "Mirror the strategies of experienced traders in real time and grow with the community."],
  ["03", "Axi app, MT4 and MT5", "Trade on the award-style Axi app experience, MetaTrader 4 or MetaTrader 5 — web and mobile."],
  ["04", "Simple funding", "Cards via Stripe, PayPal, Skrill, crypto and bank transfer — reviewed and credited by our team."],
];

const stats = [
  ["650+", "Instruments across forex, crypto, indices, shares and commodities"],
  ["MT4 · MT5", "Full MetaTrader support plus the Axi trading app and copy trading"],
  ["100+", "Countries served with localised funding options"],
  ["24/7", "Account access, funding requests and support around the clock"],
];

const products = [
  ["CFDs", "FX. Indices. Shares. Razor-sharp spreads.", "One account for every major market — forex, indices, shares, commodities and ETFs.", "/trading/"],
  ["Crypto", "Spot and perpetual-style crypto markets.", "Trade Bitcoin, Ethereum and altcoins without leaving your AxiTrades account.", "/markets/"],
  ["Copy trading", "Automate. Imitate. Copy trade.", "Follow experienced traders and mirror their strategies in real time.", "/copy-trading/"],
];

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#282424]">
      <div className="bg-[#0b0b0c] px-5 py-2 text-center text-[10px] leading-4 text-white/50">Over-the-counter derivatives are leveraged products and carry a high level of risk to your capital. Trading may not be suitable for everyone.</div>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="shrink-0"><AxiMark /></Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map(item => <Link key={item.href} href={item.href} className="text-sm font-semibold text-black/70 transition hover:text-[#e4002e]">{item.label}</Link>)}
            <Link href="/login/" className="text-sm font-bold">Login</Link>
            <Link href="/register/" className="rounded-md bg-[#e4002e] px-5 py-3 text-xs font-extrabold uppercase tracking-[.12em] text-white transition hover:bg-[#b20024]">Open account</Link>
          </nav>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="border-t border-black/10 bg-white px-5 py-5 lg:hidden"><div className="mx-auto grid max-w-[1280px] gap-4">{navigation.map(item => <Link key={item.href} onClick={() => setOpen(false)} href={item.href} className="font-semibold">{item.label}</Link>)}<Link href="/login/" className="font-semibold">Login</Link><Link href="/register/" className="rounded-md bg-[#e4002e] px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[.12em] text-white">Open account</Link></div></div>}
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0b0b0c] text-white">
          <div className="absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-[#e4002e]/20 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-white/[.04] blur-3xl" />
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <p className="mb-7 text-[11px] font-extrabold uppercase tracking-[.22em] text-white/60">/// Your edge in the markets</p>
              <h1 className="max-w-[650px] text-5xl font-extrabold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[78px]">Tight spreads.<br />Real prices.<br /><span className="text-[#e4002e]">Unmatched execution.</span></h1>
              <p className="mt-7 max-w-[560px] text-base leading-7 text-white/60 sm:text-lg">Trade forex, crypto, indices and commodities with a focused workspace — live markets, copy trading, MT4 and MT5, and funding reviewed by our team.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/register/" className="inline-flex items-center gap-2 rounded-md bg-[#e4002e] px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-[#b20024]">Open account <ArrowRight size={16} /></Link><Link href="/markets/" className="rounded-md border border-white/20 px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:border-white/50">View all markets</Link></div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-white/50"><span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#e4002e]" /> Account controls</span><span className="inline-flex items-center gap-2"><WalletCards size={16} className="text-[#e4002e]" /> Funding tools</span><span className="inline-flex items-center gap-2"><Sparkles size={16} className="text-[#e4002e]" /> Advanced charts</span></div>
            </div>
            <div className="relative z-10 lg:pl-4"><MarketPreview /></div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {edgeBlocks.map(([num, title, desc]) => <div key={num} className="border-l-2 border-[#e4002e] pl-5"><p className="text-[10px] font-extrabold tracking-[.18em] text-[#e4002e]">{num}</p><h2 className="mt-2 text-xl font-extrabold tracking-[-.02em]">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-black/50">{desc}</p></div>)}
          </div>
        </section>

        <section className="bg-[#0b0b0c] text-white">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {stats.map(([value, label]) => <div key={label}><p className="text-4xl font-extrabold tracking-[-.03em] lg:text-5xl">{value}</p><p className="mt-3 max-w-[240px] text-sm leading-6 text-white/50">{label}</p></div>)}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1280px] px-5 pt-16 lg:px-8 lg:pt-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-black/40">/// Featured</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-[-.035em] sm:text-5xl">Built for every kind of trader.</h2>
          </div>
          <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8">
            <Link href="/markets/" className="group relative block overflow-hidden rounded-[28px] border border-black/10">
              <img src="/images/promo-crypto.png" alt="Buy crypto — BTC, ETH and XRP on the Axi app" className="h-auto w-full object-cover" loading="lazy" />
              <span className="absolute left-8 top-1/2 hidden max-w-[320px] -translate-y-1/2 lg:block">
                <span className="block text-3xl font-extrabold leading-tight tracking-[-.03em] text-[#282424]">Buy crypto in minutes.</span>
                <span className="mt-3 block text-sm leading-6 text-black/55">BTC, ETH, XRP and more — fund with card, PayPal, Skrill or bank transfer.</span>
                <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#e4002e] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[.14em] text-white transition group-hover:bg-[#b20024]">Start trading <ArrowRight size={15} /></span>
              </span>
            </Link>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Link href="/register/" className="group overflow-hidden rounded-[28px] border border-black/10 bg-white transition hover:border-[#e4002e]/50 hover:shadow-[0_20px_60px_rgba(228,0,46,.12)]">
                <img src="/images/promo-select.jpg" alt="Trade with Axi funds up to 1 million USD" className="aspect-[1080/551] w-full object-cover" loading="lazy" />
                <span className="flex items-center justify-between p-5"><span className="text-sm font-extrabold">Axi Select — capital allocation</span><ArrowRight size={17} className="text-[#e4002e] transition group-hover:translate-x-1" /></span>
              </Link>
              <Link href="/trading/" className="group overflow-hidden rounded-[28px] border border-black/10 bg-white transition hover:border-[#e4002e]/50 hover:shadow-[0_20px_60px_rgba(228,0,46,.12)]">
                <img src="/images/promo-ai.jpg" alt="Power up your trading strategy with AI" className="aspect-[1080/551] w-full object-cover" loading="lazy" />
                <span className="flex items-center justify-between p-5"><span className="text-sm font-extrabold">AI trading analyst</span><ArrowRight size={17} className="text-[#e4002e] transition group-hover:translate-x-1" /></span>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 pb-14 lg:px-8"><div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-[#0b0b0c] p-8 text-white sm:p-12"><div className="absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-[#e4002e]/25 blur-3xl" /><div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-[#e4002e]">/// Limited offer</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-.03em] sm:text-5xl">100% deposit bonus — up to $5,000.</h2><p className="mt-4 max-w-xl leading-7 text-white/60">Double your first deposit with a 100% trading credit. Deposit $200 or more, enter the code below, and the bonus is credited automatically once your payment is approved.</p><div className="mt-5 flex flex-wrap items-center gap-3"><span className="rounded-lg border border-dashed border-white/30 bg-white/[.06] px-5 py-3 text-lg font-extrabold tracking-[.2em]">BONUS100</span><Link href="/deposit/" className="rounded-md bg-[#e4002e] px-7 py-3.5 text-xs font-extrabold uppercase tracking-[.14em] text-white hover:bg-[#b20024]">Claim bonus</Link></div><p className="mt-5 max-w-xl text-[11px] leading-5 text-white/35">First deposit only · minimum $200 · maximum $5,000 credit · one per client · credit supports margin and cannot be withdrawn · abuse voids the bonus · terms apply.</p></div><div className="hidden justify-self-end text-right lg:block"><p className="text-[120px] font-extrabold leading-none tracking-[-.05em] text-white/[.07]">100%</p></div></div></div></section>

        <section className="bg-[#fafafa]">
          <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-black/40">/// Trading products</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-[-.035em] sm:text-5xl">CFDs, crypto and copy trading. All in one account.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {products.map(([kicker, title, desc, href]) => (
                <Link key={kicker} href={href} className="group rounded-[24px] border border-black/10 bg-white p-7 transition hover:border-[#e4002e]/50 hover:shadow-[0_20px_60px_rgba(228,0,46,.12)]">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#e4002e]">{kicker}</p>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-[-.02em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/55">{desc}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.14em] text-black">Start trading <ArrowRight size={15} className="text-[#e4002e] transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-black/40">/// Trading platforms</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-[-.035em] sm:text-5xl">Choose your platform.</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[["Axi app", "Live analysis, portfolio view and mobile trading in one place.", "/dashboard/"], ["MetaTrader 4", "The classic, reliable terminal with WebTrader in your browser.", "/mt4-webtrader/"], ["MetaTrader 5", "Advanced multi-asset charting and algorithmic trading.", "/mt5-webtrader/"], ["Copy trading", "Mirror experienced traders automatically.", "/copy-trading/"]].map(([title, desc, href]) => (
                <Link key={title} href={href} className="group rounded-[24px] bg-[#0b0b0c] p-7 text-white transition hover:bg-[#1a1a1c]">
                  <h3 className="text-xl font-extrabold tracking-[-.02em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/50">{desc}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.14em]">Open <ArrowRight size={15} className="text-[#e4002e] transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 pb-14 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-7 rounded-[28px] bg-[#e4002e] p-8 text-white sm:p-12 lg:flex-row lg:items-center"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/65">Ready when you are</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] sm:text-4xl">Build your trading workspace.</h2></div><Link href="/register/" className="rounded-md bg-white px-7 py-4 text-xs font-extrabold uppercase tracking-[.14em] text-[#e4002e]">Open account</Link></div></section>
      </main>

      <section className="border-t border-black/10 bg-white"><div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8"><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-black/50">Risk warning</h2><p className="mt-3 max-w-4xl text-xs leading-5 text-black/45">Trading leveraged products carries a high level of risk and may not be suitable for all investors. The value of your investments can go down as well as up, and you may get back less than you put in. Past performance is not a reliable indicator of future results. Nothing on this platform is intended as investment advice. Demo or illustrative content, where shown, operates in a simulated environment and may differ from live trading conditions.</p></div></section>
      <footer className="bg-[#0b0b0c] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div><AxiMark /><p className="mt-4 max-w-[240px] text-sm leading-6 text-white/50">Trade your edge — with confidence.</p></div>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/40">Trade</p><div className="mt-4 grid gap-3 text-sm font-semibold text-white/70"><Link href="/markets/" className="hover:text-white">Markets</Link><Link href="/trading/" className="hover:text-white">Trading</Link><Link href="/copy-trading/" className="hover:text-white">Copy trading</Link><Link href="/watchlist/" className="hover:text-white">Watchlist</Link></div></div>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/40">Platforms</p><div className="mt-4 grid gap-3 text-sm font-semibold text-white/70"><Link href="/mt4-webtrader/" className="hover:text-white">MT4 WebTrader</Link><Link href="/mt5-webtrader/" className="hover:text-white">MT5 WebTrader</Link><Link href="/dashboard/" className="hover:text-white">Dashboard</Link><Link href="/wallet/" className="hover:text-white">Wallet</Link></div></div>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/40">Support</p><div className="mt-4 grid gap-3 text-sm font-semibold text-white/70"><Link href="/helpcenter/" className="hover:text-white">Help center</Link><Link href="/help/" className="hover:text-white">Help</Link><Link href="/login/" className="hover:text-white">Login</Link><Link href="/register/" className="hover:text-white">Open account</Link></div></div>
        </div>
        <div className="border-t border-white/10"><div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© AxiTrades. All rights reserved.</span><span>www.axitrades.com</span></div></div>
      </footer>
      <LiveChatBot />
    </div>
  );
}
