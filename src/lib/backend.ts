"use client";

/**
 * Presentation helpers only.
 *
 * Financial/account state MUST come from the authenticated API/database.
 * This module contains formatting utilities only and never owns financial state.
 */
export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}
