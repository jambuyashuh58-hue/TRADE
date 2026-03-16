"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Briefcase, Bell, Brain, Users, MoreHorizontal,
  Activity, Menu, X, Crown, Clock, LogOut, RefreshCw, ChevronRight,
} from "lucide-react";
import { useTradePulseStore, getTotalPnL } from "@/lib/store";
import { formatINRCompact, marketStatusLabel } from "@/lib/utils";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const NAV = [
  { href: "/",          icon: LayoutDashboard, label: "Home"      },
  { href: "/portfolio", icon: Briefcase,        label: "Portfolio" },
  { href: "/alerts",    icon: Bell,             label: "Alerts"    },
  { href: "/strategy",  icon: Brain,            label: "AI"        },
  { href: "/social",    icon: Users,            label: "Social"    },
  { href: "/settings",  icon: MoreHorizontal,   label: "More"      },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { positions, firedAlerts } = useTradePulseStore();
  const totalPnL   = getTotalPnL(positions);
  const { open }   = marketStatusLabel();
  const [drawer, setDrawer]     = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const recentAlerts = firedAlerts.filter((a) => {
    const diff = Date.now() - new Date(a.firedAt).getTime();
    return diff < 1000 * 60 * 60;
  }).length;

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(setUserInfo).catch(() => {});
  }, []);

  const handleLogout = useCallback(async () => {
    setDrawer(false);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }, [router]);

  const handleRefresh = useCallback(() => {
    setDrawer(false);
    toast.success("Market data refreshed!");
    router.refresh();
  }, [router]);

  // Don't show shell on login/subscribe pages
  if (pathname === "/login" || pathname === "/subscribe") return <>{children}</>;

  return (
    <div className="flex flex-col h-screen bg-[#060b0f] overflow-hidden">

      {/* ── Top Appbar ──────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-[#0c1117] border-b border-[#1a2535] px-4 h-14 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className={clsx("w-2 h-2 rounded-full pulse-dot", open ? "bg-[#00d97e]" : "bg-[#4a5568]")} />
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#00d97e]" />
            <span className="font-bold text-[15px] tracking-tight text-white">
              Trade<span className="text-[#00d97e]">Pulse</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {positions.length > 0 && (
            <span className={clsx(
              "mono font-semibold text-[15px]",
              totalPnL >= 0 ? "text-[#00d97e]" : "text-[#ff4560]"
            )}>
              {totalPnL >= 0 ? "+" : ""}{formatINRCompact(totalPnL)}
            </span>
          )}
          <button
            onClick={() => setDrawer(true)}
            className="w-9 h-9 rounded-lg bg-[#111920] border border-[#243040] flex items-center justify-center text-[#94a3b8] active:scale-95 transition-transform"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto overscroll-none" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="animate-fade-up">
          {children}
        </div>
      </main>

      {/* ── Bottom Nav ───────────────────────────────────────────── */}
      <nav
        className="flex-shrink-0 bg-[#0c1117] border-t border-[#1a2535] flex z-10"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV.map((item) => {
          const active   = pathname === item.href;
          const isAlerts = item.href === "/alerts";
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative active:scale-95 transition-transform"
            >
              <div className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                active ? "bg-[#6366f1]/20" : ""
              )}>
                <item.icon className={clsx("w-5 h-5", active ? "text-[#6366f1]" : "text-[#4a5568]")} />
              </div>
              <span className={clsx(
                "text-[9px] font-semibold uppercase tracking-wide",
                active ? "text-[#6366f1]" : "text-[#4a5568]"
              )}>
                {item.label}
              </span>
              {isAlerts && recentAlerts > 0 && (
                <span className="absolute top-2 right-[calc(50%-16px)] w-2 h-2 bg-[#ff4560] rounded-full border-2 border-[#0c1117]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Drawer Overlay ───────────────────────────────────────── */}
      {drawer && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setDrawer(false)}
        />
      )}

      {/* ── Slide-Up Drawer ──────────────────────────────────────── */}
      <div className={clsx(
        "fixed left-0 right-0 bottom-0 z-50 bg-[#0c1117] border-t border-[#243040] rounded-t-2xl transition-transform duration-300",
        drawer ? "translate-y-0" : "translate-y-full"
      )} style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-[#243040] rounded-full" />
        </div>

        {/* User info */}
        {userInfo && (
          <div className="mx-4 mb-4 bg-[#111920] border border-[#1a2535] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-[#6366f1] font-bold text-sm flex-shrink-0">
              {userInfo.displayName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-white truncate">{userInfo.displayName}</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">{userInfo.role}</div>
            </div>
            {userInfo.subscribed ? (
              <div className="flex items-center gap-1 bg-[#00d97e]/10 border border-[#00d97e]/30 text-[#00d97e] text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                <Crown className="w-3 h-3" />Pro
              </div>
            ) : userInfo.trialActive ? (
              <div className="flex items-center gap-1 bg-[#6366f1]/10 border border-[#6366f1]/25 text-[#6366f1] text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                <Clock className="w-3 h-3" />{userInfo.trialDaysLeft}d
              </div>
            ) : null}
          </div>
        )}

        {/* Drawer actions */}
        <div className="px-4 space-y-1">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#94a3b8] hover:bg-[#111920] hover:text-white text-sm font-medium transition-colors active:scale-98"
          >
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Refresh market data</span>
          </button>

          <Link
            href="/subscribe"
            onClick={() => setDrawer(false)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#94a3b8] hover:bg-[#111920] hover:text-white text-sm font-medium transition-colors"
          >
            <Crown className="w-5 h-5 flex-shrink-0 text-[#6366f1]" />
            <span className="flex-1 text-left">Subscribe — ₹2,000/month</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <div className="h-px bg-[#1a2535] my-2" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#ff4560] hover:bg-[#ff4560]/10 text-sm font-medium transition-colors active:scale-98"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

    </div>
  );
}
