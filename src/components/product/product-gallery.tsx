"use client";

import type { ProductImage } from "@/types/product.types";
import { Heart, ImageOff } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";

const AUTO_SWITCH_MS = 4000;

interface ProductGalleryProps {
  images: ProductImage[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const openAuthDialog = useAuthDialogStore((state) => state.open);

  React.useEffect(() => {
    if (paused || images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      AUTO_SWITCH_MS,
    );
    return () => clearInterval(timer);
  }, [paused, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
        <span className="text-sm">No image</span>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* From lg the stack overhangs the image, so leave room on the right.
          Below that the thumbnails sit in a row underneath at full width. */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted lg:w-[88%]">
        <button
          type="button"
          onClick={openAuthDialog}
          aria-label={`Add ${alt} to wishlist`}
          className="absolute top-4 left-4 z-10 cursor-pointer rounded-full bg-background p-3 shadow-md transition-transform hover:scale-110"
        >
          <Heart className="size-5 text-secondary" />
        </button>

        {images.map((image, position) => (
          <Image
            key={image.id}
            src={image.product_image}
            alt={position === index ? alt : ""}
            fill
            unoptimized
            priority={position === 0}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className={cn(
              "object-cover transition-opacity duration-500 ease-out",
              position === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto lg:absolute lg:top-1/2 lg:right-0 lg:mt-0 lg:-translate-y-1/2 lg:flex-col lg:gap-4 lg:overflow-visible">
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`View image ${position + 1}`}
              aria-current={position === index}
              className={cn(
                "relative size-20 shrink-0 cursor-pointer overflow-hidden border-2 transition-colors sm:size-24 lg:size-32 lg:border-4 lg:shadow-lg",
                position === index
                  ? "border-primary"
                  : "border-transparent hover:border-border lg:border-background",
              )}
            >
              <Image
                src={image.product_image}
                alt=""
                fill
                unoptimized
                sizes="128px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
