import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { EditorArbol } from "./EditorArbol";
import { PanelNecesidades, type NecesidadPanel } from "./PanelNecesidades";
import type { PreguntaEditable } from "./reglasArbol";

export const metadata: Metadata = {
  title: "Árbol del chatbot",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

// admin/arbol.html: "preguntas, opciones y necesidades". El mockup no tiene pantalla
// para las necesidades; van aquí mismo, debajo del editor de preguntas.
export default async function Arbol() {
  await connection();
  const [filasPreguntas, filasNecesidades] = await Promise.all([
    prisma.pregunta.findMany({
      orderBy: { id: "asc" },
      include: { opciones: { orderBy: { id: "asc" }, include: { necesidades: { select: { necesidadId: true } } } } },
    }),
    prisma.necesidad.findMany({
      orderBy: { id: "asc" },
      include: {
        productos: { select: { producto: { select: { linea: { select: { nombre: true } } } } } },
        opciones: { select: { opcion: { select: { texto: true } } } },
      },
    }),
  ]);

  // La inicial primero; luego en el orden en que se crearon.
  const preguntas: PreguntaEditable[] = filasPreguntas
    .map((p) => ({
      id: p.id,
      texto: p.texto,
      esInicial: p.esInicial,
      opciones: p.opciones.map((o) => ({
        texto: o.texto,
        siguienteId: o.preguntaSiguienteId,
        necesidades: o.necesidades.map((n) => n.necesidadId),
      })),
    }))
    .sort((a, b) => Number(b.esInicial) - Number(a.esInicial) || a.id - b.id);

  // Dónde se usa cada necesidad: productos por línea y textos de las opciones del árbol.
  const necesidades: NecesidadPanel[] = filasNecesidades.map((n) => {
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

  return (
    <>
      <div className="admin-head">
        <div className="stack gap-8">
          <span className="lbl">Chatbot</span>
          <h1 className="admin-title">Árbol del chatbot</h1>
        </div>
      </div>
      <EditorArbol preguntas={preguntas} necesidades={necesidades.map(({ id, nombre }) => ({ id, nombre }))} />
      <PanelNecesidades necesidades={necesidades} />
    </>
  );
}
