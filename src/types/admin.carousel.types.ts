/** Admin console carousel management — form drafts and write payloads. */

import type {
  Breakpoint,
  SlideBlock,
  SlideFocus,
} from "@/types/carousel.types";

/** The slide fields as the form holds them, before they become a payload. */
export interface SlideDraft {
  title: string;
  overlay_opacity: number;
  image_focus: SlideFocus;
  blocks: SlideBlock[];
  is_active: boolean;
}

export type SlideDraftErrors = Partial<Record<keyof SlideDraft, string>> & {
  image_desktop?: string;
};

/**
 * One breakpoint's image while editing: either a file the admin just picked,
 * or the URL already on the server.
 */
export interface SlideImageDraft {
  file: File | null;
  /** Object URL for a new file, or the saved URL. Null means "nothing here". */
  previewUrl: string | null;
  /** True once a saved image is removed, so the server clears the field. */
  cleared: boolean;
}

export type SlideImageDrafts = Record<Breakpoint, SlideImageDraft>;
