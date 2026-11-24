import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { enviarCorreoRecuperacion } from "@/lib/auth-correo";
import { prisma } from "@/lib/prisma";

// - Solo correo + contraseña.
// - Registro público desactivado: la única cuenta admin la crea el seed.
// - Recuperación por correo con Resend; el enlace vence en 1 hora y, al
//   cambiar la contraseña, se cierran las sesiones abiertas.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await enviarCorreoRecuperacion(user.email, url);
    },
  },
  plugins: [nextCookies()],
});
