"use client";

import { CreditCard, Landmark, Wallet } from "lucide-react";

export type BrandMethod = {
  key?: string | null;
  name?: string | null;
  type?: string | null;
  asset?: string | null;
  logoUrl?: string | null;
};

const haystack = (m: BrandMethod) =>
  `${m.key || ""} ${m.name || ""} ${m.asset || ""}`.toLowerCase();

/* ---------------- Card & e-wallet brand marks (inline SVG, offline-safe) ---------------- */

function MastercardMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.68} viewBox="0 0 36 22" role="img" aria-label="Mastercard">
      <circle cx="12.5" cy="11" r="7.5" fill="#EB001B" />
      <circle cx="23.5" cy="11" r="7.5" fill="#F79E1B" />
      <path d="M18 5.9 A7.5 7.5 0 0 1 18 16.1 A7.5 7.5 0 0 0 18 5.9 Z" fill="#FF5F00" />
    </svg>
  );
}

function VisaMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.68} viewBox="0 0 48 30" role="img" aria-label="Visa">
      <rect x="0.5" y="0.5" width="47" height="29" rx="4" fill="#fff" stroke="#d7dae0" />
      <text x="24" y="21.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" letterSpacing="1.5" fill="#1A1F71">VISA</text>
    </svg>
  );
}

function PaypalMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 40 32" role="img" aria-label="PayPal">
      <text x="20" y="25" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontStyle="italic" fontSize="24" fill="#009CDE">P</text>
      <text x="16.5" y="25" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontStyle="italic" fontSize="24" fill="#003087">P</text>
    </svg>
  );
}

function SkrillMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 72 28" role="img" aria-label="Skrill">
      <text x="36" y="20" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontStyle="italic" fontSize="17" letterSpacing="0.5" fill="#5B2D83">SKRILL</text>
    </svg>
  );
}

function NetellerMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.42} viewBox="0 0 88 30" role="img" aria-label="Neteller">
      <text x="42" y="20" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="15" letterSpacing="0.5" fill="#111">NETELLER</text>
      <circle cx="81" cy="14" r="4" fill="#7AB929" />
    </svg>
  );
}

/* ---------------- Crypto marks ---------------- */

const CRYPTO_COLORS: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B", USDC: "#2775CA",
  BNB: "#F0B90B", LTC: "#345D9D", DOGE: "#C2A633", XRP: "#23292F",
  SOL: "#14F195", TRX: "#EB0029", ADA: "#0033AD", TON: "#0098EA",
};

function EthGlyph({ size }: { size: number }) {
  const s = size * 0.62;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" role="img" aria-label="Ethereum">
      <polygon points="12,2 4.5,12.2 12,15.5 19.5,12.2" fill="#8A9AFD" />
      <polygon points="12,2 12,15.5 19.5,12.2" fill="#627EEA" opacity="0.85" />
      <polygon points="12,16.8 4.5,13.4 12,22 19.5,13.4" fill="#627EEA" />
      <polygon points="12,16.8 12,22 19.5,13.4" fill="#3C4ED8" opacity="0.9" />
    </svg>
  );
}

function SolGlyph({ size }: { size: number }) {
  const s = size * 0.62;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" role="img" aria-label="Solana">
      <defs><linearGradient id="solg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#14F195" /><stop offset="1" stopColor="#9945FF" /></linearGradient></defs>
      <polygon points="7,4 17,4 14.5,8.5 4.5,8.5" fill="url(#solg)" />
      <polygon points="7,10 17,10 14.5,14.5 4.5,14.5" fill="url(#solg)" />
      <polygon points="7,16 17,16 14.5,20.5 4.5,20.5" fill="url(#solg)" />
    </svg>
  );
}

const CRYPTO_GLYPH: Record<string, string> = {
  BTC: "₿", USDT: "₮", USDC: "C", BNB: "◆", LTC: "Ł", DOGE: "Ð",
  XRP: "X", TRX: "T", ADA: "A", TON: "T",
};

function CryptoMark({ asset, size }: { asset: string; size: number }) {
  const code = asset.trim().toUpperCase();
  const color = CRYPTO_COLORS[code] || "#17191a";
  if (code === "ETH") {
    return <span className="grid place-items-center rounded-full bg-[#eef0fe]" style={{ width: size, height: size }}><EthGlyph size={size} /></span>;
  }
  if (code === "SOL") {
    return <span className="grid place-items-center rounded-full bg-[#101418]" style={{ width: size, height: size }}><SolGlyph size={size} /></span>;
  }
  const glyph = CRYPTO_GLYPH[code] || code.slice(0, 1) || "C";
  const dark = ["XRP", "TON"].includes(code);
  return (
    <span className="grid place-items-center rounded-full font-black" style={{ width: size, height: size, background: color, color: dark ? "#fff" : code === "BNB" || code === "DOGE" ? "#fff" : "#fff", fontSize: size * 0.52 }} aria-label={code} role="img">
      {glyph}
    </span>
  );
}

/* ---------------- Resolver ---------------- */

export function brandKindOf(m: BrandMethod): string {
  const hay = haystack(m);
  if (hay.includes("mastercard")) return "mastercard";
  if (hay.includes("visa")) return "visa";
  if (hay.includes("paypal")) return "paypal";
  if (hay.includes("skrill")) return "skrill";
  if (hay.includes("neteller")) return "neteller";
  const asset = (m.asset || "").trim().toUpperCase();
  if (m.type === "crypto" || (asset && CRYPTO_COLORS[asset])) return `crypto:${asset || "?"}`;
  if (m.type === "card") return "card";
  if (m.type === "bank") return "bank";
  return "wallet";
}

/**
 * Precise, offline-safe brand mark for a funding method.
 * Honors an admin-provided logoUrl first; otherwise renders the exact
 * brand artwork (Mastercard/Visa/PayPal/Skrill/Neteller/crypto) or a
 * neutral terminal icon.
 */
export function BrandMark({ method, size = 40 }: { method: BrandMethod; size?: number }) {
  const kind = brandKindOf(method);
  if (method.logoUrl) {
    return <img src={method.logoUrl} alt={method.name || "Payment method"} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  if (kind === "mastercard") return <MastercardMark size={size} />;
  if (kind === "visa") return <VisaMark size={size} />;
  if (kind === "paypal") return <PaypalMark size={size} />;
  if (kind === "skrill") return <SkrillMark size={size} />;
  if (kind === "neteller") return <NetellerMark size={size} />;
  if (kind.startsWith("crypto:")) return <CryptoMark asset={kind.slice(7)} size={size} />;
  const iconCls = "text-[#17191a]";
  if (kind === "card") return <CreditCard size={size * 0.55} className={iconCls} />;
  if (kind === "bank") return <Landmark size={size * 0.55} className={iconCls} />;
  return <Wallet size={size * 0.55} className={iconCls} />;
}
