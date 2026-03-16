import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUser, SESSION_SECRET, isTrialActive, trialDaysLeft, SUBSCRIPTION_LABEL, TRIAL_DAYS } from "@/lib/config";
import { hasActiveSubscription, getSubscription } from "@/lib/subscriptions";

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get("tp_session");
    if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = Buffer.from(session.value, "base64").toString("utf-8");
    const [username, secret] = decoded.split(":");
    if (secret !== SESSION_SECRET) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const user = findUser(username);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trialActive = isTrialActive(user);
    const daysLeft    = trialDaysLeft(user);
    const subscribed  = hasActiveSubscription(username);
    const sub         = subscribed ? getSubscription(username) : undefined;

    return NextResponse.json({
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      trialStartDate: user.trialStartDate,
      trialDaysLeft: daysLeft,
      trialActive,
      subscribed,
      subscriptionValidUntil: sub?.validUntil ?? null,
      accessGranted: trialActive || subscribed,
      subscriptionLabel: SUBSCRIPTION_LABEL,
      trialDays: TRIAL_DAYS,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
