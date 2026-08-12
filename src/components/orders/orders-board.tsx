"use client";

import { Eye, Package, Printer, Search, X } from "lucide-react";
import * as React from "react";

import { OrderDetailSheet } from "@/components/orders/order-detail-sheet";
import { PaymentStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { formatPrice } from "@/lib/product";
import {
  DATE_PRESETS,
  ORDER_STATUSES,
  PAGE_SIZES,
  presetRange,
  type DatePreset,
} from "@/types/admin.order.types";

const PAYMENT_FILTERS = [
  { value: "", label: "All payments" },
  { value: "paid", label: "Paid" },
  { value: "created", label: "Unpaid" },
  { value: "failed", label: "Failed" },
];

function formatWhen(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-border bg-background p-4">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-secondary">{value}</p>
    </div>
  );
}

export function OrdersBoard() {
  const {
    orders,
    stats,
    count,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    paymentStatus,
    setPaymentStatus,
    dateFrom,
    dateTo,
    setRange,
    pageSize,
    setPageSize,
    setPage,
    setOrderStatus,
    receiptId,
    printInvoice,
  } = useAdminOrders();

  const [openId, setOpenId] = React.useState<number | null>(null);
  const [preset, setPreset] = React.useState<DatePreset>("all");

  function choosePreset(next: DatePreset) {
    setPreset(next);
    if (next === "all") {
      setRange("", "");
      return;
    }
    // "custom" leaves whatever is in the two fields alone.
    const option = DATE_PRESETS.find((entry) => entry.value === next);
    if (option?.days !== null && option?.days !== undefined) {
      const range = presetRange(option.days);
      setRange(range.from, range.to);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every order placed on the storefront.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={stats.total} />
        <Stat label="Awaiting fulfilment" value={stats.awaiting_fulfilment} />
        <Stat label="Delivered" value={stats.by_status.delivered ?? 0} />
        <Stat label="Paid revenue" value={formatPrice(stats.paid_revenue)} />
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="border border-border bg-background">
        {/* Filters, table and pagination are one panel: they are one tool, and
            three stacked cards made them read as three unrelated ones. */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:min-w-72">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order number, name, phone or payment id"
                className="h-10 rounded-none bg-background pl-9"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-secondary"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <NativeSelect
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
              wrapperClassName="sm:w-48"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>

            <NativeSelect
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              aria-label="Filter by payment"
              wrapperClassName="sm:w-44"
            >
              {PAYMENT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <NativeSelect
              value={preset}
              onChange={(event) =>
                choosePreset(event.target.value as DatePreset)
              }
              aria-label="Date range"
              wrapperClassName="sm:w-44"
            >
              {DATE_PRESETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>

            {/* The two fields stay visible on a preset so the chosen range is
            legible, not just implied by a dropdown label. */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => {
                  setPreset("custom");
                  setRange(event.target.value, dateTo);
                }}
                aria-label="From date"
                className="h-10 w-40 rounded-none bg-background"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => {
                  setPreset("custom");
                  setRange(dateFrom, event.target.value);
                }}
                aria-label="To date"
                className="h-10 w-40 rounded-none bg-background"
              />
              {dateFrom || dateTo ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => choosePreset("all")}
                  className="h-10 cursor-pointer rounded-none px-2 text-xs"
                >
                  Clear
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <label
                htmlFor="orders-page-size"
                className="text-sm whitespace-nowrap text-muted-foreground"
              >
                Rows
              </label>
              <NativeSelect
                id="orders-page-size"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                wrapperClassName="w-24"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>
        {/* The table scrolls sideways rather than squeezing eight columns into
            a phone — a squashed order number helps nobody. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="p-3 text-center font-bold text-secondary">#</th>
                <th className="p-3 font-bold text-secondary">Order</th>
                <th className="p-3 font-bold text-secondary">Customer</th>
                <th className="p-3 font-bold text-secondary">Date</th>
                <th className="p-3 text-center font-bold text-secondary">
                  Items
                </th>
                <th className="p-3 text-center font-bold text-secondary">
                  Total
                </th>
                <th className="p-3 text-center font-bold text-secondary">
                  Savings
                </th>
                <th className="p-3 text-center font-bold text-secondary">
                  Payment
                </th>
                <th className="p-3 text-center font-bold text-secondary">
                  Status
                </th>
                <th className="p-3 text-center font-bold text-secondary">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td colSpan={10} className="p-3">
                      <div className="h-6 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <Package className="size-5 text-primary" />
                      </span>
                      <p className="font-bold text-secondary">
                        {search || status || paymentStatus
                          ? "Nothing matches those filters"
                          : "No orders yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-b border-border bg-background last:border-b-0 hover:bg-muted/40"
                  >
                    {/* Continuous across pages: page two starts at 21, not 1,
                        so a row can be referred to by number over the phone. */}
                    <td className="p-3 text-center text-muted-foreground tabular-nums">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="p-3 font-medium whitespace-nowrap text-secondary">
                      {order.order_number}
                    </td>
                    <td className="max-w-48 truncate p-3 text-secondary">
                      {order.address.full_name}
                      <span className="block text-xs text-muted-foreground">
                        {order.address.city}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {formatWhen(order.created_at)}
                    </td>
                    <td className="p-3 text-center text-secondary tabular-nums">
                      {order.item_count}
                    </td>
                    <td className="p-3 text-center font-medium text-secondary tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    {/* At a glance: whether anything came off, and via what. */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {order.coupon_code || Number(order.offer_savings) > 0 ? (
                        <span className="flex flex-col items-center gap-0.5">
                          {order.coupon_code ? (
                            <span className="font-mono text-xs font-bold tracking-wider text-primary">
                              {order.coupon_code} −{formatPrice(order.discount)}
                            </span>
                          ) : null}
                          {Number(order.offer_savings) > 0 ? (
                            <span className="text-xs text-muted-foreground">
                              Offers −{formatPrice(order.offer_savings)}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    {/* The select stays its own width and is centred as a
                        block — text-center would only move its label. */}
                    <td className="p-3">
                      {/* Editable in place: moving a parcel along is the job
                          this screen exists for, and it should not need a
                          detour through a detail view. */}
                      <NativeSelect
                        value={order.status}
                        onChange={(event) =>
                          void setOrderStatus(order, event.target.value)
                        }
                        aria-label={`Status for ${order.order_number}`}
                        className="h-8 pr-8 pl-2 text-xs"
                        wrapperClassName="mx-auto w-36"
                      >
                        {ORDER_STATUSES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void printInvoice(order)}
                          disabled={
                            receiptId === order.id ||
                            order.payment_status !== "paid"
                          }
                          aria-label={`Print invoice for ${order.order_number}`}
                          title={
                            order.payment_status === "paid"
                              ? "Print invoice"
                              : "No invoice until the payment is confirmed"
                          }
                          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Printer className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenId(order.id)}
                          aria-label={`View ${order.order_number}`}
                          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Eye className="size-4" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {count > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground tabular-nums">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, count)} of {count}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!hasPrevious}
                onClick={() => setPage(page - 1)}
                className="h-8 cursor-pointer rounded-none text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!hasNext}
                onClick={() => setPage(page + 1)}
                className="h-8 cursor-pointer rounded-none text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <OrderDetailSheet
        orderId={openId}
        onOpenChange={(open) => !open && setOpenId(null)}
      />
    </div>
  );
}
