import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt, notes, currency = "INR" } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys not configured on server" },
        { status: 500 }
      );
    }

    // Razorpay amount in paise (e.g. ₹100 = 10000 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

    const orderPayload = {
      amount: amountInPaise,
      currency,
      receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes: notes || {},
    };

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Razorpay order creation failed:", errData);
      return NextResponse.json(
        { error: errData.error?.description || "Failed to create Razorpay order" },
        { status: res.status }
      );
    }

    const order = await res.json();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error("Order creation server error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
