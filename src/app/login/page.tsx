"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Activity, AlertCircle, Loader2, User, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const router       = useRouter();
  const searchParams = useSearchParams();
  const ref          = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Enter both username and password."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed."); setPassword(""); return; }
      toast.success(`Welcome, ${data.user?.displayName ?? username}!`);
      router.push(searchParams.get("from") ?? "/");
      router.refresh();
    } catch { setError("Network error. Check your connection."); }
    finally  { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#060b0f] flex flex-col items-center justify-center p-5 overflow-y-auto"
      style={{ paddingTop: "env(safe-area-inset-top, 20px)", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>

      {/* Grid bg */}
      <div className="fixed inset-0 opacity-[0.25] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#1a2535 1px,transparent 1px),linear-gradient(90deg,#1a2535 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
      <div className="fixed w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(0,217,126,0.09) 0%,transparent 70%)", top: "35%", left: "50%", transform: "translate(-50%,-50%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00d97e]/10 border border-[#00d97e]/30 mb-4">
            <Activity className="w-7 h-7 text-[#00d97e]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Trade<span className="text-[#00d97e]">Pulse</span>
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">Indian trading intelligence platform</p>
        </div>

        {/* Trial badge */}
        <div className="bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-xl p-3 text-center mb-5">
          <p className="text-sm font-semibold text-[#6366f1]">🎁 30-Day Free Trial</p>
          <p className="text-xs text-[#94a3b8] mt-0.5">Full access · No credit card · Then ₹2,000/month</p>
        </div>

        {/* Card */}
        <div className="bg-[#0c1117] border border-[#243040] rounded-2xl p-5">
          {error && (
            <div className="flex items-center gap-2 bg-[#ff4560]/10 border border-[#ff4560]/30 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-[#ff4560] flex-shrink-0" />
              <p className="text-xs text-[#ff4560]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
                <input ref={ref} type="text" value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  placeholder="your username" disabled={loading}
                  autoComplete="username" inputMode="text"
                  className="w-full bg-[#060b0f] border border-[#243040] rounded-xl pl-10 pr-4 py-3.5 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 focus:ring-2 focus:ring-[#00d97e]/10 transition-all disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" disabled={loading}
                  autoComplete="current-password"
                  className="w-full bg-[#060b0f] border border-[#243040] rounded-xl pl-10 pr-11 py-3.5 text-[15px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#00d97e]/50 focus:ring-2 focus:ring-[#00d97e]/10 transition-all disabled:opacity-50 mono tracking-widest" />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#94a3b8]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !username.trim() || !password.trim()}
              className="w-full bg-[#00d97e] hover:bg-[#00f290] active:scale-[0.98] text-[#060b0f] font-bold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                : <><Lock className="w-4 h-4" />Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#4a5568] mt-4">
          🔒 HTTP-only session cookies · 7-day session
        </p>
      </div>
    </div>
  );
}
