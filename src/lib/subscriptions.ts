// src/lib/types.ts

/** The kinds of alerts your app supports */
export type AlertType = "price" | "indicator" | "volume" | "news";

/** Basic shape of an alert rule (adjust fields to match your UI) */
export interface AlertRule {
  id: string;
  type: AlertType;
  symbol: string;                    // e.g., "NIFTY", "BTCUSDT"
  direction?: "above" | "below";     // for threshold-type alerts
  threshold?: number;                // price/indicator value
  note?: string;                     // optional user note
  active: boolean;
  createdAt: string;                 // ISO datetime string
  updatedAt?: string;                // ISO datetime string
}
``
