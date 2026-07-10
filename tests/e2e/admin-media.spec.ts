import path from "path";
import { unlink } from "fs/promises";
import { expect, test } from "@playwright/test";
import {
  ensureE2eAdmin,
  prisma,
  removeE2eAdmin,
  signInAsE2eAdmin,
} from "./admin-test-helpers";

const logoPath = path.resolve(process.cwd(), "public/images/partners/coca-cola.png");
const photoPath = path.resolve(process.cwd(), "public/images/team/valiev-xojiakbar.jpg");
const e2eSuffix = "media-upload";

let partnerId = "";
let staffId = "";
let newsId = "";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await ensureE2eAdmin();

  await prisma.partner.deleteMany({
    where: { translations: { some: { locale: "uz", name: `E2E hamkor ${e2eSuffix}` } } },
  });
  await prisma.staff.deleteMany({ where: { slug: `e2e-staff-${e2eSuffix}` } });
  await prisma.news.deleteMany({ where: { slug: `e2e-news-${e2eSuffix}` } });

  const [partner, staff, news] = await prisma.$transaction([
    prisma.partner.create({
      data: {
        logoUrl: "/images/partners/kfc.png",
        order: 9_999,
        published: true,
        translations: {
          create: [
            { locale: "uz", name: `E2E hamkor ${e2eSuffix}` },
            { locale: "ru", name: `E2E partner ${e2eSuffix}` },
            { locale: "en", name: `E2E partner ${e2eSuffix}` },
          ],
        },
      },
    }),
    prisma.staff.create({
      data: {
        slug: `e2e-staff-${e2eSuffix}`,
        photoUrl: "/images/team/valiev-xojiakbar.jpg",
        department: "management",
        order: 9_999,
        published: false,
        translations: {
          create: [
            { locale: "uz", name: "E2E xodim", position: "Sinov" },
            { locale: "ru", name: "E2E сотрудник", position: "Тест" },
            { locale: "en", name: "E2E staff", position: "Test" },
          ],
        },
      },
    }),
    prisma.news.create({
      data: {
        slug: `e2e-news-${e2eSuffix}`,
        imageUrl: "/images/office/office.jpg",
        status: "draft",
        translations: {
          create: [
            { locale: "uz", title: "E2E yangilik", body: "Sinov matni" },
            { locale: "ru", title: "E2E новость", body: "Тестовый текст" },
            { locale: "en", title: "E2E news", body: "Test body" },
          ],
        },
      },
    }),
  ]);
  partnerId = partner.id;
  staffId = staff.id;
  newsId = news.id;
});

test.afterAll(async () => {
  const [partner, staff, news] = await Promise.all([
    prisma.partner.findUnique({ where: { id: partnerId }, select: { logoUrl: true } }),
    prisma.staff.findUnique({ where: { id: staffId }, select: { photoUrl: true } }),
    prisma.news.findUnique({ where: { id: newsId }, select: { imageUrl: true } }),
  ]);
  await prisma.$transaction([
    prisma.partner.deleteMany({ where: { id: partnerId } }),
    prisma.staff.deleteMany({ where: { id: staffId } }),
    prisma.news.deleteMany({ where: { id: newsId } }),
  ]);
  for (const url of [partner?.logoUrl, staff?.photoUrl, news?.imageUrl]) {
    if (url?.startsWith("/api/media/")) {
      await unlink(path.join(process.cwd(), "public", "uploads", url.slice("/api/media/".length))).catch(() => undefined);
    }
  }
  await removeE2eAdmin();
  await prisma.$disconnect();
});

test("blocks publishing a partner until all three translations exist", async ({ page }) => {
  await signInAsE2eAdmin(page);
  await page.goto("/admin/partners/new?lang=uz");
  await page.locator('input[name="uz_name"]').fill("E2E incomplete partner");
  await page.locator('button[type="submit"]').click();

  await expect(page.getByText(/Chop etishdan oldin/)).toBeVisible();
  await expect(page.locator('input[name="uz_name"]')).toHaveValue("E2E incomplete partner");
  await expect(
    prisma.partner.count({ where: { translations: { some: { locale: "uz", name: "E2E incomplete partner" } } } })
  ).resolves.toBe(0);
});

test("replaces a partner logo through the admin and renders it publicly", async ({ page }) => {
  await signInAsE2eAdmin(page);
  await page.goto(`/admin/partners/${partnerId}?lang=uz`);
  await page.locator('input[name="logo"]').setInputFiles(logoPath);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/partners(?:\?|$)/);

  const partner = await prisma.partner.findUniqueOrThrow({ where: { id: partnerId } });
  expect(partner.logoUrl).toMatch(/^\/api\/media\/partner\//);

  await page.goto("/uz");
  // Freeze the decorative marquee so the uploaded logo can be checked as a
  // visible public asset instead of landing outside the viewport mid-animation.
  await page.addStyleTag({ content: ".marquee-track { animation: none !important; transform: none !important; }" });
  const uploadedLogo = page.getByAltText(`E2E hamkor ${e2eSuffix}`).first();
  await expect(uploadedLogo).toHaveAttribute("src", partner.logoUrl);
  const response = await page.request.get(partner.logoUrl);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("replaces staff and news images through their admin edit forms", async ({ page }) => {
  await signInAsE2eAdmin(page);

  await page.goto(`/admin/staff/${staffId}?lang=uz`);
  await page.locator('input[name="photo"]').setInputFiles(photoPath);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/staff(?:\?|$)/);

  await page.goto(`/admin/news/${newsId}?lang=uz`);
  await page.locator('input[name="image"]').setInputFiles(logoPath);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/news(?:\?|$)/);

  const [staff, news] = await Promise.all([
    prisma.staff.findUniqueOrThrow({ where: { id: staffId } }),
    prisma.news.findUniqueOrThrow({ where: { id: newsId } }),
  ]);
  expect(staff.photoUrl).toMatch(/^\/api\/media\/staff\//);
  expect(news.imageUrl).toMatch(/^\/api\/media\/news\//);
});
