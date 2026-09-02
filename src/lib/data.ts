export const categoryFilters = [
  { id: "popular", label: "Popular", icon: "Star" },
  { id: "forex", label: "Forex", icon: "DollarSign" },
  { id: "crypto", label: "Crypto", icon: "Bitcoin" },
  { id: "indices", label: "Indices", icon: "BarChart3" },
  { id: "commodities", label: "Commodities", icon: "Gem" },
  { id: "shares", label: "Shares", icon: "Building2" },
];

export const helpArticles = [
  { id: "getting-started", category: "Getting Started", title: "Opening an AxiTrades account", content: "Create an account, complete required verification, and review the funding and trading requirements before using the platform.", tags: ["account", "registration", "verification"], views: 0 },
  { id: "funding", category: "Funding", title: "Funding and withdrawals", content: "Available funding methods, currencies, limits, instructions, and processing states are loaded from configured server-side funding methods.", tags: ["deposit", "withdrawal", "funding"], views: 0 },
  { id: "trading", category: "Trading", title: "Trading execution", content: "Orders are accepted only when a real broker execution adapter is configured. The platform does not manufacture fills or paper trades.", tags: ["orders", "execution", "broker"], views: 0 },
  { id: "platforms", category: "Platforms", title: "Trading platforms", content: "Platform connectivity and account availability depend on the live broker integration configured for the deployment.", tags: ["mt4", "mt5", "platform"], views: 0 },
  { id: "security", category: "Account", title: "Account security", content: "Authentication, authorization, transaction records, KYC records, and account balances are handled server-side.", tags: ["security", "authentication", "account"], views: 0 },
];
