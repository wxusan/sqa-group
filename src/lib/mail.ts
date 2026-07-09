import nodemailer from "nodemailer";

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
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      `SMTP is not configured. Email to ${COMPANY_RECEIVER_EMAIL} was not sent. Subject: ${subject}`
    );
    return { sent: false, skipped: true };
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? user,
    to: COMPANY_RECEIVER_EMAIL,
    subject,
    text,
    html,
    attachments,
  });

  return { sent: true, skipped: false };
}
