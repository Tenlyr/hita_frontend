import { Josefin_Sans } from "next/font/google";

/**
 * Storefront typeface.
 *
 * Exported here rather than declared inside the landing layout so portalled UI
 * (dialogs, toasts) can opt in explicitly — portals render into <body>, outside
 * the layout that scopes `--font-sans` to Josefin, and would otherwise fall
 * back to the app-wide Lato.
 */
export const josefinSans = Josefin_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
