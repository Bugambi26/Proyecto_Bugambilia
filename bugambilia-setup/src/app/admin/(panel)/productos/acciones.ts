"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requerirSesion } from "@/lib/auth-sesion";
import { borrarImagen, subirImagen } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { validarProducto, type ErroresProducto } from "./validacion";

// Si todo sale bien no se devuelve nada: la acción redirige al inventario.
export type ResultadoGuardar = { ok: false; errores: ErroresProducto; mensaje?: string };

const CARPETA = "bugambilia/productos";

// Alta (sin "id") o cambio (con "id") del formulario de producto.
// Imagen: "imagen" trae la nueva (ya reducida en el navegador) y "quitarImagen"
// pide volver al logo. La anterior de Cloudinary se borra solo si todo se guardó.
export async function guardarProducto(formulario: FormData): Promise<ResultadoGuardar> {
  await requerirSesion();

  const validacion = validarProducto(formulario);
  if ("errores" in validacion) return { ok: false, errores: validacion.errores };
  const d = validacion.datos;

  const id = Number(formulario.get("id")) || null;
  const anterior = id ? await prisma.producto.findUnique({ where: { id }, select: { imagenUrl: true } }) : null;
  if (id && !anterior) return { ok: false, errores: {}, mensaje: "Este producto ya no existe." };

  const imagen = formulario.get("imagen");
  let imagenUrl = anterior?.imagenUrl ?? null;
  let nuevaImagen: string | null = null;
  if (imagen instanceof File && imagen.size > 0) {
    try {
      nuevaImagen = await subirImagen(imagen, CARPETA);
    } catch (error) {
      console.error("No se pudo subir la imagen a Cloudinary:", error);
      return { ok: false, errores: { imagen: "No se pudo subir la imagen. Intenta de nuevo." } };
    }
    imagenUrl = nuevaImagen;
  } else if (formulario.get("quitarImagen") === "1") {
    imagenUrl = null;
  }

  const datos = {
    lineaId: d.lineaId,
    nombre: d.nombre,
    tipoProducto: d.tipoProducto,
    ingredientesProtagonistas: d.ingredientes,
    beneficioPrincipal: d.beneficio,
    contenidoNeto: d.contenidoNeto,
    precio: d.precio,
    stock: d.stock,
    imagenUrl,
  };
  const necesidades = d.necesidades.map((necesidadId) => ({ necesidadId }));

  try {
    if (id) {
      await prisma.producto.update({
        where: { id },
        data: {
          ...datos,
          activo: formulario.get("activo") !== "false",
          necesidades: { deleteMany: {}, create: necesidades },
        },
      });
    } else {
      // Fase 5: el producto se crea activo.
      await prisma.producto.create({ data: { ...datos, activo: true, necesidades: { create: necesidades } } });
    }
  } catch (error) {
    await borrarImagen(nuevaImagen); // no dejar huérfana la que se acaba de subir
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errores: { nombre: "Ya hay un producto con ese nombre en esta línea." } };
    }
    console.error("No se pudo guardar el producto:", error);
    return { ok: false, errores: {}, mensaje: "No se pudo guardar. Intenta de nuevo." };
  }

  if (anterior?.imagenUrl !== imagenUrl) await borrarImagen(anterior?.imagenUrl ?? null);

  // Redirigir desde el servidor manda la navegación y la lista nueva en la misma
  // respuesta; con router.push en el navegador el botón se quedaba en "Guardando…"
  // y el inventario mostraba datos viejos hasta recargar.
  revalidatePath("/admin/inventario");
  if (id) revalidatePath(`/admin/productos/${id}`);
  redirect("/admin/inventario");
}
