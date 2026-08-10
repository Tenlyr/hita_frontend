"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { contactService } from "@/services/contact.service";
import type {
  ContactMessage,
  ContactMessageListResult,
} from "@/types/admin.contact.types";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY: ContactMessageListResult = {
  results: [],
  count: 0,
  unread_count: 0,
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

/** The console inbox: list, filters, and the read/delete actions. */
export function useContactMessages() {
  const [data, setData] = React.useState<ContactMessageListResult>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);

  /** Bumped to force a refetch after a mutation. */
  const [revision, setRevision] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    // Let typing settle rather than firing a request per keystroke.
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await contactService.list({
          search: search.trim(),
          unread_only: unreadOnly,
          page,
          page_size: PAGE_SIZE,
        });
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load messages."));
          setData(EMPTY);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, unreadOnly, page, revision]);

  const refresh = React.useCallback(
    () => setRevision((current) => current + 1),
    [],
  );

  const setRead = React.useCallback(
    async (message: ContactMessage, isRead: boolean) => {
      // Paint the row immediately; opening a message should not feel like it
      // waits on the network.
      setData((current) => ({
        ...current,
        results: current.results.map((item) =>
          item.id === message.id ? { ...item, is_read: isRead } : item,
        ),
        unread_count: Math.max(0, current.unread_count + (isRead ? -1 : 1)),
      }));

      try {
        await contactService.setRead(message.id, isRead);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Could not update that message."));
        refresh();
      }
    },
    [refresh],
  );

  const remove = React.useCallback(
    async (message: ContactMessage) => {
      try {
        await contactService.remove(message.id);
        toast.success("Message deleted.");
        refresh();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Could not delete that message."));
        return false;
      }
    },
    [refresh],
  );

  /** Filters change what page 1 even means, so reset when they move. */
  const changeSearch = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const changeUnreadOnly = React.useCallback((value: boolean) => {
    setUnreadOnly(value);
    setPage(1);
  }, []);

  return {
    messages: data.results,
    count: data.count,
    unreadCount: data.unread_count,
    page: data.page,
    totalPages: data.total_pages,
    hasNext: data.has_next,
    hasPrevious: data.has_previous,
    isLoading,
    error,
    search,
    setSearch: changeSearch,
    unreadOnly,
    setUnreadOnly: changeUnreadOnly,
    setPage,
    setRead,
    remove,
    refresh,
  };
}
