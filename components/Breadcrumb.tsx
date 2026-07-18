import Link from "next/link";

/**
 * Crawlable breadcrumb trail (Home › Province › Spot) for the region and
 * spot pages. The last item is the current page and renders as plain text.
 */
export default function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="mb-4 text-sm text-gray-400">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && <span className="mx-1.5">›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-indigo-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
