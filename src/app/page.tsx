"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  TrendingUp, BarChart3, Shield, Globe, Zap, Award, Star, Users, Clock,
  ChevronRight, ArrowRight, Play, Monitor, Download, Check, Trophy,
  Smartphone, Cpu, Headphones, BookOpen, ChevronDown, Menu, X
} from "lucide-react";
import { realMarkets } from "@/lib/data";
import { PLATFORMS } from "@/lib/countries";
import AssetIcon from "@/components/AssetIcon";
import LiveChatBot from "@/components/LiveChatBot";

export default function HomePage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [livePrices, setLivePrices] = useState(realMarkets.slice(0, 8));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices((prev) =>
        prev.map((m) => {
          const volatility = m.category === "crypto" ? 0.002 : m.category === "forex" ? 0.0001 : 0.001;
          const change = (Math.random() - 0.5) * volatility * m.price;
          const newPrice = Math.max(0, m.price + change);
          return { ...m, price: newPrice };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: "200+", label: "Trading Instruments", icon: BarChart3 },
    { value: "0.0", label: "Pips Spread from", icon: TrendingUp },
    { value: "500:1", label: "Max Leverage", icon: Zap },
    { value: "60K+", label: "Active Traders", icon: Users },
  ];

  const features = [
    { icon: Globe, title: "Global Markets", desc: "Trade Forex, Crypto, Indices, Commodities & Shares from a single platform" },
    { icon: Shield, title: "Regulated & Secure", desc: "FCA, ASIC, DFSA & FSCA regulated with segregated client funds" },
    { icon: Zap, title: "Fast Execution", desc: "Sub-100ms execution with 99.9% fill rate on market orders" },
    { icon: Award, title: "Award Winning", desc: "Best Forex Broker 2025 — recognized by 15+ industry awards" },
  ];

  const awards = [
    { title: "Best Forex Provider", year: "2025", org: "Investment Trends" },
    { title: "Best MT4 Broker", year: "2024", org: "ForexBrokers.com" },
    { title: "Best Trading Platform", year: "2024", org: "Global Forex Awards" },
    { title: "Most Trusted Broker", year: "2025", org: "FXEmpire" },
  ];

  const faqs = [
    { q: "What is the minimum deposit?", a: "You can start trading with $0 on a Standard account. Pro accounts require $1,000 minimum, and Elite accounts require $25,000." },
    { q: "Is Axi regulated?", a: "Yes, Axi is regulated by FCA (UK), ASIC (Australia), DFSA (Dubai), and FSCA (South Africa). Your funds are held in segregated accounts." },
    { q: "What platforms can I use?", a: "We offer MetaTrader 4, MetaTrader 5, and our proprietary Axi Trading Platform. All are available on web, desktop (Windows/Mac), iOS, and Android." },
    { q: "How fast are withdrawals?", a: "Withdrawals are processed within 24-48 hours for verified accounts. Crypto withdrawals are typically fastest, while bank transfers may take 1-3 business days." },
    { q: "Do you offer copy trading?", a: "Yes! Our Copy Trading feature lets you automatically replicate the trades of top-performing traders. You can set your own risk limits and stop copying anytime." },
  ];

  const platforms = [
    { name: "MetaTrader 4", desc: "Industry standard with 99.9% reliability", icon: Monitor, color: "#1A1A1A" },
    { name: "MetaTrader 5", desc: "Next-gen with more timeframes & order types", icon: Cpu, color: "#D31C2B" },
    { name: "Axi Mobile App", desc: "Trade on the go with 650+ markets", icon: Smartphone, color: "#F5C842" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" ref={ref}>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#D9D3CB]">
        <div className="container-axi flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1">
            <svg viewBox="0 0 200 60" className="w-20 h-auto">
              <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="900" fill="#D31C2B" letterSpacing="-2">axi</text>
              <polygon points="100,8 113,8 107,22" fill="#D31C2B" />
            </svg>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/markets/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B] transition-colors">Markets</Link>
            <Link href="/copy-trading/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B] transition-colors">Copy Trading</Link>
            <Link href="/helpcenter/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B] transition-colors">Help</Link>
            <Link href="/login/" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#D31C2B] transition-colors">Login</Link>
            <Link href="/register/" className="btn-yellow">Open Account</Link>
          </nav>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden bg-white border-t border-[#D9D3CB] px-6 py-4 space-y-3">
            <Link href="/markets/" className="block text-sm font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Markets</Link>
            <Link href="/copy-trading/" className="block text-sm font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Copy Trading</Link>
            <Link href="/helpcenter/" className="block text-sm font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Help</Link>
            <Link href="/login/" className="block text-sm font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link href="/register/" className="block btn-yellow w-full text-center" onClick={() => setMobileMenuOpen(false)}>Open Account</Link>
          </motion.div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-[90vh] bg-[#1A1A1A] overflow-hidden flex items-center pt-16">
        <motion.div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#D31C2B]/10 blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-[#F5C842]/10 blur-3xl" animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="container-axi relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div style={{ y, opacity }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#D31C2B]/10 rounded-full mb-6">
              <Star size={14} className="text-[#D31C2B]" />
              <span className="text-sm font-bold text-[#D31C2B]">#1 Rated Forex Broker 2025</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Trade with <span className="text-[#F5C842]">Confidence</span> on a World-Class Platform
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed">
              Access 200+ instruments across Forex, Crypto, Indices, Commodities & Shares with ultra-competitive spreads and lightning-fast execution.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4">
              <Link href="/register/" className="btn-yellow text-sm">Open Account</Link>
              <Link href="/markets/" className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded hover:bg-white/10 transition-colors">
                Explore Markets <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-6 mt-10 text-white/40 text-xs">
              <span className="flex items-center gap-1"><Shield size={12} /> FCA Regulated</span>
              <span className="flex items-center gap-1"><Clock size={12} /> 24/5 Support</span>
              <span className="flex items-center gap-1"><Zap size={12} /> Sub-100ms</span>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
            <div className="bg-[#2D2D2D] rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">Live Market Prices</h3>
                <span className="flex items-center gap-1 text-[10px] text-[#22A958]"><span className="w-2 h-2 rounded-full bg-[#22A958] animate-pulse" /> Live</span>
              </div>
              <div className="space-y-2">
                {livePrices.map((m) => (
                  <div key={m.symbol} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={m.symbol} size={28} />
                      <div><p className="text-white text-sm font-bold">{m.symbol}</p><p className="text-white/40 text-[10px]">{m.name}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono-axi text-sm font-bold">{m.price >= 1000 ? m.price.toLocaleString("en-US", { minimumFractionDigits: 2 }) : m.price.toFixed(m.price >= 10 ? 2 : 4)}</p>
                      <p className={`text-xs font-bold ${m.changePercent >= 0 ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{m.changePercent >= 0 ? "+" : ""}{m.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#F5F2ED] py-12">
        <div className="container-axi">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <motion.div key={s.label} variants={itemVariants} className="text-center">
                <s.icon size={24} className="mx-auto mb-2 text-[#D31C2B]" />
                <p className="text-2xl md:text-3xl font-black text-[#1A1A1A]">{s.value}</p>
                <p className="text-xs text-[#9B9590] font-bold mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-padding">
        <div className="container-axi">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">Why Trade with Axi?</h2>
            <p className="text-[#9B9590] max-w-xl mx-auto">Trusted by over 60,000 traders worldwide with industry-leading conditions</p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={itemVariants} className="p-6 bg-[#F5F2ED] rounded-2xl hover:shadow-lg transition-shadow">
                <f.icon size={28} className="text-[#D31C2B] mb-4" />
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{f.title}</h3>
                <p className="text-sm text-[#9B9590] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* LIVE PRICES TABLE */}
      <section className="bg-[#1A1A1A] section-padding">
        <div className="container-axi">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">A World of Opportunity</h2>
            <p className="text-white/50 max-w-xl mx-auto">Ultra-competitive pricing and fairer charges, so more of your money is invested in the markets.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#2D2D2D] rounded-2xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Instrument</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Bid</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Ask</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Spread</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {realMarkets.slice(0, 10).map((m) => (
                    <tr key={m.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <AssetIcon symbol={m.symbol} size={28} />
                          <div><p className="text-white text-sm font-bold">{m.symbol}</p><p className="text-white/40 text-[10px]">{m.name}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-mono-axi text-white">{m.bid?.toFixed(m.price >= 1000 ? 2 : m.price >= 10 ? 2 : 4)}</td>
                      <td className="px-6 py-3 text-right text-sm font-mono-axi text-white">{m.ask?.toFixed(m.price >= 1000 ? 2 : m.price >= 10 ? 2 : 4)}</td>
                      <td className="px-6 py-3 text-right text-sm font-mono-axi text-[#F5C842]">{m.spread}</td>
                      <td className={`px-6 py-3 text-right text-sm font-bold ${m.changePercent >= 0 ? "text-[#22A958]" : "text-[#D31C2B]"}`}>{m.changePercent >= 0 ? "+" : ""}{m.changePercent.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-white/10">
              <Link href="/markets/" className="inline-flex items-center gap-2 text-[#F5C842] text-sm font-bold hover:underline">
                View All Markets <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARKETS CATEGORIES */}
      <section className="section-padding">
        <div className="container-axi">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">Discover Popular Markets</h2>
            <p className="text-[#9B9590] max-w-xl mx-auto">Trade 200+ instruments across all major asset classes</p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "Forex", count: "50+", desc: "Major, minor & exotic pairs", icon: "💱", color: "#003399" },
              { name: "Crypto", count: "15+", desc: "Bitcoin, Ethereum & altcoins", icon: "₿", color: "#F7931A" },
              { name: "Indices", count: "20+", desc: "Global stock indices", icon: "📊", color: "#1A1A1A" },
              { name: "Commodities", count: "10+", desc: "Gold, oil & agriculture", icon: "🛢️", color: "#D4AF37" },
              { name: "Shares", count: "100+", desc: "US, EU & AU equities", icon: "🏢", color: "#22A958" },
            ].map((cat) => (
              <motion.div key={cat.name} variants={itemVariants}>
                <Link href={`/markets/`} className="block p-6 bg-[#F5F2ED] rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 text-center">
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{cat.name}</h3>
                  <p className="text-xs text-[#9B9590] mb-2">{cat.desc}</p>
                  <span className="inline-block px-2 py-1 bg-white rounded-lg text-xs font-bold" style={{ color: cat.color }}>{cat.count} instruments</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="bg-[#F5F2ED] section-padding">
        <div className="container-axi">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">Powerful Platforms</h2>
            <p className="text-[#9B9590] max-w-xl mx-auto">Industry-standard tools with innovative technology</p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {platforms.map((p) => (
              <motion.div key={p.name} variants={itemVariants} className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: p.color + "15" }}>
                  <p.icon size={28} style={{ color: p.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{p.name}</h3>
                <p className="text-sm text-[#9B9590] mb-6">{p.desc}</p>
                <div className="flex flex-col gap-2">
                  <Link href={p.name.includes("MT4") ? "/mt4-webtrader/" : p.name.includes("MT5") ? "/mt5-webtrader/" : "/register/"} className="btn-yellow text-xs w-full justify-center">Launch WebTrader</Link>
                  <button className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#1A1A1A] py-2 hover:text-[#D31C2B] transition-colors">
                    <Download size={14} /> Download App
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* COPY TRADING */}
      <section className="section-padding">
        <div className="container-axi">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">Copy Trading</h2>
              <p className="text-[#9B9590] mb-6 leading-relaxed">Automatically replicate the trades of top-performing traders. Set your own risk limits, choose your allocation, and let the experts trade for you.</p>
              <ul className="space-y-3 mb-8">
                {["Browse 500+ verified traders", "Set custom risk limits", "Real-time performance tracking", "Stop copying anytime"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#1A1A1A]"><Check size={16} className="text-[#22A958] shrink-0" /> {item}</li>
                ))}
              </ul>
              <Link href="/copy-trading/" className="btn-yellow text-sm">Explore Copy Trading</Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#F5F2ED] rounded-2xl p-6">
              <div className="space-y-3">
                {[
                  { name: "Alexander Chen", return: "+287.5%", followers: "12.4K", risk: "Low", avatar: "AC" },
                  { name: "Sarah Williams", return: "+412.3%", followers: "8.9K", risk: "Medium", avatar: "SW" },
                  { name: "Marcus Johnson", return: "+156.8%", followers: "5.6K", risk: "Low", avatar: "MJ" },
                ].map((t) => (
                  <div key={t.name} className="flex items-center gap-4 p-4 bg-white rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                    <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">{t.name}</p><p className="text-[10px] text-[#9B9590]">{t.followers} followers · {t.risk} risk</p></div>
                    <span className="text-sm font-bold text-[#22A958]">{t.return}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section className="bg-[#1A1A1A] section-padding">
        <div className="container-axi">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Award-Winning Service</h2>
            <p className="text-white/50 max-w-xl mx-auto">Recognized globally for excellence in trading services</p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((a) => (
              <motion.div key={a.title} variants={itemVariants} className="bg-[#2D2D2D] rounded-2xl p-6 text-center border border-white/10">
                <Trophy size={32} className="mx-auto mb-4 text-[#F5C842]" />
                <h3 className="text-lg font-bold text-white mb-1">{a.title}</h3>
                <p className="text-[#F5C842] text-sm font-bold">{a.year}</p>
                <p className="text-white/40 text-xs mt-1">{a.org}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-axi max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#9B9590]">Everything you need to know about trading with Axi</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-[#F5F2ED] rounded-2xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-bold text-[#1A1A1A]">{faq.q}</span>
                  <ChevronDown size={18} className={`text-[#9B9590] transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-4">
                    <p className="text-sm text-[#6B6560] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#D31C2B] py-20">
        <div className="container-axi text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Start Trading?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">Join 60,000+ traders worldwide. Open your account in minutes and start trading with confidence.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register/" className="bg-white text-[#D31C2B] font-bold text-sm uppercase tracking-wider px-8 py-4 rounded hover:bg-white/90 transition-colors">Open Account</Link>
              <Link href="/helpcenter/" className="border border-white/30 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded hover:bg-white/10 transition-colors">Learn More</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1A1A] py-16">
        <div className="container-axi">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <svg viewBox="0 0 200 60" className="w-20 h-auto mb-4">
                <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="900" fill="#D31C2B" letterSpacing="-2">axi</text>
                <polygon points="100,8 113,8 107,22" fill="#D31C2B" />
              </svg>
              <p className="text-white/40 text-sm leading-relaxed">Professional trading platform with real-time market data, copy trading, and advanced charting tools.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Markets</h4>
              <ul className="space-y-2">
                {["Forex", "Crypto", "Indices", "Commodities", "Shares"].map((item) => (
                  <li key={item}><Link href="/markets/" className="text-white/40 text-sm hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                {["About Us", "Contact", "Help Center", "Regulation", "Careers"].map((item) => (
                  <li key={item}><Link href="/helpcenter/" className="text-white/40 text-sm hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Support</h4>
              <ul className="space-y-2">
                {["Live Chat", "Email Support", "Phone: +1-800-AXI-TRADE", "FAQ", "Status Page"].map((item) => (
                  <li key={item}><span className="text-white/40 text-sm">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs">© 2025 Axi. All rights reserved. Axi is a registered trademark.</p>
            <div className="flex gap-4">
              <span className="text-white/30 text-xs">Privacy Policy</span>
              <span className="text-white/30 text-xs">Terms of Service</span>
              <span className="text-white/30 text-xs">Risk Disclosure</span>
            </div>
          </div>
        </div>
      </footer>

      <LiveChatBot />
    </div>
  );
}
