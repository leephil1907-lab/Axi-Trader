import Link from "next/link";
import { Bell, ChevronDown, CircleHelp, LayoutDashboard, LineChart, LogOut, Menu, Settings, Star, WalletCards, Layers3 } from "lucide-react";

const primary = [
  { label: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
  { label: "Watchlist", href: "/watchlist/", icon: Star },
  { label: "Markets", href: "/markets/", icon: LineChart },
  { label: "Positions", href: "/positions/", icon: WalletCards },
  { label: "Accounts", href: "/accounts/", icon: Layers3 },
];

export function AxiWordmark({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" aria-label="Axi home" className="inline-flex items-center gap-2">
      <span className="axi-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className={`text-[27px] font-black tracking-[-0.08em] ${dark ? "text-white" : "text-[#17191a]"}`}>axi</span>
    </Link>
  );
}

export function AxiAppShell({ children, active = "Dashboard" }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="min-h-screen bg-[#f0ede7] text-[#17191a]">
      <header className="sticky top-0 z-50 border-b border-[#dedbd5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center gap-5 px-4 sm:px-6 lg:px-8">
          <AxiWordmark />
          <nav className="hidden flex-1 items-center gap-1 xl:flex">
            {primary.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className={`flex items-center gap-2 rounded-md px-3.5 py-2.5 text-xs font-bold transition ${active === label ? "bg-[#f6f4f0] text-[#d61f2c]" : "text-[#66696a] hover:bg-[#f6f4f0] hover:text-[#17191a]"}`}>
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            <Link href="/deposit/" className={`ml-1 flex items-center gap-2 rounded-md px-3.5 py-2.5 text-xs font-bold ${active === "Funding" ? "bg-[#f6f4f0] text-[#d61f2c]" : "text-[#66696a] hover:bg-[#f6f4f0]"}`}><WalletCards className="h-4 w-4" />Funding</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/helpcenter/" aria-label="Help" className="hidden rounded-full p-2.5 text-[#6c6f70] hover:bg-[#f6f4f0] sm:block"><CircleHelp className="h-5 w-5" /></Link>
            <button type="button" aria-label="Notifications" className="rounded-full p-2.5 text-[#6c6f70] hover:bg-[#f6f4f0]"><Bell className="h-5 w-5" /></button>
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#dedbd5] px-2 py-1.5 text-xs font-bold hover:bg-[#f6f4f0]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#17191a] text-white">A</span><ChevronDown className="h-3.5 w-3.5 text-[#6c6f70]" /></summary>
              <div className="absolute right-0 top-12 w-56 rounded-lg border border-[#dedbd5] bg-white p-2 shadow-xl">
                <Link href="/accounts/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold hover:bg-[#f6f4f0]"><Layers3 className="h-4 w-4" />My Accounts</Link>
                <Link href="/settings/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold hover:bg-[#f6f4f0]"><Settings className="h-4 w-4" />Settings</Link>
                <Link href="/helpcenter/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold hover:bg-[#f6f4f0]"><CircleHelp className="h-4 w-4" />Customer Support</Link>
                <Link href="/login/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold text-[#d61f2c] hover:bg-[#fff5f5]"><LogOut className="h-4 w-4" />Logout</Link>
              </div>
            </details>
            <Link href="/accounts/" className="rounded-md p-2.5 text-[#17191a] xl:hidden" aria-label="Open account navigation"><Menu className="h-5 w-5" /></Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <div className="border-t border-[#dedbd5] bg-white px-4 py-5 text-center text-[10px] text-[#858888]">Trading involves risk. Review the applicable terms and risk disclosures before trading.</div>
    </div>
  );
}
