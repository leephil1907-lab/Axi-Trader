"use client";

/**
 * Presentation helpers only.
 *
 * Financial/account state MUST come from the authenticated API/database.
 * This module intentionally contains no localStorage-backed balances,
 * trades, transactions, users, KYC records, or demo/seed data.
 */
export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}
