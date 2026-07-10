/** Local uploads exist only in development and the isolated E2E adapter.
 * Production media is served from Vercel Blob and remains Next/Image optimized. */
export function isLocalMediaUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/api/media/") || url?.startsWith("/uploads/"));
}
