import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Receipt, CreditCard, Users, Package,
  KeyRound, BarChart3, MessageSquare, ScrollText, Settings,
  Moon, Sun, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("theme") || "dark";
    return "dark";
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="ghost" size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Receipt, label: "Transaksi", href: "/transactions" },
  { icon: CreditCard, label: "Deposit", href: "/deposits" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Package, label: "Produk", href: "/products" },
  { icon: KeyRound, label: "Auto Stock", href: "/stock" },
  { icon: BarChart3, label: "Analitik", href: "/analytics" },
  { icon: MessageSquare, label: "Broadcast", href: "/broadcast" },
  { icon: ScrollText, label: "Audit Log", href: "/audit-logs" },
  { icon: Settings, label: "Pengaturan", href: "/settings" },
  { icon: BookOpen, label: "Panduan", href: "/panduan" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-60 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-base text-primary">
            <Settings className="w-4 h-4" />
            <span>StorBot Admin</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground px-2">v2.0</span>
          <ThemeToggle />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
