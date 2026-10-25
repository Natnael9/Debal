import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || `"Debal App" <${SMTP_USER}>`;

// Create reusable transporter
const transporter = (SMTP_USER && SMTP_PASS)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`\n========================================\n[email:fallback]\nTo: ${to}\nSubject: ${subject}\n${text || html}\n========================================\n`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log(`[email] Successfully sent email to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.warn(`\n⚠️ [email] SMTP send failed to ${to}: ${err.message}`);
    console.log(`\n========================================\n[email:dev-fallback]\nTo: ${to}\nSubject: ${subject}\n${text || html}\n========================================\n`);
  }
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