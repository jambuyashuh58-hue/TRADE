// src/lib/subscriptions.ts
// Stores active subscriptions in data/subscriptions.json
// This file is auto-created when first payment is made.
// Add /data to .gitignore — it may contain payment data.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "subscriptions.json");

export interface Subscription {
  username: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paidAt: string;     // ISO string
  validUntil: string; // ISO string (paidAt + 30 days)
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
    // Corrupt file or invalid JSON — start fresh
    return [];
  }
}

function writeAll(subs: Subscription[]) {
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
}

/**
 * Check if a username has an active (non‑expired) subscription.
 */
export function hasActiveSubscription(username: string): boolean {
  const subs = readAll();
  const now = new Date();
  const uname = username.toLowerCase();

  return subs.some(
    (s) =>
      s.username.toLowerCase() === uname &&
      new Date(s.validUntil) > now
  );
}

/**
 * Record a new payment (called after Razorpay verification).
 * Returns the stored subscription entry.
 */
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

/**
 * Get the latest (most recent, still active) subscription for a user.
 */
export function getSubscription(username: string): Subscription | undefined {
  const subs = readAll();
  const now = new Date();
  const uname = username.toLowerCase();

  return subs
    .filter(
      (s) =>
        s.username.toLowerCase() === uname &&
        new Date(s.validUntil) > now
    )
    .sort(
      (a, b) =>
        new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    )[0];
}

/**
 * Alias required by your API import:
 * Attempted import error showed: markSubscribed from "@/lib/subscriptions"
 * We implement it by delegating to recordPayment to keep your API unchanged.
 */
export async function markSubscribed(
  username: string,
  razorpayPaymentId: string,
  razorpayOrderId: string
): Promise<Subscription> {
  // If you later move to a real DB (Prisma/SQL/Firestore),
  // update this implementation accordingly.
  return recordPayment(username, razorpayPaymentId, razorpayOrderId);
}
