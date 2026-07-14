"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, ChevronDown, ArrowLeft, BookOpen, Headphones, MessageCircle,
  Mail, Phone, Clock, Shield, FileText, CreditCard, Monitor, TrendingUp, Users
} from "lucide-react";
import { helpArticles } from "@/lib/data";
import LiveChatBot from "@/components/LiveChatBot";

const categories = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen, articles: 4 },
  { id: "funding", label: "Funding", icon: CreditCard, articles: 3 },
  { id: "platforms", label: "Platforms", icon: Monitor, articles: 2 },
  { id: "trading", label: "Trading", icon: TrendingUp, articles: 3 },
  { id: "copy-trading", label: "Copy Trading", icon: Users, articles: 1 },
  { id: "account", label: "Account", icon: Shield, articles: 2 },
  { id: "support", label: "Support", icon: Headphones, articles: 1 },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filtered = helpArticles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || a.category.toLowerCase().replace(/\s/g, "-") === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const article = helpArticles.find((a) => a.id === selectedArticle);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => selectedArticle ? setSelectedArticle(null) : activeCategory ? setActiveCategory(null) : window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">{selectedArticle ? "Article" : activeCategory ? "Help Center" : "Help Center"}</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {!selectedArticle && !activeCategory && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9590]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search help articles..." className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2ED] rounded-2xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20 placeholder:text-[#9B9590]" />
              </div>

              {/* Quick Contact */}
              <div className="p-4 bg-[#1A1A1A] rounded-2xl mb-6">
                <h2 className="text-lg font-black text-white mb-1">Need Help?</h2>
                <p className="text-white/50 text-sm mb-4">Our support team is available 24/5 to assist you</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 bg-[#333] rounded-xl text-center hover:bg-[#444] transition-colors">
                    <MessageCircle size={18} className="mx-auto mb-1 text-[#F5C842]" />
                    <p className="text-[10px] text-white font-bold">Live Chat</p>
                  </button>
                  <button className="p-3 bg-[#333] rounded-xl text-center hover:bg-[#444] transition-colors">
                    <Mail size={18} className="mx-auto mb-1 text-[#F5C842]" />
                    <p className="text-[10px] text-white font-bold">Email</p>
                  </button>
                  <button className="p-3 bg-[#333] rounded-xl text-center hover:bg-[#444] transition-colors">
                    <Phone size={18} className="mx-auto mb-1 text-[#F5C842]" />
                    <p className="text-[10px] text-white font-bold">Call</p>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Browse by Category</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {categories.map((cat) => (
                  <motion.button key={cat.id} whileTap={{ scale: 0.97 }} onClick={() => setActiveCategory(cat.id)} className="p-4 bg-[#F5F2ED] rounded-2xl text-left hover:shadow-md transition-shadow">
                    <cat.icon size={20} className="text-[#D31C2B] mb-2" />
                    <p className="text-sm font-bold text-[#1A1A1A]">{cat.label}</p>
                    <p className="text-[10px] text-[#9B9590]">{cat.articles} articles</p>
                  </motion.button>
                ))}
              </div>

              {/* Popular Articles */}
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Popular Articles</h3>
              <div className="space-y-2">
                {helpArticles.sort((a, b) => b.views - a.views).slice(0, 5).map((a) => (
                  <motion.button key={a.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedArticle(a.id)} className="w-full p-4 bg-[#F5F2ED] rounded-xl text-left flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">{a.title}</p>
                      <p className="text-[10px] text-[#9B9590]">{a.category} · {a.views.toLocaleString()} views</p>
                    </div>
                    <ChevronDown size={16} className="text-[#D9D3CB] -rotate-90" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeCategory && !selectedArticle && (
            <motion.div key="category" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-black text-[#1A1A1A] mb-4">{categories.find((c) => c.id === activeCategory)?.label}</h2>
              <div className="space-y-2">
                {filtered.map((a) => (
                  <motion.button key={a.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedArticle(a.id)} className="w-full p-4 bg-[#F5F2ED] rounded-xl text-left flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">{a.title}</p>
                      <p className="text-[10px] text-[#9B9590]">{a.views.toLocaleString()} views</p>
                    </div>
                    <ChevronDown size={16} className="text-[#D9D3CB] -rotate-90" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedArticle && article && (
            <motion.div key="article" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <span className="inline-block px-2 py-1 bg-[#F5F2ED] rounded-lg text-[10px] font-bold text-[#9B9590] uppercase mb-3">{article.category}</span>
              <h2 className="text-xl font-black text-[#1A1A1A] mb-4">{article.title}</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-[#6B6560] leading-relaxed whitespace-pre-line">{article.content}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-[#F5F2ED] rounded-lg text-[10px] font-bold text-[#9B9590] uppercase">{tag}</span>
                ))}
              </div>
              <div className="mt-8 p-4 bg-[#F5F2ED] rounded-2xl">
                <p className="text-sm font-bold text-[#1A1A1A] mb-2">Was this article helpful?</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-[#1A1A1A] hover:bg-[#22A958]/10 transition-colors">Yes, helpful</button>
                  <button className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-[#1A1A1A] hover:bg-[#D31C2B]/10 transition-colors">No, needs work</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveChatBot />
    </div>
  );
}
