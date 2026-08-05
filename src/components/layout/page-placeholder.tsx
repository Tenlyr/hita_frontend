interface PagePlaceholderProps {
  title: string;
  description?: string;
}

/** Centred stand-in for screens that are routed but not built yet. */
export function PagePlaceholder({
  title,
  description = "This screen is coming soon.",
}: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-bold text-secondary sm:text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
