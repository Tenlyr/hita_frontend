"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { contactService } from "@/services/contact.service";
import type { ContactMessage } from "@/types/admin.contact.types";

/** Matches MAX_REPLY_LENGTH in contact/schemas.py. */
const BODY_MAX = 8000;

interface ReplyDialogProps {
  message: ContactMessage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Handed the updated message, replies included. */
  onSent: (message: ContactMessage) => void;
}

export function ReplyDialog({
  message,
  open,
  onOpenChange,
  onSent,
}: ReplyDialogProps) {
  const [subject, setSubject] = React.useState(`Re: ${message.subject}`);
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  // Reset when the dialog opens rather than in an effect, so replying to one
  // message never leaves another one's draft behind.
  const [lastOpen, setLastOpen] = React.useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setSubject(`Re: ${message.subject}`);
      setBody("");
      setError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!body.trim()) {
      setError("Write something before sending.");
      return;
    }

    setIsSending(true);
    try {
      const updated = await contactService.reply(message.id, {
        subject: subject.trim(),
        body: body.trim(),
      });
      onSent(updated);
      onOpenChange(false);
      toast.success(`Reply sent to ${message.email}.`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send the reply."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reply to {message.full_name}</DialogTitle>
          <DialogDescription>
            Sent from the shop address. Their original message is quoted below
            for reference — it is not included in the email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-secondary">To</Label>
            {/* Fixed on purpose: a reply goes to whoever wrote in, and a
                typo here would send it into the void. */}
            <p className="border border-border bg-muted px-3 py-2.5 text-sm text-secondary">
              {message.email}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reply-subject" className="text-secondary">
              Subject
            </Label>
            <Input
              id="reply-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={200}
              className="h-11 rounded-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reply-body" className="text-secondary">
              Message
            </Label>
            <Textarea
              id="reply-body"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setError(null);
              }}
              maxLength={BODY_MAX}
              rows={8}
              placeholder="Write your reply…"
              aria-invalid={Boolean(error)}
              className={cn(
                "min-h-44 rounded-none",
                error && "border-destructive",
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-destructive">{error ?? ""}</p>
              <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {body.length} / {BODY_MAX}
              </p>
            </div>
          </div>

          <details className="border border-border">
            <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-muted-foreground uppercase">
              Their message
            </summary>
            <p className="max-h-40 overflow-y-auto px-3 pb-3 text-sm leading-relaxed whitespace-pre-wrap text-secondary">
              {message.message}
            </p>
          </details>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              className="cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
            >
              {isSending ? "Sending…" : "Send reply"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
