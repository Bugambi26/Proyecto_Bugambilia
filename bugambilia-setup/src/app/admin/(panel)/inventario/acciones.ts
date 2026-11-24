"use server";

import { requerirSesion } from "@/lib/auth-sesion";
import { prisma } from "@/lib/prisma";

// Acciones de la tabla del inventario. Cada una valida la sesión antes de tocar
// la base: una Server Action se puede llamar directo, sin pasar por el panel.

// Suma o resta una pieza. Nunca baja de 0 (la condición va en la misma consulta
// para que dos clics rápidos no dejen el stock negativo). Devuelve el stock real.
export async function ajustarStock(id: number, delta: 1 | -1): Promise<number> {
  await requerirSesion();
  if (delta === -1) {
    await prisma.producto.updateMany({ where: { id, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } });
  } else {
    await prisma.producto.update({ where: { id }, data: { stock: { increment: 1 } } });
  }
  const { stock } = await prisma.producto.findUniqueOrThrow({ where: { id }, select: { stock: true } });
  return stock;
}

// Dar de baja (false) o reactivar (true). Nunca se borra un producto.
export async function cambiarActivo(id: number, activo: boolean): Promise<void> {
  await requerirSesion();
  await prisma.producto.update({ where: { id }, data: { activo } });
}
