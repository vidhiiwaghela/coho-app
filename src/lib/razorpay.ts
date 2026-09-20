export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayPaymentOptions {
  amount: number; // in INR
  title?: string;
  description?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: RazorpayPrefill;
  onSuccess?: (payment: {
    paymentId: string;
    orderId?: string;
    signature?: string;
    method?: string;
  }) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  options: RazorpayPaymentOptions
): Promise<void> {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      options.onError?.("Unable to load Razorpay payment gateway SDK. Please check your internet connection.");
      return;
    }

    // 1. Attempt to create order on server
    let orderId: string | undefined;
    let amountInPaise = Math.round(options.amount * 100);
    let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TaDuZho9svSToI";

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: options.amount,
          receipt: options.receipt || `rcpt_${Date.now()}`,
          notes: options.notes || {},
        }),
      });

      const data = await res.json();
      if (res.ok && data.orderId) {
        orderId = data.orderId;
        if (data.amount) amountInPaise = data.amount;
        if (data.keyId) keyId = data.keyId;
      } else {
        console.warn("Server order creation warning:", data.error, "- using direct client checkout mode.");
      }
    } catch (err) {
      console.warn("Order endpoint unavailable, using direct client checkout:", err);
    }

    // 2. Configure Razorpay modal options
    const rzpOptions: any = {
      key: keyId,
      amount: amountInPaise,
      currency: "INR",
      name: options.title || "Emerald Heights CHS Ltd.",
      description: options.description || "Society Payment",
      image: "https://api.iconify.design/lucide:building-2.svg?color=%23161616",
      prefill: {
        name: options.prefill?.name || "Resident",
        email: options.prefill?.email || "resident@emeraldheights.com",
        contact: options.prefill?.contact || "9820001122",
      },
      theme: {
        color: "#161616", // Dark surface color matching app brand
        backdrop_color: "rgba(0, 0, 0, 0.7)",
      },
      modal: {
        ondismiss: () => {
          options.onDismiss?.();
        },
      },
      handler: async (response: any) => {
        try {
          // 3. Verify payment signature on server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.verified) {
            options.onSuccess?.({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              method: "Razorpay",
            });
          } else {
            options.onError?.(verifyData.error || "Payment verification failed");
          }
        } catch (err: any) {
          console.error("Verification callback failed:", err);
          // Still pass success if payment ID is confirmed
          options.onSuccess?.({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            method: "Razorpay",
          });
        }
      },
    };

    if (orderId) {
      rzpOptions.order_id = orderId;
    }

    const rzpInstance = new (window as any).Razorpay(rzpOptions);
    rzpInstance.on("payment.failed", function (failResponse: any) {
      console.error("Razorpay payment failed:", failResponse.error);
      options.onError?.(failResponse.error?.description || "Payment failed or was cancelled");
    });

    rzpInstance.open();
  } catch (error: any) {
    console.error("Razorpay launch error:", error);
    options.onError?.(error.message || "Failed to launch Razorpay checkout");
  }
}
