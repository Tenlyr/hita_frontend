/**
 * Red asterisk marking a mandatory field.
 *
 * Decorative only — the requirement is conveyed to assistive tech by the
 * input's own `required` attribute, so this is hidden from screen readers
 * to avoid it being announced as "star".
 */
export function RequiredMark() {
  return (
    <span aria-hidden className="text-destructive">
      *
    </span>
  );
}
