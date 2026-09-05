"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import LiveChatBot from "@/components/LiveChatBot";

export default function MarketsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/markets/", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Live market data is unavailable.");
      setData(payload);
    } catch (error: any) {
      setError(error.message || "Live market data is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/" className="flex items-center gap-2 font-bold">
            <ArrowLeft size={20} /> Markets
          </Link>
          <button onClick={load} className="p-2 rounded-lg hover:bg-[#F5F2ED]" aria-label="Refresh market data">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        {error ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <AlertTriangle className="inline w-5 h-5 mr-2" />
            <strong>Live market data is unavailable.</strong>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : data ? (
          <>
            <div className="mb-5 p-3 rounded-xl bg-green-50 text-green-800 text-xs font-bold">
              LIVE · Source: {data.source}
            </div>
            <pre className="p-5 rounded-2xl bg-[#F5F2ED] overflow-auto text-xs">
              {JSON.stringify(data.data, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
      <LiveChatBot />
    </div>
  );
}
