"use client";

import * as React from "react";

import { ImageDropzone } from "@/components/carousel/image-dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  SlideDraft,
  SlideDraftErrors,
  SlideImageDrafts,
} from "@/types/admin.carousel.types";
import {
  BREAKPOINTS,
  BREAKPOINT_HINTS,
  type Breakpoint,
} from "@/types/carousel.types";

interface SlideSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SlideDraft;
  images: SlideImageDrafts;
  errors: SlideDraftErrors;
  onChange: <K extends keyof SlideDraft>(
    field: K,
    value: SlideDraft[K],
  ) => void;
  onPickImage: (breakpoint: Breakpoint, file: File) => void;
  onClearImage: (breakpoint: Breakpoint) => void;
  /** Opened straight to the image that failed validation. */
  initialTab?: Breakpoint;
}

/**
 * Everything that isn't the canvas: name, images, overlay, live toggle.
 *
 * Kept out of the main screen so the editor and its properties can share one
 * row — these are set once per slide, while the layout is fiddled with
 * constantly.
 */
export function SlideSettingsSheet({
  open,
  onOpenChange,
  draft,
  images,
  errors,
  onChange,
  onPickImage,
  onClearImage,
  initialTab = "desktop",
}: SlideSettingsSheetProps) {
  const [tab, setTab] = React.useState<Breakpoint>(initialTab);

  // Follow the caller when it points at a specific breakpoint (a failed save
  // opens on the offending image) without an effect fighting manual clicks.
  const [lastInitial, setLastInitial] = React.useState(initialTab);
  if (initialTab !== lastInitial) {
    setLastInitial(initialTab);
    setTab(initialTab);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-xl font-bold text-secondary">
            Slide settings
          </SheetTitle>
          <SheetDescription>
            Name, images and how the slide behaves on the storefront.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="slide-title" className="text-secondary">
              Slide name
              <RequiredMark />
            </Label>
            <Input
              id="slide-title"
              value={draft.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Monsoon sale banner"
              aria-invalid={Boolean(errors.title)}
              className={cn(
                "h-11 rounded-none",
                errors.title && "border-destructive",
              )}
            />
            <p className="text-xs text-muted-foreground">
              Only you see this — it labels the slide in the list.
            </p>
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-secondary">
              Images
              <RequiredMark />
            </Label>
            <div className="flex gap-1 border border-border p-1">
              {BREAKPOINTS.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setTab(entry)}
                  aria-pressed={tab === entry}
                  className={cn(
                    "flex-1 cursor-pointer px-2 py-2 text-xs font-semibold transition-colors",
                    tab === entry
                      ? "bg-sidebar text-sidebar-foreground"
                      : "text-muted-foreground hover:text-secondary",
                  )}
                >
                  {BREAKPOINT_HINTS[entry].label}
                  {images[entry].previewUrl ? null : (
                    <span className="ml-1 opacity-50">–</span>
                  )}
                </button>
              ))}
            </div>

            <ImageDropzone
              breakpoint={tab}
              image={images[tab]}
              required={tab === "desktop"}
              fallbackNote="Nothing uploaded — falls back to the desktop image."
              error={tab === "desktop" ? errors.image_desktop : undefined}
              onPick={(file) => onPickImage(tab, file)}
              onClear={() => onClearImage(tab)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slide-overlay" className="text-secondary">
              Overlay · {draft.overlay_opacity}%
            </Label>
            <input
              id="slide-overlay"
              type="range"
              min={0}
              max={60}
              step={5}
              value={draft.overlay_opacity}
              onChange={(event) =>
                onChange("overlay_opacity", Number(event.target.value))
              }
              className="w-full cursor-pointer accent-[var(--sidebar)]"
            />
            <p className="text-xs text-muted-foreground">
              Darkens the photo so the text stays readable.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div>
              <Label htmlFor="slide-active" className="text-secondary">
                Live on the storefront
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn off to keep the slide as a draft.
              </p>
            </div>
            <Switch
              id="slide-active"
              checked={draft.is_active}
              onCheckedChange={(checked) => onChange("is_active", checked)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
