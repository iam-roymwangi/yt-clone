import type { NextRequest } from "next/server";

/** Public origin for proxied URLs (works behind Vercel / reverse proxies). */
export function getRequestOrigin(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (envUrl) {
    const base = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return base.replace(/\/$/, "");
  }

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}
