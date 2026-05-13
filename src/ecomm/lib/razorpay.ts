/* eslint-disable @typescript-eslint/no-explicit-any */

/** VITE_RAZORPAY_KEY_ID is publishable; the server (later) will create real Orders. */
export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";
}

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as any).Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export interface RazorpayOpenParams {
  amountInPaise: number;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  themeColor?: string;
  /** Real flows pass an Order id from your server. Test mode can omit. */
  orderId?: string;
}

export interface RazorpayResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export function openRazorpayCheckout(params: RazorpayOpenParams): Promise<RazorpayResult> {
  return new Promise((resolve, reject) => {
    const key = getRazorpayKeyId();
    if (!key) {
      reject(new Error("Razorpay key is not configured. Add VITE_RAZORPAY_KEY_ID as a Workspace Build Secret."));
      return;
    }
    const RZ = (window as any).Razorpay;
    if (!RZ) {
      reject(new Error("Razorpay SDK failed to load. Check your network and try again."));
      return;
    }
    const rz = new RZ({
      key,
      amount: params.amountInPaise,
      currency: "INR",
      name: params.name,
      description: params.description,
      order_id: params.orderId,
      prefill: params.prefill,
      notes: params.notes,
      theme: { color: params.themeColor ?? "#7c3aed" },
      handler: (response: RazorpayResult) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    });
    rz.open();
  });
}