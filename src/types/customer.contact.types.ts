/** Storefront contact form. */

export interface ContactMessageInput {
  full_name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  /** Honeypot — always empty for a real visitor. */
  website?: string;
}

export interface ContactMessageResult {
  id: number;
}
