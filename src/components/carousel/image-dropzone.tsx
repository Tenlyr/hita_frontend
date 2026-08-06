"use client";

import { ImagePlus, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { SlideImageDraft } from "@/types/admin.carousel.types";
import { BREAKPOINT_HINTS, type Breakpoint } from "@/types/carousel.types";

const MAX_FILE_MB = 5;

interface ImageDropzoneProps {
  breakpoint: Breakpoint;
  image: SlideImageDraft;
  /** Desktop is required; the others say so when they fall back. */
  required?: boolean;
  fallbackNote?: string;
  error?: string;
  onPick: (file: File) => void;
  onClear: () => void;
}

export function ImageDropzone({
  breakpoint,
  image,
  required = false,
  fallbackNote,
  error,
  onPick,
  onClear,
}: ImageDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const hint = BREAKPOINT_HINTS[breakpoint];

  function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Images must be under ${MAX_FILE_MB}MB.`);
      return;
    }
    onPick(file);
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          accept(event.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex aspect-[16/7] items-center justify-center overflow-hidden border border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          error && "border-destructive",
        )}
      >
        {image.previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt={`${hint.label} slide image`}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              aria-label={`Remove ${hint.label.toLowerCase()} image`}
              className="absolute top-2 right-2 cursor-pointer rounded-full bg-background/90 p-1.5 text-secondary shadow-sm transition-colors hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ImagePlus className="size-7" />
            <span className="text-sm font-semibold">
              Drop an image or click to browse
            </span>
            <span className="text-xs">
              Recommended {hint.size} · max {MAX_FILE_MB}MB
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            accept(event.target.files?.[0]);
            // Reset so re-picking the same file still fires a change.
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : !image.previewUrl && !required && fallbackNote ? (
        <p className="text-xs text-muted-foreground">{fallbackNote}</p>
      ) : null}
    </div>
  );
}
