"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signIn, signOut } from "@/lib/auth";
import { storeImage, deleteLocalUpload } from "@/lib/storage";
import { missingTranslations } from "@/lib/publish";
import { slugify } from "@/lib/slug";
import { locales } from "@/i18n/routing";
import { PAGE_KEYS } from "@/lib/pages";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

function revalidatePublic() {
  // Public pages cache for 120s; bust them all on any content change
  revalidatePath("/", "layout");
}

/* ---------------- auth ---------------- */

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch {
    return { error: "Invalid login or password" };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/admin/login");
}

/* ---------------- shared helpers ---------------- */

async function maybeUpload(formData: FormData, field: string): Promise<string | undefined> {
  const file = formData.get(field);
  if (file instanceof File && file.size > 0) {
    return storeImage(file);
  }
  return undefined;
}

function translationFields(formData: FormData, fields: string[]) {
  return locales.map((locale) => {
    const entry: Record<string, string> = { locale };
    for (const f of fields) {
      entry[f] = String(formData.get(`${locale}_${f}`) ?? "").trim();
    }
    return entry;
  });
}

/* ---------------- staff ---------------- */

const STAFF_REQUIRED = ["name", "position"];

export async function saveStaff(_prev: { error?: string } | undefined, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const wantPublish = formData.get("published") === "on";

  const translations = translationFields(formData, ["name", "position", "intro", "bio", "expertise"]);

  if (wantPublish) {
    const problems = missingTranslations(translations, STAFF_REQUIRED);
    if (problems.length > 0) {
      return { error: `Cannot publish — fix first: ${problems.join("; ")}` };
    }
  }

  const photoUrl = await maybeUpload(formData, "photo").catch((e: Error) => {
    throw new Error(e.message);
  });

  const base = {
    department: String(formData.get("department") ?? "certification"),
    order: Number(formData.get("order") ?? 0),
    published: wantPublish,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    ...(photoUrl ? { photoUrl } : {}),
  };

  if (id) {
    await prisma.staff.update({ where: { id }, data: base });
    for (const tr of translations) {
      await prisma.staffTranslation.upsert({
        where: { staffId_locale: { staffId: id, locale: tr.locale } },
        update: { name: tr.name, position: tr.position, intro: tr.intro || null, bio: tr.bio || null, expertise: tr.expertise || null },
        create: { staffId: id, locale: tr.locale, name: tr.name, position: tr.position, intro: tr.intro || null, bio: tr.bio || null, expertise: tr.expertise || null },
      });
    }
  } else {
    const en = translations.find((t) => t.locale === "en");
    const uz = translations.find((t) => t.locale === "uz");
    const slugSource = en?.name || uz?.name || translations[0]?.name || "staff";
    let slug = slugify(slugSource);
    if (await prisma.staff.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;

    await prisma.staff.create({
      data: {
        slug,
        ...base,
        translations: {
          create: translations
            .filter((t) => t.name || t.position)
            .map((t) => ({ locale: t.locale, name: t.name, position: t.position, intro: t.intro || null, bio: t.bio || null, expertise: t.expertise || null })),
        },
      },
    });
  }

  revalidatePublic();
  redirect("/admin/staff");
}

export async function deleteStaff(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.staff.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/staff");
}

/* ---------------- news ---------------- */

const NEWS_REQUIRED = ["title", "body"];

export async function saveNews(_prev: { error?: string } | undefined, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const wantPublish = formData.get("publish") === "on";

  const translations = translationFields(formData, ["title", "summary", "body"]);

  if (wantPublish) {
    const problems = missingTranslations(translations, NEWS_REQUIRED);
    if (problems.length > 0) {
      return { error: `Cannot publish — fix first: ${problems.join("; ")}` };
    }
  }

  const imageUrl = await maybeUpload(formData, "image");

  const base = {
    status: wantPublish ? "published" : "draft",
    ...(imageUrl ? { imageUrl } : {}),
  };

  if (id) {
    const existing = await prisma.news.findUnique({ where: { id } });
    await prisma.news.update({
      where: { id },
      data: {
        ...base,
        publishedAt: wantPublish ? existing?.publishedAt ?? new Date() : existing?.publishedAt,
      },
    });
    for (const tr of translations) {
      await prisma.newsTranslation.upsert({
        where: { newsId_locale: { newsId: id, locale: tr.locale } },
        update: { title: tr.title, summary: tr.summary || null, body: tr.body },
        create: { newsId: id, locale: tr.locale, title: tr.title, summary: tr.summary || null, body: tr.body },
      });
    }
  } else {
    const en = translations.find((t) => t.locale === "en");
    const uz = translations.find((t) => t.locale === "uz");
    let slug = slugify(en?.title || uz?.title || translations[0]?.title || "news");
    if (await prisma.news.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;

    await prisma.news.create({
      data: {
        slug,
        ...base,
        publishedAt: wantPublish ? new Date() : null,
        translations: {
          create: translations
            .filter((t) => t.title || t.body)
            .map((t) => ({ locale: t.locale, title: t.title, summary: t.summary || null, body: t.body })),
        },
      },
    });
  }

  revalidatePublic();
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.news.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/news");
}

/* ---------------- partners ---------------- */

const PARTNER_REQUIRED = ["name"];

export async function savePartner(_prev: { error?: string } | undefined, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const wantPublish = formData.get("published") === "on";

  const translations = translationFields(formData, ["name"]);

  if (wantPublish) {
    const problems = missingTranslations(translations, PARTNER_REQUIRED);
    if (problems.length > 0) {
      return { error: `Cannot publish — fix first: ${problems.join("; ")}` };
    }
  }

  const logoUrl = await maybeUpload(formData, "logo");
  if (!id && !logoUrl) {
    return { error: "A logo image is required for a new partner" };
  }

  const base = {
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim() || null,
    order: Number(formData.get("order") ?? 0),
    published: wantPublish,
    ...(logoUrl ? { logoUrl } : {}),
  };

  if (id) {
    await prisma.partner.update({ where: { id }, data: base });
    for (const tr of translations) {
      await prisma.partnerTranslation.upsert({
        where: { partnerId_locale: { partnerId: id, locale: tr.locale } },
        update: { name: tr.name },
        create: { partnerId: id, locale: tr.locale, name: tr.name },
      });
    }
  } else {
    await prisma.partner.create({
      data: {
        ...(base as typeof base & { logoUrl: string }),
        translations: {
          create: translations.filter((t) => t.name).map((t) => ({ locale: t.locale, name: t.name })),
        },
      },
    });
  }

  revalidatePublic();
  redirect("/admin/partners");
}

export async function deletePartner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.partner.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/partners");
}

/* ---------------- media ---------------- */

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "");
  if (name) await deleteLocalUpload(name);
  revalidatePath("/admin/media");
}

/* ---------------- page visibility ---------------- */

export async function setPageEnabled(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  if (!key || !PAGE_KEYS.has(key)) return;
  await prisma.pageSetting.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });
  revalidatePublic();
  revalidatePath("/admin/pages");
}
