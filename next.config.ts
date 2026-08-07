import type { NextConfig } from "next";

/**
 * Baseline security headers (KB/security.md §5.3).
 *
 * Content-Security-Policy is deliberately absent here. Next.js needs either a
 * nonce-based CSP wired through middleware or a permissive `unsafe-inline`
 * fallback, and shipping an untested CSP is worse than shipping none — it either
 * breaks the app or provides false assurance. CSP lands in Phase 2, where it can
 * be verified against a running app (KB/plan.md Phase 2 security gate).
 */
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
