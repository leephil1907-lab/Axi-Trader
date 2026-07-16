"use client";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("axi_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("axi_token", token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("axi_token");
}

export function getClientUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("axi_user");
  return data ? JSON.parse(data) : null;
}

export function setClientUser(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("axi_user", JSON.stringify(user));
}

export function clearClientAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("axi_token");
  localStorage.removeItem("axi_user");
}
