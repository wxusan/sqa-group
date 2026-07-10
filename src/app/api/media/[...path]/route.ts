import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT = path.resolve(process.cwd(), "public", "uploads");
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Serves files written by the local media adapter after Next has started.
 * Production uploads use Vercel Blob and never reach this route.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  if (!segments.length || segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment))) {
    return new NextResponse(null, { status: 400 });
  }

  const resolved = path.resolve(ROOT, ...segments);
  if (!resolved.startsWith(`${ROOT}${path.sep}`)) return new NextResponse(null, { status: 400 });

  const mime = MIME_TYPES[path.extname(resolved).toLowerCase()];
  if (!mime) return new NextResponse(null, { status: 404 });

  try {
    const file = await readFile(resolved);
    return new NextResponse(file, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": mime,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
