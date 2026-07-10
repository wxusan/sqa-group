import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import type { Page } from "@playwright/test";

export const E2E_ADMIN_EMAIL = "e2e-admin@sqa.test";
export const E2E_ADMIN_PASSWORD = "e2e-admin-password";

export const prisma = new PrismaClient();

export function assertSafeE2eDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const usesLocalPostgres = databaseUrl.includes("127.0.0.1") || databaseUrl.includes("localhost");
  if (!usesLocalPostgres || !databaseUrl.includes("sqa_audit")) {
    throw new Error("E2E mutation tests require a local DATABASE_URL containing 'sqa_audit'.");
  }
}

export async function ensureE2eAdmin() {
  assertSafeE2eDatabase();
  await prisma.adminUser.upsert({
    where: { email: E2E_ADMIN_EMAIL },
    update: { passwordHash: await hash(E2E_ADMIN_PASSWORD, 10), name: "E2E Admin" },
    create: {
      email: E2E_ADMIN_EMAIL,
      passwordHash: await hash(E2E_ADMIN_PASSWORD, 10),
      name: "E2E Admin",
    },
  });
}

export async function removeE2eAdmin() {
  await prisma.adminUser.deleteMany({ where: { email: E2E_ADMIN_EMAIL } });
}

export async function signInAsE2eAdmin(page: Page) {
  await page.goto("/admin/login?lang=uz");
  await page.locator('input[name="email"]').fill(E2E_ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: /Kirish|Sign in/ }).click();
  await page.waitForURL(/\/admin(?:\?|$)/);
}
