"use client";

import {
  Hand,
  ImageOff,
  ImagePlus,
  Maximize2,
  Minus,
  Monitor,
  MousePointerClick,
  Plus,
  Smartphone,
  Tablet,
  Type,
} from "lucide-react";
import * as React from "react";

import { SlideCanvas } from "@/components/carousel/slide-canvas";
import { Button } from "@/components/ui/button";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { SlideImageDrafts } from "@/types/admin.carousel.types";
import type { FocusPoint } from "@/types/carousel.types";
import {
  BREAKPOINT_HINTS,
  type Breakpoint,
  type SlideBlock,
} from "@/types/carousel.types";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

const clampZoom = (value: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));

const DEVICES: {
  id: Breakpoint;
  icon: typeof Monitor;
  aspect: string;
  frame: string;
}[] = [
  {
    id: "mobile",
    icon: Smartphone,
    aspect: "aspect-[9/14]",
    frame: "max-w-64",
  },
  { id: "tablet", icon: Tablet, aspect: "aspect-[4/3]", frame: "max-w-lg" },
  {
    id: "desktop",
    icon: Monitor,
    aspect: "aspect-[16/7]",
    frame: "max-w-full",
  },
];

interface SlideEditorCanvasProps {
  blocks: SlideBlock[];
  images: SlideImageDrafts;
  overlayOpacity: number;
  breakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onAddText: () => void;
  onAddButton: () => void;
  onAddImage: (file: File) => void;
  /** Object-position for the photo at the shown breakpoint. */
  focus: FocusPoint;
  onFocusChange: (focus: FocusPoint) => void;
  /** True while the background is the selected "layer". */
  isBackgroundSelected: boolean;
}

/**
 * The editable slide.
 *
 * The device switcher swaps the frame, the source image *and* which
 * breakpoint drags write to — moving a block here in mobile mode creates a
 * mobile override rather than shifting the desktop layout.
 */
export function SlideEditorCanvas({
  blocks,
  images,
  overlayOpacity,
  breakpoint,
  onBreakpointChange,
  selectedId,
  onSelect,
  onMove,
  onAddText,
  onAddButton,
  onAddImage,
  focus,
  onFocusChange,
  isBackgroundSelected,
}: SlideEditorCanvasProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const panning = React.useRef<{
    startX: number;
    startY: number;
    fromX: number;
    fromY: number;
  } | null>(null);
  const stagePan = React.useRef<{
    startX: number;
    startY: number;
    fromX: number;
    fromY: number;
  } | null>(null);

  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [handMode, setHandMode] = React.useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = React.useState(false);

  const isPanning = handMode || isSpaceHeld;

  function fit() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  /* Space is the usual "grab the canvas" shortcut, so it works alongside the
     toolbar toggle. Ignored while typing, or a space in a heading would start
     panning instead of typing. */
  React.useEffect(() => {
    function isTyping(target: EventTarget | null) {
      const node = target as HTMLElement | null;
      const tag = node?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || node?.isContentEditable;
    }
    function down(event: KeyboardEvent) {
      if (event.code === "Space" && !isTyping(event.target)) {
        event.preventDefault();
        setIsSpaceHeld(true);
      }
    }
    function up(event: KeyboardEvent) {
      if (event.code === "Space") setIsSpaceHeld(false);
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* Ctrl/Cmd + wheel zooms toward the pointer, the way every canvas tool does.
     Registered by hand because React's onWheel is passive, and a passive
     listener cannot preventDefault the browser's own page zoom. */
  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function onWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();

      const rect = stage!.getBoundingClientRect();
      const pointerX = event.clientX - rect.left - rect.width / 2;
      const pointerY = event.clientY - rect.top - rect.height / 2;

      setZoom((current) => {
        const next = clampZoom(current * (event.deltaY > 0 ? 0.9 : 1.1));
        if (next === current) return current;
        // Keep whatever sits under the cursor under the cursor.
        const ratio = next / current;
        setOffset((pan) => ({
          x: pointerX - (pointerX - pan.x) * ratio,
          y: pointerY - (pointerY - pan.y) * ratio,
        }));
        return next;
      });
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);
  const device = DEVICES.find((entry) => entry.id === breakpoint) ?? DEVICES[2];
  const ownImage = images[breakpoint].previewUrl;
  const source = ownImage ?? images.desktop.previewUrl;
  const isFallback = !ownImage && Boolean(images.desktop.previewUrl);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 border border-border p-1">
          {DEVICES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onBreakpointChange(entry.id)}
              aria-pressed={breakpoint === entry.id}
              title={BREAKPOINT_HINTS[entry.id].label}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center transition-colors",
                breakpoint === entry.id
                  ? "bg-sidebar text-sidebar-foreground"
                  : "text-muted-foreground hover:text-secondary",
              )}
            >
              <entry.icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border border-border">
            <button
              type="button"
              onClick={() =>
                setZoom((current) => clampZoom(current - ZOOM_STEP))
              }
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="flex size-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              onClick={fit}
              title="Reset to 100%"
              className="w-14 cursor-pointer text-center text-xs font-semibold text-secondary tabular-nums"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() =>
                setZoom((current) => clampZoom(current + ZOOM_STEP))
              }
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="flex size-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={fit}
              title="Fit the slide"
              aria-label="Fit the slide"
              className="flex size-8 cursor-pointer items-center justify-center border-l border-border text-muted-foreground transition-colors hover:text-secondary"
            >
              <Maximize2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setHandMode((current) => !current)}
              aria-pressed={handMode}
              title="Pan the canvas (or hold Space)"
              aria-label="Pan the canvas"
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center border-l border-border transition-colors",
                handMode
                  ? "bg-sidebar text-sidebar-foreground"
                  : "text-muted-foreground hover:text-secondary",
              )}
            >
              <Hand className="size-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onAddText}
            className="h-9 cursor-pointer rounded-none text-xs"
          >
            <Type className="size-4" />
            Add text
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onAddButton}
            className="h-9 cursor-pointer rounded-none text-xs"
          >
            <MousePointerClick className="size-4" />
            Add button
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-9 cursor-pointer rounded-none text-xs"
          >
            <ImagePlus className="size-4" />
            Add image
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAddImage(file);
              // Reset so re-picking the same file still fires a change.
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {/* The stage is bordered so the working area reads as a panel, and the
          slide frame gets its own edge so its bounds stay obvious against it. */}
      <div
        ref={stageRef}
        onPointerDown={(event) => {
          // Middle-drag pans too, without needing the toggle or the key.
          if (!isPanning && event.button !== 1) return;
          event.preventDefault();
          stagePan.current = {
            startX: event.clientX,
            startY: event.clientY,
            fromX: offset.x,
            fromY: offset.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const pan = stagePan.current;
          if (!pan) return;
          setOffset({
            x: pan.fromX + (event.clientX - pan.startX),
            y: pan.fromY + (event.clientY - pan.startY),
          });
        }}
        onPointerUp={() => {
          stagePan.current = null;
        }}
        onPointerCancel={() => {
          stagePan.current = null;
        }}
        className={cn(
          "relative flex h-[clamp(20rem,55vh,44rem)] items-center justify-center overflow-hidden border border-border bg-muted/40 p-4",
          isPanning && "cursor-grab active:cursor-grabbing",
        )}
      >
        {/* No transition on the transform: it would lag a drag and fight the
            wheel. */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
          className="flex w-full items-center justify-center"
        >
          <div
            className={cn(
              // The console binds --font-sans to Lato, the storefront to
              // Josefin. Rebinding it here is what makes the "Josefin Sans"
              // option preview as the face that will actually ship.
              josefinSans.variable,
              "relative w-full overflow-hidden border border-border bg-muted",
              device.aspect,
              device.frame,
              // While the stage is being panned nothing inside should take the
              // drag, or a block moves instead of the canvas.
              isPanning && "pointer-events-none",
            )}
          >
            {source ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={source}
                alt=""
                draggable={false}
                onPointerDown={(event) => {
                  if (!isBackgroundSelected) return;
                  event.preventDefault();
                  panning.current = {
                    startX: event.clientX,
                    startY: event.clientY,
                    fromX: focus.x,
                    fromY: focus.y,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  const pan = panning.current;
                  if (!pan) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  // Dragging right should reveal more of the left of the photo,
                  // so the focus percent moves against the pointer.
                  const dx = ((event.clientX - pan.startX) / rect.width) * 100;
                  const dy = ((event.clientY - pan.startY) / rect.height) * 100;
                  onFocusChange({
                    x: Math.round(Math.min(100, Math.max(0, pan.fromX - dx))),
                    y: Math.round(Math.min(100, Math.max(0, pan.fromY - dy))),
                  });
                }}
                onPointerUp={() => {
                  panning.current = null;
                }}
                onPointerCancel={() => {
                  panning.current = null;
                }}
                style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
                className={cn(
                  "absolute inset-0 size-full object-cover",
                  isBackgroundSelected && "cursor-move touch-none",
                )}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="size-6" />
                <span className="text-xs">Upload a desktop image</span>
              </div>
            )}

            <SlideCanvas
              // Blocks stop intercepting pointers while the photo is being
              // reframed, or the drag lands on whatever is on top of it.
              className={cn(isBackgroundSelected && "pointer-events-none")}
              blocks={blocks}
              breakpoint={breakpoint}
              overlayOpacity={overlayOpacity}
              interactive={false}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
            />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {isFallback
          ? `Showing the desktop image — no ${BREAKPOINT_HINTS[breakpoint].label.toLowerCase()} upload. `
          : ""}
        {isPanning
          ? "Drag to pan the canvas"
          : isBackgroundSelected
            ? "Drag the photo to reframe it"
            : "Drag a block to move it"}{" "}
        — saved for {BREAKPOINT_HINTS[breakpoint].label.toLowerCase()} only.{" "}
        ⌘/Ctrl + scroll to zoom, Space to pan.
      </p>
    </div>
  );
}
