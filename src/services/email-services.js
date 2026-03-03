// services/emailService.js
import { resend, emailPurchaseConfig } from "../config/nodemailer.js";

export const sendPurchaseEmailService = async (user, items, total) => {
  console.log("📧 RESEND_API_KEY existe:", !!process.env.RESEND_API_KEY);
  console.log("📧 Destinatario:", user.email);

  try {
    const mailOptions = emailPurchaseConfig(user, items, total);
    console.log("📧 mailOptions.from:", mailOptions.from);
    console.log("📧 mailOptions.to:", mailOptions.to);
    const { data, error } = await resend.emails.send(mailOptions);
    if (error) {
      throw error;
    }
    console.log("✅ Email enviado - id:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Email error:", error.message || error);
    throw new Error("Error al enviar correo de compra");
  }
};
