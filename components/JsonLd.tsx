/**
 * Renders schema.org structured data as an inline ld+json script.
 * `<` is escaped to its unicode form so page content can never break out of
 * the script tag (the pattern Next's JSON-LD guide recommends).
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
