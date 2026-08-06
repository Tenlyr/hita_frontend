"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  RefreshCw,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { LinkPicker } from "@/components/carousel/link-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BREAKPOINT_HINTS,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  type BlockAlign,
  type BlockLayout,
  type Breakpoint,
  type ButtonColor,
  type ButtonVariant,
  type FontFamily,
  type FontWeight,
  type SlideBlock,
} from "@/types/carousel.types";

const FIELD_CLASS = "h-10 rounded-none";

const ALIGN_ICONS: Record<BlockAlign, typeof AlignLeft> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

const WEIGHT_LABELS: Record<number, string> = {
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extra",
  900: "Black",
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-secondary uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SegmentedButton({
  isActive,
  onClick,
  children,
  title,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={isActive}
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center px-2 py-1.5 text-xs font-semibold transition-colors",
        isActive
          ? "bg-sidebar text-sidebar-foreground"
          : "text-muted-foreground hover:text-secondary",
      )}
    >
      {children}
    </button>
  );
}

interface BlockInspectorProps {
  block: SlideBlock;
  /** Which breakpoint the canvas is showing — position and size target it. */
  breakpoint: Breakpoint;
  onChange: (patch: Partial<SlideBlock>) => void;
  /** Position and size, for the shown breakpoint only. */
  onLayout: (patch: Partial<BlockLayout>) => void;
  onCopyLayoutToAll: () => void;
  /** Image layers only — swaps the picture without losing the layout. */
  onReplaceImage?: (file: File) => void;
  onDelete: () => void;
}

export function BlockInspector({
  block,
  breakpoint,
  onChange,
  onLayout,
  onCopyLayoutToAll,
  onReplaceImage,
  onDelete,
}: BlockInspectorProps) {
  const layout = block[breakpoint];
  const device = BREAKPOINT_HINTS[breakpoint].label;
  const isImage = block.type === "image";
  const fileRef = React.useRef<HTMLInputElement>(null);

  const LABELS: Record<string, string> = {
    text: "Text",
    button: "Button",
    image: "Image",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-secondary">{LABELS[block.type]}</p>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete block"
          className="cursor-pointer p-1.5 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {isImage ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-9 w-full cursor-pointer gap-2 rounded-none text-xs"
          >
            <RefreshCw className="size-3.5" />
            Replace picture
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onReplaceImage?.(file);
              // Reset so re-picking the same file still fires a change.
              event.target.value = "";
            }}
          />
        </>
      ) : null}

      {isImage ? null : (
        <Row label={block.type === "button" ? "Label" : "Text"}>
          {block.type === "button" ? (
            <Input
              value={block.text}
              onChange={(event) => onChange({ text: event.target.value })}
              placeholder="Shop now"
              className={FIELD_CLASS}
            />
          ) : (
            <Textarea
              value={block.text}
              onChange={(event) => onChange({ text: event.target.value })}
              placeholder="Handcrafted for your home"
              rows={3}
              className="rounded-none"
            />
          )}
        </Row>
      )}

      {block.type === "button" ? (
        <>
          <LinkPicker
            url={block.url}
            isExternal={block.is_external}
            onChange={(url, is_external) => onChange({ url, is_external })}
          />

          <Row label="Style">
            <div className="flex gap-1 border border-border p-1">
              {(["primary", "secondary", "sidebar"] as ButtonColor[]).map(
                (color) => (
                  <SegmentedButton
                    key={color}
                    isActive={block.button_color === color}
                    onClick={() => onChange({ button_color: color })}
                  >
                    <span className="capitalize">{color}</span>
                  </SegmentedButton>
                ),
              )}
            </div>
            <div className="flex gap-1 border border-border p-1">
              {(["filled", "bordered"] as ButtonVariant[]).map((variant) => (
                <SegmentedButton
                  key={variant}
                  isActive={block.button_variant === variant}
                  onClick={() => onChange({ button_variant: variant })}
                >
                  <span className="capitalize">{variant}</span>
                </SegmentedButton>
              ))}
            </div>
          </Row>
        </>
      ) : null}

      {isImage ? (
        <div className="grid grid-cols-2 gap-3">
          <Row label={`Size · ${layout.width}%`}>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={layout.width}
              onChange={(event) =>
                onLayout({ width: Number(event.target.value) })
              }
              className="w-full cursor-pointer accent-[var(--sidebar)]"
            />
          </Row>
          <Row label={`Corners · ${block.radius}`}>
            <input
              type="range"
              min={0}
              max={400}
              step={4}
              value={block.radius}
              onChange={(event) =>
                onChange({ radius: Number(event.target.value) })
              }
              className="w-full cursor-pointer accent-[var(--sidebar)]"
            />
          </Row>
        </div>
      ) : (
        <>
          {/* Font and size pair up: a number field stranded on a full-width
              row reads as an error. */}
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
            <Row label="Font">
              <select
                value={layout.font_family}
                onChange={(event) =>
                  onLayout({ font_family: event.target.value as FontFamily })
                }
                className="h-10 w-full cursor-pointer border border-border bg-background px-2 text-sm text-secondary"
              >
                {FONT_FAMILIES.map((family) => (
                  <option key={family.value} value={family.value}>
                    {family.label}
                  </option>
                ))}
              </select>
            </Row>

            <Row label="Size">
              <Input
                type="number"
                min={8}
                max={200}
                value={layout.font_size}
                onChange={(event) =>
                  onLayout({ font_size: Number(event.target.value) })
                }
                className={FIELD_CLASS}
              />
            </Row>
          </div>

          {block.type === "text" ? (
            <Row label="Colour">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.color}
                  onChange={(event) => onChange({ color: event.target.value })}
                  aria-label="Text colour"
                  className="size-10 shrink-0 cursor-pointer border border-border bg-background p-1"
                />
                <Input
                  value={block.color}
                  onChange={(event) =>
                    onChange({ color: event.target.value.toUpperCase() })
                  }
                  aria-label="Text colour hex"
                  className={cn(FIELD_CLASS, "font-mono text-xs")}
                />
              </div>
            </Row>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Row label="Weight">
              <select
                value={layout.font_weight}
                onChange={(event) =>
                  onLayout({
                    font_weight: Number(event.target.value) as FontWeight,
                  })
                }
                className="h-10 w-full cursor-pointer border border-border bg-background px-2 text-sm text-secondary"
              >
                {FONT_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {WEIGHT_LABELS[weight]} ({weight})
                  </option>
                ))}
              </select>
            </Row>

            <Row label="Leading">
              <Input
                type="number"
                min={0.8}
                max={2}
                step={0.05}
                value={layout.line_height}
                onChange={(event) =>
                  onLayout({ line_height: Number(event.target.value) })
                }
                className={FIELD_CLASS}
              />
            </Row>
          </div>
        </>
      )}

      {isImage ? null : (
        <Row label={`Tracking · ${layout.letter_spacing}em`}>
          <input
            type="range"
            min={-0.05}
            max={0.4}
            step={0.01}
            value={layout.letter_spacing}
            onChange={(event) =>
              onLayout({ letter_spacing: Number(event.target.value) })
            }
            className="w-full cursor-pointer accent-[var(--sidebar)]"
          />
        </Row>
      )}

      <Row label={`Opacity · ${block.opacity}%`}>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={block.opacity}
          onChange={(event) =>
            onChange({ opacity: Number(event.target.value) })
          }
          className="w-full cursor-pointer accent-[var(--sidebar)]"
        />
      </Row>

      {isImage ? null : (
        <Row label="Align">
          <div className="flex gap-1 border border-border p-1">
            {(["left", "center", "right"] as BlockAlign[]).map((align) => {
              const Icon = ALIGN_ICONS[align];
              return (
                <SegmentedButton
                  key={align}
                  isActive={layout.align === align}
                  onClick={() => onLayout({ align })}
                  title={align}
                >
                  <Icon className="size-4" />
                </SegmentedButton>
              );
            })}
          </div>
        </Row>
      )}

      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-bold text-secondary uppercase">
            {device} position
          </Label>
          <button
            type="button"
            onClick={onCopyLayoutToAll}
            title="Copy this breakpoint's type and position to the other two"
            className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-bold text-primary transition-opacity hover:opacity-70"
          >
            <Copy className="size-3" />
            Apply to all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Row label="X %">
            <Input
              type="number"
              value={layout.x}
              onChange={(event) => onLayout({ x: Number(event.target.value) })}
              className={FIELD_CLASS}
            />
          </Row>
          <Row label="Y %">
            <Input
              type="number"
              value={layout.y}
              onChange={(event) => onLayout({ y: Number(event.target.value) })}
              className={FIELD_CLASS}
            />
          </Row>
          <Row label="Width %">
            <Input
              type="number"
              value={layout.width}
              onChange={(event) =>
                onLayout({ width: Number(event.target.value) })
              }
              className={FIELD_CLASS}
            />
          </Row>
        </div>
        <p className="text-xs text-muted-foreground">
          Font, size, spacing and position are all saved for{" "}
          {device.toLowerCase()} only.
        </p>
      </div>

      <Row label={`Rotation · ${block.rotation}°`}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={block.rotation}
            onChange={(event) =>
              onChange({ rotation: Number(event.target.value) })
            }
            className="w-full cursor-pointer accent-[var(--sidebar)]"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange({ rotation: 0 })}
            className="h-8 cursor-pointer rounded-none px-2 text-xs"
          >
            Reset
          </Button>
        </div>
      </Row>
    </div>
  );
}
