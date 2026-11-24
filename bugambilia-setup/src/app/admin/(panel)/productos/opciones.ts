import "server-only";
import { prisma } from "@/lib/prisma";

// Líneas y necesidades para los selectores del formulario de producto.
export async function opcionesDelFormulario() {
  const [lineas, necesidades] = await Promise.all([
    prisma.linea.findMany({ orderBy: { id: "asc" }, select: { id: true, nombre: true } }),
    prisma.necesidad.findMany({ orderBy: { id: "asc" }, select: { id: true, nombre: true } }),
  ]);
  return { lineas, necesidades };
}
