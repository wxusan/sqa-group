import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

/** Keys of pages currently turned OFF. A missing row means the page is enabled. */
export async function getDisabledPageKeys(): Promise<string[]> {
  const rows = await prisma.pageSetting.findMany({
    where: { enabled: false },
    select: { key: true },
  });
  return rows.map((r) => r.key);
}

/** Call at the top of a controllable page. Renders 404 when the page is turned off. */
export async function guardPage(key: string): Promise<void> {
  const row = await prisma.pageSetting.findUnique({ where: { key } });
  if (row && !row.enabled) notFound();
}
