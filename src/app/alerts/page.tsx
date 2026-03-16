"use client";
import { useState } from "react";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Zap, Clock } from "lucide-react";
import { useTradePulseStore } from "@/lib/store";
import { AlertRule, AlertType } from "@/lib/types";
import { formatINR, genId } from "@/lib/utils";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const RULE_TYPES: { value: AlertType; label: string; desc: string }[] = [
  { value: "daily_profit_target", label: "Daily Profit Target", desc: "Fire when total P&L hits target" },
  { value: "daily_stop_loss",     label: "Daily Stop Loss",     desc: "Fire when loss hits limit" },
  { value: "position_profit",     label: "Position Profit",     desc: "Fire when a position gains enough" },
  { value: "position_loss",       label: "Position Loss",       desc: "Fire when a position loses too much" },
  { value: "index_level",         label: "Index Level",         desc: "Fire when index crosses a value" },
];

export default function AlertsPage() {
  const { alertRules, firedAlerts, addAlertRule, removeAlertRule, toggleAlertRule } = useTradePulseStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "daily_profit_target" as AlertType, threshold: "", symbol: "" });

  function handleAdd() {
    if (!form.name || !form.threshold) { toast.error("Fill name and threshold"); return; }
    const rule: AlertRule = {
      id: genId(), name: form.name, type: form.type,
      threshold: parseFloat(form.threshold),
      symbol: form.symbol || undefined,
      enabled: true, createdAt: new Date().toISOString(),
    };
    addAlertRule(rule);
    setForm({ name: "", type: "daily_profit_target", threshold: "", symbol: "" });
    setShowForm(false);
    toast.success("Alert rule created!");
  }

  const active = alertRules.filter(r => r.enabled);
  const recentFired = firedAlerts.slice(0, 10);

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-white">Alerts</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">{active.length} active rule{active.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00d97e]/10 border border-[#00d97e]/30 text-[#00d97e] text-xs font-semibold active:scale-95 transition-transform">
          <Plus className="w-3.5 h-3.5" />New Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0c1117] border border-[#243040] rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-white">New Alert Rule</h3>
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">Alert Name</label>
            <input type="text" placeholder="e.g. Take Profit at ₹3000" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">Rule Type</label>
            <div className="space-y-2">
              {RULE_TYPES.map(rt => (
                <button key={rt.value} onClick={() => setForm(p => ({ ...p, type: rt.value }))}
                  className={clsx("w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-all",
                    form.type === rt.value ? "bg-[#00d97e]/10 border-[#00d97e]/30 text-[#00d97e]" : "bg-[#111920] border-[#1a2535] text-[#94a3b8]")}>
                  <div className="font-semibold">{rt.label}</div>
                  <div className="text-[#4a5568] mt-0.5">{rt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">Threshold (₹)</label>
            <input type="number" placeholder="e.g. 3000" inputMode="decimal" value={form.threshold}
              onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))}
              className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 transition-all" />
          </div>
          {(form.type === "position_profit" || form.type === "position_loss") && (
            <div>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">Symbol (optional)</label>
              <input type="text" placeholder="e.g. RELIANCE" value={form.symbol}
                onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))}
                className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 transition-all" />
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#1a2535] text-[#94a3b8] text-sm font-semibold">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-3 rounded-xl bg-[#00d97e] text-[#060b0f] text-sm font-bold">Create Alert</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {alertRules.length === 0 && !showForm ? (
        <div className="bg-[#0c1117] border border-[#1a2535] border-dashed rounded-2xl p-8 text-center">
          <Bell className="w-8 h-8 text-[#4a5568] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#94a3b8]">No alert rules</p>
          <p className="text-xs text-[#4a5568] mt-1">Create rules to get notified on profit/loss targets</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alertRules.map(rule => (
            <div key={rule.id} className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", rule.enabled ? "bg-[#6366f1]/15" : "bg-[#111920]")}>
                  <Bell className={clsx("w-4 h-4", rule.enabled ? "text-[#6366f1]" : "text-[#4a5568]")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{rule.name}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{RULE_TYPES.find(r => r.value === rule.type)?.label} · {formatINR(rule.threshold)}</p>
                  {rule.symbol && <p className="text-xs text-[#4a5568] mt-0.5">Symbol: {rule.symbol}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleAlertRule(rule.id)} className="active:scale-95 transition-transform">
                    {rule.enabled
                      ? <ToggleRight className="w-6 h-6 text-[#00d97e]" />
                      : <ToggleLeft className="w-6 h-6 text-[#4a5568]" />}
                  </button>
                  <button onClick={() => { removeAlertRule(rule.id); toast.success("Rule deleted"); }}
                    className="w-8 h-8 rounded-lg bg-[#ff4560]/10 flex items-center justify-center text-[#ff4560] active:scale-95 transition-transform">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fired alerts history */}
      {recentFired.length > 0 && (
        <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-semibold">Fired History</span>
          </div>
          <div className="space-y-2">
            {recentFired.map(a => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-[#1a2535] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d97e] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{a.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#4a5568]" />
                    <span className="text-[10px] text-[#4a5568]">
                      {new Date(a.firedAt).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </span>
                    <span className="text-[10px] text-[#00d97e] mono">P&L: {formatINR(a.pnlAtFire)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
