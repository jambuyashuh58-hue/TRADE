"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Bell, Brain,
  Users, Settings, Activity, LogOut, Crown, Clock,
} from "lucide-react";
import { useTradePulseStore, getTotalPnL } from "@/lib/store";
import { formatINRCompact, marketStatusLabel } from "@/lib/utils";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/strategy", icon: Brain, label: "AI Strategy" },
  { href: "/social", icon: Users, label: "Social" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { positions, alertRules, firedAlerts } = useTradePulseStore();
  const totalPnL = getTotalPnL(positions);
  const { open, label } = marketStatusLabel();
  const unreadAlerts = firedAlerts.filter((a) => {
    const fired = new Date(a.firedAt);
    const now = new Date();
    return now.getTime() - fired.getTime() < 1000 * 60 * 60;
  }).length;

  const [userStatus, setUserStatus] = useState<{
    displayName?: string;
    trialDaysLeft?: number;
    trialActive?: boolean;
    subscribed?: boolean;
  }>({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserStatus(d))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-panel-bg border-r border-border-color flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border-color">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-primary-text leading-none">
              TradePulse
            </div>
            <div className="text-[10px] text-muted-text">India</div>
          </div>
        </div>
      </div>

      {/* Market status */}
      <div className="px-4 py-3 border-b border-border-color">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "w-2 h-2 rounded-full",
              open ? "bg-trading-green animate-pulse" : "bg-muted-text"
            )}
          />
          <span className="text-xs text-muted-text">{label}</span>
        </div>
      </div>

      {/* Daily P&L summary */}
      {positions.length > 0 && (
        <div className="px-4 py-3 border-b border-border-color">
          <div className="text-[10px] text-muted-text uppercase tracking-wider mb-1">
            Today&apos;s P&amp;L
          </div>
          <div
            className={clsx(
              "font-mono font-semibold text-lg",
              totalPnL >= 0 ? "text-trading-green" : "text-trading-red"
            )}
          >
            {totalPnL >= 0 ? "+" : ""}{formatINRCompact(totalPnL)}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const isAlerts = item.href === "/alerts";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-muted-text hover:text-primary-text hover:bg-card-bg"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isAlerts && unreadAlerts > 0 && (
                <span className="w-4 h-4 rounded-full bg-trading-red text-white text-[9px] flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: trial/subscription + logout */}
      <div className="px-2 py-3 border-t border-border-color space-y-2">

        {/* User display name */}
        {userStatus.displayName && (
          <div className="px-3 py-1.5">
            <div className="text-xs text-muted-text">Signed in as</div>
            <div className="text-xs font-semibold text-secondary-text truncate">{userStatus.displayName}</div>
          </div>
        )}

        {/* Trial / subscription badge */}
        {userStatus.subscribed ? (
          <Link href="/subscribe"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-trading-green/10 border border-trading-green/20 cursor-pointer hover:bg-trading-green/15 transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-trading-green flex-shrink-0" />
            <span className="text-xs text-trading-green font-medium">Pro · Active</span>
          </Link>
        ) : userStatus.trialActive ? (
          <Link href="/subscribe"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 hover:bg-accent-indigo/15 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-accent-indigo flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-accent-indigo font-medium">
                Trial · {userStatus.trialDaysLeft}d left
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/subscribe"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-trading-red/10 border border-trading-red/20 hover:bg-trading-red/15 transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-trading-red flex-shrink-0" />
            <span className="text-xs text-trading-red font-medium">Trial expired · Subscribe</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-text hover:text-trading-red hover:bg-trading-red/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
        <div className="px-2 text-[10px] text-dim-text">v0.1 Beta · Personal use only</div>
      </div>
    </aside>
  );
}
