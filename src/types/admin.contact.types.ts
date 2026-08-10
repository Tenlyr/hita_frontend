/** Admin console — contact messages sent from the storefront form. */

export interface ContactReply {
  id: number;
  subject: string;
  body: string;
  /** Name or email of the admin who sent it, if still on the account. */
  sent_by: string | null;
  created_at: string | null;
}

export interface ContactMessage {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string | null;
  replies: ContactReply[];
  reply_count: number;
}

export interface ReplyInput {
  subject: string;
  body: string;
}

export interface ContactMessageListResult {
  results: ContactMessage[];
  count: number;
  /** Every unread message, not just the unread ones on this page. */
  unread_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ContactMessageQuery {
  search?: string;
  unread_only?: boolean;
  page?: number;
  page_size?: number;
}
