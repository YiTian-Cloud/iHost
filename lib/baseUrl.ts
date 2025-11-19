// lib/baseUrl.ts
export function getPublicBaseUrl(): string {
    // In the browser, prefer the actual origin
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
  
    // On the server, use env
    const raw = process.env.NEXT_PUBLIC_BASE_URL || "";
    return raw.replace(/\/+$/, ""); // remove trailing slashes
  }
  