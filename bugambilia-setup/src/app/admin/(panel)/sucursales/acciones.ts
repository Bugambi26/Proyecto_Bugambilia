"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requerirSesion } from "@/lib/auth-sesion";
import { borrarImagen, subirImagen } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { validarSucursal, type ErroresSucursal } from "./validacion";

export type ResultadoSucursal = { ok: true; id: number } | { ok: false; errores: ErroresSucursal; mensaje?: string };

const CARPETA = "bugambilia/sucursales";

// Las sucursales salen en el panel, en el inicio (tarjetas) y en /sucursales.
function revalidarSucursales() {
  revalidatePath("/admin/sucursales");
  revalidatePath("/");
  revalidatePath("/sucursales");
}

// Alta (sin "id") o cambio (con "id"). "foto" trae la nueva, ya reducida en el
// navegador; la anterior de Cloudinary se borra solo si todo se guardó.
export async function guardarSucursal(formulario: FormData): Promise<ResultadoSucursal> {
  await requerirSesion();

  const validacion = validarSucursal(formulario);
  if ("errores" in validacion) return { ok: false, errores: validacion.errores };
  const { horarios, ...d } = validacion.datos;

  const id = Number(formulario.get("id")) || null;
  const anterior = id ? await prisma.sucursal.findUnique({ where: { id }, select: { fotoUrl: true } }) : null;
  if (id && !anterior) return { ok: false, errores: {}, mensaje: "Esta sucursal ya no existe." };

  const foto = formulario.get("foto");
  let fotoUrl = anterior?.fotoUrl ?? null;
  let nuevaFoto: string | null = null;
  if (foto instanceof File && foto.size > 0) {
    try {
      nuevaFoto = await subirImagen(foto, CARPETA);
    } catch (error) {
      console.error("No se pudo subir la foto a Cloudinary:", error);
      return { ok: false, errores: { foto: "No se pudo subir la foto. Intenta de nuevo." } };
    }
    fotoUrl = nuevaFoto;
  } else if (formulario.get("quitarFoto") === "1") {
    fotoUrl = null;
  }

  let guardada: { id: number };
  try {
    guardada = id
      ? await prisma.sucursal.update({
          where: { id },
          data: { ...d, fotoUrl, horarios: { deleteMany: {}, create: horarios } },
          select: { id: true },
        })
      : await prisma.sucursal.create({ data: { ...d, fotoUrl, horarios: { create: horarios } }, select: { id: true } });
  } catch (error) {
    await borrarImagen(nuevaFoto); // no dejar huérfana la que se acaba de subir
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errores: { nombre: "Ya hay una sucursal con ese nombre." } };
    }
    console.error("No se pudo guardar la sucursal:", error);
    return { ok: false, errores: {}, mensaje: "No se pudo guardar. Intenta de nuevo." };
  }

  if (anterior?.fotoUrl !== fotoUrl) await borrarImagen(anterior?.fotoUrl ?? null);
  revalidarSucursales();
  return { ok: true, id: guardada.id };
}

// Borrado físico (Fase 5): se van también sus horarios (en cascada) y su foto de
// Cloudinary. Las fotos del seed (/img/…) no se tocan.
export async function eliminarSucursal(id: number): Promise<{ ok: boolean }> {
  await requerirSesion();
  try {
    const { fotoUrl } = await prisma.sucursal.delete({ where: { id }, select: { fotoUrl: true } });
    await borrarImagen(fotoUrl);
  } catch (error) {
    console.error("No se pudo eliminar la sucursal:", error);
    return { ok: false };
  }
  revalidarSucursales();
  return { ok: true };
}
