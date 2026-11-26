"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requerirSesion } from "@/lib/auth-sesion";
import { prisma } from "@/lib/prisma";
import { validarNecesidad, type ErroresNecesidad } from "./validacionNecesidad";

export type ResultadoNecesidad = { ok: true; id: number } | { ok: false; errores: ErroresNecesidad; mensaje?: string };

// Las necesidades salen en esta página y en los chips del formulario de producto.
// El chatbot las lee en cada consulta (su API no guarda caché).
function revalidarNecesidades() {
  revalidatePath("/admin/arbol");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/admin/productos/[id]", "page");
}

// Alta (sin "id") o cambio (con "id").
export async function guardarNecesidad(formulario: FormData): Promise<ResultadoNecesidad> {
  await requerirSesion();
  const validacion = validarNecesidad(formulario);
  if ("errores" in validacion) return { ok: false, errores: validacion.errores };

  const id = Number(formulario.get("id")) || null;
  try {
    const { id: guardada } = id
      ? await prisma.necesidad.update({ where: { id }, data: validacion.datos, select: { id: true } })
      : await prisma.necesidad.create({ data: validacion.datos, select: { id: true } });
    revalidarNecesidades();
    return { ok: true, id: guardada };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errores: { nombre: "Ya hay una necesidad con ese nombre." } };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, errores: {}, mensaje: "Esta necesidad ya no existe." };
    }
    console.error("No se pudo guardar la necesidad:", error);
    return { ok: false, errores: {}, mensaje: "No se pudo guardar. Intenta de nuevo." };
  }
}

// Solo si no la usa ningún producto ni ninguna opción del árbol (Fase 5). Se vuelve a
// revisar aquí aunque el botón ya venga desactivado; la base también lo impide (Restrict).
export async function eliminarNecesidad(id: number): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  await requerirSesion();
  const [productos, opciones] = await Promise.all([
    prisma.productoNecesidad.count({ where: { necesidadId: id } }),
    prisma.opcionNecesidad.count({ where: { necesidadId: id } }),
  ]);
  if (productos || opciones) {
    return { ok: false, mensaje: "No se puede eliminar: está ligada a productos u opciones del árbol." };
  }
  try {
    await prisma.necesidad.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar la necesidad:", error);
    return { ok: false, mensaje: "No se pudo eliminar. Intenta de nuevo." };
  }
  revalidarNecesidades();
  return { ok: true };
}
