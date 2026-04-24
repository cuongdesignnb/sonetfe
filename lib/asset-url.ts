/**
 * Resolve asset URL - prepend backend URL for /storage paths
 * Used for logo, favicon, and other media assets from backend storage
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Already absolute URL
  if (/^https?:\/\//i.test(url)) return url;
  // Backend storage path - prepend API base URL
  if (url.startsWith("/storage/")) {
    // Strip /api, /api/backend, or trailing slash from API URL
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api(\/backend)?\/?$/, "") ||
      "http://localhost:8000";
    return `${apiBase}${url}`;
  }
  return url;
}

/**
 * Get the backend base URL (without /api path)
 */
export function getBackendBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api(\/backend)?\/?$/, "") ||
    "http://localhost:8000"
  );
}

