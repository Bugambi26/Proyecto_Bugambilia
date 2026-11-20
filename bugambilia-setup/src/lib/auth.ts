import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

// Configuración base de Better Auth (S12). La completa Miguelinchis en la S13:
// recuperación de contraseña con Resend, rutas del panel, etc.
// - Solo correo + contraseña.
// - Registro público desactivado: la única cuenta admin la crea el seed.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [nextCookies()],
});
