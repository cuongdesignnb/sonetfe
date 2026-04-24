// API configuration
// This file centralizes API URL configuration

// Production API URL - used as fallback when env var is not set
const PROD_API_URL = "https://admin.phamanhchien.vn/api";

// Get API URL based on environment
export function getApiUrl(): string {
  // Server-side: use INTERNAL_API_URL for direct connection
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL?.replace(/\/$/, "") || PROD_API_URL;
  }
  // Client-side: use NEXT_PUBLIC_API_URL
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || PROD_API_URL;
}

// Export constant for static usage (uses production URL as safe default)
export const API_URL = PROD_API_URL;

export default API_URL;
