"use client";

import {
  ArrowLeft,
  Mail,
  MailOpen,
  Phone,
  Reply,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/admin.contact.types";

function formatReceived(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-secondary" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-0.5 text-sm break-words text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}

interface MessageDetailProps {
  message: ContactMessage;
  onToggleRead: () => void;
  onDelete: () => void;
  onReply: () => void;
  /** Only rendered below lg, where the panes stack. */
  onBack: () => void;
}

export function MessageDetail({
  message,
  onToggleRead,
  onDelete,
  onReply,
  onBack,
}: MessageDetailProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3 border-b border-border p-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          aria-label="Back to messages"
          className="size-8 shrink-0 cursor-pointer rounded-none lg:hidden"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-secondary">
              {message.subject}
            </h2>
            {message.is_read ? null : (
              <span className="bg-primary/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                New
              </span>
            )}
            {message.reply_count > 0 ? (
              <span className="bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                Replied
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Received {formatReceived(message.created_at)}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field icon={User} label="From">
            {message.full_name}
          </Field>

          <Field icon={Mail} label="Email">
            <a
              href={`mailto:${message.email}`}
              className="transition-colors hover:text-primary"
            >
              {message.email}
            </a>
          </Field>

          {message.phone_number ? (
            <Field icon={Phone} label="Phone">
              <a
                href={`tel:${message.phone_number}`}
                className="transition-colors hover:text-primary"
              >
                {message.phone_number}
              </a>
            </Field>
          ) : null}
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Message
          </p>
          {/* `whitespace-pre-wrap`: the sender's own line breaks are the only
              formatting we have, so they are worth keeping. `wrap-anywhere`
              so a long pasted URL wraps instead of widening the pane. */}
          <p className="mt-2 leading-relaxed whitespace-pre-wrap wrap-anywhere text-secondary">
            {message.message}
          </p>
        </div>

        {message.replies.length > 0 ? (
          <div className="border-t border-border pt-5">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {message.replies.length} repl
              {message.replies.length === 1 ? "y" : "ies"} sent
            </p>

            <ul className="mt-3 space-y-3">
              {message.replies.map((reply) => (
                <li
                  key={reply.id}
                  className="border-l-2 border-primary bg-muted/50 p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-bold text-secondary">
                      {reply.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reply.sent_by ? `${reply.sent_by} · ` : ""}
                      {formatReceived(reply.created_at)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere text-secondary">
                    {reply.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
        <Button
          type="button"
          onClick={onReply}
          className="h-9 cursor-pointer gap-2 rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
        >
          <Reply className="size-4" />
          Reply
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onToggleRead}
          className="h-9 cursor-pointer gap-2 rounded-none"
        >
          {message.is_read ? (
            <Mail className="size-4" />
          ) : (
            <MailOpen className="size-4" />
          )}
          {message.is_read ? "Mark unread" : "Mark read"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onDelete}
          className={cn(
            "ml-auto h-9 cursor-pointer gap-2 rounded-none",
            "text-muted-foreground hover:text-destructive",
          )}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
