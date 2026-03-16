import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Position, AlertRule, AlertFired,
  MarketIndex, DayPnL, TradeShare,
  DailyStrategy, UserSettings
} from "./types";

// ─── Default settings ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: UserSettings = {
  dailyProfitTarget: 2000,
  dailyStopLoss: 1000,
  capitalDeployed: 50000,
  whatsappNumber: "",
  callMeBotKey: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  notifications: { browser: true, whatsapp: false, sound: true },
};

// ─── Store interface ──────────────────────────────────────────────────────────
interface TradePulseStore {
  // Portfolio
  positions: Position[];
  addPosition: (pos: Position) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  removePosition: (id: string) => void;
  setPositions: (positions: Position[]) => void;
  updatePrices: (prices: Record<string, number>) => void;

  // Alerts
  alertRules: AlertRule[];
  firedAlerts: AlertFired[];
  addAlertRule: (rule: AlertRule) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  removeAlertRule: (id: string) => void;
  toggleAlertRule: (id: string) => void;
  firealert: (fired: AlertFired) => void;
  clearFiredAlerts: () => void;

  // Market
  indices: MarketIndex[];
  setIndices: (indices: MarketIndex[]) => void;

  // P&L history
  pnlHistory: DayPnL[];
  addDayPnL: (day: DayPnL) => void;

  // Social
  socialFeed: TradeShare[];
  shareToFeed: (post: TradeShare) => void;

  // Strategy
  todayStrategy: DailyStrategy | null;
  setStrategy: (s: DailyStrategy) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

// ─── Computed helpers (call these outside store) ───────────────────────────────
export const getTotalPnL = (positions: Position[]) =>
  positions.reduce((sum, p) => sum + p.pnl, 0);

export const getTotalInvested = (positions: Position[]) =>
  positions.reduce((sum, p) => sum + p.investedAmount, 0);

export const getTotalValue = (positions: Position[]) =>
  positions.reduce((sum, p) => sum + p.currentValue, 0);

export const getWinners = (positions: Position[]) =>
  positions.filter((p) => p.pnl > 0);

export const getLosers = (positions: Position[]) =>
  positions.filter((p) => p.pnl < 0);

// ─── Store ────────────────────────────────────────────────────────────────────
export const useTradePulseStore = create<TradePulseStore>()(
  persist(
    (set) => ({
      // ─── Portfolio ──────────────────────────────────────────────────────────
      positions: [],
      addPosition: (pos) =>
        set((s) => ({ positions: [...s.positions, pos] })),
      updatePosition: (id, updates) =>
        set((s) => ({
          positions: s.positions.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePosition: (id) =>
        set((s) => ({ positions: s.positions.filter((p) => p.id !== id) })),
      setPositions: (positions) => set({ positions }),
      updatePrices: (prices) =>
        set((s) => ({
          positions: s.positions.map((p) => {
            const newPrice = prices[p.symbol];
            if (!newPrice) return p;
            const currentValue = newPrice * p.quantity;
            const pnl = currentValue - p.investedAmount;
            const pnlPercent = (pnl / p.investedAmount) * 100;
            return {
              ...p,
              currentPrice: newPrice,
              currentValue,
              pnl,
              pnlPercent,
              lastUpdated: new Date().toISOString(),
            };
          }),
        })),

      // ─── Alerts ─────────────────────────────────────────────────────────────
      alertRules: [],
      firedAlerts: [],
      addAlertRule: (rule) =>
        set((s) => ({ alertRules: [...s.alertRules, rule] })),
      updateAlertRule: (id, updates) =>
        set((s) => ({
          alertRules: s.alertRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      removeAlertRule: (id) =>
        set((s) => ({
          alertRules: s.alertRules.filter((r) => r.id !== id),
        })),
      toggleAlertRule: (id) =>
        set((s) => ({
          alertRules: s.alertRules.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        })),
      firealert: (fired) =>
        set((s) => ({ firedAlerts: [fired, ...s.firedAlerts].slice(0, 50) })),
      clearFiredAlerts: () => set({ firedAlerts: [] }),

      // ─── Market ─────────────────────────────────────────────────────────────
      indices: [],
      setIndices: (indices) => set({ indices }),

      // ─── P&L history ────────────────────────────────────────────────────────
      pnlHistory: [],
      addDayPnL: (day) =>
        set((s) => ({
          pnlHistory: [
            day,
            ...s.pnlHistory.filter((d) => d.date !== day.date),
          ].slice(0, 90),
        })),

      // ─── Social ─────────────────────────────────────────────────────────────
      socialFeed: [],
      shareToFeed: (post) =>
        set((s) => ({ socialFeed: [post, ...s.socialFeed].slice(0, 100) })),

      // ─── Strategy ───────────────────────────────────────────────────────────
      todayStrategy: null,
      setStrategy: (s) => set({ todayStrategy: s }),

      // ─── Settings ───────────────────────────────────────────────────────────
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),
    }),
    {
      name: "tradepulse-storage",
      // Only persist these keys
      partialize: (state) =>
        ({
          positions: state.positions,
          alertRules: state.alertRules,
          firedAlerts: state.firedAlerts,
          pnlHistory: state.pnlHistory,
          socialFeed: state.socialFeed,
          settings: state.settings,
          todayStrategy: state.todayStrategy,
        }) as TradePulseStore,
    }
  )
);
