/**
 * Oak Scholars — Email Notification Service
 * Uses Nodemailer with configurable SMTP transport.
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in env.
 * Falls back to Ethereal (test) transport when SMTP_HOST is not set.
 */

import nodemailer, { Transporter } from "nodemailer";

const BRAND_PURPLE = "#281A39";
const BRAND_AMBER = "#E8A838";
const BRAND_SURFACE = "#F9F7F2";

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

const FROM_ADDRESS = process.env.SMTP_FROM || '"Oak Scholars" <team@oakscholars.com>';
const ADMIN_EMAIL = "team@oakscholars.com";

function baseTemplate(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oak Scholars</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_SURFACE};font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_SURFACE};padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(40,26,57,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_PURPLE};padding:40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://framerusercontent.com/images/V6mG3N1n6Kz8Z2z5H8f0y3w.png" alt="Oak Scholars" width="160" style="display:block;margin-bottom:12px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">
                      <span style="color:${BRAND_AMBER};">Oak</span> Scholars
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:48px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fcfbf9;padding:40px;text-align:center;border-top:1px solid rgba(40,26,57,0.05);">
              <p style="margin:0 0 16px;color:${BRAND_PURPLE};font-size:14px;font-weight:600;">
                Empowering the next generation of learners.
              </p>
              <div style="margin-bottom:24px;">
                <a href="https://instagram.com/oakscholars" style="display:inline-block;margin:0 8px;color:${BRAND_PURPLE};text-decoration:none;font-size:12px;font-weight:600;">Instagram</a>
                <a href="https://tiktok.com/@oakscholars" style="display:inline-block;margin:0 8px;color:${BRAND_PURPLE};text-decoration:none;font-size:12px;font-weight:600;">TikTok</a>
                <a href="https://linkedin.com/company/oakscholars" style="display:inline-block;margin:0 8px;color:${BRAND_PURPLE};text-decoration:none;font-size:12px;font-weight:600;">LinkedIn</a>
              </div>
              <p style="margin:0;color:#999;font-size:11px;line-height:1.6;letter-spacing:0.02em;">
                &copy; ${new Date().getFullYear()} Oak Scholars Ltd. Online Tutoring Nationwide.<br/>
                <a href="https://oakscholars.co.uk" style="color:${BRAND_AMBER};text-decoration:none;font-weight:600;">oakscholars.co.uk</a>
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
    <h2 style="color:${BRAND_PURPLE};font-size:24px;margin:0 0 12px;font-family:serif;">New Booking Request</h2>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">A new student has requested a tutoring session.</p>
    
    <div style="background:${BRAND_SURFACE};border-radius:12px;padding:24px;margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;width:140px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Student</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.firstName} ${data.lastName}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);"><a href="mailto:${data.email}" style="color:${BRAND_AMBER};font-weight:600;text-decoration:none;">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Phone</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:600;">${data.phone}</td></tr>` : ""}
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Subject</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:600;">${data.subject} (${data.level})</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Package</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:600;">${data.sessionType}</td></tr>
        <tr><td style="padding:12px 0;${data.message ? "border-bottom:1px solid rgba(40,26,57,0.05);" : ""}color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Preferred Time</td><td style="padding:12px 0;${data.message ? "border-bottom:1px solid rgba(40,26,57,0.05);" : ""}color:${BRAND_PURPLE};font-weight:600;">${data.preferredTime}</td></tr>
        ${data.message ? `<tr><td style="padding:12px 0;color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Message</td><td style="padding:12px 0;color:${BRAND_PURPLE};line-height:1.6;">${data.message}</td></tr>` : ""}
      </table>
    </div>
    <div style="text-align:center;">
      <a href="https://oakscholars.co.uk/admin" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;box-shadow:0 4px 12px rgba(40,26,57,0.15);">Manage Booking →</a>
    </div>
  `, `New booking from ${data.firstName} ${data.lastName}`);
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
    <h2 style="color:${BRAND_PURPLE};font-size:24px;margin:0 0 12px;font-family:serif;">New Inquiry</h2>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">You have a new message from the contact form.</p>
    
    <div style="background:${BRAND_SURFACE};border-radius:12px;padding:24px;margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;width:100px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">From</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.name}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);"><a href="mailto:${data.email}" style="color:${BRAND_AMBER};font-weight:600;text-decoration:none;">${data.email}</a></td></tr>
        <tr><td style="padding:12px 0;color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Subject</td><td style="padding:12px 0;color:${BRAND_PURPLE};font-weight:600;">${data.subject}</td></tr>
      </table>
      <div style="margin-top:20px;background:#ffffff;border:1px solid rgba(40,26,57,0.05);padding:20px;border-radius:8px;">
        <p style="margin:0;color:${BRAND_PURPLE};font-size:15px;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
      </div>
    </div>
    <div style="text-align:center;">
      <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" style="display:inline-block;background:${BRAND_AMBER};color:${BRAND_PURPLE};text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:800;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;margin-right:12px;">Reply Now</a>
      <a href="https://oakscholars.co.uk/admin" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Admin View</a>
    </div>
  `, `Message from ${data.name}`);
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
    <h2 style="color:${BRAND_PURPLE};font-size:24px;margin:0 0 12px;font-family:serif;">Tutor Application</h2>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">A new undergraduate has applied to join the Oak Scholars team.</p>
    
    <div style="background:${BRAND_SURFACE};border-radius:12px;padding:24px;margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;width:140px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Applicant</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.firstName} ${data.lastName}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">University</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:600;">${data.university}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Degree</td><td style="padding:12px 0;border-bottom:1px solid rgba(40,26,57,0.05);color:${BRAND_PURPLE};font-weight:600;">${data.degreeSubject} (${data.yearOfStudy})</td></tr>
        <tr><td style="padding:12px 0;color:#999;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Subjects</td><td style="padding:12px 0;color:${BRAND_PURPLE};line-height:1.6;">${data.subjects}</td></tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="https://oakscholars.co.uk/admin" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Review Application →</a>
    </div>
  `, `New application from ${data.firstName}`);
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
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">Booking Request Received ✓</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.firstName}</strong>, thank you for choosing Oak Scholars!</p>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">We've received your request and our team is currently matching you with the best-suited undergraduate scholar. We'll be in touch within <strong>24 hours</strong> to confirm your tutor and schedule your first session.</p>
    
    <div style="background:${BRAND_SURFACE};border-radius:16px;padding:32px;margin-bottom:32px;border:1px solid rgba(40,26,57,0.03);">
      <p style="margin:0 0 20px;color:#999;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Booking Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#777;font-size:14px;width:130px;">Subject</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.subject}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Level</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.level}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Session Type</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.sessionType}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Preferred Time</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.preferredTime}</td></tr>
      </table>
    </div>

    <div style="background:rgba(232,168,56,0.1);border-radius:12px;padding:20px;margin-bottom:32px;text-align:center;">
      <p style="margin:0;color:${BRAND_PURPLE};font-size:14px;font-weight:600;line-height:1.5;">
        You've secured your <span style="color:${BRAND_AMBER};">50% discount</span> for this trial session. Our scholars are excited to help you excel!
      </p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://oakscholars.co.uk/dashboard" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">View My Dashboard</a>
    </div>

    <p style="color:#999;font-size:13px;line-height:1.7;margin:0;text-align:center;">
      Any questions? Just reply to this email or reach us at <a href="mailto:team@oakscholars.com" style="color:${BRAND_AMBER};text-decoration:none;font-weight:600;">team@oakscholars.com</a>
    </p>
  `, `We've received your booking, ${data.firstName}!`);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: data.email,
    subject: `Your Oak Scholars booking is confirmed 🌳`, html,
  });
  console.log("[Email] Booking confirmation sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendContactConfirmation(data: { name: string; email: string; subject: string }) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">Message Received ✓</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.name}</strong>, thanks for reaching out!</p>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">We've received your inquiry regarding <em>"${data.subject}"</em>. One of our team members will review your message and get back to you personally within <strong>24 hours</strong>.</p>
    
    <div style="border:2px dashed rgba(232,168,56,0.3);border-radius:16px;padding:32px;text-align:center;">
      <p style="margin:0 0 20px;color:${BRAND_PURPLE};font-size:16px;font-weight:600;">Ready to get started?</p>
      <a href="https://oakscholars.co.uk/booking" style="display:inline-block;background:${BRAND_AMBER};color:${BRAND_PURPLE};text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:800;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Book a Trial Session (50% Off)</a>
    </div>
  `, `We've received your message — Oak Scholars`);
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
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">Application Received ✓</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.firstName}</strong>, thank you for applying!</p>
    <p style="color:#666;margin:0 0 24px;font-size:16px;line-height:1.6;">We've received your application to join the Oak Scholars team as an undergraduate tutor from <strong>${data.university}</strong>.</p>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">Our recruitment team will review your profile and experience over the next <strong>3–5 working days</strong>. If your background is a good match, we'll reach out to schedule a short introductory interview.</p>
    
    <div style="background:${BRAND_PURPLE};border-radius:16px;padding:32px;color:#ffffff;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:rgba(255,255,255,0.7);font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Next Steps</p>
      <p style="margin:0;font-size:16px;line-height:1.6;">Profile Review &rarr; Short Interview &rarr; Trial Observation &rarr; Onboarding</p>
    </div>
  `, `Tutor application received — Oak Scholars`);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS, to: data.email,
    subject: `Your Oak Scholars tutor application has been received 🌳`, html,
  });
  console.log("[Email] Tutor confirmation sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendSessionReminder(data: {
  studentName: string;
  studentEmail: string;
  tutorName: string;
  subject: string;
  scheduledAt: Date;
  sessionLink?: string;
}) {
  const transporter = await getTransporter();
  const sessionTime = data.scheduledAt.toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  });

  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">Upcoming Session 🎓</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.studentName}</strong>, your lesson is coming up!</p>
    
    <div style="background:${BRAND_SURFACE};border-radius:16px;padding:32px;margin-bottom:32px;border:1px solid rgba(40,26,57,0.03);">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#777;font-size:14px;width:130px;">Tutor</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.tutorName}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Subject</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.subject}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Date & Time</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${sessionTime}</td></tr>
      </table>
    </div>

    ${data.sessionLink ? `
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${data.sessionLink}" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Join Session Now</a>
    </div>
    ` : ''}

    <div style="text-align:center;">
      <a href="https://oakscholars.co.uk/dashboard" style="color:${BRAND_PURPLE};text-decoration:underline;font-size:14px;font-weight:600;">Manage Booking / Reschedule</a>
    </div>
  `, `Reminder: Your lesson with ${data.tutorName} is coming up!`);

  const info = await transporter.sendMail({
    from: FROM_ADDRESS,
    to: data.studentEmail,
    subject: `Reminder: Your tutoring session with ${data.tutorName} is coming up! 🌳`,
    html,
  });
  console.log("[Email] Session reminder sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendSessionCancellationNotice(data: {
  recipientName: string;
  recipientEmail: string;
  otherPartyName: string;
  subject: string;
  scheduledAt: Date;
  reason?: string;
}) {
  const transporter = await getTransporter();
  const sessionTime = data.scheduledAt.toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  });

  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">Session Cancelled</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.recipientName}</strong>, your lesson has been cancelled.</p>
    
    <div style="background:#fff5f5;border:1px solid #feb2b2;border-radius:16px;padding:32px;margin-bottom:32px;">
      <p style="margin:0 0 16px;color:#c53030;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Cancelled Details</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#777;font-size:14px;width:130px;">With</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.otherPartyName}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Subject</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${data.subject}</td></tr>
        <tr><td style="padding:8px 0;color:#777;font-size:14px;">Was For</td><td style="padding:8px 0;color:${BRAND_PURPLE};font-weight:700;font-size:15px;">${sessionTime}</td></tr>
      </table>
      ${data.reason ? `
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid #feb2b2;">
        <p style="margin:0;color:#777;font-size:14px;"><strong>Reason:</strong> ${data.reason}</p>
      </div>
      ` : ''}
    </div>

    <div style="text-align:center;">
      <a href="https://oakscholars.co.uk/dashboard" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Reschedule Lesson</a>
    </div>
  `, `Session Cancelled: ${data.subject}`);

  const info = await transporter.sendMail({
    from: FROM_ADDRESS,
    to: data.recipientEmail,
    subject: `Session Cancelled: ${data.subject} on ${new Date(data.scheduledAt).toLocaleDateString()}`,
    html,
  });
  console.log("[Email] Cancellation notice sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendLessonFollowUp(data: {
  studentName: string;
  studentEmail: string;
  tutorName: string;
  subject: string;
  sessionId: number;
}) {
  const transporter = await getTransporter();
  const feedbackLink = `https://oakscholars.co.uk/dashboard?tab=feedback&sessionId=${data.sessionId}`;

  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">How was your lesson? ✨</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.studentName}</strong>, thank you for completing your lesson with <strong>${data.tutorName}</strong>!</p>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">We hope you found the session valuable. Your feedback helps our scholars improve and ensures we provide the best possible support for your academic journey.</p>
    
    <div style="background:rgba(232,168,56,0.05);border:2px solid ${BRAND_AMBER};border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 24px;color:${BRAND_PURPLE};font-size:16px;font-weight:700;">Please take 30 seconds to let us know how it went:</p>
      <a href="${feedbackLink}" style="display:inline-block;background:${BRAND_AMBER};color:${BRAND_PURPLE};text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:800;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Share My Feedback</a>
    </div>

    <p style="color:#999;font-size:14px;line-height:1.7;margin:0;text-align:center;">
      Need to book your next session? <a href="https://oakscholars.co.uk/booking" style="color:${BRAND_AMBER};font-weight:600;">Click here to schedule &rarr;</a>
    </p>
  `, `How was your lesson with ${data.tutorName}?`);

  const info = await transporter.sendMail({
    from: FROM_ADDRESS,
    to: data.studentEmail,
    subject: `Thank you for completing your lesson — Oak Scholars 🌳`,
    html,
  });
  console.log("[Email] Lesson follow-up sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendParentLinkCode(data: {
  studentName: string;
  studentEmail: string;
  parentName: string;
  confirmCode: string;
}) {
  const transporter = await getTransporter();

  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">Parent Link Request</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.studentName}</strong>,</p>
    <p style="color:#666;margin:0 0 24px;font-size:16px;line-height:1.6;">
      <strong>${data.parentName || "A parent"}</strong> has requested to link their account to yours on Oak Scholars. This will allow them to view your tutoring sessions and progress.
    </p>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">
      If you know this person and would like to grant them access, share the confirmation code below with them. They will enter it on their Parent Dashboard to complete the link.
    </p>
    
    <div style="background:rgba(232,168,56,0.08);border:2px solid ${BRAND_AMBER};border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 12px;color:${BRAND_PURPLE};font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Your Confirmation Code</p>
      <p style="margin:0;color:${BRAND_PURPLE};font-size:42px;font-weight:900;font-family:monospace;letter-spacing:0.2em;">${data.confirmCode}</p>
      <p style="margin:12px 0 0;color:#999;font-size:13px;">This code expires in 24 hours.</p>
    </div>

    <p style="color:#999;font-size:14px;line-height:1.7;margin:0;text-align:center;">
      If you did not expect this request, you can safely ignore this email. Your account will not be linked without the code being entered.
    </p>
  `, `Parent link request — confirmation code: ${data.confirmCode}`);

  const info = await transporter.sendMail({
    from: FROM_ADDRESS,
    to: data.studentEmail,
    subject: `Your Oak Scholars parent link confirmation code`,
    html,
  });
  console.log("[Email] Parent link code sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendLoginOtp(data: { name: string; email: string; code: string }) {
  const transporter = await getTransporter();
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:24px;margin:0 0 16px;font-family:serif;">Your sign-in code</h2>
    <p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 32px;">Hi <strong>${data.name || "there"}</strong>, use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.</p>
    <div style="background:rgba(232,168,56,0.08);border:2px solid ${BRAND_AMBER};border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 12px;color:${BRAND_PURPLE};font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Verification Code</p>
      <p style="margin:0;color:${BRAND_PURPLE};font-size:48px;font-weight:900;font-family:monospace;letter-spacing:0.25em;">${data.code}</p>
      <p style="margin:12px 0 0;color:#999;font-size:13px;">Expires in 10 minutes.</p>
    </div>
    <p style="color:#999;font-size:14px;line-height:1.7;margin:0;text-align:center;">If you did not attempt to sign in, you can safely ignore this email.</p>
  `, `Your Oak Scholars sign-in code: ${data.code}`);
  const info = await transporter.sendMail({
    from: FROM_ADDRESS,
    to: data.email,
    subject: `Your Oak Scholars sign-in code: ${data.code}`,
    html,
  });
  console.log("[Email] Login OTP sent:", nodemailer.getTestMessageUrl(info) || info.messageId);
}

export async function sendTutorApplicationStatusChange(data: {
  applicantName: string;
  applicantEmail: string;
  status: "accepted" | "rejected" | "interview";
  message?: string;
}) {
  const transporter = await getTransporter();
  
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    accepted: {
      title: "Application Accepted! 🎉",
      message: "Congratulations! Your application to join Oak Scholars has been accepted. You are now part of our tutor network. The team will be in touch shortly with next steps.",
      color: "#22c55e",
    },
    rejected: {
      title: "Application Update",
      message: "Thank you for your interest in joining Oak Scholars. Unfortunately, we will not be moving forward with your application at this time. We appreciate your effort and encourage you to reapply in the future.",
      color: "#ef4444",
    },
    interview: {
      title: "Interview Scheduled 📅",
      message: "Great news! Your application has progressed to the interview stage. The team will contact you shortly to schedule a convenient time.",
      color: "#3b82f6",
    },
  };

  const info = statusMessages[data.status];
  const html = baseTemplate(`
    <h2 style="color:${BRAND_PURPLE};font-size:26px;margin:0 0 16px;font-family:serif;">${info.title}</h2>
    <p style="color:${BRAND_PURPLE};margin:0 0 24px;font-size:17px;line-height:1.6;">Hi <strong>${data.applicantName}</strong>,</p>
    <p style="color:#666;margin:0 0 32px;font-size:16px;line-height:1.6;">${info.message}</p>
    
    ${data.message ? `
    <div style="background:${BRAND_SURFACE};border-radius:12px;padding:20px;margin-bottom:32px;">
      <p style="margin:0;color:${BRAND_PURPLE};font-size:15px;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
    </div>
    ` : ""}

    <div style="text-align:center;">
      <a href="https://oakscholars.co.uk" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">Visit Oak Scholars</a>
    </div>
  `, `Tutor Application Status Update`);

  const info_result = await transporter.sendMail({
    from: FROM_ADDRESS,
    to: data.applicantEmail,
    subject: `Oak Scholars Tutor Application — ${data.status === "accepted" ? "Accepted! 🎉" : data.status === "interview" ? "Interview Scheduled 📅" : "Update"}`,
    html,
  });
  console.log("[Email] Tutor application status email sent:", nodemailer.getTestMessageUrl(info_result) || info_result.messageId);
}
