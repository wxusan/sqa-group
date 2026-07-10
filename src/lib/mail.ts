import { Resend } from "resend";
import { logWarn } from "@/lib/logger";

type Attachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type CompanyMail = {
  subject: string;
  text: string;
  html: string;
  attachments?: Attachment[];
};

export const COMPANY_RECEIVER_EMAIL = process.env.COMPANY_RECEIVER_EMAIL ?? "info@sqa.uz";

export async function sendCompanyEmail({ subject, text, html, attachments = [] }: CompanyMail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    logWarn("mail.not_configured");
    return { sent: false, skipped: true };
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: COMPANY_RECEIVER_EMAIL,
    subject: subject.replace(/[\r\n]+/g, " "),
    text,
    html,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      content_type: attachment.contentType,
    })),
  });

  if (result.error) throw new Error(`Resend delivery failed: ${result.error.name}`);

  return { sent: true, skipped: false, id: result.data?.id };
}
