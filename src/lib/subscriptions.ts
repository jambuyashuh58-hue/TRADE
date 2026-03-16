// Stores active subscriptions in data/subscriptions.json
// This file is auto-created when first payment is made.
// Add it to .gitignore — it contains payment data.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR  = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "subscriptions.json");

export interface Subscription {
  username: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paidAt: string;          // ISO string
  validUntil: string;      // ISO string (paidAt + 30 days)
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): Subscription[] {
  ensureDataDir();
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(subs: Subscription[]) {
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
}

// Check if a username has an active subscription
export function hasActiveSubscription(username: string): boolean {
  const subs = readAll();
  const now  = new Date();
  return subs.some(
    (s) =>
      s.username.toLowerCase() === username.toLowerCase() &&
      new Date(s.validUntil) > now
  );
}

// Record a new payment (called after Razorpay verification)
export function recordPayment(
  username: string,
  razorpayPaymentId: string,
  razorpayOrderId: string
): Subscription {
  const subs = readAll();
  const paidAt = new Date();
  const validUntil = new Date(paidAt);
  validUntil.setDate(validUntil.getDate() + 30);

  const sub: Subscription = {
    username,
    razorpayPaymentId,
    razorpayOrderId,
    paidAt: paidAt.toISOString(),
    validUntil: validUntil.toISOString(),
  };

  subs.push(sub);
  writeAll(subs);
  return sub;
}

// Get the latest subscription for a user
export function getSubscription(username: string): Subscription | undefined {
  const subs = readAll();
  const now  = new Date();
  return subs
    .filter(
      (s) =>
        s.username.toLowerCase() === username.toLowerCase() &&
        new Date(s.validUntil) > now
    )
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];
}
