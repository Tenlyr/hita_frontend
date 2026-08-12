import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/customer.order.types";

/* Tone carries meaning: gold for "money is in", grey for waiting, red for
   anything that went wrong, green for done. */
const ORDER_TONE: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/15 text-primary",
  packed: "bg-primary/15 text-primary",
  shipped: "bg-sidebar/15 text-sidebar",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-muted text-muted-foreground line-through",
  failed: "bg-destructive/10 text-destructive",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  created: "bg-muted text-muted-foreground",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-destructive/10 text-destructive",
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  created: "Unpaid",
  paid: "Paid",
  failed: "Failed",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-[10px] font-bold tracking-wide whitespace-nowrap uppercase",
        ORDER_TONE[status],
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-[10px] font-bold tracking-wide whitespace-nowrap uppercase",
        PAYMENT_TONE[status],
      )}
    >
      {PAYMENT_LABEL[status]}
    </span>
  );
}
