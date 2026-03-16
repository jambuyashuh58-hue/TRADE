import { NextResponse } from "next/server";
import { MarketIndex } from "@/lib/types";

// Maps: display name → Yahoo Finance symbol
const INDICES = [
  { name: "NIFTY 50", symbol: "^NSEI", yahooSymbol: "%5ENSEI" },
  { name: "SENSEX", symbol: "^BSESN", yahooSymbol: "%5EBSESN" },
  { name: "BANK NIFTY", symbol: "^NSEBANK", yahooSymbol: "%5ENSEBANK" },
];

async function fetchYahooQuote(encodedSymbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TradePulse/1.0)",
      Accept: "application/json",
    },
    next: { revalidate: 30 }, // Cache 30s
  });
  if (!res.ok) throw new Error(`Yahoo fetch failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      INDICES.map((idx) => fetchYahooQuote(idx.yahooSymbol))
    );

    const indices: MarketIndex[] = results.map((result, i) => {
      const idx = INDICES[i];
      if (result.status === "rejected") {
        // Return mock data on failure so UI doesn't crash
        return mockIndex(idx.name, idx.symbol);
      }
      try {
        const chart = result.value?.chart?.result?.[0];
        const meta = chart?.meta;
        const price = meta?.regularMarketPrice ?? 0;
        const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
        const change = price - prevClose;
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
        return {
          symbol: idx.symbol,
          name: idx.name,
          price,
          change,
          changePercent,
          dayHigh: meta?.regularMarketDayHigh ?? price,
          dayLow: meta?.regularMarketDayLow ?? price,
          volume: meta?.regularMarketVolume,
          lastUpdated: new Date().toISOString(),
        } satisfies MarketIndex;
      } catch {
        return mockIndex(idx.name, idx.symbol);
      }
    });

    return NextResponse.json({ indices, ok: true });
  } catch (err) {
    console.error("Market API error:", err);
    // Always return something usable
    return NextResponse.json({
      indices: INDICES.map((i) => mockIndex(i.name, i.symbol)),
      ok: false,
      error: "Using fallback data",
    });
  }
}

// ─── Fetch prices for individual stock symbols ────────────────────────────────
export async function POST(request: Request) {
  try {
    const { symbols } = await request.json() as { symbols: string[] };
    if (!symbols || symbols.length === 0) {
      return NextResponse.json({ prices: {} });
    }

    const prices: Record<string, number> = {};

    await Promise.allSettled(
      symbols.map(async (sym) => {
        try {
          // NSE stocks: append .NS for Yahoo Finance
          const yahooSym = sym.includes(".") ? sym : `${sym}.NS`;
          const encoded = encodeURIComponent(yahooSym);
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d`;
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const data = await res.json();
          const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (price) prices[sym] = price;
        } catch {
          // Skip failed symbols
        }
      })
    );

    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json({ prices: {} });
  }
}

// ─── Mock fallback data ───────────────────────────────────────────────────────
function mockIndex(name: string, symbol: string): MarketIndex {
  const mockPrices: Record<string, number> = {
    "NIFTY 50": 24856.5,
    SENSEX: 81523.3,
    "BANK NIFTY": 52841.2,
  };
  const price = mockPrices[name] ?? 10000;
  const change = (Math.random() - 0.45) * 200;
  return {
    symbol,
    name,
    price,
    change,
    changePercent: (change / price) * 100,
    dayHigh: price + Math.abs(change) * 1.2,
    dayLow: price - Math.abs(change) * 0.8,
    lastUpdated: new Date().toISOString(),
  };
}
