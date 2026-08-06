"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// The app is light-only (next-themes was removed), so the theme is fixed
// rather than read from a theme provider.
//
// Brand styling: white background, sidebar-brown border and icons. Note this
// means severity is carried by the icon shape, not colour — so don't pass
// `richColors`, which would repaint the whole toast per type.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-sidebar" />
        ),
        info: (
          <InfoIcon className="size-4 text-sidebar" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-sidebar" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-sidebar" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--secondary)",
          "--normal-border": "var(--sidebar)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast border-sidebar",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
