"use client";
import { useState, useRef } from "react";
import { Plus, Upload, Trash2, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { useTradePulseStore } from "@/lib/store";
import { formatINR, formatPercent, pnlColor, parseGrowwCSV, genId } from "@/lib/utils";
import { AssetType, Position } from "@/lib/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const ASSET_TYPES: AssetType[] = ["equity", "options", "futures", "commodity", "currency", "mf"];

export default function PortfolioPage() {
  const { positions, addPosition, removePosition } = useTradePulseStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: "", qty: "", avgBuy: "", ltp: "", type: "equity" as AssetType });
  const fileRef = useRef<HTMLInputElement>(null);
  const totalPnL = positions.reduce((s, p) => s + p.pnl, 0);

  function handleAdd() {
    if (!form.symbol || !form.qty || !form.avgBuy || !form.ltp) { toast.error("Fill all fields"); return; }
    const qty = parseFloat(form.qty), avg = parseFloat(form.avgBuy), ltp = parseFloat(form.ltp);
    if ([qty, avg, ltp].some(isNaN)) { toast.error("Invalid numbers"); return; }
    const pnl = (ltp - avg) * qty;
    addPosition({ id: genId(), symbol: form.symbol.toUpperCase(), qty, avgBuy: avg, ltp, pnl, pnlPercent: ((ltp - avg) / avg) * 100, assetType: form.type, broker: "manual", addedAt: new Date().toISOString() });
    setForm({ symbol: "", qty: "", avgBuy: "", ltp: "", type: "equity" });
    setShowForm(false);
    toast.success(`${form.symbol.toUpperCase()} added!`);
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const csv = ev.target?.result as string;
      const parsed = parseGrowwCSV(csv);
      if (!parsed.length) { toast.error("Could not parse CSV. Check format."); return; }
      parsed.forEach(p => addPosition({ ...p, id: genId(), broker: "groww", addedAt: new Date().toISOString() }));
      toast.success(`${parsed.length} positions imported from Groww!`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-white">Portfolio</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">{positions.length} position{positions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111920] border border-[#243040] text-[#94a3b8] text-xs font-semibold active:scale-95 transition-transform">
            <Upload className="w-3.5 h-3.5" />Groww CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] text-xs font-semibold active:scale-95 transition-transform">
            <Plus className="w-3.5 h-3.5" />Add
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
      </div>

      {/* Total P&L */}
      {positions.length > 0 && (
        <div className={clsx("rounded-2xl p-4 border", totalPnL >= 0 ? "bg-[#00d97e]/5 border-[#00d97e]/20" : "bg-[#ff4560]/5 border-[#ff4560]/20")}>
          <p className="text-xs text-[#94a3b8] mb-1">Total Open P&L</p>
          <p className={clsx("mono font-bold text-2xl", totalPnL >= 0 ? "text-[#00d97e]" : "text-[#ff4560]")}>
            {totalPnL >= 0 ? "+" : ""}{formatINR(totalPnL)}
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-[#0c1117] border border-[#243040] rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-white">Add Position</h3>
          {[
            { label: "Symbol",    key: "symbol",  type: "text",   placeholder: "e.g. RELIANCE", inputMode: "text" },
            { label: "Qty",       key: "qty",     type: "number", placeholder: "e.g. 10",       inputMode: "numeric" },
            { label: "Avg Buy ₹", key: "avgBuy",  type: "number", placeholder: "e.g. 2842",     inputMode: "decimal" },
            { label: "LTP ₹",     key: "ltp",     type: "number", placeholder: "e.g. 2918",     inputMode: "decimal" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} inputMode={f.inputMode as any}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#6366f1]/50 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5 font-medium">Asset Type</label>
            <div className="flex flex-wrap gap-2">
              {ASSET_TYPES.map(t => (
                <button key={t} onClick={() => setForm(prev => ({ ...prev, type: t }))}
                  className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize",
                    form.type === t ? "bg-[#6366f1]/20 border-[#6366f1]/40 text-[#6366f1]" : "bg-[#111920] border-[#1a2535] text-[#4a5568]")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#1a2535] text-[#94a3b8] text-sm font-semibold active:scale-98 transition-transform">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-3 rounded-xl bg-[#6366f1] text-white text-sm font-semibold active:scale-98 transition-transform">Add Position</button>
          </div>
        </div>
      )}

      {/* Positions list */}
      {positions.length === 0 && !showForm ? (
        <div className="bg-[#0c1117] border border-[#1a2535] border-dashed rounded-2xl p-8 text-center">
          <TrendingUp className="w-8 h-8 text-[#4a5568] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#94a3b8]">No positions yet</p>
          <p className="text-xs text-[#4a5568] mt-1">Add manually or import your Groww CSV</p>
        </div>
      ) : (
        <div className="space-y-2">
          {positions.map(pos => (
            <div key={pos.id} className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="mono font-semibold text-[#a78bfa] text-sm">{pos.symbol}</span>
                    <span className="text-[10px] bg-[#111920] border border-[#1a2535] rounded-md px-1.5 py-0.5 text-[#4a5568] uppercase">{pos.assetType}</span>
                  </div>
                  <p className="text-xs text-[#4a5568] mt-0.5">Qty: {pos.qty} · Avg: ₹{pos.avgBuy.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={clsx("mono font-bold text-base", pos.pnl >= 0 ? "text-[#00d97e]" : "text-[#ff4560]")}>
                      {pos.pnl >= 0 ? "+" : ""}{formatINR(pos.pnl)}
                    </p>
                    <p className={clsx("text-xs mono", pos.pnl >= 0 ? "text-[#00d97e]/70" : "text-[#ff4560]/70")}>
                      {pos.pnlPercent >= 0 ? "+" : ""}{formatPercent(pos.pnlPercent)}
                    </p>
                  </div>
                  <button onClick={() => { removePosition(pos.id); toast.success(`${pos.symbol} removed`); }}
                    className="w-8 h-8 rounded-lg bg-[#ff4560]/10 flex items-center justify-center text-[#ff4560] active:scale-95 transition-transform flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs text-[#4a5568]">
                <span>LTP: <span className="text-white mono">₹{pos.ltp.toFixed(2)}</span></span>
                <span>Value: <span className="text-white mono">₹{(pos.ltp * pos.qty).toLocaleString("en-IN")}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
