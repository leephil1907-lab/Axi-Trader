"use client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
export default function MT4WebTrader(){return <main className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6"><div className="max-w-lg bg-white rounded-2xl p-8 border border-[#D9D3CB] text-center"><AlertTriangle className="mx-auto text-[#F5C842] mb-4" size={32}/><h1 className="text-2xl font-black">MT4 WebTrader unavailable</h1><p className="text-sm text-[#6B6560] mt-3">No real broker execution gateway is configured. This platform does not simulate prices, orders, or fills.</p><Link href="/dashboard/" className="inline-block mt-6 px-5 py-3 bg-[#1A1A1A] text-white rounded-lg font-bold">Back to Dashboard</Link></div></main>}
