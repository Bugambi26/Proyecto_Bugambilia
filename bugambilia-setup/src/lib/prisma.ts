import "server-only";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "@/generated/prisma/client";

// Cliente único de Prisma para toda la app (solo en el servidor).
// - Usa DATABASE_URL (conexión con pooler de Neon) mediante el adaptador de Neon.
// - El driver de Neon se conecta por WebSocket; se le pasa `ws` para no depender de que
//   el entorno de ejecución (funciones de Netlify) traiga WebSocket global.
// - El cliente se crea en la primera consulta, no al importar el módulo: si falta la
//   variable de entorno, falla solo la parte que consulta datos y no toda la página.
// - En desarrollo se guarda en globalThis para no abrir conexiones nuevas en cada recarga.

neonConfig.webSocketConstructor = ws;

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function obtenerCliente(): PrismaClient {
  if (globalParaPrisma.prisma) return globalParaPrisma.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL en las variables de entorno.");
  }
  const cliente = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  globalParaPrisma.prisma = cliente;
  return cliente;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_destino, propiedad) {
    const cliente = obtenerCliente();
    const valor = Reflect.get(cliente, propiedad, cliente);
    return typeof valor === "function" ? valor.bind(cliente) : valor;
  },
});
