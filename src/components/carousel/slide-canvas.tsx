"use client";

import * as React from "react";

import { SweepButton } from "@/components/ui/sweep-button";
import { cn } from "@/lib/utils";
import {
  fontStack,
  REFERENCE_WIDTH,
  resolveBlock,
  type BlockLayout,
  type Breakpoint,
  type SlideBlock,
} from "@/types/carousel.types";

/**
 * Font sizes are authored against a 1920px slide and emitted in `cqw`, so the
 * same value renders proportionally at any container width. 100cqw is the
 * container's width, so 1px at 1920 is (1 / 19.2) cqw.
 */
export function fontSizeToCqw(px: number): string {
  return `${(px / (REFERENCE_WIDTH / 100)).toFixed(4)}cqw`;
}

interface BlockViewProps {
  block: SlideBlock;
  breakpoint: Breakpoint;
  /** Live navigation is off inside the editor. */
  interactive: boolean;
  isSelected?: boolean;
  onPointerDown?: (event: React.PointerEvent) => void;
}

function BlockView({
  block,
  breakpoint,
  interactive,
  isSelected = false,
  onPointerDown,
}: BlockViewProps) {
  const resolved = resolveBlock(block, breakpoint);
  const isEditable = Boolean(onPointerDown);

  return (
    <div
      data-block-id={block.id}
      onPointerDown={onPointerDown}
      style={{
        left: `${resolved.x}%`,
        top: `${resolved.y}%`,
        width: `${resolved.width}%`,
        opacity: resolved.opacity / 100,
        // Anchored at its own centre, which is what makes dragging behave.
        transform: `translate(-50%, -50%) rotate(${resolved.rotation}deg)`,
      }}
      className={cn(
        "absolute",
        isEditable && "cursor-move touch-none select-none",
        isSelected && "outline-2 outline-offset-2 outline-primary",
      )}
    >
      {block.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved.localPreview ?? resolved.src_url ?? ""}
          alt=""
          draggable={false}
          style={{ borderRadius: fontSizeToCqw(resolved.radius) }}
          className="block w-full select-none"
        />
      ) : block.type === "button" ? (
        <div
          className={cn(
            "flex",
            resolved.align === "center" && "justify-center",
            resolved.align === "right" && "justify-end",
          )}
        >
          <SweepButton
            label={resolved.text || "Button"}
            color={resolved.button_color}
            variant={resolved.button_variant}
            href={interactive ? resolved.url : undefined}
            external={interactive && resolved.is_external}
            className={cn(
              "text-[length:inherit]",
              !interactive && "pointer-events-none",
            )}
            style={{
              fontFamily: fontStack(resolved.font_family),
              fontSize: fontSizeToCqw(resolved.font_size),
              fontWeight: resolved.font_weight,
            }}
            // em padding, so the button scales with its own font size rather
            // than staying a fixed rem box in a small preview.
            contentClassName="px-[1.4em] py-[0.55em]"
          />
        </div>
      ) : (
        <p
          style={{
            fontFamily: fontStack(resolved.font_family),
            fontSize: fontSizeToCqw(resolved.font_size),
            fontWeight: resolved.font_weight,
            color: resolved.color,
            lineHeight: resolved.line_height,
            letterSpacing: `${resolved.letter_spacing}em`,
            textAlign: resolved.align,
          }}
          className="m-0 break-words whitespace-pre-wrap"
        >
          {resolved.text}
        </p>
      )}
    </div>
  );
}

interface SlideCanvasProps {
  blocks: SlideBlock[];
  breakpoint: Breakpoint;
  overlayOpacity: number;
  interactive?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Called with the new centre, in percent, while dragging. */
  onMove?: (id: string, x: number, y: number) => void;
  className?: string;
}

/**
 * The positioned blocks over a slide image.
 *
 * One component for the storefront hero and the console canvas: two would
 * drift and the editor would stop telling the truth about what ships. Passing
 * `onMove` is what turns it into an editor.
 */
export function SlideCanvas({
  blocks,
  breakpoint,
  overlayOpacity,
  interactive = true,
  selectedId = null,
  onSelect,
  onMove,
  className,
}: SlideCanvasProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  function handlePointerDown(event: React.PointerEvent, block: SlideBlock) {
    if (!onMove || !ref.current) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(block.id);

    const rect = ref.current.getBoundingClientRect();
    const resolved = resolveBlock(block, breakpoint);
    // Remember where inside the block the pointer landed, or it snaps its
    // centre to the cursor on the first move.
    drag.current = {
      id: block.id,
      offsetX: ((event.clientX - rect.left) / rect.width) * 100 - resolved.x,
      offsetY: ((event.clientY - rect.top) / rect.height) * 100 - resolved.y,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const current = drag.current;
    if (!current || !onMove || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x =
      ((event.clientX - rect.left) / rect.width) * 100 - current.offsetX;
    const y =
      ((event.clientY - rect.top) / rect.height) * 100 - current.offsetY;

    // Snap to the centre lines — eyeballing 50% by hand never lands exactly.
    const snap = (value: number) => (Math.abs(value - 50) < 1.5 ? 50 : value);

    onMove(
      current.id,
      Math.round(Math.min(120, Math.max(-20, snap(x))) * 100) / 100,
      Math.round(Math.min(120, Math.max(-20, snap(y))) * 100) / 100,
    );
  }

  function endDrag() {
    drag.current = null;
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={() => onSelect?.(null)}
      style={{ containerType: "inline-size" }}
      className={cn("absolute inset-0", className)}
    >
      {overlayOpacity > 0 ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      ) : null}

      {blocks.map((block) => (
        <BlockView
          key={block.id}
          block={block}
          breakpoint={breakpoint}
          interactive={interactive}
          isSelected={selectedId === block.id}
          onPointerDown={
            onMove ? (event) => handlePointerDown(event, block) : undefined
          }
        />
      ))}
    </div>
  );
}

function sameLayout(a: BlockLayout, b: BlockLayout): boolean {
  return a.x === b.x && a.y === b.y && a.font_size === b.font_size;
}

/* Same cut points as SlideImage, so the layout and the photo switch together. */
const VARIANTS: { breakpoint: Breakpoint; visibility: string }[] = [
  { breakpoint: "mobile", visibility: "sm:hidden" },
  { breakpoint: "tablet", visibility: "hidden sm:block lg:hidden" },
  { breakpoint: "desktop", visibility: "hidden lg:block" },
];

/**
 * The storefront canvas, picking its layout by viewport.
 *
 * Three CSS-switched copies rather than a `matchMedia` hook: reading the
 * viewport during render is what makes the server HTML and the first client
 * paint disagree. When no block carries an override there is nothing to
 * switch, so it collapses to a single copy.
 */
export function ResponsiveSlideCanvas({
  blocks,
  overlayOpacity,
}: {
  blocks: SlideBlock[];
  overlayOpacity: number;
}) {
  // Every block now carries all three layouts, so "does it have one" is
  // always true — the question is whether they actually differ.
  const isResponsive = blocks.some(
    (block) =>
      !sameLayout(block.desktop, block.tablet) ||
      !sameLayout(block.desktop, block.mobile),
  );

  if (!isResponsive) {
    return (
      <SlideCanvas
        blocks={blocks}
        breakpoint="desktop"
        overlayOpacity={overlayOpacity}
      />
    );
  }

  return (
    <>
      {/* The scrim belongs to the slide, not a breakpoint. Drawn once here so
          the three copies don't stack three of them. */}
      {overlayOpacity > 0 ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      ) : null}

      {VARIANTS.map((variant) => (
        <SlideCanvas
          key={variant.breakpoint}
          blocks={blocks}
          breakpoint={variant.breakpoint}
          overlayOpacity={0}
          className={variant.visibility}
        />
      ))}
    </>
  );
}
