import api from "@/lib/axios";
import type {
  ContactMessage,
  ContactMessageListResult,
  ContactMessageQuery,
  ReplyInput,
} from "@/types/admin.contact.types";
import type { ApiResponse } from "@/types/api.types";
import type {
  ContactMessageInput,
  ContactMessageResult,
} from "@/types/customer.contact.types";

export const contactService = {
  /** POST /contact — public, no session needed. */
  async send(payload: ContactMessageInput): Promise<ContactMessageResult> {
    const { data } = await api.post<ApiResponse<ContactMessageResult>>(
      "/contact",
      payload,
    );
    return data.data;
  },

  /** GET /admin/contact-messages — paginated inbox for the console. */
  async list(
    query: ContactMessageQuery = {},
  ): Promise<ContactMessageListResult> {
    const { data } = await api.get<ApiResponse<ContactMessageListResult>>(
      "/admin/contact-messages",
      { params: query },
    );
    return data.data;
  },

  async setRead(id: number, isRead: boolean): Promise<ContactMessage> {
    const { data } = await api.patch<ApiResponse<ContactMessage>>(
      `/admin/contact-messages/${id}`,
      { is_read: isRead },
    );
    return data.data;
  },

  /** POST /admin/contact-messages/{id}/reply — emails and records it. */
  async reply(id: number, payload: ReplyInput): Promise<ContactMessage> {
    const { data } = await api.post<ApiResponse<ContactMessage>>(
      `/admin/contact-messages/${id}/reply`,
      payload,
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/contact-messages/${id}`);
  },
};
