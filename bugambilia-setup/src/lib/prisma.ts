import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Cliente único de Prisma para toda la app (solo en el servidor).
// Usa DATABASE_URL (conexión con pooler de Neon) mediante el adaptador de Neon.
// En desarrollo se guarda en globalThis para no abrir conexiones nuevas en cada recarga.

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL en las variables de entorno.");
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

export const prisma = globalParaPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
