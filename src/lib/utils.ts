import { Position, AssetType } from "./types";

// ─── ID generation ────────────────────────────────────────────────────────────
export function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ─── Number formatters ────────────────────────────────────────────────────────
export function formatINR(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Color helpers ────────────────────────────────────────────────────────────
export function pnlColor(pnl: number): string {
  if (pnl > 0) return "text-trading-green";
  if (pnl < 0) return "text-trading-red";
  return "text-muted-text";
}

export function pnlBg(pnl: number): string {
  if (pnl > 0) return "bg-trading-green/10 border-trading-green/30";
  if (pnl < 0) return "bg-trading-red/10 border-trading-red/30";
  return "bg-card-bg border-border-color";
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay(); // 0 Sun, 6 Sat
  if (day === 0 || day === 6) return false;
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMin = hours * 60 + minutes;
  return timeInMin >= 9 * 60 + 15 && timeInMin <= 15 * 60 + 30;
}

export function marketStatusLabel(): {
  open: boolean;
  label: string;
  next: string;
} {
  const open = isMarketOpen();
  if (open) return { open: true, label: "Market Open", next: "Closes 3:30 PM" };
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  if (day === 0) return { open: false, label: "Weekend", next: "Opens Monday 9:15 AM" };
  if (day === 6) return { open: false, label: "Weekend", next: "Opens Monday 9:15 AM" };
  const hours = ist.getHours();
  if (hours < 9 || (hours === 9 && ist.getMinutes() < 15)) {
    return { open: false, label: "Pre-Market", next: "Opens 9:15 AM IST" };
  }
  return { open: false, label: "Market Closed", next: "Opens Tomorrow 9:15 AM" };
}

// ─── Position compute ─────────────────────────────────────────────────────────
export function computePosition(
  raw: Omit<Position, "investedAmount" | "currentValue" | "pnl" | "pnlPercent">
): Position {
  const investedAmount = raw.avgBuyPrice * raw.quantity;
  const currentValue = raw.currentPrice * raw.quantity;
  const pnl = currentValue - investedAmount;
  const pnlPercent = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;
  return { ...raw, investedAmount, currentValue, pnl, pnlPercent };
}

// ─── Groww CSV parser ─────────────────────────────────────────────────────────
// Groww P&L export columns (varies slightly by version):
// Symbol | ISIN | Quantity | Avg Buy Price | LTP | Invested Amount | Market Value | P&L | P&L %
export function parseGrowwCSV(csvText: string): Position[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Find header row
  const headerLine = lines.findIndex((l) =>
    l.toLowerCase().includes("symbol") || l.toLowerCase().includes("scrip")
  );
  if (headerLine === -1) return [];

  const headers = lines[headerLine]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  const colIndex = (names: string[]): number => {
    for (const n of names) {
      const idx = headers.findIndex((h) => h.includes(n));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const symCol = colIndex(["symbol", "scrip", "stock"]);
  const qtyCol = colIndex(["quantity", "qty", "units"]);
  const buyCol = colIndex(["avg buy", "average buy", "avg price", "buy price", "nav"]);
  const ltpCol = colIndex(["ltp", "current price", "market price", "last price"]);
  const investedCol = colIndex(["invested", "purchase value", "cost"]);
  const mktValCol = colIndex(["market value", "current value", "present value"]);

  const positions: Position[] = [];

  for (let i = headerLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
    const symbol = symCol >= 0 ? cols[symCol]?.toUpperCase() : "";
    if (!symbol) continue;

    const qty = parseFloat(cols[qtyCol] || "0") || 0;
    const avgBuy = parseFloat(cols[buyCol] || "0") || 0;
    const ltp = parseFloat(cols[ltpCol] || "0") || avgBuy;

    // Guess asset type from symbol
    const assetType: AssetType = symbol.endsWith("CE") || symbol.endsWith("PE")
      ? "options"
      : symbol.includes("FUT") ? "futures"
      : qty < 1 ? "mutualfund" : "stock";

    positions.push(
      computePosition({
        id: genId(),
        symbol,
        displayName: symbol,
        assetType,
        broker: "groww",
        quantity: qty,
        avgBuyPrice: avgBuy,
        currentPrice: ltp,
        lastUpdated: new Date().toISOString(),
      })
    );
  }

  return positions;
}

// ─── Alert helpers ─────────────────────────────────────────────────────────────
export function shouldFireAlert(
  rule: import("./types").AlertRule,
  totalPnL: number,
  positions: Position[]
): { fire: boolean; message: string; value: number } {
  if (!rule.isActive || rule.triggered) {
    return { fire: false, message: "", value: 0 };
  }

  switch (rule.type) {
    case "daily_profit_target": {
      if (totalPnL >= (rule.targetAmount ?? 0)) {
        return {
          fire: true,
          message: `🎯 Daily profit target hit! P&L: ${formatINR(totalPnL)}`,
          value: totalPnL,
        };
      }
      break;
    }
    case "daily_stop_loss": {
      if (totalPnL <= -(rule.targetAmount ?? 0)) {
        return {
          fire: true,
          message: `🛑 Stop loss triggered! Loss: ${formatINR(totalPnL)}`,
          value: totalPnL,
        };
      }
      break;
    }
    case "position_profit": {
      const pos = positions.find((p) => p.id === rule.positionId);
      if (pos && pos.pnl >= (rule.targetAmount ?? 0)) {
        return {
          fire: true,
          message: `📈 ${pos.symbol} profit target hit! P&L: ${formatINR(pos.pnl)}`,
          value: pos.pnl,
        };
      }
      break;
    }
    case "position_loss": {
      const pos = positions.find((p) => p.id === rule.positionId);
      if (pos && pos.pnl <= -(rule.targetAmount ?? 0)) {
        return {
          fire: true,
          message: `📉 ${pos.symbol} stop loss hit! Loss: ${formatINR(pos.pnl)}`,
          value: pos.pnl,
        };
      }
      break;
    }
  }

  return { fire: false, message: "", value: 0 };
}

// ─── WhatsApp via CallMeBot ───────────────────────────────────────────────────
export async function sendWhatsAppAlert(
  phone: string,
  apiKey: string,
  message: string
): Promise<boolean> {
  if (!phone || !apiKey) return false;
  try {
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Browser notification ─────────────────────────────────────────────────────
export async function sendBrowserNotification(
  title: string,
  body: string
): Promise<void> {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  } else if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }
}
