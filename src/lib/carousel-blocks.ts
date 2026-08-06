import {
  BREAKPOINTS,
  type BlockAlign,
  type BlockLayout,
  type Breakpoint,
  type FocusPoint,
  type FontWeight,
  type SlideBlock,
} from "@/types/carousel.types";

/** A readable id that survives a round trip and is stable in React keys. */
function blockId(): string {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Smaller screens get smaller type by default.
 *
 * A new block starts in the same spot everywhere, so the layout is usable
 * before anyone touches the tablet or mobile view — but a 64px heading that
 * fits a widescreen banner overflows a phone crop, so the starting size
 * shrinks with the breakpoint.
 */
const SIZE_FACTOR: Record<Breakpoint, number> = {
  desktop: 1,
  tablet: 0.75,
  mobile: 0.55,
};

function layoutsFor(x: number, y: number, fontSize: number, width: number) {
  return Object.fromEntries(
    BREAKPOINTS.map((breakpoint) => [
      breakpoint,
      {
        x,
        y,
        // Narrower canvases need proportionally wider blocks to hold the
        // same amount of text, so width goes the other way from font size.
        width: Math.min(
          100,
          Math.round(width / (SIZE_FACTOR[breakpoint] + 0.35)),
        ),
        font_family: "sans" as const,
        font_size: Math.round(fontSize * SIZE_FACTOR[breakpoint]),
        font_weight: 700 as const,
        line_height: 1.2,
        letter_spacing: 0,
        align: "left" as const,
      },
    ]),
  ) as Record<Breakpoint, BlockLayout>;
}

export function newTextBlock(): SlideBlock {
  return {
    id: blockId(),
    type: "text",
    ...layoutsFor(50, 50, 64, 45),
    rotation: 0,
    radius: 0,
    opacity: 100,
    text: "New heading",
    color: "#FFFFFF",
    src: "",
    url: "",
    is_external: false,
    button_color: "primary",
    button_variant: "filled",
  };
}

export function newImageBlock(localPreview: string): SlideBlock {
  return {
    ...newTextBlock(),
    id: blockId(),
    type: "image",
    text: "Image",
    localPreview,
    ...layoutsFor(50, 50, 48, 25),
  };
}

export function newButtonBlock(): SlideBlock {
  return {
    ...newTextBlock(),
    id: blockId(),
    type: "button",
    ...layoutsFor(50, 70, 22, 25),
    text: "Shop now",
    url: "/products",
  };
}

/** Patch one breakpoint's layout, leaving the other two alone. */
export function withLayout(
  block: SlideBlock,
  breakpoint: Breakpoint,
  patch: Partial<BlockLayout>,
): SlideBlock {
  return {
    ...block,
    [breakpoint]: { ...block[breakpoint], ...patch },
  };
}

export const DEFAULT_FOCUS: FocusPoint = { x: 50, y: 50 };

/**
 * Fill in anything a block is missing.
 *
 * Blocks live in a JSONField, so a row written by an older shape — or a page
 * still holding pre-reload state — can arrive without a key the inspector
 * binds an input to. A missing value flips that input from controlled to
 * uncontrolled, which React warns about and which loses the user's edit.
 */
export function normaliseBlock(block: SlideBlock): SlideBlock {
  // An earlier shape kept one width on the block instead of one per
  // breakpoint; fall back to it before the default.
  const legacy = block as unknown as {
    width?: number;
    font_weight?: FontWeight;
    line_height?: number;
    letter_spacing?: number;
    align?: BlockAlign;
  };
  const legacyWidth = legacy.width;

  const layouts = Object.fromEntries(
    BREAKPOINTS.map((breakpoint) => {
      const layout = block[breakpoint] ?? {};
      return [
        breakpoint,
        {
          x: layout.x ?? 50,
          y: layout.y ?? 50,
          width: layout.width ?? legacyWidth ?? 40,
          // Typography used to live on the block, so fall back to it before
          // the defaults when opening a slide saved under the old shape.
          font_family: layout.font_family ?? "sans",
          font_size: layout.font_size ?? 48,
          font_weight: layout.font_weight ?? legacy.font_weight ?? 700,
          line_height: layout.line_height ?? legacy.line_height ?? 1.2,
          letter_spacing: layout.letter_spacing ?? legacy.letter_spacing ?? 0,
          align: layout.align ?? legacy.align ?? "left",
        },
      ];
    }),
  ) as Record<Breakpoint, BlockLayout>;

  return {
    ...block,
    ...layouts,
    rotation: block.rotation ?? 0,
    radius: block.radius ?? 0,
    opacity: block.opacity ?? 100,
    color: block.color ?? "#FFFFFF",
    text: block.text ?? "",
    src: block.src ?? "",
    url: block.url ?? "",
    is_external: block.is_external ?? false,
    button_color: block.button_color ?? "primary",
    button_variant: block.button_variant ?? "filled",
  };
}

/** Copy one breakpoint's layout onto the other two. */
export function copyLayoutToAll(
  block: SlideBlock,
  from: Breakpoint,
): SlideBlock {
  const source = block[from];
  return {
    ...block,
    ...(Object.fromEntries(
      BREAKPOINTS.map((breakpoint) => [breakpoint, { ...source }]),
    ) as Record<Breakpoint, BlockLayout>),
  };
}
