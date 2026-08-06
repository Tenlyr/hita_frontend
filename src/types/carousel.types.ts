/** Hero carousel slides — shared by the storefront and the admin console. */

/** The three art-directed sizes a slide can carry. */
export const BREAKPOINTS = ["mobile", "tablet", "desktop"] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

export type BlockType = "text" | "button" | "image";
export type BlockAlign = "left" | "center" | "right";
export type ButtonColor = "primary" | "secondary" | "sidebar";
export type ButtonVariant = "filled" | "bordered";

export const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800, 900] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

/**
 * Families the storefront can actually render.
 *
 * Deliberately limited to the site face and web-safe stacks: a font that only
 * exists in the console would preview correctly and then ship wrong.
 */
export const FONT_FAMILIES = [
  {
    value: "sans",
    label: "Josefin Sans",
    stack: "var(--font-sans), sans-serif",
  },
  {
    value: "serif",
    label: "Serif",
    stack: "Georgia, 'Times New Roman', serif",
  },
  {
    value: "grotesk",
    label: "Grotesque",
    stack: "'Helvetica Neue', Arial, sans-serif",
  },
  { value: "mono", label: "Mono", stack: "'Courier New', monospace" },
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number]["value"];

export function fontStack(family: FontFamily | string): string {
  return (
    FONT_FAMILIES.find((entry) => entry.value === family)?.stack ??
    FONT_FAMILIES[0].stack
  );
}

/**
 * Font sizes are px measured against a 1920px-wide slide.
 *
 * Rendering divides by this and emits `cqw`, so one number is correct at every
 * width — the 224px phone preview and the real hero show the same proportions
 * with no JS measurement.
 */
export const REFERENCE_WIDTH = 1920;

/** Where the photo is anchored, as object-position percents. */
export interface FocusPoint {
  x: number;
  y: number;
}

export type SlideFocus = Record<Breakpoint, FocusPoint>;

/** Where a block sits, and how big it is, at one breakpoint. */
/**
 * How a block looks at one breakpoint — placement *and* typography.
 *
 * Every type setting lives here rather than on the block: a headline that
 * reads well at 72px bold across a widescreen banner usually wants a
 * different face, weight and tracking once it is in a phone crop.
 */
export interface BlockLayout {
  x: number;
  y: number;
  width: number;
  font_family: FontFamily;
  font_size: number;
  font_weight: FontWeight;
  line_height: number;
  letter_spacing: number;
  align: BlockAlign;
}

export interface SlideBlock {
  id: string;
  type: BlockType;
  /**
   * One layout per breakpoint, each holding its own position and size.
   *
   * Stored outright rather than inherited-with-overrides: a mobile crop is a
   * different composition, so a desktop position rarely survives it, and
   * "inherit unless overridden" is a rule nobody laying out a banner should
   * have to keep in their head.
   */
  desktop: BlockLayout;
  tablet: BlockLayout;
  mobile: BlockLayout;
  rotation: number;
  /** Corner rounding, px at a 1920px slide — rendered in cqw like font_size. */
  radius: number;
  /** 0–100. */
  opacity: number;
  text: string;
  color: string;
  /**
   * Image blocks only: a storage-relative path. `src_url` is the absolute URL
   * to render — `src` is sent back untouched so the next save still resolves.
   */
  src: string;
  src_url?: string;
  /** Set client-side while a newly picked file has not been uploaded yet. */
  localPreview?: string;
  /** Button blocks only. */
  url: string;
  is_external: boolean;
  button_color: ButtonColor;
  button_variant: ButtonVariant;
}

export interface CarouselSlide {
  id: number;
  title: string;
  /** Always populated — tablet and mobile fall back to desktop server-side. */
  image_desktop: string;
  image_tablet: string;
  image_mobile: string;
  /** Whether a file was actually uploaded, as opposed to falling back. */
  has_tablet_image: boolean;
  has_mobile_image: boolean;
  /** 0–60. A scrim so copy survives a bright photo. */
  overlay_opacity: number;
  image_focus: SlideFocus;
  blocks: SlideBlock[];
  is_active: boolean;
  sort_order: number;
}

export interface CarouselSlideList {
  results: CarouselSlide[];
  count: number;
}

/** Recommended upload sizes, shown in the editor's dropzones. */
export const BREAKPOINT_HINTS: Record<
  Breakpoint,
  { label: string; size: string }
> = {
  mobile: { label: "Mobile", size: "768 × 900" },
  tablet: { label: "Tablet", size: "1024 × 700" },
  desktop: { label: "Desktop", size: "1920 × 800" },
};

/** The block flattened for one breakpoint, ready to render. */
export function resolveBlock(
  block: SlideBlock,
  breakpoint: Breakpoint,
): SlideBlock & BlockLayout {
  return { ...block, ...block[breakpoint] };
}
