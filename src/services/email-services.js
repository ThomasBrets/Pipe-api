// services/emailService.js
import { transporter, emailPurchaseConfig } from "../config/nodemailer.js";

export const sendPurchaseEmailService = async (user, items, total) => {
  console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
  console.log("📧 EMAIL_PASS existe:", !!process.env.EMAIL_PASS, "length:", process.env.EMAIL_PASS?.length);
  console.log("📧 Destinatario:", user.email);

  try {
    const mailOptions = emailPurchaseConfig(user, items, total);
    console.log("📧 mailOptions.from:", mailOptions.from);
    console.log("📧 mailOptions.to:", mailOptions.to);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado - messageId:", info.messageId, "response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email error code:", error.code);
    console.error("❌ Email error command:", error.command);
    console.error("❌ Email error message:", error.message);
    throw new Error("Error al enviar correo de compra");
  }
};


