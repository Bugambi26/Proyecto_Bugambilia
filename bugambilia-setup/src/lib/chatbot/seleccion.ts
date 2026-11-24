// Regla de selección del chatbot (Fase 4, sección 4). Sin IA y sin base de datos:
// los mismos datos de entrada producen siempre los mismos rituales.
//
// 1. Entran los productos activos, con stock y con al menos una necesidad activa (OR).
// 2. Si no queda ninguno → [] (el chatbot muestra la cita de diagnóstico, sin llamar a la IA).
// 3. Se agrupan por línea (ritual).
// 4. Orden de los rituales: primero el que cubre la necesidad activada antes (P1, el color),
//    después los de P2 (el objetivo); entre varios que cubren la misma, el más específico
//    (menos necesidades distintas en sus productos) y, si empatan, el orden del catálogo.
// 5. Máximo MAX_RITUALES. Un ritual sin productos disponibles nunca aparece (paso 1).
// 6. Dentro de cada ritual, orden de rutina: limpieza → tratamiento → finalización.

import type { TipoProducto } from "@/generated/prisma/enums";
import { compararPorRutina } from "@/lib/catalogo";

export const MAX_RITUALES = 2;

export type ProductoCandidato = {
  id: number; // orden del catálogo
  tipoProducto: TipoProducto;
  activo: boolean;
  stock: number;
  lineaId: number; // orden del catálogo de las líneas
  necesidades: number[]; // ids de sus necesidades
};

export type RitualSeleccionado<P extends ProductoCandidato> = { lineaId: number; productos: P[] };

/**
 * @param necesidadesActivas ids de las necesidades que activó la visitante, en el orden en
 *   que las fue activando (primero las de P1). Los repetidos se ignoran.
 * @param productos el catálogo (cualquier estado: la función filtra activos y con stock).
 */
export function seleccionarRituales<P extends ProductoCandidato>(
  necesidadesActivas: readonly number[],
  productos: readonly P[],
): RitualSeleccionado<P>[] {
  // Posición de cada necesidad según cuándo se activó (la primera vez cuenta).
  const posicion = new Map<number, number>();
  for (const n of necesidadesActivas) if (!posicion.has(n)) posicion.set(n, posicion.size);
  if (posicion.size === 0) return [];

  const disponibles = productos.filter(
    (p) => p.activo && p.stock > 0 && p.necesidades.some((n) => posicion.has(n)),
  );

  const porLinea = new Map<number, P[]>();
  for (const p of disponibles) {
    const lista = porLinea.get(p.lineaId);
    if (lista) lista.push(p);
    else porLinea.set(p.lineaId, [p]);
  }

  const rituales = [...porLinea].map(([lineaId, lista]) => {
    const necesidades = new Set(lista.flatMap((p) => p.necesidades));
    const prioridad = Math.min(...[...necesidades].map((n) => posicion.get(n) ?? Infinity));
    return { lineaId, productos: lista, prioridad, especificidad: necesidades.size };
  });

  rituales.sort((a, b) => a.prioridad - b.prioridad || a.especificidad - b.especificidad || a.lineaId - b.lineaId);

  return rituales.slice(0, MAX_RITUALES).map(({ lineaId, productos: lista }) => ({
    lineaId,
    productos: [...lista].sort(compararPorRutina),
  }));
}
