import { writeFile, mkdir, readdir, unlink, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Stores an uploaded image. Uses Cloudinary when credentials are present,
 * otherwise falls back to local /public/uploads (fine for development).
 * Returns the public URL.
 */
export async function storeImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Only JPG, PNG, WEBP or SVG images are allowed");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be 5MB or smaller");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured()) {
    return uploadToCloudinary(buffer, file.type);
  }

  const ext =
    file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1] ?? "bin";
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}

async function uploadToCloudinary(buffer: Buffer, mime: string) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "sqa";
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }));
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`);
  const json = (await res.json()) as { secure_url: string };
  return json.secure_url;
}

/** Lists files in the local uploads folder (local storage mode). */
export async function listLocalUploads() {
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await readdir(dir);
    const out = [];
    for (const f of files) {
      const s = await stat(path.join(dir, f));
      out.push({ name: f, url: `/uploads/${f}`, size: s.size, mtime: s.mtime });
    }
    return out.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch {
    return [];
  }
}

export async function deleteLocalUpload(name: string) {
  if (name.includes("/") || name.includes("..")) throw new Error("Bad name");
  await unlink(path.join(process.cwd(), "public", "uploads", name));
}
