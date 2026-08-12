"use client";

import {
  Bell,
  IndianRupee,
  Package,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { APP_ROUTES } from "@/constants/routes";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import type {
  ActivityEntry,
  RecentTransaction,
} from "@/types/admin.dashboard.types";
import { ORDER_STATUSES } from "@/types/admin.order.types";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const CARD_CLASS = "rounded-none border-border bg-background shadow-none";

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-3)" },
} satisfies ChartConfig;

const statusConfig = {
  count: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig;

const STATUS_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Compact rupees for an axis, where "₹61,491.23" would not fit. */
function shortMoney(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
}

function when(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof ShoppingBag;
  href?: string;
}) {
  const body = (
    <Card
      className={cn(CARD_CLASS, href && "transition-shadow hover:shadow-md")}
    >
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-black text-secondary">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-primary" />
        </span>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function TransactionRow({ item }: { item: RecentTransaction }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center bg-sidebar text-sidebar-foreground">
        <ShoppingBag className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-secondary">
          {item.product_name}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {item.order_number}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-primary tabular-nums">
          {formatPrice(item.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{when(item.created_at)}</p>
      </div>
    </li>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const paid = entry.payment_status === "paid";
  return (
    <li className="relative border-l border-border py-3 pl-5">
      <span
        className={cn(
          "absolute top-5 -left-[4.5px] size-2 rounded-full",
          paid ? "bg-primary" : "bg-destructive",
        )}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-secondary">
          {entry.order_number}
        </span>
        <span
          className={cn(
            "px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
            paid
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {entry.payment_status}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {entry.customer || "Guest"} · {formatPrice(entry.total)} ·{" "}
        {when(entry.created_at)}
      </p>
    </li>
  );
}

export function DashboardView() {
  const { summary, isLoading, error } = useDashboard();

  if (error) {
    return (
      <p
        role="alert"
        className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse bg-muted" />
          ))}
        </div>
        <div className="h-80 animate-pulse bg-muted" />
      </div>
    );
  }

  const { totals, monthly, by_status, top_products } = summary;
  // Recharts needs numbers; the API sends decimal strings so nothing is
  // rounded in transit.
  const revenueData = monthly.map((point) => ({
    ...point,
    revenue: Number(point.revenue),
  }));
  // "Pending payment" beats "pending" in a legend, and the donut needs the
  // readable name as its nameKey for the same reason.
  const statusData = by_status.map((entry) => ({
    ...entry,
    label:
      ORDER_STATUSES.find((option) => option.value === entry.status)?.label ??
      entry.status,
  }));
  const topData = top_products.map((product) => ({
    ...product,
    revenue: Number(product.revenue),
    name:
      product.name.length > 18 ? `${product.name.slice(0, 18)}…` : product.name,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={String(totals.sales)}
          hint={`${totals.units} items shipped`}
          icon={ShoppingBag}
          href={APP_ROUTES.APP.ORDERS}
        />
        <StatCard
          label="Total Revenue"
          value={formatPrice(totals.revenue)}
          hint={`${formatPrice(totals.average_order)} average order`}
          icon={IndianRupee}
        />
        <StatCard
          label="Total Products"
          value={String(totals.products)}
          hint={`${summary.low_stock.length} running low`}
          icon={Package}
          href={APP_ROUTES.APP.INVENTORY}
        />
        <StatCard
          label="Needs Attention"
          value={String(totals.awaiting_fulfilment)}
          hint={`${totals.unread_messages} unread messages`}
          icon={Bell}
          href={APP_ROUTES.APP.ORDERS}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className={CARD_CLASS}>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Paid revenue and order count, month by month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-72 w-full">
              <AreaChart data={revenueData} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={shortMoney}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) =>
                        name === "revenue"
                          ? formatPrice(String(value))
                          : String(value)
                      }
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className={CARD_CLASS}>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Where every order currently sits.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="h-72 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className={CARD_CLASS}>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recent_transactions.length ? (
              <ul className="divide-y divide-border">
                {summary.recent_transactions.map((item) => (
                  <TransactionRow key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No orders yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={CARD_CLASS}>
          <CardHeader>
            <CardTitle>Best Sellers</CardTitle>
            <CardDescription>By units sold on paid orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {topData.length ? (
              <ChartContainer
                config={{ units: { label: "Units", color: "var(--chart-2)" } }}
                className="h-64 w-full"
              >
                <BarChart
                  data={topData}
                  layout="vertical"
                  margin={{ left: 8, right: 12 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value} sold`}
                      />
                    }
                  />
                  <Bar dataKey="units" fill="var(--color-units)" radius={0} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing sold yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={CARD_CLASS}>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.activity.length ? (
              <ul>
                {summary.activity.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing has happened yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {summary.low_stock.length ? (
        <Card className={CARD_CLASS}>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <TriangleAlert className="size-4 text-destructive" />
            <CardTitle>Running Low</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {summary.low_stock.map((entry) => (
                <li
                  key={entry.variant_id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate text-secondary">
                    {entry.name}
                    {entry.size ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {entry.size}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 text-xs font-bold",
                      entry.quantity === 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {entry.quantity === 0
                      ? "Out of stock"
                      : `${entry.quantity} left`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
