"use client";
import { useState, useEffect } from "react";
import { Brain, Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, BookOpen, AlertCircle } from "lucide-react";
import { useTradePulseStore } from "@/lib/store";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface StrategyData {
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  summary: string;
  support: number;
  resistance: number;
  deployCapital: string;
  keyLevels: string[];
  strategy: string[];
  risks: string[];
  generatedAt?: string;
}

export default function StrategyPage() {
  const { indices, positions, settings } = useTradePulseStore();
  const [data,    setData]    = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function fetchStrategy() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indices, positions: positions.map(p => ({ symbol: p.symbol, pnl: p.pnl, pnlPercent: p.pnlPercent })), settings }),
      });
      if (!res.ok) throw new Error("API error");
      const d = await res.json();
      setData({ ...d, generatedAt: new Date().toISOString() });
      toast.success("AI strategy updated!");
    } catch (e: any) {
      setError(e.message ?? "Failed to generate strategy");
      toast.error("Failed to generate strategy");
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchStrategy(); }, []);

  const sentimentConfig = {
    BULLISH:  { icon: TrendingUp,   color: "text-[#00d97e]", bg: "bg-[#00d97e]/10", border: "border-[#00d97e]/30" },
    BEARISH:  { icon: TrendingDown, color: "text-[#ff4560]", bg: "bg-[#ff4560]/10", border: "border-[#ff4560]/30" },
    NEUTRAL:  { icon: Minus,        color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/30" },
  };
  const sc = data ? sentimentConfig[data.sentiment] : null;

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-white">AI Strategy</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {data?.generatedAt ? `Updated ${new Date(data.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Claude-powered market analysis"}
          </p>
        </div>
        <button onClick={fetchStrategy} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50">
          <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {loading && !data && (
        <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-8 text-center">
          <Brain className="w-10 h-10 text-[#6366f1] mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-[#94a3b8]">Analysing Indian markets...</p>
          <p className="text-xs text-[#4a5568] mt-1">Claude is generating your morning brief</p>
        </div>
      )}

      {error && (
        <div className="bg-[#ff4560]/10 border border-[#ff4560]/30 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#ff4560] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#ff4560]">Could not load strategy</p>
            <p className="text-xs text-[#94a3b8] mt-1">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Sentiment banner */}
          <div className={clsx("flex items-center gap-3 rounded-2xl p-4 border", sc?.bg, sc?.border)}>
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", sc?.bg, "border", sc?.border)}>
              {sc && <sc.icon className={clsx("w-5 h-5", sc.color)} />}
            </div>
            <div className="flex-1">
              <p className={clsx("font-bold text-base", sc?.color)}>{data.sentiment}</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Today's market outlook</p>
            </div>
            <Sparkles className={clsx("w-5 h-5 flex-shrink-0", sc?.color)} />
          </div>

          {/* Key levels */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Support",  value: data.support.toLocaleString("en-IN"), color: "text-[#00d97e]" },
              { label: "Resist.",  value: data.resistance.toLocaleString("en-IN"), color: "text-[#ff4560]" },
              { label: "Deploy",   value: data.deployCapital, color: "text-[#6366f1]" },
            ].map(k => (
              <div key={k.label} className="bg-[#0c1117] border border-[#1a2535] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide mb-1">{k.label}</p>
                <p className={clsx("mono font-bold text-sm", k.color)}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-[#6366f1]/05 border border-[#6366f1]/20 border-l-4 border-l-[#6366f1] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs text-[#6366f1] font-bold uppercase tracking-wide">AI Analysis</span>
            </div>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">{data.summary}</p>
          </div>

          {/* Strategy points */}
          {data.strategy.length > 0 && (
            <div className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#00d97e]" />
                <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-semibold">Today's Strategy</span>
              </div>
              <div className="space-y-2">
                {data.strategy.map((s, i) => (
                  <div key={i} className="flex gap-2.5 text-sm text-[#cbd5e1]">
                    <span className="w-5 h-5 rounded-full bg-[#00d97e]/10 text-[#00d97e] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                    <span className="leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {data.risks.length > 0 && (
            <div className="bg-[#0c1117] border border-[#ff4560]/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-[#ff4560]" />
                <span className="text-xs text-[#94a3b8] uppercase tracking-wide font-semibold">Key Risks</span>
              </div>
              <div className="space-y-2">
                {data.risks.map((r, i) => (
                  <div key={i} className="flex gap-2.5 text-sm text-[#cbd5e1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4560] flex-shrink-0 mt-2" />
                    <span className="leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-[11px] text-[#4a5568] px-4">
            ⚠ This is AI-generated market analysis, not SEBI-registered financial advice. Trade responsibly.
          </p>
        </>
      )}
    </div>
  );
}
