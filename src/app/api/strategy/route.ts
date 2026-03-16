import { NextRequest, NextResponse } from "next/server";
import { ANTHROPIC_API_KEY } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { indices = [], positions = [], settings = {} } = await req.json();

    const marketSummary = indices.length > 0
      ? indices.map((i: any) => `${i.name}: ${i.price} (${i.change >= 0 ? "+" : ""}${i.changePercent?.toFixed(2)}%)`).join(", ")
      : "NIFTY 50: ~22,400, SENSEX: ~73,900, BANK NIFTY: ~48,200";

    const portfolioSummary = positions.length > 0
      ? `Current positions: ${positions.map((p: any) => `${p.symbol} P&L ${p.pnl >= 0 ? "+" : ""}₹${p.pnl}`).join(", ")}`
      : "No open positions";

    const prompt = `You are a professional Indian stock market analyst. Today is ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.

Current market data: ${marketSummary}
Trader portfolio: ${portfolioSummary}
Daily profit target: ₹${settings.dailyProfitTarget ?? 3000}, Stop loss: ₹${settings.dailyStopLoss ?? 1500}

Provide a morning strategy brief as JSON only (no markdown, no extra text):
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": "2-3 sentence market overview for Indian F&O trader",
  "support": <NIFTY support level as number>,
  "resistance": <NIFTY resistance level as number>,
  "deployCapital": "₹X.XL",
  "keyLevels": ["level 1", "level 2", "level 3"],
  "strategy": ["action 1", "action 2", "action 3"],
  "risks": ["risk 1", "risk 2"]
}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("Strategy route error:", e);
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}
