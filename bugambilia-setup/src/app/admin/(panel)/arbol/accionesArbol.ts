"use server";

import { revalidatePath } from "next/cache";
import { requerirSesion } from "@/lib/auth-sesion";
import { prisma } from "@/lib/prisma";
import { arbolConCambio, ID_NUEVA, motivoParaNoEliminar, revisarArbol, type PreguntaEditable } from "./reglasArbol";

export type ResultadoPregunta = { ok: true; id: number; avisos: string[] } | { ok: false; errores: string[] };

// El árbol tal como está en la base, en el formato del editor.
async function arbolActual(): Promise<PreguntaEditable[]> {
  const filas = await prisma.pregunta.findMany({
    orderBy: { id: "asc" },
    include: { opciones: { orderBy: { id: "asc" }, include: { necesidades: { select: { necesidadId: true } } } } },
  });
  return filas.map((p) => ({
    id: p.id,
    texto: p.texto,
    esInicial: p.esInicial,
    opciones: p.opciones.map((o) => ({
      texto: o.texto,
      siguienteId: o.preguntaSiguienteId,
      necesidades: o.necesidades.map((n) => n.necesidadId),
    })),
  }));
}

// Lo que llega del navegador no se da por bueno: se limpia antes de revisarlo.
function limpiar(p: PreguntaEditable): PreguntaEditable {
  const entero = (n: unknown) => (Number.isSafeInteger(n) ? (n as number) : null);
  return {
    id: entero(p.id) ?? ID_NUEVA,
    texto: String(p.texto ?? "").trim(),
    esInicial: p.esInicial === true,
    opciones: (Array.isArray(p.opciones) ? p.opciones : []).slice(0, 20).map((o) => ({
      texto: String(o?.texto ?? "").trim(),
      siguienteId: o?.siguienteId === null ? null : entero(o?.siguienteId),
      necesidades: [...new Set((Array.isArray(o?.necesidades) ? o.necesidades : []).map(entero))].filter(
        (n): n is number => n !== null && n > 0,
      ),
    })),
  };
}

function revalidarArbol() {
  revalidatePath("/admin/arbol");
}

// Pregunta y opciones se guardan juntas (Fase 5). Se revisa el árbol completo como
// quedaría; si rompe una regla no se guarda nada.
export async function guardarPregunta(entrada: PreguntaEditable): Promise<ResultadoPregunta> {
  await requerirSesion();
  const pregunta = limpiar(entrada);

  const actual = await arbolActual();
  if (pregunta.id !== ID_NUEVA && !actual.some((p) => p.id === pregunta.id)) {
    return { ok: false, errores: ["Esta pregunta ya no existe. Recarga la página."] };
  }
  const necesidadesValidas = new Set((await prisma.necesidad.findMany({ select: { id: true } })).map((n) => n.id));
  if (pregunta.opciones.some((o) => o.necesidades.some((n) => !necesidadesValidas.has(n)))) {
    return { ok: false, errores: ["Una de las necesidades elegidas ya no existe. Recarga la página."] };
  }

  const { errores, avisos } = revisarArbol(arbolConCambio(actual, pregunta));
  if (errores.length) return { ok: false, errores };

  try {
    const id = await prisma.$transaction(async (tx) => {
      // Primero se quita la inicial anterior: la base solo permite una (índice único parcial).
      if (pregunta.esInicial) {
        await tx.pregunta.updateMany({ where: { esInicial: true, NOT: { id: pregunta.id } }, data: { esInicial: false } });
      }
      const datos = { texto: pregunta.texto, esInicial: pregunta.esInicial };
      const { id } =
        pregunta.id === ID_NUEVA
          ? await tx.pregunta.create({ data: datos, select: { id: true } })
          : await tx.pregunta.update({ where: { id: pregunta.id }, data: datos, select: { id: true } });
      // Las opciones se reemplazan completas (nadie apunta a una opción; sus necesidades se van en cascada).
      await tx.opcion.deleteMany({ where: { preguntaId: id } });
      for (const o of pregunta.opciones) {
        await tx.opcion.create({
          data: {
            preguntaId: id,
            texto: o.texto,
            preguntaSiguienteId: o.siguienteId,
            necesidades: { create: o.necesidades.map((necesidadId) => ({ necesidadId })) },
          },
        });
      }
      return id;
    });
    revalidarArbol();
    return { ok: true, id, avisos };
  } catch (error) {
    console.error("No se pudo guardar la pregunta:", error);
    return { ok: false, errores: ["No se pudo guardar. Intenta de nuevo."] };
  }
}

// Regla 6: no se borra la inicial ni una pregunta a la que apunta una opción.
export async function eliminarPregunta(id: number): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  await requerirSesion();
  const motivo = motivoParaNoEliminar(await arbolActual(), id);
  if (motivo) return { ok: false, mensaje: motivo };
  try {
    await prisma.pregunta.delete({ where: { id } }); // sus opciones se van en cascada
  } catch (error) {
    console.error("No se pudo eliminar la pregunta:", error);
    return { ok: false, mensaje: "No se pudo eliminar. Intenta de nuevo." };
  }
  revalidarArbol();
  return { ok: true };
}
