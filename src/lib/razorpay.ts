const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error?: { description?: string; reason?: string; code?: string };
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loader: Promise<boolean> | null = null;

/**
 * Loads Checkout on demand.
 *
 * Kept out of the document head: it is a third-party script that only matters
 * on one click, and the promise is cached so a second attempt after a failed
 * payment does not add another tag.
 */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!loader) {
    loader = new Promise<boolean>((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );
      const script = existing ?? document.createElement("script");

      script.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      script.addEventListener("error", () => {
        // Cleared so a retry can try again rather than resolving false forever.
        loader = null;
        resolve(false);
      });

      if (!existing) {
        script.src = SCRIPT_SRC;
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }

  return loader;
}

export type { RazorpayInstance };
