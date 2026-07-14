export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  status: "active" | "pending" | "suspended";
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  totalProfit: number;
  totalLoss: number;
  createdAt: Date;
}

export interface Trader {
  id: string;
  name: string;
  avatar: string;
  strategy: string;
  riskScore: number;
  followers: number;
  totalReturn: number;
  monthlyReturn: number;
  winRate: number;
  tradesCount: number;
  avgTradeDuration: string;
  profitFactor: number;
  isPro: boolean;
  performance: { month: string; return: number }[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  method: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  category: "forex" | "crypto" | "indices" | "commodities" | "shares";
  leverage?: string;
  icon?: string;
  bid?: number;
  ask?: number;
  spread?: number;
}

export interface OpenTrade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: Date;
}

export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  views: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}
