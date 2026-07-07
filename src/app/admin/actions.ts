"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth, signIn, signOut } from "@/lib/auth";
import { missingTranslations } from "@/lib/publish";
import { storeImage, deleteLocalUpload } from "@/lib/storage";
import { slugify } from "@/lib/slug";
import { locales } from "@/i18n/routing";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
}

export type ActionResult = { ok: boolean; error?: string };

/* ---------------- auth ---------------- */

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch {
    return { ok: false, error: "Invalid email or password" };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/admin/login");
}

/* ---------------- shared helpers ---------------- */

function translationsFromForm(formData: FormData, fields: string[]) {
  return locales.map((locale) => {
    const entry: Record<string, string> = { locale };
    for (const f of fields) {
      entry[f] = String(formData.get(`${locale}_${f}`) ?? "").trim();
    }
    return entry;
  });
}

async function maybeStoreImage(formData: FormData, field: string): Promise<string | null> {
  const file = formData.get(field);
  if (file instanceof File && file.size > 0) {
    return storeImage(file);
  }
  const existing = String(formData.get(`${field}_existing`) ?? "").trim();
  return existing || null;
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

/* ---------------- staff ---------------- */

const staffSchema = z.object({
  department: z.enum(["management", "certification", "laboratory"]),
  order: z.coerce.number().int().min(0),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
});

export async function saveStaff(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const wantPublish = formData.get("published") === "on";

  const parsed = staffSchema.safeParse({
    department: formData.get("department"),
    order: formData.get("order"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    linkedin: formData.get("linkedin"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const translations = translationsFromForm(formData, ["name", "position", "intro", "bio", "expertise"]);

  if (wantPublish) {
    const problems = missingTranslations(translations, ["name", "position"]);
    if (problems.length) {
      return { ok: false, error: `Cannot publish — required translations missing: ${problems.join("; ")}` };
    }
  }

  const uzName = translations.find((t) => t.locale === "uz")?.name || "staff";
  let photoUrl: string | null;
  try {
    photoUrl = await maybeStoreImage(formData, "photo");
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }

  const data = {
    department: parsed.data.department,
    order: parsed.data.order,
    published: wantPublish,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    linkedin: parsed.data.linkedin || null,
    photoUrl,
  };

  if (id) {
    await prisma.staff.update({
      where: { id },
      data: {
        ...data,
        translations: {
          deleteMany: {},
          create: translations.map((t) => ({
            locale: t.locale, name: t.name, position: t.position,
            intro: t.intro || null, bio: t.bio || null, expertise: t.expertise || null,
          })),
        },
      },
    });
  } else {
    await prisma.staff.create({
      data: {
        ...data,
        slug: await uniqueSlug("staff", slugify(uzName)),
        translations: {
          create: translations.map((t) => ({
            locale: t.locale, name: t.name, position: t.position,
            intro: t.intro || null, bio: t.bio || null, expertise: t.expertise || null,
          })),
        },
      },
    });
  }
  revalidatePublic();
  redirect("/admin/staff");
}

export async function deleteStaff(formData: FormData) {
  await requireAdmin();
  await prisma.staff.delete({ where: { id: String(formData.get("id")) } });
  revalidatePublic();
  revalidatePath("/admin/staff");
}

/* ---------------- news ---------------- */

export async function saveNews(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const wantPublish = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  const translations = translationsFromForm(formData, ["title", "summary", "body"]);

  if (wantPublish) {
    const problems = missingTranslations(translations, ["title", "body"]);
    if (problems.length) {
      return { ok: false, error: `Cannot publish — required translations missing: ${problems.join("; ")}` };
    }
  }

  const uzTitle = translations.find((t) => t.locale === "uz")?.title || "news";
  let imageUrl: string | null;
  try {
    imageUrl = await maybeStoreImage(formData, "image");
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }

  const data = {
    status: wantPublish ? "published" : "draft",
    featured,
    imageUrl,
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : wantPublish ? new Date() : null,
  };

  if (id) {
    await prisma.news.update({
      where: { id },
      data: {
        ...data,
        translations: {
          deleteMany: {},
          create: translations.map((t) => ({
            locale: t.locale, title: t.title, summary: t.summary || null, body: t.body,
          })),
        },
      },
    });
  } else {
    await prisma.news.create({
      data: {
        ...data,
        slug: await uniqueSlug("news", slugify(uzTitle)),
        translations: {
          create: translations.map((t) => ({
            locale: t.locale, title: t.title, summary: t.summary || null, body: t.body,
          })),
        },
      },
    });
  }
  revalidatePublic();
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData) {
  await requireAdmin();
  await prisma.news.delete({ where: { id: String(formData.get("id")) } });
  revalidatePublic();
  revalidatePath("/admin/news");
}

/* ---------------- partners ---------------- */

export async function savePartner(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const wantPublish = formData.get("published") === "on";
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  const translations = translationsFromForm(formData, ["name"]);

  if (wantPublish) {
    const problems = missingTranslations(translations, ["name"]);
    if (problems.length) {
      return { ok: false, error: `Cannot publish — required translations missing: ${problems.join("; ")}` };
    }
  }

  let logoUrl: string | null;
  try {
    logoUrl = await maybeStoreImage(formData, "logo");
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
  if (!logoUrl) return { ok: false, error: "Partner logo is required" };

  const data = { logoUrl, websiteUrl: websiteUrl || null, order, published: wantPublish };

  if (id) {
    await prisma.partner.update({
      where: { id },
      data: {
        ...data,
        translations: {
          deleteMany: {},
          create: translations.map((t) => ({ locale: t.locale, name: t.name })),
        },
      },
    });
  } else {
    await prisma.partner.create({
      data: {
        ...data,
        translations: { create: translations.map((t) => ({ locale: t.locale, name: t.name })) },
      },
    });
  }
  revalidatePublic();
  redirect("/admin/partners");
}

export async function deletePartner(formData: FormData) {
  await requireAdmin();
  await prisma.partner.delete({ where: { id: String(formData.get("id")) } });
  revalidatePublic();
  revalidatePath("/admin/partners");
}

/* ---------------- media ---------------- */

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  await deleteLocalUpload(String(formData.get("name")));
  revalidatePath("/admin/media");
}

/* ---------------- slug helper ---------------- */

async function uniqueSlug(model: "staff" | "news", base: string): Promise<string> {
  let slug = base;
  let n = 1;
  for (;;) {
    const existing =
      model === "staff"
        ? await prisma.staff.findUnique({ where: { slug } })
        : await prisma.news.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${++n}`;
  }
}
