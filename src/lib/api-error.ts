import axios from "axios";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/** Pull the backend's `message` out of an error, with sensible fallbacks. */
export function getApiErrorMessage(
  error: unknown,
  fallback = FALLBACK_MESSAGE,
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }
    if (!error.response) {
      return "Cannot reach the server. Check your connection and try again.";
    }
  }
  return fallback;
}
