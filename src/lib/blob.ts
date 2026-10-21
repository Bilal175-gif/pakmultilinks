import { del } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Detects whether a URL is a Vercel Blob Storage URL.
 * Blob URLs follow the pattern: https://<token>.public.blob.vercel-storage.com/...
 */
export function isVercelBlobUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * Detects whether a URL is a local upload path.
 */
export function isLocalUploadUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("/uploads/") && !url.includes("..");
}

/**
 * Deletes one or more images by URL (supports Vercel Blob and local /uploads).
 * Silently ignores external URLs and deletion failures to avoid blocking
 * the caller (cleanup is best-effort).
 */
export async function deleteBlobs(urls: string[]): Promise<void> {
  const blobUrls = urls.filter(isVercelBlobUrl);
  if (blobUrls.length > 0 && (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN)) {
    try {
      await del(blobUrls);
    } catch (error) {
      console.error("Blob cleanup failed:", error);
    }
  }

  const localUrls = urls.filter(isLocalUploadUrl);
  for (const localUrl of localUrls) {
    try {
      const sanitized = path.normalize(localUrl).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(process.cwd(), "public", sanitized);
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (fullPath.startsWith(uploadsDir)) {
        await fs.unlink(fullPath).catch(() => {});
      }
    } catch (error) {
      console.error("Local file cleanup failed:", error);
    }
  }
}
