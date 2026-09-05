"use client";

import { useEffect, useRef } from "react";

type Props = { symbol: string };

function toTradingViewSymbol(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "";
  if (normalized.includes(":")) return normalized;
  const forex = normalized.replace("/", "");
  if (/^[A-Z]{6}$/.test(forex)) return `FX:${forex}`;
  if (/^(XAU|XAG)USD$/.test(forex)) return `OANDA:${forex}`;
  if (/^BTCUSD$/.test(forex)) return "COINBASE:BTCUSD";
  if (/^ETHUSD$/.test(forex)) return "COINBASE:ETHUSD";
  return normalized;
}

export function TradingViewChart({ symbol }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const tvSymbol = toTradingViewSymbol(symbol);

  useEffect(() => {
    if (!host.current || !tvSymbol) return;
    host.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com"
    });
    host.current.appendChild(script);
    return () => { if (host.current) host.current.innerHTML = ""; };
  }, [tvSymbol]);

  if (!tvSymbol) {
    return <div className="grid h-[420px] place-items-center bg-[#f6f4f0] text-sm text-[#777a7b]">Select an instrument to load its chart.</div>;
  }

  return <div ref={host} className="h-[420px] w-full overflow-hidden bg-white" aria-label={`${symbol} TradingView chart`} />;
}
