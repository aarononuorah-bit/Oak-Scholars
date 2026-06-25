/**
 * Oak Scholars — Email Notification Service
 * Uses Nodemailer with configurable SMTP transport.
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in env.
 * Falls back to Ethereal (test) transport when SMTP_HOST is not set.
 */

import nodemailer, { Transporter } from "nodemailer";

const BRAND_PURPLE = "#281A39";
const BRAND_AMBER = "#E8A838";

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("[Email] Using Ethereal test transport. Preview emails at https://ethereal.email");
    console.log("[Email] Test account:", testAccount.user);
  }

  return _transporter;
}

const FROM_ADDRESS = process.env.SMTP_FROM || '"Oak Scholars" <hello@oakscholars.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@oakscholars.com";

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oak Scholars</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${BRAND_PURPLE};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.02em;">
                🌳 <span style="color:${BRAND_AMBER};">Oak</span> Scholars
              </h1>
            </td>
          </tr>
          <tr><td style="padding:40px;">${content}</td></tr>
          <tr>
            <td style="background:#f9f8f5;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
                Oak Scholars · Online Tutoring · UK-wide<br/>
                <a href="https://oakscholars.com" style="color:${BRAND_AMBER};text-decoration:none;">oakscholars.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendAdminBookingAlert(data: {
  firstName: string; lastName: string; email: string; phone?: string;
  subject: string; level: string; sessionType: string; preferredTime: string; message?: string;
}) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:20px;margin:0 0 8px;">New Booking Request</h2>
    <p style="color:#666;margin:0 0 24px;font-size:14px;">A new session booking has been submitted.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;width:140px;">Student</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;font-weight:600;">${data.firstName} ${data.lastName}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${data.email}" style="color:${BRAND_AMBER};">${data.email}</a></td></tr>
      ${data.phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.phone}</td></tr>` : ""}
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.subject}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Level</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.level}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Session Type</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.sessionType}</td></tr>
      <tr><td style="padding:10px 0;${data.message ? "border-bottom:1px solid #f0f0f0;" : ""}color:#999;font-size:13px;">Preferred Time</td><td style="padding:10px 0;${data.message ? "border-bottom:1px solid #f0f0f0;" : ""}color:#281A39;">${data.preferredTime}</td></tr>
      ${data.message ? `<tr><td style="padding:10px 0;color:#999;font-size:13px;vertical-align:top;">Note</td><td style="padding:10px 0;color:#281A39;">${data.message}</td></tr>` : ""}
    </table>
    <div style="margin-top:28px;text-align:center;">
      <a href="https://oakscholars.com/admin" style="display:inline-block;background:${BRAND_PURPLE};color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">View in Dashboard →</a>
    </div>
  `);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: ADMIN_EMAIL,
    subject: `📚 New Booking — ${data.firstName} ${data.lastName} (${data.subject})`, html,
  });
  console.log("[Email] Admin booking alert sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendAdminContactAlert(data: {
  name: string; email: string; subject: string; message: string;
}) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:20px;margin:0 0 8px;">New Contact Message</h2>
    <p style="color:#666;margin:0 0 24px;font-size:14px;">Someone has sent a message through the contact form.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;width:100px;">From</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;font-weight:600;">${data.name}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${data.email}" style="color:${BRAND_AMBER};">${data.email}</a></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.subject}</td></tr>
    </table>
    <div style="margin-top:20px;background:#f9f8f5;border-left:3px solid ${BRAND_AMBER};padding:16px 20px;border-radius:0 6px 6px 0;">
      <p style="margin:0;color:#444;font-size:14px;line-height:1.7;">${data.message.replace(/\n/g, "<br/>")}</p>
    </div>
    <div style="margin-top:24px;text-align:center;">
      <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" style="display:inline-block;background:${BRAND_AMBER};color:${BRAND_PURPLE};text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:700;font-size:14px;margin-right:12px;">Reply by Email</a>
      <a href="https://oakscholars.com/admin" style="display:inline-block;background:${BRAND_PURPLE};color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">View Dashboard</a>
    </div>
  `);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: ADMIN_EMAIL,
    subject: `💬 New Message — ${data.name}: ${data.subject}`, html,
  });
  console.log("[Email] Admin contact alert sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendAdminTutorAlert(data: {
  firstName: string; lastName: string; email: string;
  university: string; degreeSubject: string; yearOfStudy: string; subjects: string;
}) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:20px;margin:0 0 8px;">New Tutor Application</h2>
    <p style="color:#666;margin:0 0 24px;font-size:14px;">A new tutor has applied to join the Oak Scholars team.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;width:140px;">Applicant</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;font-weight:600;">${data.firstName} ${data.lastName}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${data.email}" style="color:${BRAND_AMBER};">${data.email}</a></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">University</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.university}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#999;font-size:13px;">Degree</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#281A39;">${data.degreeSubject} (Year ${data.yearOfStudy})</td></tr>
      <tr><td style="padding:10px 0;color:#999;font-size:13px;">Subjects</td><td style="padding:10px 0;color:#281A39;">${data.subjects}</td></tr>
    </table>
    <div style="margin-top:28px;text-align:center;">
      <a href="https://oakscholars.com/admin" style="display:inline-block;background:${BRAND_PURPLE};color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">Review Application →</a>
    </div>
  `);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: ADMIN_EMAIL,
    subject: `🎓 New Tutor Application — ${data.firstName} ${data.lastName} (${data.university})`, html,
  });
  console.log("[Email] Admin tutor alert sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendBookingConfirmation(data: {
  firstName: string; email: string; subject: string;
  level: string; sessionType: string; preferredTime: string;
}) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:20px;margin:0 0 8px;">Booking Request Received ✓</h2>
    <p style="color:#444;margin:0 0 20px;font-size:15px;line-height:1.6;">Hi <strong>${data.firstName}</strong>, thank you for booking with Oak Scholars! We've received your request and will be in touch within 24 hours to confirm your tutor and session time.</p>
    <div style="background:#f9f8f5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:#999;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Your Booking Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#999;font-size:13px;width:130px;">Subject</td><td style="padding:6px 0;color:#281A39;font-weight:600;">${data.subject}</td></tr>
        <tr><td style="padding:6px 0;color:#999;font-size:13px;">Level</td><td style="padding:6px 0;color:#281A39;font-weight:600;">${data.level}</td></tr>
        <tr><td style="padding:6px 0;color:#999;font-size:13px;">Session Type</td><td style="padding:6px 0;color:#281A39;font-weight:600;">${data.sessionType}</td></tr>
        <tr><td style="padding:6px 0;color:#999;font-size:13px;">Preferred Time</td><td style="padding:6px 0;color:#281A39;font-weight:600;">${data.preferredTime}</td></tr>
      </table>
    </div>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px;">Your first session is <strong style="color:${BRAND_AMBER};">50% off</strong>. We'll send you payment details when we confirm your tutor match.</p>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0;">Any questions? Reply to this email or contact us at <a href="mailto:hello@oakscholars.com" style="color:${BRAND_AMBER};">hello@oakscholars.com</a></p>
  `);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: data.email,
    subject: `Your Oak Scholars booking is confirmed 🌳`, html,
  });
  console.log("[Email] Booking confirmation sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendContactConfirmation(data: { name: string; email: string; subject: string }) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:20px;margin:0 0 8px;">Message Received ✓</h2>
    <p style="color:#444;margin:0 0 20px;font-size:15px;line-height:1.6;">Hi <strong>${data.name}</strong>, thanks for getting in touch! We've received your message about <em>"${data.subject}"</em> and will get back to you within 24 hours.</p>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0;">In the meantime, feel free to <a href="https://oakscholars.com/booking" style="color:${BRAND_AMBER};font-weight:600;">book a trial session</a> — your first lesson is 50% off.</p>
  `);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: data.email,
    subject: `We've received your message — Oak Scholars`, html,
  });
  console.log("[Email] Contact confirmation sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendTutorApplicationConfirmation(data: {
  firstName: string; email: string; university: string;
}) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:20px;margin:0 0 8px;">Application Received ✓</h2>
    <p style="color:#444;margin:0 0 20px;font-size:15px;line-height:1.6;">Hi <strong>${data.firstName}</strong>, thank you for applying to become an Oak Scholars tutor! We've received your application from <strong>${data.university}</strong> and our team will review it within 3–5 working days.</p>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 16px;">We'll be in touch about next steps, which may include a short interview and a trial session observation.</p>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0;">Questions? Email us at <a href="mailto:hello@oakscholars.com" style="color:${BRAND_AMBER};">hello@oakscholars.com</a></p>
  `);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: data.email,
    subject: `Your Oak Scholars tutor application has been received 🌳`, html,
  });
  console.log("[Email] Tutor confirmation sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}
