import "server-only";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { TIPOS_PRODUCTO } from "@/lib/catalogo";
import { FIRMA } from "@/lib/contacto";
import { inicialSiEsValido } from "./arbol";
import { redactarConPlantilla } from "./redaccion";
import { seleccionarRituales } from "./seleccion";
import type { RespuestaArbol, RespuestaRecomendacion } from "./tipos";

// Datos del chatbot desde la base. `connection()`: se consulta en cada petición, nunca en
// el build (un cambio de stock o del árbol en el panel se refleja al instante).

export async function obtenerArbol(): Promise<RespuestaArbol> {
  await connection();
  const filas = await prisma.pregunta.findMany({
    orderBy: { id: "asc" },
    include: { opciones: { orderBy: { id: "asc" }, include: { necesidades: { orderBy: { necesidadId: "asc" } } } } },
  });
  const preguntas = filas.map((p) => ({
    id: p.id,
    texto: p.texto,
    opciones: p.opciones.map((o) => ({
      id: o.id,
      texto: o.texto,
      siguienteId: o.preguntaSiguienteId,
      necesidades: o.necesidades.map((n) => n.necesidadId),
    })),
  }));
  const inicialId = inicialSiEsValido(
    preguntas,
    filas.filter((p) => p.esInicial).map((p) => p.id),
  );
  return inicialId === null ? { estado: "roto" } : { estado: "listo", inicialId, preguntas };
}

export async function recomendar(necesidadesPedidas: number[]): Promise<RespuestaRecomendacion> {
  await connection();
  // Solo cuentan las necesidades que existen (se conserva el orden en que se activaron).
  const existentes = new Set(
    (await prisma.necesidad.findMany({ where: { id: { in: necesidadesPedidas } }, select: { id: true } })).map((n) => n.id),
  );
  const necesidades = necesidadesPedidas.filter((id) => existentes.has(id));
  if (necesidades.length === 0) return { tipo: "diagnostico" };

  const filas = await prisma.producto.findMany({
    where: { activo: true, stock: { gt: 0 }, necesidades: { some: { necesidadId: { in: necesidades } } } },
    include: { linea: true, necesidades: { select: { necesidadId: true } } },
  });
  const candidatos = filas.map((p) => ({ ...p, necesidades: p.necesidades.map((n) => n.necesidadId) }));

  const seleccion = seleccionarRituales(necesidades, candidatos);
  if (seleccion.length === 0) return { tipo: "diagnostico" };

  const rituales = seleccion.map(({ lineaId, productos }) => ({ lineaId, linea: productos[0].linea, productos }));
  const redaccion = redactarConPlantilla(
    rituales.map((r) => ({ lineaId: r.lineaId, ritual: r.linea.nombreRitual, descripcion: r.linea.descripcion })),
  );
  const mensajes = new Map(redaccion.rituales.map((r) => [r.id_linea, r.mensaje]));

  return {
    tipo: "recomendacion",
    introduccion: redaccion.introduccion,
    rituales: rituales.map((r) => ({
      lineaId: r.lineaId,
      linea: r.linea.nombre,
      ritual: r.linea.nombreRitual,
      mensaje: mensajes.get(r.lineaId) ?? "",
      productos: r.productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        paso: TIPOS_PRODUCTO[p.tipoProducto].paso,
        beneficio: p.beneficioPrincipal,
        imagenUrl: p.imagenUrl,
        href: `/productos/${p.id}`,
      })),
    })),
    cierre: FIRMA,
    origen: "plantilla",
  };
}
