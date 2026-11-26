import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { PanelNecesidades, type NecesidadPanel } from "./PanelNecesidades";

export const metadata: Metadata = {
  title: "Árbol del chatbot",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

// admin/arbol.html: "preguntas, opciones y necesidades". Por ahora solo la sección de
// necesidades (el mockup no tiene pantalla para ellas); el editor del árbol va aquí mismo.
export default async function Arbol() {
  await connection();
  const datos = await prisma.necesidad.findMany({
    orderBy: { id: "asc" },
    include: {
      productos: { select: { producto: { select: { linea: { select: { nombre: true } } } } } },
      opciones: { select: { opcion: { select: { texto: true } } } },
    },
  });

  // Dónde se usa cada una: productos por línea y textos de las opciones del árbol.
  const necesidades: NecesidadPanel[] = datos.map((n) => {
    const porLinea = new Map<string, number>();
    for (const { producto } of n.productos) porLinea.set(producto.linea.nombre, (porLinea.get(producto.linea.nombre) ?? 0) + 1);
    return {
      id: n.id,
      nombre: n.nombre,
      descripcion: n.descripcion,
      productos: [...porLinea].map(([linea, cuantos]) => ({ linea, cuantos })),
      opciones: n.opciones.map((o) => o.opcion.texto),
    };
  });

  return <PanelNecesidades necesidades={necesidades} />;
}
