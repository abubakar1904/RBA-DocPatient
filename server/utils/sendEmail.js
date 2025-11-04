import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, text) => {
  // If Gmail creds exist, use them; otherwise fall back to Ethereal for development
  const useGmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

  try {
    let transporter;
    let fromAddress;

    if (useGmail) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_SECURE || "false") === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      });
      fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    } else {
      // Ethereal test account (emails don't go to real inbox; preview via URL)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      fromAddress = `Test Mailer <${testAccount.user}>`;
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject,
      text,
    });

    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : undefined;
    console.log("✉️ Email sent:", info.response || info.messageId);
    if (previewUrl) console.log("🔗 Preview email:", previewUrl);

    return { previewUrl };
  } catch (err) {
    console.error("Error sending email:", err.message);
    // If Gmail auth fails with 535 or similar, auto-fallback to Ethereal
    const isAuthError =
      String(err?.responseCode) === "535" || /535|Invalid credentials|Authentication failed/i.test(String(err?.message));
    if (useGmail && isAuthError) {
      try {
        console.warn("⚠️ Gmail auth failed; falling back to Ethereal test SMTP...");
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await fallbackTransporter.sendMail({
          from: `Test Mailer <${testAccount.user}>`,
          to: email,
          subject,
          text,
        });
        const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : undefined;
        if (previewUrl) console.log("🔗 Preview email (fallback):", previewUrl);
        return { previewUrl };
      } catch (fallbackErr) {
        console.error("❌ Fallback (Ethereal) also failed:", fallbackErr.message);
        throw err;
      }
    }
    throw err;
  }
};
