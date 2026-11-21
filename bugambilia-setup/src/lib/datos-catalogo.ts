import "server-only";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { compararPorRutina } from "@/lib/catalogo";

// Consultas del sitio público. Solo productos activos (los inactivos no se muestran en
// ningún lado). `connection()` hace que se consulte en cada visita y nunca en el build,
// para que un cambio de stock en el panel se vea al instante.

export async function obtenerLineasConProductos() {
  await connection();
  const lineas = await prisma.linea.findMany({
    orderBy: { id: "asc" },
    include: { productos: { where: { activo: true } } },
  });
  return lineas.map((l) => ({ ...l, productos: [...l.productos].sort(compararPorRutina) }));
}

export async function obtenerLineas() {
  await connection();
  return prisma.linea.findMany({ orderBy: { id: "asc" } });
}

export async function obtenerProducto(id: number) {
  await connection();
  const producto = await prisma.producto.findFirst({
    where: { id, activo: true },
    include: { linea: { include: { productos: { where: { activo: true } } } } },
  });
  if (!producto) return null;
  const otros = producto.linea.productos.filter((p) => p.id !== producto.id).sort(compararPorRutina);
  return { ...producto, otros };
}

export type LineaConProductos = Awaited<ReturnType<typeof obtenerLineasConProductos>>[number];
export type ProductoCatalogo = LineaConProductos["productos"][number];
