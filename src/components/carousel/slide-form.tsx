"use client";

import {
  ChevronDown,
  ChevronUp,
  Image as ImageLayerIcon,
  ImageIcon,
  Layers,
  MousePointerClick,
  Settings2,
  Type,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { BlockInspector } from "@/components/carousel/block-inspector";
import { SlideEditorCanvas } from "@/components/carousel/slide-editor-canvas";
import { SlideSettingsSheet } from "@/components/carousel/slide-settings-sheet";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  copyLayoutToAll,
  DEFAULT_FOCUS,
  newButtonBlock,
  newImageBlock,
  newTextBlock,
  normaliseBlock,
  withLayout,
} from "@/lib/carousel-blocks";
import { cn } from "@/lib/utils";
import { carouselService } from "@/services/carousel.service";
import type {
  SlideDraft,
  SlideDraftErrors,
  SlideImageDrafts,
} from "@/types/admin.carousel.types";
import type {
  BlockLayout,
  Breakpoint,
  CarouselSlide,
  FocusPoint,
  SlideBlock,
  SlideFocus,
} from "@/types/carousel.types";

/** Selection id for the photo itself, which is a layer in the UI but not a
    block in the data. */
const BACKGROUND = "__background__";

function emptyImages(): SlideImageDrafts {
  return {
    mobile: { file: null, previewUrl: null, cleared: false },
    tablet: { file: null, previewUrl: null, cleared: false },
    desktop: { file: null, previewUrl: null, cleared: false },
  };
}

function focusFrom(slide?: CarouselSlide): SlideFocus {
  return {
    desktop: slide?.image_focus?.desktop ?? { ...DEFAULT_FOCUS },
    tablet: slide?.image_focus?.tablet ?? { ...DEFAULT_FOCUS },
    mobile: slide?.image_focus?.mobile ?? { ...DEFAULT_FOCUS },
  };
}

function draftFrom(slide?: CarouselSlide): SlideDraft {
  return {
    title: slide?.title ?? "",
    overlay_opacity: slide?.overlay_opacity ?? 0,
    image_focus: focusFrom(slide),
    // Anything missing a key would bind an input to undefined and flip it
    // from controlled to uncontrolled on the first edit.
    blocks: (slide?.blocks ?? []).map(normaliseBlock),
    is_active: slide?.is_active ?? true,
  };
}

function imagesFrom(slide?: CarouselSlide): SlideImageDrafts {
  const images = emptyImages();
  if (!slide) return images;

  images.desktop.previewUrl = slide.image_desktop;
  // Only count an image the slide actually owns — the API fills the other two
  // with the desktop URL, and showing that as an upload would be a lie.
  if (slide.has_tablet_image) images.tablet.previewUrl = slide.image_tablet;
  if (slide.has_mobile_image) images.mobile.previewUrl = slide.image_mobile;
  return images;
}

function validate(
  draft: SlideDraft,
  images: SlideImageDrafts,
): SlideDraftErrors {
  const errors: SlideDraftErrors = {};

  if (!draft.title.trim()) {
    errors.title = "Give the slide a name so you can find it later.";
  }
  if (!images.desktop.previewUrl) {
    errors.image_desktop = "A desktop image is required.";
  }

  // Mirrors the server rule, so a half-filled button is caught before the
  // round trip rather than coming back as a field error.
  const brokenButton = draft.blocks.find(
    (block) =>
      block.type === "button" && (!block.text.trim() || !block.url.trim()),
  );
  if (brokenButton) {
    errors.blocks = "Every button needs a label and a link.";
  }

  return errors;
}

interface SlideFormProps {
  /** Omit to create; pass a saved slide to edit it. */
  slide?: CarouselSlide;
}

export function SlideForm({ slide }: SlideFormProps) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<SlideDraft>(() => draftFrom(slide));
  const [images, setImages] = React.useState<SlideImageDrafts>(() =>
    imagesFrom(slide),
  );
  const [errors, setErrors] = React.useState<SlideDraftErrors>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("desktop");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState<Breakpoint>("desktop");
  /* Files for image layers, keyed by block id. They ride along as their own
     multipart parts, since a File cannot live inside the blocks JSON. */
  const [blockFiles, setBlockFiles] = React.useState<Record<string, File>>({});

  const selected =
    draft.blocks.find((block) => block.id === selectedId) ?? null;

  // Object URLs are leaked memory until revoked, and the browser keeps the
  // whole file alive behind each one.
  const objectUrls = React.useRef<string[]>([]);
  React.useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  function set<K extends keyof SlideDraft>(field: K, value: SlideDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function mapBlock(id: string, fn: (block: SlideBlock) => SlideBlock) {
    setDraft((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === id ? fn(block) : block,
      ),
    }));
  }

  function patchBlock(id: string, patch: Partial<SlideBlock>) {
    mapBlock(id, (block) => ({ ...block, ...patch }));
    setErrors((current) => ({ ...current, blocks: undefined }));
  }

  /** Position and size always land on the breakpoint being shown. */
  function setLayout(id: string, patch: Partial<BlockLayout>) {
    mapBlock(id, (block) => withLayout(block, breakpoint, patch));
  }

  function addBlock(block: SlideBlock) {
    // Appending puts it on top: the blocks array is paint order.
    setDraft((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedId(block.id);
  }

  function addImageBlock(file: File) {
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current.push(previewUrl);
    const block = newImageBlock(previewUrl);
    setBlockFiles((current) => ({ ...current, [block.id]: file }));
    addBlock(block);
  }

  /** Swap an image layer's picture, keeping its position and size. */
  function replaceImage(id: string, file: File) {
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current.push(previewUrl);
    setBlockFiles((current) => ({ ...current, [id]: file }));
    patchBlock(id, { localPreview: previewUrl });
  }

  /** Swap a layer with its neighbour — the array order is the z-order. */
  function moveLayer(id: string, direction: -1 | 1) {
    setDraft((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.blocks.length) {
        return current;
      }
      const blocks = [...current.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...current, blocks };
    });
  }

  function setFocus(focus: FocusPoint) {
    setDraft((current) => ({
      ...current,
      image_focus: { ...current.image_focus, [breakpoint]: focus },
    }));
  }

  function deleteBlock(id: string) {
    setDraft((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== id),
    }));
    setBlockFiles((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setSelectedId(null);
  }

  function pickImage(target: Breakpoint, file: File) {
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current.push(previewUrl);
    setImages((current) => ({
      ...current,
      [target]: { file, previewUrl, cleared: false },
    }));
    setErrors((current) => ({ ...current, image_desktop: undefined }));
  }

  function clearImage(target: Breakpoint) {
    setImages((current) => ({
      ...current,
      [target]: { file: null, previewUrl: null, cleared: true },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validate(draft, images);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // The name and images live in the sheet, so a failure there has to open
      // it — otherwise the error is invisible.
      if (found.title || found.image_desktop) {
        if (found.image_desktop) setSettingsTab("desktop");
        setSettingsOpen(true);
      }
      toast.error(found.blocks ?? "Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (slide) {
        await carouselService.update(slide.id, draft, images, blockFiles);
        toast.success("Slide updated.");
      } else {
        await carouselService.create(draft, images, blockFiles);
        toast.success("Slide created.");
      }
      router.push(APP_ROUTES.APP.CAROUSEL);
      router.refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the slide."));
    } finally {
      setIsSaving(false);
    }
  }

  const missingImage = !images.desktop.previewUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            className="h-9 cursor-pointer gap-2 rounded-none"
          >
            <Settings2 className="size-4" />
            Slide settings
            {missingImage ? (
              <span className="flex items-center gap-1 text-destructive">
                <ImageIcon className="size-3.5" />
                Image needed
              </span>
            ) : null}
          </Button>
          <span className="truncate text-sm text-muted-foreground">
            {draft.title || "Untitled slide"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(APP_ROUTES.APP.CAROUSEL)}
            className="h-9 cursor-pointer rounded-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-9 cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
          >
            {isSaving ? "Saving…" : slide ? "Save changes" : "Create slide"}
          </Button>
        </div>
      </div>

      {/* Canvas and properties share one row: laying out a slide means moving
          something and immediately adjusting it. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <SlideEditorCanvas
          blocks={draft.blocks}
          images={images}
          overlayOpacity={draft.overlay_opacity}
          breakpoint={breakpoint}
          onBreakpointChange={setBreakpoint}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={(id, x, y) => setLayout(id, { x, y })}
          onAddText={() => addBlock(newTextBlock())}
          onAddButton={() => addBlock(newButtonBlock())}
          onAddImage={addImageBlock}
          focus={draft.image_focus[breakpoint]}
          onFocusChange={setFocus}
          isBackgroundSelected={selectedId === BACKGROUND}
        />

        <aside className="max-h-[calc(100vh-9rem)] space-y-4 overflow-y-auto border border-border p-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-2 text-sm font-bold text-secondary">
            <Layers className="size-4" />
            Layers
          </div>

          {/* Front-most first, the way design tools stack them. The data is
              back-to-front, so this list is reversed. */}
          <div className="space-y-1">
            {[...draft.blocks].reverse().map((block, reversedIndex) => {
              const index = draft.blocks.length - 1 - reversedIndex;
              const Icon =
                block.type === "button"
                  ? MousePointerClick
                  : block.type === "image"
                    ? ImageLayerIcon
                    : Type;
              return (
                <div
                  key={block.id}
                  className={cn(
                    "flex items-center gap-1 pr-1 transition-colors",
                    selectedId === block.id
                      ? "bg-sidebar text-sidebar-foreground"
                      : "text-secondary hover:bg-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(block.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {block.type === "image"
                        ? "Image"
                        : block.text || "Empty layer"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLayer(block.id, 1)}
                    disabled={index === draft.blocks.length - 1}
                    title="Bring forward"
                    aria-label={`Bring ${block.text || "layer"} forward`}
                    className="cursor-pointer p-1 opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLayer(block.id, -1)}
                    disabled={index === 0}
                    title="Send backward"
                    aria-label={`Send ${block.text || "layer"} backward`}
                    className="cursor-pointer p-1 opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              );
            })}

            {/* The photo is always the bottom layer, so it is pinned here
                rather than being reorderable. */}
            <button
              type="button"
              onClick={() =>
                setSelectedId(selectedId === BACKGROUND ? null : BACKGROUND)
              }
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 border-t border-border px-3 py-2 text-left text-sm transition-colors",
                selectedId === BACKGROUND
                  ? "bg-sidebar text-sidebar-foreground"
                  : "text-secondary hover:bg-muted",
              )}
            >
              <ImageIcon className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">Background photo</span>
              <span className="shrink-0 text-[10px] tracking-wide uppercase opacity-60">
                {selectedId === BACKGROUND ? "Drag to pan" : ""}
              </span>
            </button>
          </div>

          {errors.blocks ? (
            <p className="text-xs text-destructive">{errors.blocks}</p>
          ) : null}

          {selectedId === BACKGROUND ? (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-bold text-secondary">
                Background photo
              </p>
              <p className="text-xs text-muted-foreground">
                Drag the photo on the canvas to choose what stays in frame at
                this breakpoint.
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Focus {draft.image_focus[breakpoint].x}% /{" "}
                  {draft.image_focus[breakpoint].y}%
                </span>
                <button
                  type="button"
                  onClick={() => setFocus({ ...DEFAULT_FOCUS })}
                  className="cursor-pointer font-bold text-primary transition-opacity hover:opacity-70"
                >
                  Recentre
                </button>
              </div>
            </div>
          ) : selected ? (
            <div className="border-t border-border pt-4">
              <BlockInspector
                block={selected}
                breakpoint={breakpoint}
                onChange={(patch) => patchBlock(selected.id, patch)}
                onLayout={(patch) => setLayout(selected.id, patch)}
                onCopyLayoutToAll={() =>
                  mapBlock(selected.id, (block) =>
                    copyLayoutToAll(block, breakpoint),
                  )
                }
                onReplaceImage={(file) => replaceImage(selected.id, file)}
                onDelete={() => deleteBlock(selected.id)}
              />
            </div>
          ) : null}
        </aside>
      </div>

      <SlideSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        draft={draft}
        images={images}
        errors={errors}
        onChange={set}
        onPickImage={pickImage}
        onClearImage={clearImage}
        initialTab={settingsTab}
      />
    </form>
  );
}
