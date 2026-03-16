"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Clock, CheckCircle, ArrowLeft, Shield, Zap, Brain, Bell, TrendingUp, Users, Upload, BarChart2 } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";

declare global { interface Window { Razorpay: any } }

const FEATURES = [
  { icon: TrendingUp, text: "Unified P&L across all brokers" },
  { icon: Zap,        text: "Live NIFTY, SENSEX, BANK NIFTY" },
  { icon: Bell,       text: "Smart exit alerts — profit & stop loss" },
  { icon: Bell,       text: "Free WhatsApp alerts via CallMeBot" },
  { icon: Brain,      text: "AI Morning Strategy Brief (Claude)" },
  { icon: Users,      text: "Social trade sharing feed" },
  { icon: Upload,     text: "Groww CSV portfolio import" },
  { icon: BarChart2,  text: "30-day P&L history chart" },
];

export default function SubscribePage() {
  const router = useRouter();
  const [userInfo, setUserInfo]   = useState<any>(null);
  const [loading,  setLoading]    = useState(false);
  const [success,  setSuccess]    = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(setUserInfo).catch(() => {});
    // Load Razorpay SDK
    if (!document.getElementById("rzp-sdk")) {
      const s = document.createElement("script");
      s.id  = "rzp-sdk";
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.head.appendChild(s);
    }
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      // 1. Create order on server
      const orderRes  = await fetch("/api/payment/create-order", { method: "POST" });
      if (!orderRes.ok) throw new Error("Could not create payment order");
      const { orderId, amount, currency, keyId } = await orderRes.json();

      // 2. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         keyId,
          amount,
          currency,
          order_id:    orderId,
          name:        "TradePulse",
          description: "Monthly Subscription — ₹2,000/month",
          image:       "/icon.png",
          prefill: {
            name:  userInfo?.displayName ?? "",
            email: "",
            contact: "",
          },
          theme:   { color: "#6366f1" },
          modal:   { ondismiss: () => reject(new Error("cancelled")) },
          handler: async (response: any) => {
            // 3. Verify on server
            const verRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            if (!verRes.ok) { reject(new Error("Verification failed")); return; }
            resolve();
          },
        });
        rzp.open();
      });

      setSuccess(true);
      toast.success("🎉 Subscribed! Welcome to TradePulse Pro!");
      setTimeout(() => router.push("/"), 2500);

    } catch (e: any) {
      if (e.message !== "cancelled") toast.error(e.message ?? "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#060b0f] flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#00d97e]/15 border border-[#00d97e]/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-[#00d97e]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're Pro! 🎉</h1>
          <p className="text-[#94a3b8] text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b0f] flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>

      {/* Top bar */}
      <div className="bg-[#0c1117] border-b border-[#1a2535] px-4 h-14 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-[#111920] border border-[#243040] flex items-center justify-center text-[#94a3b8] active:scale-95 transition-transform">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-[15px] text-white">TradePulse Pro</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">

        {/* Hero */}
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-[#6366f1]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Trade<span className="text-[#6366f1]">Pulse</span> Pro
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">Everything you need to trade smarter</p>
        </div>

        {/* Trial status */}
        {userInfo?.trialActive && (
          <div className="bg-[#6366f1]/08 border border-[#6366f1]/25 rounded-2xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#6366f1] flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-[#6366f1]">Free Trial — {userInfo.trialDaysLeft} days remaining</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Subscribe now to keep full access after trial</p>
            </div>
          </div>
        )}

        {/* Price box */}
        <div className="bg-[#0c1117] border border-[#243040] rounded-2xl p-5">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="text-4xl font-bold mono text-white">₹2,000</span>
              <p className="text-sm text-[#94a3b8] mt-1">per month</p>
            </div>
            <div className="bg-[#00d97e]/10 border border-[#00d97e]/30 text-[#00d97e] text-xs font-bold px-3 py-1.5 rounded-full">
              30 days FREE
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#00d97e] flex-shrink-0" />
                <span className="text-sm text-[#cbd5e1]">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Pay button */}
          <button onClick={handleSubscribe} disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#7c3aed] active:scale-[0.98] text-white font-bold py-4 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
              : <><Crown className="w-4 h-4" />Subscribe Now — ₹2,000/month</>}
          </button>

          <div className="flex items-center justify-center gap-2 mt-3">
            <Shield className="w-3.5 h-3.5 text-[#4a5568]" />
            <p className="text-xs text-[#4a5568]">Secured by Razorpay · UPI, Cards, Net Banking · Cancel anytime</p>
          </div>
        </div>

        {/* Live badge */}
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-2 h-2 rounded-full bg-[#00d97e] pulse-dot" />
          <p className="text-xs text-[#4a5568]">Live payments · rzp_live mode active</p>
        </div>

      </div>
    </div>
  );
}
