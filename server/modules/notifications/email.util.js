/**
 * email.util.js
 *
 * NOTE FOR TEAM: Architecture doc §2 specifies SendGrid for transactional
 * email. Switched to Resend on Aug 15 2026 after Twilio SendGrid rejected
 * account activation (ticket #29014791, cause undisclosed by Twilio).
 * Flag for architecture doc update — same "resolve mismatches" pattern as
 * the users.model.js note.
 */


import { Resend } from 'resend';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

export async function sendEmail({ to, subject, text }) {
  if (!resend) {
    console.log(`[email:fallback] To: ${to} | Subject: ${subject}\n${text}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
  });

  if (error) {
    console.error('[email] Resend send failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendVerificationOtpEmail(to, otp) {
  await sendEmail({
    to,
    subject: 'Your Debal verification code',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
}