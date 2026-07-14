"use client";

import { DollarSign, Bitcoin, BarChart3, Gem, Building2, TrendingUp } from "lucide-react";

interface AssetIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function AssetIcon({ symbol, size = 32, className = "" }: AssetIconProps) {
  const getIcon = () => {
    if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("XRP") || symbol.includes("SOL") || symbol.includes("ADA") || symbol.includes("DOGE")) {
      return <Bitcoin size={size * 0.5} className="text-white" />;
    }
    if (symbol.includes("XAU") || symbol.includes("XAG") || symbol.includes("OIL") || symbol.includes("BRENT") || symbol.includes("NATGAS") || symbol.includes("COPPER")) {
      return <Gem size={size * 0.5} className="text-white" />;
    }
    if (symbol.includes("US30") || symbol.includes("US500") || symbol.includes("NAS") || symbol.includes("UK100") || symbol.includes("GER") || symbol.includes("JPN")) {
      return <BarChart3 size={size * 0.5} className="text-white" />;
    }
    if (symbol.includes("TSLA") || symbol.includes("AAPL") || symbol.includes("MSFT") || symbol.includes("GOOGL") || symbol.includes("AMZN") || symbol.includes("NVDA") || symbol.includes("META")) {
      return <Building2 size={size * 0.5} className="text-white" />;
    }
    return <DollarSign size={size * 0.5} className="text-white" />;
  };

  const getBgColor = () => {
    if (symbol.includes("BTC")) return "#F7931A";
    if (symbol.includes("ETH")) return "#627EEA";
    if (symbol.includes("XRP")) return "#23292F";
    if (symbol.includes("SOL")) return "#14F195";
    if (symbol.includes("ADA")) return "#0033AD";
    if (symbol.includes("DOGE")) return "#C2A633";
    if (symbol.includes("XAU")) return "#D4AF37";
    if (symbol.includes("XAG")) return "#C0C0C0";
    if (symbol.includes("OIL") || symbol.includes("BRENT") || symbol.includes("NATGAS")) return "#1A1A1A";
    if (symbol.includes("COPPER")) return "#B87333";
    if (symbol.includes("US30") || symbol.includes("US500") || symbol.includes("NAS")) return "#1A1A1A";
    if (symbol.includes("UK100")) return "#012169";
    if (symbol.includes("GER40")) return "#FFCE00";
    if (symbol.includes("JPN225")) return "#BC002D";
    if (symbol.includes("TSLA")) return "#CC0000";
    if (symbol.includes("AAPL")) return "#555555";
    if (symbol.includes("MSFT")) return "#00A4EF";
    if (symbol.includes("GOOGL")) return "#4285F4";
    if (symbol.includes("AMZN")) return "#FF9900";
    if (symbol.includes("NVDA")) return "#76B900";
    if (symbol.includes("META")) return "#0668E1";
    if (symbol.includes("EUR")) return "#003399";
    if (symbol.includes("GBP")) return "#012169";
    if (symbol.includes("JPY")) return "#BC002D";
    if (symbol.includes("AUD")) return "#00008B";
    if (symbol.includes("CAD")) return "#FF0000";
    if (symbol.includes("NZD")) return "#00247D";
    if (symbol.includes("CHF")) return "#DA291C";
    return "#D31C2B";
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: getBgColor() }}
    >
      {getIcon()}
    </div>
  );
}
