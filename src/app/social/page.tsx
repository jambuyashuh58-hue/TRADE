"use client";
import { useState } from "react";
import { Send, TrendingUp, TrendingDown, Users, Heart, MessageCircle } from "lucide-react";
import { useTradePulseStore } from "@/lib/store";
import { SocialPost } from "@/lib/types";
import { formatINR, genId } from "@/lib/utils";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const DEMO_FEED: SocialPost[] = [
  { id:"d1", userId:"rahul", displayName:"Rahul S.", content:"RELIANCE breakout trade worked perfectly. Entry 2842, target 2950 ✅", pnl:1080, pnlPercent:3.8, symbol:"RELIANCE", postedAt:"2026-03-13T10:15:00", likes:24, comments:7 },
  { id:"d2", userId:"priya", displayName:"Priya M.", content:"Stopped out early on Bank Nifty. RBI news killed the move 📉 Lesson: always check event calendar!", pnl:-420, pnlPercent:-0.9, postedAt:"2026-03-13T09:45:00", likes:8, comments:5 },
  { id:"d3", userId:"vikram", displayName:"Vikram T.", content:"NIFTY CE 22500 scalp — 30 min trade, exit at target. Clean setup 🎯", pnl:1600, pnlPercent:25.8, symbol:"NIFTY CE", postedAt:"2026-03-13T09:20:00", likes:31, comments:12 },
];

export default function SocialPage() {
  const { socialPosts, addSocialPost, positions } = useTradePulseStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content: "", pnl: "", symbol: "" });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const allPosts = [...socialPosts, ...DEMO_FEED].sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  function handlePost() {
    if (!form.content.trim()) { toast.error("Write something!"); return; }
    const post: SocialPost = {
      id: genId(), userId: "you", displayName: "You",
      content: form.content.trim(),
      pnl: form.pnl ? parseFloat(form.pnl) : undefined,
      pnlPercent: undefined,
      symbol: form.symbol || undefined,
      postedAt: new Date().toISOString(),
      likes: 0, comments: 0,
    };
    addSocialPost(post);
    setForm({ content: "", pnl: "", symbol: "" });
    setShowForm(false);
    toast.success("Trade shared!");
  }

  function toggleLike(id: string) {
    setLikedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const avatarColor = (id: string) => {
    const colors = ["bg-[#6366f1]/20 text-[#6366f1]","bg-[#00d97e]/15 text-[#00d97e]","bg-[#f59e0b]/20 text-[#f59e0b]","bg-[#ec4899]/20 text-[#ec4899]"];
    return colors[id.charCodeAt(0) % colors.length];
  };

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-white">Trade Feed</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">{allPosts.length} trades shared today</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1] text-xs font-semibold active:scale-95 transition-transform">
          <Send className="w-3.5 h-3.5" />Share
        </button>
      </div>

      {/* Compose */}
      {showForm && (
        <div className="bg-[#0c1117] border border-[#243040] rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-white">Share a Trade</h3>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="What happened today? Share your setup, trade, or lesson..." rows={3}
            className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-3 text-[14px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#6366f1]/50 transition-all resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5">P&L (₹)</label>
              <input type="number" placeholder="e.g. 1200" inputMode="decimal" value={form.pnl}
                onChange={e => setForm(p => ({ ...p, pnl: e.target.value }))}
                className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#6366f1]/50 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] text-[#94a3b8] uppercase tracking-wide mb-1.5">Symbol</label>
              <input type="text" placeholder="e.g. NIFTY" value={form.symbol}
                onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))}
                className="w-full bg-[#060b0f] border border-[#1a2535] rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#6366f1]/50 transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#1a2535] text-[#94a3b8] text-sm font-semibold">Cancel</button>
            <button onClick={handlePost} className="flex-1 py-3 rounded-xl bg-[#6366f1] text-white text-sm font-bold">Post Trade</button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {allPosts.map(post => (
          <div key={post.id} className="bg-[#0c1117] border border-[#1a2535] rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", avatarColor(post.userId))}>
                {initials(post.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-white">{post.displayName}</p>
                  {post.pnl !== undefined && (
                    <span className={clsx("mono font-bold text-sm flex-shrink-0", post.pnl >= 0 ? "text-[#00d97e]" : "text-[#ff4560]")}>
                      {post.pnl >= 0 ? "+" : ""}{formatINR(post.pnl)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4a5568]">
                  {new Date(post.postedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {post.symbol && <span className="ml-2 text-[#a78bfa] mono">{post.symbol}</span>}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#cbd5e1] leading-relaxed mb-3">{post.content}</p>
            <div className="flex items-center gap-4 pt-2 border-t border-[#1a2535]">
              <button onClick={() => toggleLike(post.id)}
                className={clsx("flex items-center gap-1.5 text-xs transition-colors", likedIds.has(post.id) ? "text-[#ff4560]" : "text-[#4a5568]")}>
                <Heart className={clsx("w-4 h-4", likedIds.has(post.id) && "fill-current")} />
                {post.likes + (likedIds.has(post.id) ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#4a5568]">
                <MessageCircle className="w-4 h-4" />{post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
