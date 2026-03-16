"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Target, Phone, Bell, Crown, Clock, LogOut, ChevronRight, CheckCircle } from "lucide-react";
import { useTradePulseStore } from "@/lib/store";
import { clsx } from "clsx";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { settings, updateSettings } = useTradePulseStore();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [form, setForm] = useState({
    profitTarget: String(settings.dailyProfitTarget),
    stopLoss:     String(settings.dailyStopLoss),
    capital:      String(settings.capitalToDeploy),
    whatsapp:     settings.whatsappNumber  ?? "",
    waKey:        settings.whatsappApiKey  ?? "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(setUserInfo).catch(() => {});
  }, []);

  function saveTargets() {
    const target  = parseFloat(form.profitTarget);
    const sl      = parseFloat(form.stopLoss);
    const capital = parseFloat(form.capital);
    if ([target, sl, capital].some(v => isNaN(v) || v <= 0)) { toast.error("Enter valid positive numbers"); return; }
    updateSettings({ dailyProfitTarget: target, dailyStopLoss: sl, capitalToDeploy: capital });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    toast.success("Targets saved!");
  }

  function saveWhatsApp() {
    if (!form.whatsapp || !form.waKey) { toast.error("Enter both number and API key"); return; }
    updateSettings({ whatsappNumber: form.whatsapp, whatsappApiKey: form.waKey });
    toast.success("WhatsApp configured! 📲");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      <div>
        <h1 className="font-bold text-lg text-white">Settings</h1>
        <p className="text-xs text-[#94a3b8] mt-0.5">Manage your account & preferences</p>
      </div>

      {/* User card */}
      {userInfo && (
        <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-[#6366f1] font-bold text-base flex-shrink-0">
            {userInfo.displayName?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white">{userInfo.displayName}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5 capitalize">{userInfo.role}</p>
          </div>
          {userInfo.subscribed ? (
            <div className="flex items-center gap-1.5 bg-[#00d97e]/10 border border-[#00d97e]/30 text-[#00d97e] text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
              <Crown className="w-3 h-3" />Pro
            </div>
          ) : userInfo.trialActive ? (
            <button onClick={() => router.push("/subscribe")}
              className="flex items-center gap-1.5 bg-[#6366f1]/10 border border-[#6366f1]/25 text-[#6366f1] text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 active:scale-95 transition-transform">
              <Clock className="w-3 h-3" />{userInfo.trialDaysLeft}d left
            </button>
          ) : null}
        </div>
      )}

      {/* Subscribe CTA */}
      {userInfo && !userInfo.subscribed && (
        <button onClick={() => router.push("/subscribe")}
          className="w-full flex items-center gap-3 bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-2xl p-4 active:scale-[0.99] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-[#6366f1]" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm text-[#6366f1]">Upgrade to Pro</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">₹2,000/month · UPI & Cards</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6366f1]" />
        </button>
      )}

      {/* Daily Targets */}
      <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-[#6366f1]" />
          <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-semibold">Daily Targets</span>
        </div>
        <div className="space-y-3">
          {[
            { label: "Profit Target (₹)", key: "profitTarget", placeholder: "e.g. 3000" },
            { label: "Stop Loss (₹)",     key: "stopLoss",     placeholder: "e.g. 1500" },
            { label: "Capital to Deploy (₹)", key: "capital",  placeholder: "e.g. 500000" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">{f.label}</label>
              <input type="number" placeholder={f.placeholder} inputMode="numeric"
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#6366f1]/50 transition-all" />
            </div>
          ))}
          <button onClick={saveTargets}
            className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]",
              saved ? "bg-[#00d97e]/15 border border-[#00d97e]/30 text-[#00d97e]" : "bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1]")}>
            {saved ? <><CheckCircle className="w-4 h-4" />Saved!</> : "Save Targets"}
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-[#00d97e]" />
          <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-semibold">WhatsApp Alerts</span>
          <span className="ml-auto text-[10px] bg-[#00d97e]/10 text-[#00d97e] border border-[#00d97e]/25 px-2 py-0.5 rounded-full font-semibold">FREE</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">Mobile Number</label>
            <input type="tel" placeholder="+91 98765 43210" inputMode="tel" value={form.whatsapp}
              onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
              className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">CallMeBot API Key</label>
            <input type="text" placeholder="Get free key from callmebot.com" inputMode="numeric" value={form.waKey}
              onChange={e => setForm(p => ({ ...p, waKey: e.target.value }))}
              className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 transition-all" />
          </div>
          <p className="text-[11px] text-[#4a5568]">
            Free WhatsApp alerts via CallMeBot. Get API key: <span className="text-[#6366f1]">callmebot.com/blog/free-api-whatsapp-messages</span>
          </p>
          <button onClick={saveWhatsApp}
            className="w-full py-3 rounded-xl bg-[#00d97e]/10 border border-[#00d97e]/30 text-[#00d97e] text-sm font-bold active:scale-[0.98] transition-all">
            Save WhatsApp Config
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-semibold">Browser Notifications</span>
        </div>
        <button onClick={() => {
          if (!("Notification" in window)) { toast.error("Not supported on this browser"); return; }
          Notification.requestPermission().then(p => {
            if (p === "granted") { new Notification("TradePulse", { body: "Notifications enabled! 🎉" }); toast.success("Notifications enabled!"); }
            else toast.error("Permission denied");
          });
        }} className="w-full py-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[#f59e0b] text-sm font-bold active:scale-[0.98] transition-all">
          Enable Browser Notifications
        </button>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#ff4560]/25 bg-[#ff4560]/06 text-[#ff4560] text-sm font-semibold active:scale-[0.98] transition-all">
        <LogOut className="w-4 h-4" />Logout
      </button>
    </div>
  );
}
