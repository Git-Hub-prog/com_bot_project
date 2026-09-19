const nodemailer = require("nodemailer");
const { EMAIL_FROM } = require("../config/env");

const sendEmail = async ({ to, subject, text }) => {
  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  if (!smtpConfigured) {
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

  try {
    return await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (error) {
    if (error.code === "EAUTH" || error.responseCode === 534 || error.responseCode === 535) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("SMTP authentication failed in development; using email simulation instead.");
        console.log(`[email simulation] to=${to} subject=${subject}\n${text}`);
        return { simulated: true };
      }
      const smtpError = new Error("Gmail rejected the SMTP login. Use a Gmail App Password in SMTP_PASSWORD.");
      smtpError.status = 503;
      throw smtpError;
    }
    throw error;
  }
};

module.exports = { sendEmail };
