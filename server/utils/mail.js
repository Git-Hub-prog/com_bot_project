const nodemailer = require("nodemailer");
const { EMAIL_FROM } = require("../config/env");

const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === "production") {
      console.warn("SMTP is not configured; email delivery was skipped in production.");
      return { simulated: false };
    }
    console.log(`[email simulation] to=${to} subject=${subject}\n${text}`);
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  return transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
  });
};

module.exports = { sendEmail };
