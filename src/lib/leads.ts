"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logError, logWarn } from "@/lib/logger";
import { COMPANY_RECEIVER_EMAIL, sendCompanyEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";

const SERVICE_TYPES = ["certification", "testing", "surveillance", "other"];
const SERVICE_LABEL_UZ: Record<string, string> = {
  certification: "Mahsulot sertifikatlash",
  testing: "Laboratoriya sinovi",
  surveillance: "Inspeksiya nazorati",
  other: "Boshqa / maslahat",
};

export type LeadState = { ok?: boolean; error?: string };

/** Public application form. Protected by a honeypot field + length limits. */
export async function submitApplication(_prev: LeadState | undefined, formData: FormData): Promise<LeadState> {
  // Honeypot: real users never fill this hidden field
  if (String(formData.get("website") ?? "") !== "") {
    return { ok: true };
  }
  if (!(await checkRateLimit("application-form"))) {
    return { error: "rate-limit" };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 50);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const company = String(formData.get("company") ?? "").trim().slice(0, 200);
  const serviceType = String(formData.get("serviceType") ?? "");
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  const locale = String(formData.get("locale") ?? "uz").slice(0, 5);

  if (!name || !phone || !message || !SERVICE_TYPES.includes(serviceType)) {
    return { error: "validation" };
  }

  try {
    await prisma.lead.create({
      data: { name, phone, email: email || null, company: company || null, serviceType, message, locale },
    });
  } catch (error) {
    logError("lead.create_failed", error, { service_type: serviceType });
    return { error: "persistence" };
  }

  try {
    const mail = await sendCompanyEmail({
      subject: `Yangi ariza: ${SERVICE_LABEL_UZ[serviceType] ?? serviceType} - ${name}`,
      text: [
      "Sayt orqali yangi ariza qabul qilindi.",
      "",
      `Xizmat turi: ${SERVICE_LABEL_UZ[serviceType] ?? serviceType}`,
      `F.I.Sh.: ${name}`,
      `Telefon: ${phone}`,
      `Email: ${email || "Ko'rsatilmagan"}`,
      `Tashkilot: ${company || "Ko'rsatilmagan"}`,
      `Sayt tili: ${locale}`,
      "",
      "Mahsulot va so'rov tafsilotlari:",
      message,
      "",
      `Qabul qiluvchi: ${COMPANY_RECEIVER_EMAIL}`,
      ].join("\n"),
      html: `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#1f2937">
        <h2 style="margin:0 0 12px;color:#2003bd">Sayt orqali yangi ariza qabul qilindi</h2>
        <p>Quyida ariza beruvchi tomonidan yuborilgan ma'lumotlar keltirilgan.</p>
        <table style="border-collapse:collapse;width:100%;max-width:680px">
          <tbody>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Xizmat turi</td><td style="padding:8px;border:1px solid #e5e7eb">${SERVICE_LABEL_UZ[serviceType] ?? serviceType}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">F.I.Sh.</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Telefon</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(email || "Ko'rsatilmagan")}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Tashkilot</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(company || "Ko'rsatilmagan")}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Sayt tili</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(locale)}</td></tr>
          </tbody>
        </table>
        <h3 style="margin:18px 0 8px">Mahsulot va so'rov tafsilotlari</h3>
        <div style="white-space:pre-wrap;border:1px solid #e5e7eb;background:#f8fafc;padding:12px">${escapeHtml(message)}</div>
      </div>
      `,
    });
    if (mail.skipped) logWarn("lead.email_skipped", { service_type: serviceType });
  } catch (error) {
    // The application is already durable in the admin inbox; do not discard it
    // just because a notification email could not be delivered.
    logError("lead.email_failed", error, { service_type: serviceType });
  }

  revalidatePath("/admin/leads");
  return { ok: true };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function setLeadStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new");
  if (id) await prisma.lead.updateMany({ where: { id }, data: { status: status === "processed" ? "processed" : "new" } });
  revalidatePath("/admin/leads");
}

export async function deleteLead(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.lead.deleteMany({ where: { id } });
  revalidatePath("/admin/leads");
}
