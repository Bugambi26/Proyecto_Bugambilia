import "dotenv/config";
import { defineConfig } from "prisma/config";

// La CLI de Prisma (migraciones) usa la conexión DIRECTA de Neon (sin pooler).
// La app en tiempo de ejecución usa DATABASE_URL (con pooler) a través del adaptador de Neon.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
