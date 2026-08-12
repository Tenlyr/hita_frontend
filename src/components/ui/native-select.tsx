import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A plain `<select>` with the browser chevron replaced.
 *
 * The native arrow is drawn inside the content box, so it sits at whatever
 * `padding-right` happens to be and crowds the border. `appearance-none` plus
 * an absolutely positioned icon puts it at a fixed inset instead, and keeps
 * every select on the screen looking the same.
 */
function NativeSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: React.ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    // Fills its container by default: an inline-flex wrapper sizes itself to
    // the widest option, so two selects in a column came out different widths
    // depending on their content. Constrain via wrapperClassName, not the
    // select's own class — the select can only fill what the wrapper gives it.
    <div className={cn("relative inline-flex w-full", wrapperClassName)}>
      <select
        data-slot="native-select"
        className={cn(
          "h-10 w-full cursor-pointer appearance-none border border-border bg-background py-2 pr-9 pl-3 text-sm text-secondary outline-none focus-visible:border-primary",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export { NativeSelect };
