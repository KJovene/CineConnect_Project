import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_SMTP_USER,
      pass: process.env.MAILGUN_SMTP_PASSWORD,
    },
  });
}

const transporter = createTransporter();

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
  const from = process.env.MAIL_FROM ?? `CineConnect <noreply@cineconnect.fr>`;
  console.log(`[mailer] Envoi vers ${options.to} — "${options.subject}"`);
  try {
    const info = await transporter.sendMail({ from, ...options });
    console.log(`[mailer] Email envoyé — messageId: ${info.messageId}`);
  } catch (err) {
    console.error("[mailer] Erreur d'envoi d'email :", err);
  }
}
