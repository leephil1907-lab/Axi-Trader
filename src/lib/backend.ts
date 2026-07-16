"use client";

import { User, Transaction, OpenTrade, KycDocument } from "@/types";

const STORAGE_KEYS = {
  USER: "axi_user",
  TRANSACTIONS: "axi_transactions",
  TRADES: "axi_trades",
  BALANCE: "axi_balance",
  SESSION: "axi_session",
  WATCHLIST: "axi_watchlist",
  SETTINGS: "axi_settings",
  KYC_DOCS: "axi_kyc_docs",
  USERS: "axi_users",
};

// User Management (client-side)
export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

// Balance
export function getBalance(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem(STORAGE_KEYS.BALANCE);
  return data ? parseFloat(data) : 0;
}

export function setBalance(amount: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BALANCE, amount.toString());
}

// Trades
export function getTrades(): OpenTrade[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRADES);
  return data ? JSON.parse(data) : [];
}

export function setTrades(trades: OpenTrade[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
}

// Transactions
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
}

export function addTransaction(tx: Transaction): void {
  if (typeof window === "undefined") return;
  const txs = getTransactions();
  txs.push(tx);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
}

export function setTransactions(txs: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
}

// KYC Docs
export function getKycDocuments(): KycDocument[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.KYC_DOCS);
  return data ? JSON.parse(data) : [];
}

export function addKycDocument(doc: KycDocument): void {
  if (typeof window === "undefined") return;
  const docs = getKycDocuments();
  docs.push(doc);
  localStorage.setItem(STORAGE_KEYS.KYC_DOCS, JSON.stringify(docs));
}

// Watchlist
export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  return data ? JSON.parse(data) : [];
}

export function setWatchlist(symbols: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(symbols));
}

// Settings
export function getSettings(): Record<string, any> {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {};
}

export function setSettings(settings: Record<string, any>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Format money
export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Seed demo data
export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEYS.USER)) return; // Already seeded

  const demoUser: User = {
    id: "demo-user-001",
    email: "demo@axi.com",
    name: "Demo Trader",
    firstName: "Demo",
    lastName: "Trader",
    phone: "+1234567890",
    country: "US",
    language: "en",
    currency: "USD",
    accountType: "standard",
    platform: "mt5",
    role: "user",
    status: "active",
    kycStatus: "verified",
    balance: 10000,
    equity: 10250,
    margin: 500,
    freeMargin: 9750,
    marginLevel: 2050,
    totalProfit: 1250,
    totalLoss: 0,
    createdAt: new Date(),
    lastLogin: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
  localStorage.setItem(STORAGE_KEYS.BALANCE, "10000");
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(["EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"]));
}
