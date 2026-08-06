import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const STARS = 5;

interface StarRatingProps {
  value: number | null;
  /** Renders the numeric value in brackets beside the stars. */
  showValue?: boolean;
  className?: string;
  starClassName?: string;
}

export function StarRating({
  value,
  showValue = true,
  className,
  starClassName,
}: StarRatingProps) {
  const rating = value ?? 0;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Rated ${rating.toFixed(1)} out of ${STARS}`}
    >
      {Array.from({ length: STARS }).map((_, star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            "size-4",
            star < Math.round(rating)
              ? "fill-[#EE9818] text-[#EE9818]"
              : "fill-muted text-muted",
            starClassName,
          )}
        />
      ))}
      {showValue ? (
        <span className="ml-1.5 text-sm text-muted-foreground">
          ( {rating ? rating.toFixed(1) : 0} )
        </span>
      ) : null}
    </div>
  );
}
