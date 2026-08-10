"use client";

import { Inbox, MailCheck, Search, X } from "lucide-react";
import * as React from "react";

import { MessageDetail } from "@/components/messages/message-detail";
import { ReplyDialog } from "@/components/messages/reply-dialog";
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
import { Input } from "@/components/ui/input";
import { useContactMessages } from "@/hooks/use-contact-messages";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/admin.contact.types";

function formatWhen(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  // Today's messages show a time, older ones a date — the useful half either
  // way, in a column too narrow for both.
  return sameDay
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function RowSkeleton() {
  return (
    <div className="space-y-2 border-b border-border p-4">
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function MessagesBoard() {
  const {
    messages,
    count,
    unreadCount,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
    search,
    setSearch,
    unreadOnly,
    setUnreadOnly,
    setPage,
    setRead,
    remove,
    refresh,
  } = useContactMessages();

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [deleting, setDeleting] = React.useState<ContactMessage | null>(null);
  const [replyingTo, setReplyingTo] = React.useState<ContactMessage | null>(
    null,
  );

  const selected = messages.find((item) => item.id === selectedId) ?? null;

  function open(message: ContactMessage) {
    setSelectedId(message.id);
    // Opening a message is what marks it read, the way any inbox behaves.
    if (!message.is_read) void setRead(message, true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const ok = await remove(deleting);
    if (ok && selectedId === deleting.id) setSelectedId(null);
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-secondary sm:text-3xl">
            Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} message{count === 1 ? "" : "s"} from the contact form
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={cn(
              "h-10 shrink-0 cursor-pointer gap-2 rounded-none",
              unreadOnly &&
                "bg-sidebar text-sidebar-foreground hover:bg-sidebar/90",
            )}
          >
            <MailCheck className="size-4" />
            Unread
            {unreadCount > 0 ? (
              <span className="tabular-nums">({unreadCount})</span>
            ) : null}
          </Button>

          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or text"
              className="h-10 rounded-none pl-9"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-secondary"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        {/* Below lg the two panes swap rather than sit side by side, so a
            phone shows one screen at a time. */}
        <div
          className={cn(
            "border border-border bg-background",
            selected && "hidden lg:block",
          )}
        >
          {isLoading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Inbox className="size-5 text-primary" />
              </span>
              <p className="font-bold text-secondary">
                {search || unreadOnly ? "Nothing matches" : "No messages yet"}
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {search || unreadOnly
                  ? "Try a different search, or turn the unread filter off."
                  : "Messages sent from the storefront contact form land here."}
              </p>
            </div>
          ) : (
            <ul className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              {messages.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => open(message)}
                    aria-current={selectedId === message.id}
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-1 border-b border-border p-4 text-left transition-colors",
                      selectedId === message.id
                        ? "bg-muted"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {message.is_read ? null : (
                        <span
                          aria-label="Unread"
                          className="size-2 shrink-0 rounded-full bg-primary"
                        />
                      )}
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm text-secondary",
                          message.is_read ? "font-medium" : "font-bold",
                        )}
                      >
                        {message.full_name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatWhen(message.created_at)}
                      </span>
                    </div>

                    <span className="truncate text-sm text-secondary">
                      {message.subject}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {message.message}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t border-border p-3">
              <Button
                type="button"
                variant="outline"
                disabled={!hasPrevious}
                onClick={() => setPage(page - 1)}
                className="h-8 cursor-pointer rounded-none text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!hasNext}
                onClick={() => setPage(page + 1)}
                className="h-8 cursor-pointer rounded-none text-xs"
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "border border-border bg-background",
            !selected && "hidden lg:block",
          )}
        >
          {selected ? (
            <MessageDetail
              // Remount on selection so the detail never shows a stale scroll
              // position from the previous message.
              key={selected.id}
              message={selected}
              onToggleRead={() => void setRead(selected, !selected.is_read)}
              onDelete={() => setDeleting(selected)}
              onReply={() => setReplyingTo(selected)}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-24 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-5 text-muted-foreground" />
              </span>
              <p className="text-sm text-muted-foreground">
                Pick a message to read it here.
              </p>
            </div>
          )}
        </div>
      </div>

      {replyingTo ? (
        <ReplyDialog
          // Keyed so switching messages with the dialog open starts a fresh
          // draft rather than carrying the previous one over.
          key={replyingTo.id}
          message={replyingTo}
          open
          onOpenChange={(open) => !open && setReplyingTo(null)}
          // The reply marks the thread read server-side, so pull the list back
          // in rather than guessing at the new state.
          onSent={() => refresh()}
        />
      ) : null}

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `The message from ${deleting.full_name} will be removed for good.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="cursor-pointer rounded-none bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
