// ═══════════════════════════════════════════════════════════════════
//  TRADEPULSE CONFIG — Paste your keys and add users here
//  This file is gitignored. NEVER push to GitHub.
// ═══════════════════════════════════════════════════════════════════

// ── 1. ANTHROPIC API KEY ─────────────────────────────────────────
//    Get yours at: https://console.anthropic.com
export const ANTHROPIC_API_KEY = "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";

// ── 2. RAZORPAY KEYS ─────────────────────────────────────────────
//    Get yours at: https://dashboard.razorpay.com/app/keys
export const RAZORPAY_KEY_ID     = "rzp_live_SRlJlNtufjf5aW";
export const RAZORPAY_KEY_SECRET = "Fe0E7AUj43bIKW5PTrE2yTy1";

// ── 3. SESSION SECRET ─────────────────────────────────────────────
//    Any long random string (e.g. mash your keyboard for 30 chars)
export const SESSION_SECRET = "tradepulse_super_secret_2025_xyz";

// ── 4. SUBSCRIPTION PRICE ────────────────────────────────────────
//    Amount in PAISE (₹2000 = 200000 paise)
export const SUBSCRIPTION_AMOUNT_PAISE = 200000;
export const SUBSCRIPTION_LABEL        = "₹2,000 / month";
export const TRIAL_DAYS                = 30;

// ═══════════════════════════════════════════════════════════════════
//  5. USERS — Add as many users as you want below
//     trialStartDate: the date this user's 30-day free trial begins
//                     format: "YYYY-MM-DD"
// ═══════════════════════════════════════════════════════════════════
export interface AppUser {
  username: string;
  password: string;
  displayName: string;
  trialStartDate: string; // "YYYY-MM-DD"
  role: "admin" | "user";
}

export const USERS: AppUser[] = [
  {
    username: "yashu",
    password: "Yashu@2025",
    displayName: "Yashu D.",
    trialStartDate: "2025-03-13",
    role: "admin",
  },
  // ── Add more users below ──────────────────────────────────────
  // {
  //   username: "trader2",
  //   password: "Trader@2025",
  //   displayName: "Rahul S.",
  //   trialStartDate: "2025-03-15",
  //   role: "user",
  // },
];

// ── Helper: Find user by username ─────────────────────────────────
export function findUser(username: string): AppUser | undefined {
  return USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

// ── Helper: Check if user's trial is still valid ──────────────────
export function isTrialActive(user: AppUser): boolean {
  const start = new Date(user.trialStartDate);
  const now   = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < TRIAL_DAYS;
}

// ── Helper: Days remaining in trial ───────────────────────────────
export function trialDaysLeft(user: AppUser): number {
  const start = new Date(user.trialStartDate);
  const now   = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DAYS - diffDays);
}
