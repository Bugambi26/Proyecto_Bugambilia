// Comprobación del árbol antes de usarlo en el chatbot. Si algo no cuadra, el chatbot no
// arriesga una conversación a medias: muestra la cita de diagnóstico (CLAUDE.md, "Árbol").
// Reglas que se revisan aquí (las que rompen la conversación):
//   1. exactamente una pregunta inicial;
//   2. de 2 a 6 opciones por pregunta;
//   3. toda opción apunta a una pregunta que existe (o a ninguna = fin);
//   4. sin ciclos: desde la inicial, la conversación siempre termina.

import type { PreguntaArbol } from "./tipos";

export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 6;

export function inicialSiEsValido(preguntas: PreguntaArbol[], inicialesIds: number[]): number | null {
  if (inicialesIds.length !== 1) return null;
  const porId = new Map(preguntas.map((p) => [p.id, p]));
  const inicialId = inicialesIds[0];
  if (!porId.has(inicialId)) return null;

  for (const p of preguntas) {
    if (p.opciones.length < MIN_OPCIONES || p.opciones.length > MAX_OPCIONES) return null;
    if (p.opciones.some((o) => o.siguienteId !== null && !porId.has(o.siguienteId))) return null;
  }

  // Búsqueda en profundidad: una pregunta que vuelve a aparecer en su propio camino = ciclo.
  const enCamino = new Set<number>();
  const terminadas = new Set<number>();
  function sinCiclos(id: number): boolean {
    if (terminadas.has(id)) return true;
    if (enCamino.has(id)) return false;
    enCamino.add(id);
    const ok = porId.get(id)!.opciones.every((o) => o.siguienteId === null || sinCiclos(o.siguienteId));
    enCamino.delete(id);
    terminadas.add(id);
    return ok;
  }

  return sinCiclos(inicialId) ? inicialId : null;
}
