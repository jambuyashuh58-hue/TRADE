// ─── Position / Portfolio ────────────────────────────────────────────────────
export type AssetType = "stock" | "options" | "futures" | "mutualfund" | "commodity";
export type Broker = "groww" | "zerodha" | "angelone" | "upstox" | "manual";

export interface Position {
  id: string;
  symbol: string;           // e.g. "RELIANCE", "NIFTY24JUL23000CE"
  displayName: string;      // Human-readable
  assetType: AssetType;
  broker: Broker;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  lastUpdated: string;      // ISO date
  // Computed
  investedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  // Options specific
  strikePrice?: number;
  optionType?: "CE" | "PE";
  expiryDate?: string;
  lotSize?: number;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export type AlertTriggerType =
  | "daily_profit_target"
  | "daily_stop_loss"
  | "position_profit"
  | "position_loss"
  | "index_level"
  | "time_based";

export interface AlertRule {
  id: string;
  name: string;
  type: AlertTriggerType;
  isActive: boolean;
  createdAt: string;
  // Trigger values
  targetAmount?: number;       // for P&L alerts
  targetPercent?: number;      // for % alerts
  targetPrice?: number;        // for index level
  positionId?: string;         // for position-specific
  symbol?: string;
  triggerTime?: string;        // HH:MM for time alerts
  // Notification
  notifyBrowser: boolean;
  notifyWhatsApp: boolean;
  // State
  triggered: boolean;
  triggeredAt?: string;
}

export interface AlertFired {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  firedAt: string;
  value: number;
}

// ─── Market Data ─────────────────────────────────────────────────────────────
export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume?: number;
  lastUpdated: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── P&L History ─────────────────────────────────────────────────────────────
export interface DayPnL {
  date: string;       // YYYY-MM-DD
  pnl: number;
  trades: number;
  winRate: number;
}

// ─── Social / Feed ───────────────────────────────────────────────────────────
export interface TradeShare {
  id: string;
  userId: string;
  userName: string;
  symbol: string;
  assetType: AssetType;
  action: "bought" | "sold";
  quantity: number;
  price: number;
  pnl?: number;
  note?: string;
  timestamp: string;
  likes: number;
}

// ─── Strategy ────────────────────────────────────────────────────────────────
export interface DailyStrategy {
  date: string;
  generatedAt: string;
  marketSentiment: "bullish" | "bearish" | "neutral" | "volatile";
  summary: string;
  keyLevels: { label: string; value: number }[];
  suggestedCapital: number;
  riskNote: string;
  sectors: { name: string; trend: "up" | "down" | "neutral" }[];
  topWatchlist: string[];
  rawResponse: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────
export interface UserSettings {
  dailyProfitTarget: number;
  dailyStopLoss: number;
  capitalDeployed: number;
  whatsappNumber: string;
  callMeBotKey: string;   // CallMeBot WhatsApp API key (free)
  timezone: string;
  currency: string;
  notifications: {
    browser: boolean;
    whatsapp: boolean;
    sound: boolean;
  };
}
