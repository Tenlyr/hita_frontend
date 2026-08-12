"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { RequiredMark } from "@/components/ui/required-mark";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_INVOICE_CLOSING_NOTE,
  DEFAULT_INVOICE_FOOTER_NOTE,
  DEFAULT_INVOICE_NOTES,
} from "@/constants/invoice";
import { APP_ROUTES } from "@/constants/routes";
import { useInvoicePreview } from "@/hooks/use-invoice-preview";
import { getApiErrorMessage } from "@/lib/api-error";
import { invoiceTotals, lineFigures } from "@/lib/invoice-totals";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import { invoiceService } from "@/services/invoice.service";
import type {
  DiscountType,
  Invoice,
  InvoiceInput,
} from "@/types/admin.invoice.types";

const FIELD_CLASS = "h-11 rounded-none";
const CARD_CLASS = "rounded-none border-border bg-background shadow-none";

/** formatPrice takes the decimal strings the API returns; these are live maths. */
function money(value: number): string {
  return formatPrice(value.toFixed(2));
}

interface ItemDraft {
  key: string;
  description: string;
  sub_note: string;
  unit_price: string;
  quantity: string;
}

interface Draft {
  invoice_date: string;
  to_name: string;
  to_address: string;
  to_gstin: string;
  ship_name: string;
  ship_address: string;
  gst_percent: string;
  discount_type: DiscountType;
  discount_value: string;
  notes: string;
  closing_note: string;
  footer_note: string;
  items: ItemDraft[];
}

function today(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function emptyItem(key: string): ItemDraft {
  return { key, description: "", sub_note: "", unit_price: "", quantity: "1" };
}

function draftFrom(invoice: Invoice | undefined, firstKey: string): Draft {
  if (!invoice) {
    return {
      invoice_date: today(),
      to_name: "",
      to_address: "",
      to_gstin: "",
      ship_name: "",
      ship_address: "",
      gst_percent: "5",
      discount_type: "percent",
      discount_value: "0",
      // Seeded, not placeholder — these print, so they have to be real text
      // the moment the form opens.
      notes: DEFAULT_INVOICE_NOTES.join("\n"),
      closing_note: DEFAULT_INVOICE_CLOSING_NOTE,
      footer_note: DEFAULT_INVOICE_FOOTER_NOTE,
      items: [emptyItem(firstKey)],
    };
  }

  return {
    invoice_date: invoice.invoice_date,
    to_name: invoice.to_name,
    to_address: invoice.to_address,
    to_gstin: invoice.to_gstin,
    ship_name: invoice.ship_name,
    ship_address: invoice.ship_address,
    gst_percent: String(Number(invoice.gst_percent)),
    discount_type: invoice.discount_type,
    discount_value: String(Number(invoice.discount_value)),
    // One bullet per line — a textarea is far quicker to edit than a list of
    // inputs when the notes are three sentences each.
    notes: invoice.notes.join("\n"),
    closing_note: invoice.closing_note,
    footer_note: invoice.footer_note,
    items: invoice.items.map((item, index) => ({
      key: `saved-${item.id ?? index}`,
      description: item.description,
      sub_note: item.sub_note,
      unit_price: String(Number(item.unit_price)),
      quantity: String(item.quantity),
    })),
  };
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-secondary">
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  // useId, never crypto.randomUUID() in a state initialiser — that is a
  // hydration mismatch waiting to happen.
  const firstKey = React.useId();
  const [draft, setDraft] = React.useState<Draft>(() =>
    draftFrom(invoice, firstKey),
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const gst = Number(draft.gst_percent) || 0;
  const discountValue = Number(draft.discount_value) || 0;
  const parsedItems = draft.items.map((item) => ({
    unit_price: Number(item.unit_price) || 0,
    quantity: Number(item.quantity) || 0,
  }));
  const totals = invoiceTotals(
    parsedItems,
    gst,
    draft.discount_type,
    discountValue,
  );

  // toPayload is a hoisted declaration, so the preview reads exactly the body
  // that submitting would send — the pane can't drift from the saved document.
  const preview = useInvoicePreview(toPayload(), invoice?.invoice_number ?? "");

  // The page currently on screen, which lags the newest blob by one render:
  // the new document loads in a hidden frame and only takes over once it has
  // painted, so the pane never drops to the viewer's dark background.
  const [visibleUrl, setVisibleUrl] = React.useState<string | null>(null);
  const isPreviewLoading =
    preview.isRendering || preview.url === null || preview.url !== visibleUrl;

  // If a frame never fires load, the pane would sit under a spinner forever.
  React.useEffect(() => {
    if (!preview.url || preview.url === visibleUrl) return;
    const url = preview.url;
    const timer = setTimeout(() => setVisibleUrl(url), 2500);
    return () => clearTimeout(timer);
  }, [preview.url, visibleUrl]);

  function set<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function setItem(key: string, patch: Partial<ItemDraft>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.key === key ? { ...item, ...patch } : item,
      ),
    }));
    setErrors((current) => ({ ...current, items: "" }));
  }

  function addItem() {
    setDraft((current) => ({
      ...current,
      items: [...current.items, emptyItem(`row-${Date.now()}`)],
    }));
  }

  function removeItem(key: string) {
    setDraft((current) => ({
      ...current,
      // Never leave zero rows — an invoice with no lines is not a document.
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((item) => item.key !== key),
    }));
  }

  function toPayload(): InvoiceInput {
    return {
      invoice_date: draft.invoice_date,
      to_name: draft.to_name,
      to_address: draft.to_address,
      to_gstin: draft.to_gstin,
      ship_name: draft.ship_name,
      ship_address: draft.ship_address,
      gst_percent: gst,
      discount_type: draft.discount_type,
      discount_value: discountValue,
      notes: draft.notes
        .split("\n")
        .map((note) => note.trim())
        .filter(Boolean),
      closing_note: draft.closing_note,
      footer_note: draft.footer_note,
      items: draft.items
        .filter((item) => item.description.trim() || item.unit_price)
        .map((item) => ({
          description: item.description,
          sub_note: item.sub_note,
          unit_price: Number(item.unit_price) || 0,
          quantity: Number(item.quantity) || 0,
        })),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const saved = invoice
        ? await invoiceService.update(invoice.id, toPayload())
        : await invoiceService.create(toPayload());
      toast.success(`${saved.invoice_number} saved.`);
      router.push(APP_ROUTES.APP.INVOICES);
      router.refresh();
    } catch (error) {
      // The server returns field errors in `data`; surface them inline rather
      // than as one toast that says "check the form".
      const fields = (error as { response?: { data?: { data?: unknown } } })
        ?.response?.data?.data;
      if (fields && typeof fields === "object") {
        setErrors(fields as Record<string, string>);
      }
      toast.error(getApiErrorMessage(error, "Could not save the invoice."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Bill to</CardTitle>
              <CardDescription>
                Who the invoice is made out to, and their GSTIN if they have
                one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Customer"
                  htmlFor="to-name"
                  required
                  error={errors.to_name}
                >
                  <Input
                    id="to-name"
                    value={draft.to_name}
                    onChange={(event) => set("to_name", event.target.value)}
                    placeholder="Event U Rox"
                    className={cn(
                      FIELD_CLASS,
                      errors.to_name && "border-destructive",
                    )}
                  />
                </Field>

                <Field
                  label="Invoice date"
                  htmlFor="invoice-date"
                  error={errors.invoice_date}
                >
                  <Input
                    id="invoice-date"
                    type="date"
                    value={draft.invoice_date}
                    onChange={(event) =>
                      set("invoice_date", event.target.value)
                    }
                    className={FIELD_CLASS}
                  />
                </Field>
              </div>

              <Field label="Address" htmlFor="to-address">
                <Textarea
                  id="to-address"
                  rows={3}
                  value={draft.to_address}
                  onChange={(event) => set("to_address", event.target.value)}
                  placeholder={
                    "#408, 18th cross, 1st Link Road,\nBangalore - 560011"
                  }
                  className="rounded-none"
                />
              </Field>

              <Field label="GSTIN" htmlFor="to-gstin">
                <Input
                  id="to-gstin"
                  value={draft.to_gstin}
                  onChange={(event) => set("to_gstin", event.target.value)}
                  placeholder="29AADFE3691E1ZE"
                  className={cn(FIELD_CLASS, "font-mono")}
                />
              </Field>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Ship to</CardTitle>
              <CardDescription>
                Leave blank when it goes to the billing address — the block is
                then left off the invoice entirely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Contact" htmlFor="ship-name">
                <Input
                  id="ship-name"
                  value={draft.ship_name}
                  onChange={(event) => set("ship_name", event.target.value)}
                  placeholder="Seema N"
                  className={FIELD_CLASS}
                />
              </Field>

              <Field label="Shipping address" htmlFor="ship-address">
                <Textarea
                  id="ship-address"
                  rows={2}
                  value={draft.ship_address}
                  onChange={(event) => set("ship_address", event.target.value)}
                  className="rounded-none"
                />
              </Field>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Prices are what you quote the customer — GST inclusive. The
                ex-GST price and the tax split are worked out from them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="GST %" htmlFor="gst" error={errors.gst_percent}>
                  <Input
                    id="gst"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={draft.gst_percent}
                    onChange={(event) => set("gst_percent", event.target.value)}
                    className={cn(
                      FIELD_CLASS,
                      errors.gst_percent && "border-destructive",
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Split in half as CGST {(gst / 2 || 0).toFixed(2)}% and SGST{" "}
                    {(gst / 2 || 0).toFixed(2)}%.
                  </p>
                </Field>

                <Field
                  label="Discount"
                  htmlFor="discount"
                  error={errors.discount_value}
                >
                  <div className="flex">
                    <Input
                      id="discount"
                      type="number"
                      min={0}
                      max={draft.discount_type === "percent" ? 100 : undefined}
                      step="0.01"
                      value={draft.discount_value}
                      onChange={(event) =>
                        set("discount_value", event.target.value)
                      }
                      className={cn(
                        FIELD_CLASS,
                        "border-r-0",
                        errors.discount_value && "border-destructive",
                      )}
                    />
                    <NativeSelect
                      aria-label="Discount type"
                      value={draft.discount_type}
                      onChange={(event) =>
                        set("discount_type", event.target.value as DiscountType)
                      }
                      className="h-11! w-24 shrink-0"
                    >
                      <option value="percent">%</option>
                      <option value="flat">₹ flat</option>
                    </NativeSelect>
                  </div>
                </Field>
              </div>

              {errors.items ? (
                <p className="text-xs text-destructive">{errors.items}</p>
              ) : null}

              <div className="space-y-4">
                {draft.items.map((item, index) => {
                  const figures = lineFigures(
                    Number(item.unit_price) || 0,
                    Number(item.quantity) || 0,
                    gst,
                  );
                  return (
                    <div
                      key={item.key}
                      className="space-y-3 border border-border p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                          Line {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          disabled={draft.items.length === 1}
                          aria-label={`Remove line ${index + 1}`}
                          className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <Input
                        value={item.description}
                        onChange={(event) =>
                          setItem(item.key, { description: event.target.value })
                        }
                        placeholder="Gold Petal Tray - 10 inch plate"
                        className={FIELD_CLASS}
                      />

                      <Input
                        value={item.sub_note}
                        onChange={(event) =>
                          setItem(item.key, { sub_note: event.target.value })
                        }
                        placeholder="(inclusive GST 5%)"
                        className={cn(FIELD_CLASS, "text-sm")}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unit_price}
                          onChange={(event) =>
                            setItem(item.key, {
                              unit_price: event.target.value,
                            })
                          }
                          placeholder="Price per unit"
                          aria-label="Price per unit"
                          className={FIELD_CLASS}
                        />
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            setItem(item.key, { quantity: event.target.value })
                          }
                          placeholder="Qty"
                          aria-label="Quantity"
                          className={FIELD_CLASS}
                        />
                      </div>

                      {/* The exact figures that will print, as you type. */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                        <span>
                          Normal{" "}
                          <span className="text-secondary tabular-nums">
                            {money(figures.normalPrice)}
                          </span>
                        </span>
                        <span>
                          CGST{" "}
                          <span className="text-secondary tabular-nums">
                            {money(figures.cgst)}
                          </span>
                        </span>
                        <span>
                          SGST{" "}
                          <span className="text-secondary tabular-nums">
                            {money(figures.sgst)}
                          </span>
                        </span>
                        <span className="ml-auto font-bold text-secondary tabular-nums">
                          {money(figures.lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="h-10 w-full cursor-pointer gap-2 rounded-none"
              >
                <Plus className="size-4" />
                Add line
              </Button>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                One bullet per line. Prefilled with your standard wording — edit
                the product, quantity and date per order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Bullet notes" htmlFor="notes">
                <Textarea
                  id="notes"
                  rows={9}
                  value={draft.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  placeholder={
                    "MATERIAL: MANGO WOOD WITH RESIN INLAY…\nEACH TRAY WILL BE BUBBLE-WRAPPED…"
                  }
                  className="rounded-none"
                />
              </Field>

              <Field label="Closing note" htmlFor="closing">
                <Textarea
                  id="closing"
                  rows={4}
                  value={draft.closing_note}
                  onChange={(event) => set("closing_note", event.target.value)}
                  placeholder="“WE SINCERELY THANK YOU FOR CHOOSING HITA…”"
                  className="rounded-none"
                />
              </Field>

              <Field label="Footer note" htmlFor="footer">
                <Input
                  id="footer"
                  value={draft.footer_note}
                  onChange={(event) => set("footer_note", event.target.value)}
                  placeholder="Bank details and invoice will be shared separately."
                  className={FIELD_CLASS}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6">
          {/* The real renderer output, not an HTML lookalike — what you see
              here is byte-for-byte what downloads. Hidden below xl, where a
              210mm page in a phone-width frame is unreadable anyway. */}
          <Card className={cn(CARD_CLASS, "hidden xl:block")}>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[210/297] w-full border border-border bg-muted">
                {/* Stays put while the next render loads behind it. */}
                {visibleUrl ? (
                  <iframe
                    // Remounted per document: reusing the frame leaves the
                    // viewer showing the previous one.
                    key={visibleUrl}
                    src={`${visibleUrl}#toolbar=0&navpanes=0&view=FitH`}
                    title="Invoice preview"
                    className="size-full"
                  />
                ) : null}

                {preview.url && preview.url !== visibleUrl ? (
                  <iframe
                    key={preview.url}
                    src={`${preview.url}#toolbar=0&navpanes=0&view=FitH`}
                    title=""
                    aria-hidden
                    tabIndex={-1}
                    onLoad={() => setVisibleUrl(preview.url)}
                    className="pointer-events-none absolute inset-0 size-full opacity-0"
                  />
                ) : null}

                {isPreviewLoading ? (
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center gap-3",
                      // Translucent over a page already on screen; solid only
                      // before the first render, when there is nothing to veil.
                      visibleUrl
                        ? "bg-background/60 backdrop-blur-[1px]"
                        : "bg-muted",
                    )}
                  >
                    <Loader2 className="size-7 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">
                      Drawing the invoice…
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="text-secondary tabular-nums">
                    {money(totals.total)}
                  </dd>
                </div>
                {totals.discount > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {draft.discount_type === "percent"
                        ? `Discount ${discountValue}%`
                        : "Discount"}
                    </dt>
                    <dd className="text-destructive tabular-nums">
                      −{money(totals.discount)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <dt className="font-bold text-secondary">Sub Total</dt>
                  <dd className="text-lg font-medium text-primary tabular-nums">
                    {money(totals.subTotal)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(APP_ROUTES.APP.INVOICES)}
          className="cursor-pointer rounded-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
        >
          {isSaving ? "Saving…" : invoice ? "Save changes" : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
