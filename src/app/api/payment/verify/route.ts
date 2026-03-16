import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { RAZORPAY_KEY_SECRET } from "@/lib/config";
import { markSubscribed } from "@/lib/subscriptions";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // HMAC verification
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Mark user as subscribed
    const user = await getSessionUser(req);
    if (user) {
      await markSubscribed(user.username, razorpay_payment_id, razorpay_order_id);
    }

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (e: any) {
    console.error("Verify error:", e);
    return NextResponse.json({ error: e.message ?? "Verification failed" }, { status: 500 });
  }
}
