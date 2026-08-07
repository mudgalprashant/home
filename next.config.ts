import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * Deferred from Phase 1 so it could be written against a real build rather than
 * guessed at (KB/plan.md Phase 2 security gate).
 *
 * ## Why script-src allows 'unsafe-inline'
 *
 * Inspecting the served HTML shows Next emits two inline <script> blocks: the
 * RSC bootstrap, and an ~11KB payload whose contents change with every content
 * edit. That rules out both alternatives:
 *
 *   - **Hashes** would have to be recomputed whenever any content changes, which
 *     for a database-backed site means on every admin save. Unworkable.
 *   - **Nonces** must differ per request, so the HTML carrying them cannot be
 *     cached. That would disable ISR on every page — the caching this entire
 *     architecture is built around (KB/system-design.md §3) — in exchange for
 *     hardening one attack path.
 *
 * So script-src permits inline. The residual XSS risk is low and bounded by
 * things already true of this codebase: `dangerouslySetInnerHTML` is banned
 * (KB/security.md §4.2 rule 8), React escapes every interpolated value, and no
 * user-submitted content is rendered anywhere. Meanwhile the policy still blocks
 * what matters most in practice — loading script from an attacker-controlled
 * origin — plus base-tag injection, form hijacking, plugin embedding, and
 * framing.
 *
 * The theme script is a static file rather than inline specifically so it needs
 * no exception here (see public/theme-init.js).
 *
 * ## Why Report-Only, for now
 *
 * A CSP that is subtly too strict breaks the site silently in the browser, and
 * this policy has never been loaded by one — there is no browser in the
 * environment it was written in. Report-Only makes violations visible in the
 * console without blocking anything, which is the standard way to roll a policy
 * out.
 *
 * TO ENFORCE: change CSP_HEADER_NAME below to "Content-Security-Policy" after
 * confirming a clean console on a deploy preview. Steps are in KB/runbook.md.
 */
const CSP_HEADER_NAME = "Content-Security-Policy-Report-Only";

const csp = [
  "default-src 'self'",
  // See the note above — inline is required by Next's own output.
  "script-src 'self' 'unsafe-inline'",
  // Tailwind injects a stylesheet; inline styles are permitted defensively since
  // style-based attacks are far less severe than script execution.
  "style-src 'self' 'unsafe-inline'",
  // data: covers inlined SVG icons; Supabase Storage will serve avatars later.
  "img-src 'self' data: blob: https://*.supabase.co",
  // next/font self-hosts at build time, so no external font origin is needed.
  "font-src 'self'",
  // The browser Supabase client (admin login, Phase 3) talks to the project API.
  "connect-src 'self' https://*.supabase.co",
  // Nothing here is meant to be embedded. Pairs with X-Frame-Options for older
  // browsers that do not honour frame-ancestors.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // Blocks a hijacked form from posting to an attacker's origin. Revisit when
  // the contact form is wired up, since it posts to a third-party endpoint.
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Block MIME-type sniffing, so a file served as text/plain can't be executed as JS.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow framing entirely — nothing here is meant to be embedded, and this
  // closes clickjacking against the admin panel before it exists.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the full URL only to same-origin destinations; cross-origin gets the bare
  // origin. Keeps the unlisted admin path out of third-party referrer logs
  // (KB/security.md §3.2).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No feature of this site needs these APIs; deny them outright.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Vercel serves HTTPS already; this stops a downgrade attempt on repeat visits.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // avatar_url accepts either a site-relative path (a file in public/) or an
    // absolute URL, so next/image has to permit Supabase Storage as well — it is
    // where uploads will land once the admin panel exists. Kept to that single
    // host rather than a wildcard: an open image host lets anyone route traffic
    // through this site's optimizer. Matches CSP img-src in the same file.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          // Production only. In development Next opens a websocket for hot
          // reload, which `connect-src 'self'` would flag on every page load and
          // bury the violations that actually matter.
          ...(process.env.NODE_ENV === "production"
            ? [{ key: CSP_HEADER_NAME, value: csp }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
