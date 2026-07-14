"use client";

import { User, Transaction, OpenTrade } from "@/types";

const STORAGE_KEYS = {
  USER: "axi_user",
  TRANSACTIONS: "axi_transactions",
  TRADES: "axi_trades",
  BALANCE: "axi_balance",
  SESSION: "axi_session",
  WATCHLIST: "axi_watchlist",
  SETTINGS: "axi_settings",
};

// User Management
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

// Balance Management
export function getBalance(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem(STORAGE_KEYS.BALANCE);
  return data ? parseFloat(data) : 12500.00; // Default starting balance
}

export function setBalance(amount: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BALANCE, amount.toString());
}

export function updateBalance(amount: number): void {
  const current = getBalance();
  setBalance(current + amount);
}

// Transaction Management
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  // Update balance
  if (transaction.status === "approved") {
    if (transaction.type === "deposit") {
      updateBalance(transaction.amount);
    } else if (transaction.type === "withdrawal") {
      updateBalance(-transaction.amount);
    }
  }
}

export function updateTransactionStatus(id: string, status: "pending" | "approved" | "rejected"): void {
  const transactions = getTransactions();
  const tx = transactions.find((t) => t.id === id);
  if (tx) {
    tx.status = status;
    if (status === "approved") {
      if (tx.type === "deposit") {
        updateBalance(tx.amount);
      } else if (tx.type === "withdrawal") {
        updateBalance(-tx.amount);
      }
    }
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }
}

// Trade Management
export function getTrades(): OpenTrade[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRADES);
  return data ? JSON.parse(data) : [];
}

export function addTrade(trade: OpenTrade): void {
  const trades = getTrades();
  trades.unshift(trade);
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
}

export function closeTrade(id: string, closePrice: number): number {
  const trades = getTrades();
  const trade = trades.find((t) => t.id === id);
  if (trade) {
    const profit = trade.type === "buy" 
      ? (closePrice - trade.openPrice) * trade.volume * 100000
      : (trade.openPrice - closePrice) * trade.volume * 100000;

    trade.currentPrice = closePrice;
    trade.profit = profit;

    // Remove from open trades
    const updatedTrades = trades.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(updatedTrades));

    // Update balance with profit/loss
    updateBalance(profit);

    return profit;
  }
  return 0;
}

export function updateTradePrices(currentPrices: Record<string, number>): void {
  const trades = getTrades();
  trades.forEach((trade) => {
    if (currentPrices[trade.symbol]) {
      trade.currentPrice = currentPrices[trade.symbol];
      trade.profit = trade.type === "buy"
        ? (trade.currentPrice - trade.openPrice) * trade.volume * 100000
        : (trade.openPrice - trade.currentPrice) * trade.volume * 100000;
    }
  });
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
}

// Watchlist
export function getWatchlist(): string[] {
  if (typeof window === "undefined") return ["EUR/USD", "BTC/USD", "XAU/USD"];
  const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  return data ? JSON.parse(data) : ["EUR/USD", "BTC/USD", "XAU/USD"];
}

export function setWatchlist(symbols: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(symbols));
}

export function toggleWatchlistSymbol(symbol: string): string[] {
  const current = getWatchlist();
  const updated = current.includes(symbol) 
    ? current.filter((s) => s !== symbol)
    : [...current, symbol];
  setWatchlist(updated);
  return updated;
}

// Settings
export function getSettings(): Record<string, any> {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    language: "en",
    currency: "EUR",
    darkMode: false,
    notifications: { trade: true, price: true, deposit: true, marketing: false },
    twoFA: false,
    biometric: false,
  };
}

export function setSettings(settings: Record<string, any>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format currency
export function formatMoney(amount: number, currency: string = "EUR"): string {
  const symbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };
  return `${symbols[currency] || "€"}${amount.toFixed(2)}`;
}
