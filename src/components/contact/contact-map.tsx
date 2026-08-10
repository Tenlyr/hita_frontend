import { MAP_EMBED_SRC, MAP_PLACE } from "@/constants/contact";

/**
 * Full-bleed map under the contact details.
 *
 * The keyless `output=embed` endpoint is deliberate — a Maps JavaScript API
 * key would need billing enabled and would leak into the client bundle for
 * what is a static pin.
 */
export function ContactMap() {
  return (
    <section aria-label="Our location" className="w-full">
      <iframe
        src={MAP_EMBED_SRC}
        title={`Map showing ${MAP_PLACE}`}
        loading="lazy"
        // Long enough to read the surrounding streets without pushing the
        // footer off a laptop screen.
        className="block h-[380px] w-full border-0 sm:h-[520px]"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}
