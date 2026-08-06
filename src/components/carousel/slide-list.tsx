"use client";

import {
  ArrowDown,
  ArrowUp,
  GalleryHorizontalEnd,
  ImageOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { useCarouselSlides } from "@/hooks/use-carousel-slides";
import { cn } from "@/lib/utils";
import type { CarouselSlide } from "@/types/carousel.types";

/** First line of text, plus a layer count — enough to tell slides apart. */
function summarise(slide: CarouselSlide): string {
  const text = slide.blocks.find(
    (block) => block.type === "text" && block.text.trim(),
  );
  const buttons = slide.blocks.filter(
    (block) => block.type === "button",
  ).length;

  const parts: string[] = [text ? text.text.split("\n")[0] : "No text"];
  if (slide.blocks.length > 0) {
    parts.push(
      `${slide.blocks.length} layer${slide.blocks.length === 1 ? "" : "s"}`,
    );
  }
  if (buttons > 0) parts.push(`${buttons} button${buttons === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function SlideRow({
  slide,
  isFirst,
  isLast,
  onMove,
  onDelete,
}: {
  slide: CarouselSlide;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-4 border border-border p-4">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          aria-label={`Move ${slide.title} up`}
          className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isLast}
          aria-label={`Move ${slide.title} down`}
          className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowDown className="size-4" />
        </button>
      </div>

      <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-muted">
        {slide.image_desktop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.image_desktop}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-4" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-secondary">{slide.title}</p>
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              slide.is_active
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {slide.is_active ? "Live" : "Draft"}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {summarise(slide)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`${APP_ROUTES.APP.CAROUSEL}/${slide.id}/edit`}
          aria-label={`Edit ${slide.title}`}
          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <Pencil className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${slide.title}`}
          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function SlideList() {
  const { slides, isLoading, isSaving, move, remove } = useCarouselSlides();
  const [deleting, setDeleting] = React.useState<CarouselSlide | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Carousel</h1>
          <p className="text-sm text-muted-foreground">
            Slides shown in the storefront hero, in this order.
          </p>
        </div>
        <Button
          // Renders an <a>, so Base UI's native-button assertion is off.
          nativeButton={false}
          render={<Link href={`${APP_ROUTES.APP.CAROUSEL}/new`} />}
          className="cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
        >
          <Plus className="size-4" />
          Add slide
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse bg-muted" />
          <div className="h-24 animate-pulse bg-muted" />
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-dashed border-border px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <GalleryHorizontalEnd className="size-6 text-primary" />
          </span>
          <p className="text-base font-bold text-secondary">No slides yet</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Add a slide to take over the storefront hero. Until then it shows
            the default banner.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={`${APP_ROUTES.APP.CAROUSEL}/new`} />}
            className="cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
          >
            Add slide
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, index) => (
            <SlideRow
              key={slide.id}
              slide={slide}
              isFirst={index === 0}
              isLast={index === slides.length - 1}
              onMove={(direction) => void move(slide.id, direction)}
              onDelete={() => setDeleting(slide)}
            />
          ))}
        </ul>
      )}

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `"${deleting.title}" and its images will be removed for good.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSaving}
              className="cursor-pointer rounded-none bg-destructive text-white hover:bg-destructive/90"
            >
              {isSaving ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
