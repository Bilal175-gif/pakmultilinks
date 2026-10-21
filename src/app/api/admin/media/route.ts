import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import {
  jsonError,
  noStoreHeaders,
  readJson,
  requireAdminRequest,
} from "@/app/api/_utils";
import { deleteBlobs } from "@/lib/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function detectImageType(bytes: Uint8Array): { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && (process.env.storeId || process.env.BLOB_STORE_ID))
  );
}

async function saveLocalMedia(scope: string, filename: string, bytes: Uint8Array): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", scope);
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, Buffer.from(bytes));
  return `/uploads/${scope}/${filename}`;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminRequest(request))) {
    return jsonError("Administrator access required.", 401);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 512 * 1024) {
    return jsonError("The upload request is too large. Maximum image size is 5 MB.", 413);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Select an image to upload.", 400);
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return jsonError("Images must be between 1 byte and 5 MB.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectImageType(bytes);
    if (!detected) {
      return jsonError("The file content does not match a supported image format (JPG, PNG, or WebP).", 400);
    }

    const rawScope = form.get("scope");
    const scope = typeof rawScope === "string" && ["deals", "products", "categories", "brands"].includes(rawScope)
      ? rawScope
      : "products";
    const filename = `${randomUUID()}.${detected.ext}`;

    let url: string;

    if (hasBlobCredentials()) {
      try {
        const blob = await put(`${scope}/${filename}`, Buffer.from(bytes), {
          access: "public",
          contentType: detected.mime,
        });
        url = blob.url;
      } catch (blobError) {
        console.warn("Vercel Blob upload failed, falling back to local storage:", blobError);
        if (!process.env.VERCEL) {
          url = await saveLocalMedia(scope, filename, bytes);
        } else {
          throw blobError;
        }
      }
    } else {
      url = await saveLocalMedia(scope, filename, bytes);
    }

    return NextResponse.json(
      { url },
      { status: 201, headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Media upload failed:", error);
    const message = error instanceof Error && error.message ? error.message : "The image could not be uploaded.";
    return jsonError(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdminRequest(request))) {
    return jsonError("Administrator access required.", 401);
  }

  try {
    const body = await readJson(request, 16_000) as { urls?: unknown };
    if (!Array.isArray(body.urls) || body.urls.length === 0) {
      return jsonError("No image URLs provided.", 400);
    }
    const urls = body.urls.filter((u): u is string => typeof u === "string" && u.length > 0);
    if (urls.length > 100) {
      return jsonError("Too many URLs. Maximum 100 per request.", 400);
    }
    await deleteBlobs(urls);
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Blob deletion failed", error);
    return jsonError("Images could not be deleted.", 500);
  }
}
