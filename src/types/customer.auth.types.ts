/** Storefront sign-in — phone number + OTP. */

export interface OtpRequestResult {
  /** Normalised to E.164 by the API — use this for the verify call. */
  phone_number: string;
  expires_in: number;
  /** Present only while the backend runs with DEBUG on. */
  debug_otp?: string;
}
