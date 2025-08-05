import sgMail from '@sendgrid/mail';
import { createWelcomeTemplate, createEmailVerificationTemplate, createPasswordResetTemplate, createKYCStatusTemplate } from './emailTemplates';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM!;

// Only set API key if it exists and is not placeholder
if (SENDGRID_API_KEY && !SENDGRID_API_KEY.includes('your-sendgrid-api-key-here')) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('[EMAIL] SendGrid API key not configured - emails will be logged instead of sent');
}

export async function sendWelcomeEmail(to: string, userName?: string, accessCode?: string) {
  return sendEmail({
    to,
    subject: "🎉 ¡Bienvenido a Kustodia!",
    html: createWelcomeTemplate(userName, accessCode)
  });
}

export async function sendKYCStatusEmail(to: string, status: 'approved' | 'rejected' | 'pending', userName?: string, reason?: string) {
  return sendEmail({
    to,
    subject: 'Actualización de tu verificación KYC',
    html: createKYCStatusTemplate(status, userName, reason)
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  // Fallback: If only HTML is provided, generate a plain text version by stripping tags
  let finalText = text;
  if (!finalText && html) {
    finalText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
  if (!(html && html.trim()) && !(finalText && finalText.trim())) {
    throw new Error('sendEmail: Either html or text content must be provided and non-empty.');
  }
  const msg = {
    to,
    from: EMAIL_FROM,
    subject,
    text: finalText,
    html: html,
  };
  await sgMail.send(msg as any);
}
