// config/resend-config.js
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

console.log("✅ Resend configurado, API key existe:", !!process.env.RESEND_API_KEY);

export const emailPurchaseConfig = (user, items, total) => {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td>${i.title}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">$${i.price.toFixed(2)}</td>
        <td style="text-align:right">$${i.subtotal.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <h2>Confirmación de compra</h2>
    <p>Hola ${user.first_name || user.email}, gracias por tu compra.</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <thead>
        <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <h3>Total: $${total.toFixed(2)}</h3>
  `;

  return {
    from: "onboarding@resend.dev",
    to: user.email,
    subject: "Tu compra - Confirmación",
    html,
  };
};
