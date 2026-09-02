"use client";

import Link from "next/link";
import { ArrowLeft, Copy, AlertTriangle } from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";

export default function CopyTradingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3"><button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED]"><ArrowLeft size={20}/></button><h1 className="text-lg font-bold">Copy Trading</h1></div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="p-6 bg-[#F5F2ED] rounded-2xl border border-[#D9D3CB]">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4"><Copy size={22} className="text-[#D31C2B]"/></div>
          <h2 className="text-xl font-black mb-2">Copy trading is not configured</h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-5">Trader profiles, performance statistics, follower counts, and copy orders must come from a verified live provider and execution service. No sample traders or paper-copy actions are displayed.</p>
          <div className="flex items-start gap-2 p-4 bg-white rounded-xl"><AlertTriangle size={16} className="text-[#D31C2B] shrink-0 mt-0.5"/><p className="text-xs text-[#6B6560]">Configure a real copy-trading provider before enabling this feature.</p></div>
          <Link href="/dashboard/" className="inline-block mt-5 px-5 py-3 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold">Back to Dashboard</Link>
        </div>
      </main>
      <LiveChatBot />
    </div>
  );
}
