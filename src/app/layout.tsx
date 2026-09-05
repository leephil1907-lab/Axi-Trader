import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.axitrades.com"),
  title: "Axi - Online Trading Broker | Forex, Crypto, CFDs",
  description: "Trade Forex, Crypto, Commodities & Indices with competitive spreads, fast execution, and professional trading tools.",
  keywords: ["forex trading", "crypto trading", "CFD trading", "MT4", "MT5", "online trading", "financial markets", "AXI"],
  authors: [{ name: "AXI Trading" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    siteName: "AXI Trading",
    title: "Axi - Online Trading Broker",
    description: "Trade Forex, Crypto, Commodities & Indices with competitive spreads and fast execution.",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@axi_trading",
    creator: "@axi_trading",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-axi-body antialiased">
        {children}
      </body>
    </html>
  );
}
