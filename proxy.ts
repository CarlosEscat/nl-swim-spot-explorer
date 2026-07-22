import { NextResponse, type NextRequest } from "next/server";

// Root metadata routes (app/sitemap.ts, app/robots.ts). These live OUTSIDE the
// [lang] tree and must always resolve to their own handler.
const METADATA_ROUTES = new Set(["/sitemap.xml", "/robots.txt"]);

// Next's client-router request headers. When any of these is present, the edge
// treats the request as an RSC navigation and resolves /sitemap.xml into the
// [lang] dynamic segment (lang="sitemap.xml") instead of the metadata route —
// returning a text/x-component payload that Google's crawlers reject. Stripping
// them forces a plain document resolution to the metadata handler.
const ROUTER_HEADERS = [
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-router-segment-prefetch",
  "next-url",
];

// Locale routing (Next 16: proxy.ts is the renamed middleware convention).
// Dutch — the primary audience — is served on the UNPREFIXED URLs via an
// invisible rewrite to /nl/...; English is a real /en prefix. No
// Accept-Language sniffing: deterministic content per URL is better for CDN
// caching and SEO, and existing indexed URLs keep working.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Metadata files: never rewrite into /nl, and strip the router headers so an
  // RSC-flavored request can't shadow them with the [lang] page (any header
  // combination now returns the intended XML/text).
  if (METADATA_ROUTES.has(pathname)) {
    const headers = new Headers(request.headers);
    for (const h of ROUTER_HEADERS) headers.delete(h);
    return NextResponse.next({ request: { headers } });
  }

  // English is a real route segment — pass through.
  if (pathname === "/en" || pathname.startsWith("/en/")) return;

  // Canonicalize: Dutch lives unprefixed, so /nl/... redirects there.
  if (pathname === "/nl" || pathname.startsWith("/nl/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/nl/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  // Everything else is Dutch: rewrite (URL in the browser stays unprefixed).
  const url = request.nextUrl.clone();
  url.pathname = `/nl${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Never touch API routes (Vercel cron hits /api/cron/* directly) or Next
  // internals. sitemap.xml/robots.txt ARE matched now (see METADATA_ROUTES):
  // the proxy must run for them to strip router headers, otherwise the edge
  // can resolve their RSC variant into the [lang] page.
  matcher: [
    "/((?!api|_next|favicon\\.ico|icon\\.svg|\\.well-known).*)",
  ],
};
