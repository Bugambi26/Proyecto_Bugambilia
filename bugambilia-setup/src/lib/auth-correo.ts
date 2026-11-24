import "server-only";
import { Resend } from "resend";

// Sin dominio verificado, Resend solo permite este remitente de prueba y solo
// entrega al correo dueño de la cuenta de Resend (el mismo que ADMIN_EMAIL).
// TODO (S15, con dominio): cambiar a un remitente del dominio de Bugambilia.
const REMITENTE = "Bugambilia <onboarding@resend.dev>";

// Correo con el enlace para crear una nueva contraseña.
export async function enviarCorreoRecuperacion(correo: string, enlace: string) {
  // Se crea aquí y no al cargar el módulo: new Resend() truena sin la llave,
  // y eso tumbaría todo Better Auth (también el login) si falta en Netlify.
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: REMITENTE,
    to: correo,
    subject: "Recupera tu acceso al panel de Bugambilia",
    text: [
      "Recibimos una solicitud para cambiar la contraseña del panel de Bugambilia.",
      "",
      `Crea una nueva contraseña aquí (el enlace vence en 1 hora): ${enlace}`,
      "",
      "Si no la pediste, ignora este correo: tu contraseña no cambia.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #3e2a1f; max-width: 480px; line-height: 1.5">
        <h1 style="font-size: 22px">Recupera tu acceso</h1>
        <p>Recibimos una solicitud para cambiar la contraseña del panel de Bugambilia.</p>
        <p><a href="${enlace}" style="display: inline-block; background: #3e2a1f; color: #f7efe6; padding: 12px 20px; border-radius: 999px; text-decoration: none">Crear nueva contraseña</a></p>
        <p style="font-size: 13px">El enlace vence en 1 hora. Si no la pediste, ignora este correo: tu contraseña no cambia.</p>
      </div>`,
  });
  if (error) {
    console.error("Resend no pudo enviar el correo de recuperación:", error);
    throw new Error("No se pudo enviar el correo de recuperación");
  }
}
