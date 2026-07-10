import { del, list, put } from "@vercel/blob";
import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { logError, logInfo } from "@/lib/logger";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type MediaKind = "news" | "partner" | "staff";
export type MediaProvider = "blob" | "local";

export type StoredMedia = {
  name: string;
  provider: MediaProvider;
  size: number;
  uploadedAt: Date;
  url: string;
};

const LOCAL_MEDIA_PREFIX = "/api/media/";

export class StorageError extends Error {
  constructor(
    readonly code: "image_too_large" | "invalid_image" | "not_configured" | "unsupported_media" | "upload_failed"
  ) {
    super(code);
    this.name = "StorageError";
  }
}

type DetectedImage = { ext: "jpg" | "png" | "webp"; mime: "image/jpeg" | "image/png" | "image/webp" };

/**
 * Production uses Vercel Blob. The local filesystem path exists only for local
 * development and automated tests; Vercel functions must never write to it.
 */
export function getMediaProvider(): MediaProvider {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";

  if (process.env.MEDIA_STORAGE === "local" || process.env.NODE_ENV !== "production") {
    return "local";
  }

  throw new StorageError("not_configured");
}

export async function storeImage(file: File, kind: MediaKind): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new StorageError("image_too_large");

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImage(buffer);
  if (!detected) throw new StorageError("invalid_image");

  const provider = getMediaProvider();
  const filename = `${kind}/${new Date().getUTCFullYear()}/${randomUUID()}.${detected.ext}`;
  const startedAt = Date.now();

  try {
    if (provider === "blob") {
      const result = await put(`sqa/${filename}`, buffer, {
        access: "public",
        contentType: detected.mime,
      });
      logInfo("media.upload.completed", {
        bytes: file.size,
        kind,
        provider,
        duration_ms: Date.now() - startedAt,
      });
      return result.url;
    }

    const directory = path.join(process.cwd(), "public", "uploads", kind);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, path.basename(filename)), buffer);
    const url = `${LOCAL_MEDIA_PREFIX}${kind}/${path.basename(filename)}`;
    logInfo("media.upload.completed", {
      bytes: file.size,
      kind,
      provider,
      duration_ms: Date.now() - startedAt,
    });
    return url;
  } catch (error) {
    logError("media.upload.failed", error, { bytes: file.size, kind, provider, duration_ms: Date.now() - startedAt });
    throw new StorageError("upload_failed");
  }
}

export async function listMedia(): Promise<StoredMedia[]> {
  const provider = getMediaProvider();

  if (provider === "blob") {
    try {
      const { blobs } = await list({ prefix: "sqa/" });
      return blobs
        .map((blob) => ({
          name: blob.pathname.replace(/^sqa\//, ""),
          provider,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          url: blob.url,
        }))
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      logError("media.list.failed", error, { provider });
      throw new StorageError("upload_failed");
    }
  }

  const root = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await listLocalFiles(root);
    return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  } catch (error) {
    logError("media.list.failed", error, { provider });
    return [];
  }
}

export async function deleteStoredMedia(url: string): Promise<void> {
  const provider = getMediaProvider();
  if (!isManagedMediaUrl(url)) throw new StorageError("unsupported_media");

  try {
    if (isLocalMediaUrl(url)) {
      if (provider !== "local") throw new StorageError("unsupported_media");
      const relative = localMediaRelativePath(url);
      const normalized = path.normalize(relative);
      if (normalized.startsWith("..") || path.isAbsolute(normalized)) throw new StorageError("unsupported_media");
      await unlink(path.join(process.cwd(), "public", "uploads", normalized));
    } else {
      if (provider !== "blob") throw new StorageError("unsupported_media");
      await del(url);
    }
    logInfo("media.delete.completed", { provider });
  } catch (error) {
    if (error instanceof StorageError) throw error;
    logError("media.delete.failed", error, { provider });
    throw new StorageError("upload_failed");
  }
}

export function isManagedMediaUrl(url: string): boolean {
  if (isLocalMediaUrl(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function detectImage(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

async function listLocalFiles(root: string, prefix = ""): Promise<StoredMedia[]> {
  const entries = await readdir(path.join(root, prefix), { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.join(prefix, entry.name);
      if (entry.isDirectory()) return listLocalFiles(root, relative);
      if (!entry.isFile() || entry.name === ".gitkeep") return [];
      const details = await stat(path.join(root, relative));
      return [
        {
          name: relative,
          provider: "local" as const,
          size: details.size,
          uploadedAt: details.mtime,
          url: `${LOCAL_MEDIA_PREFIX}${relative.split(path.sep).join("/")}`,
        },
      ];
    })
  );
  return files.flat();
}

function isLocalMediaUrl(url: string): boolean {
  return url.startsWith(LOCAL_MEDIA_PREFIX) || url.startsWith("/uploads/");
}

function localMediaRelativePath(url: string): string {
  return url.startsWith(LOCAL_MEDIA_PREFIX)
    ? url.slice(LOCAL_MEDIA_PREFIX.length)
    : url.slice("/uploads/".length);
}
