import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUBSCRIPTION_AMOUNT_PAISE, SUBSCRIPTION_LABEL } from "@/lib/config";

const rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

export async function POST(req: NextRequest) {
  try {
    const order = await rzp.orders.create({
      amount:   SUBSCRIPTION_AMOUNT_PAISE,
      currency: "INR",
      notes: { product: "TradePulse Pro", label: SUBSCRIPTION_LABEL },
    });
    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    RAZORPAY_KEY_ID,
    });
  } catch (e: any) {
    console.error("Razorpay order error:", e);
    return NextResponse.json({ error: e.message ?? "Order creation failed" }, { status: 500 });
  }
}
