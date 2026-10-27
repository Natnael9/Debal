import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// ─── Provider Configuration ──────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const resendFrom = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Debal App <onboarding@resend.dev>';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}
const sendgridFrom = process.env.SENDGRID_FROM || process.env.EMAIL_FROM || process.env.SMTP_FROM || 'noreply@debal.app';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const brevoFromEmail = process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER || 'debal.app.service@gmail.com';
const brevoFromName = process.env.BREVO_FROM_NAME || 'Debal App';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || `"Debal App" <${SMTP_USER || 'noreply@debal.app'}>`;

function createEmailTransporter() {
  if (!SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT || 465,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    family: 4, // Force IPv4 to prevent ENETUNREACH in IPv6-unsupported cloud containers (Render)
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// Create reusable transporter
export const transporter = createEmailTransporter();

// Startup health log
if (resendClient) {
  console.log('✅ [email] Resend HTTP API active (HTTPS port 443 - optimal for Render)');
} else if (SENDGRID_API_KEY) {
  console.log('✅ [email] SendGrid HTTP API active (HTTPS port 443)');
} else if (transporter) {
  console.log(`ℹ️ [email] Using SMTP transporter (${SMTP_USER})`);
} else {
  console.log('ℹ️ [email] No email service configured. Emails will log to console.');
}

export async function sendEmail({ to, subject, text, html }) {
  // 1. Try Resend (HTTPS Port 443 — Never blocked by Render firewall)
  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: resendFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html: html || text,
      });

      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }

      console.log(`[email] Resend successfully sent email to ${to} (id: ${data?.id})`);
      return { success: true, id: data?.id };
    } catch (err) {
      console.warn(`⚠️ [email] Resend delivery failed to ${to}: ${err.message}`);
    }
  }

  // 2. Try SendGrid (HTTPS Port 443)
  if (SENDGRID_API_KEY) {
    try {
      const [response] = await sgMail.send({
        to,
        from: sendgridFrom,
        subject,
        text,
        html: html || text,
      });
      console.log(`[email] SendGrid successfully sent email to ${to} (statusCode: ${response.statusCode})`);
      return { success: true, statusCode: response.statusCode };
    } catch (err) {
      console.warn(`⚠️ [email] SendGrid delivery failed to ${to}: ${err.message}`);
    }
  }

  // 3. Try Brevo HTTP REST API (HTTPS Port 443 — Free 300 emails/day to ANY recipient, no domain required)
  if (BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: brevoFromName, email: brevoFromEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html || text,
          textContent: text,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log(`[email] Brevo successfully sent email to ${to} (id: ${data?.messageId})`);
      return { success: true, id: data?.messageId };
    } catch (err) {
      console.warn(`⚠️ [email] Brevo delivery failed to ${to}: ${err.message}`);
    }
  }

  // 3. Try Nodemailer SMTP (Local / open networks)
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        text,
        html: html || text,
      });

      console.log(`[email] SMTP successfully sent email to ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.warn(`⚠️ [email] SMTP send failed to ${to}: ${err.message}`);
    }
  }

  // 4. Safe dev/fallback logging
  console.log(`\n========================================\n[email:dev-fallback]\nTo: ${to}\nSubject: ${subject}\n${text || html}\n========================================\n`);
  return { fallback: true };
}

export async function sendVerificationOtpEmail(to, otp) {
  const subject = 'Your Debal verification code';
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4F46E5;">Debal Roommate Verification</h2>
      <p>Use the following verification code to complete your identity verification:</p>
      <div style="background: #F3F4F6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #111827; border-radius: 6px; margin: 15px 0;">
        ${otp}
      </div>
      <p style="color: #6B7280; font-size: 13px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = 'Reset your Debal password';
  const text = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; max-width: 500px;">
      <h2 style="color: #071E2D; margin-top: 0;">Reset Your Password</h2>
      <p style="color: #4B5563; font-size: 14px;">We received a request to reset your password for your Debal account. Click the button below to set a new password:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #071E2D; color: #FFFFFF; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #6B7280; font-size: 12px;">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}