import { NextResponse, type NextRequest } from "next/server";

// Locale routing (Next 16: proxy.ts is the renamed middleware convention).
// Dutch — the primary audience — is served on the UNPREFIXED URLs via an
// invisible rewrite to /nl/...; English is a real /en prefix. No
// Accept-Language sniffing: deterministic content per URL is better for CDN
// caching and SEO, and existing indexed URLs keep working.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  // Never touch API routes (Vercel cron hits /api/cron/* directly), Next
  // internals, or root metadata files.
  matcher: [
    "/((?!api|_next|favicon\\.ico|sitemap\\.xml|robots\\.txt|\\.well-known).*)",
  ],
};
