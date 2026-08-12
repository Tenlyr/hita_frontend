"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

/**
 * The shadcn chart wrapper, trimmed to what this console uses.
 *
 * Its whole job is turning a config of `{ key: { label, color } }` into CSS
 * variables on a wrapper, so series colours come from the theme rather than
 * being hardcoded into every chart — and so they follow the palette when it
 * changes.
 */
export type ChartConfig = Record<
  string,
  { label?: React.ReactNode; color?: string }
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          // Recharts paints its own grid and axis strokes; these pull them
          // back to the theme's border and muted colours.
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/60",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/60",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colored = Object.entries(config).filter(([, item]) => item.color);
  if (!colored.length) return null;

  return (
    <style
      // A style tag rather than inline vars: the selector has to be scoped to
      // this chart's id so two charts on one screen cannot bleed into each
      // other. The content is our own config, not user input.
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${colored
          .map(([key, item]) => `  --color-${key}: ${item.color};`)
          .join("\n")}\n}`,
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  hideLabel = false,
  className,
}: React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: {
    name?: string;
    dataKey?: string;
    value?: unknown;
    color?: string;
  }[];
  label?: unknown;
  labelFormatter?: (value: unknown) => React.ReactNode;
  formatter?: (value: unknown, name: string) => React.ReactNode;
  hideLabel?: boolean;
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1.5 border border-border bg-background px-3 py-2 text-xs shadow-md",
        className,
      )}
    >
      {!hideLabel ? (
        <p className="font-bold text-secondary">
          {labelFormatter ? labelFormatter(label) : String(label ?? "")}
        </p>
      ) : null}
      {payload.map((item, index) => {
        // Same reasoning as the legend: a pie's slices share one dataKey and
        // differ by name, so the name leads and config is a lookup, not the
        // source of truth.
        const name = item.name ?? item.dataKey ?? String(index);
        const entry = config[name] ?? config[item.dataKey ?? ""];
        return (
          <div key={`${name}-${index}`} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0"
              style={{
                backgroundColor: item.color ?? `var(--color-${name})`,
              }}
            />
            <span className="flex-1 text-muted-foreground capitalize">
              {entry?.label ?? name}
            </span>
            <span className="font-medium text-secondary tabular-nums">
              {formatter
                ? formatter(item.value, String(item.dataKey ?? name))
                : String(item.value ?? "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChartLegendContent({
  payload,
  className,
}: {
  payload?: { dataKey?: string; value?: string; color?: string }[];
  className?: string;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-3",
        className,
      )}
    >
      {payload.map((item, index) => {
        // A pie's slices all share one dataKey ("count") and differ by name,
        // so keying off dataKey labelled every slice identically. The entry's
        // own value is the name; config is only consulted when it has one.
        const name = item.value ?? item.dataKey ?? "";
        const label = config[name]?.label ?? name;
        return (
          <div key={`${name}-${index}`} className="flex items-center gap-1.5">
            <span
              className="size-2.5 shrink-0"
              // Recharts hands over the colour it actually painted, which is
              // the only thing that can be right for a per-slice <Cell>.
              style={{
                backgroundColor: item.color ?? `var(--color-${name})`,
              }}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
