import { MAX_OPCIONES, MIN_OPCIONES } from "@/lib/chatbot/arbol";

// Reglas del editor del árbol (Fase 5, sección 4). Se revisa el árbol COMPLETO como
// quedaría con el cambio; si rompe una regla se rechaza con un mensaje que dice cuál.
// La regla 4 (alcanzable desde la inicial) solo avisa: una pregunta nueva primero se
// crea y después se conecta. El chatbot vuelve a revisar con lib/chatbot/arbol.ts.

export type OpcionEditable = { texto: string; siguienteId: number | null; necesidades: number[] };
export type PreguntaEditable = { id: number; texto: string; esInicial: boolean; opciones: OpcionEditable[] };

export const ID_NUEVA = -1; // id provisional de la pregunta que se está creando

export function revisarArbol(preguntas: PreguntaEditable[]): { errores: string[]; avisos: string[] } {
  const errores: string[] = [];
  const avisos: string[] = [];
  const porId = new Map(preguntas.map((p) => [p.id, p]));
  const nombre = (id: number) => `«${porId.get(id)?.texto.trim() || "Pregunta sin texto"}»`;

  // Regla 1: exactamente una pregunta inicial.
  const iniciales = preguntas.filter((p) => p.esInicial);
  if (iniciales.length !== 1) {
    errores.push(
      iniciales.length === 0
        ? "Debe haber una pregunta inicial: marca «Es la pregunta inicial» en alguna."
        : "Solo puede haber una pregunta inicial.",
    );
  }

  for (const p of preguntas) {
    if (!p.texto.trim()) errores.push("Escribe el texto de la pregunta.");
    // Regla 2: de 2 a 6 opciones.
    if (p.opciones.length < MIN_OPCIONES || p.opciones.length > MAX_OPCIONES) {
      errores.push(`${nombre(p.id)} debe tener de ${MIN_OPCIONES} a ${MAX_OPCIONES} opciones (tiene ${p.opciones.length}).`);
    }
    p.opciones.forEach((o, i) => {
      if (!o.texto.trim()) errores.push(`Escribe el texto de la opción ${i + 1} de ${nombre(p.id)}.`);
      if (o.siguienteId !== null && !porId.has(o.siguienteId)) {
        errores.push(`La opción ${i + 1} de ${nombre(p.id)} lleva a una pregunta que ya no existe.`);
      }
    });
    const textos = p.opciones.map((o) => o.texto.trim().toLowerCase()).filter(Boolean);
    if (new Set(textos).size !== textos.length) errores.push(`${nombre(p.id)} tiene dos opciones con el mismo texto.`);
  }

  // Regla 3: sin ciclos (en todo el árbol, no solo desde la inicial).
  const terminadas = new Set<number>();
  function buscarCiclo(id: number, camino: number[]): number[] | null {
    if (camino.includes(id)) return [...camino.slice(camino.indexOf(id)), id];
    if (terminadas.has(id)) return null;
    for (const o of porId.get(id)?.opciones ?? []) {
      if (o.siguienteId === null || !porId.has(o.siguienteId)) continue;
      const ciclo = buscarCiclo(o.siguienteId, [...camino, id]);
      if (ciclo) return ciclo;
    }
    terminadas.add(id);
    return null;
  }
  for (const p of preguntas) {
    const ciclo = buscarCiclo(p.id, []);
    if (ciclo) {
      errores.push(`Hay un ciclo: ${ciclo.map(nombre).join(" → ")}. La conversación nunca terminaría.`);
      break;
    }
  }

  // Regla 4 (solo aviso): toda pregunta alcanzable desde la inicial.
  if (iniciales.length === 1) {
    const vistas = new Set<number>();
    const pendientes = [iniciales[0].id];
    while (pendientes.length) {
      const id = pendientes.pop()!;
      if (vistas.has(id)) continue;
      vistas.add(id);
      for (const o of porId.get(id)?.opciones ?? []) if (o.siguienteId !== null) pendientes.push(o.siguienteId);
    }
    const sueltas = preguntas.filter((p) => !vistas.has(p.id));
    if (sueltas.length) {
      avisos.push(
        `Ninguna opción lleva a ${sueltas.map((p) => nombre(p.id)).join(", ")}: el chatbot no la${sueltas.length === 1 ? "" : "s"} va a preguntar. Conéctala${sueltas.length === 1 ? "" : "s"} desde la opción de otra pregunta.`,
      );
    }
  }

  return { errores: [...new Set(errores)], avisos };
}

// Aplica el cambio de una pregunta al árbol: la reemplaza (o la agrega si es nueva) y,
// si se marca como inicial, las demás dejan de serlo (así nunca hay dos).
export function arbolConCambio(preguntas: PreguntaEditable[], cambio: PreguntaEditable): PreguntaEditable[] {
  const resto = preguntas
    .filter((p) => p.id !== cambio.id)
    .map((p) => (cambio.esInicial ? { ...p, esInicial: false } : p));
  return [...resto, cambio];
}

// Regla 6: no se borra la pregunta inicial ni una a la que apunta una opción.
export function motivoParaNoEliminar(preguntas: PreguntaEditable[], id: number): string | null {
  const p = preguntas.find((x) => x.id === id);
  if (!p) return null;
  if (p.esInicial) return "Es la pregunta inicial: marca otra como inicial antes de eliminarla.";
  const origenes = preguntas.filter((x) => x.id !== id && x.opciones.some((o) => o.siguienteId === id));
  if (origenes.length) {
    return `La usan opciones de ${origenes.map((x) => `«${x.texto}»`).join(", ")}: cámbialas a otra pregunta o a «Fin» antes de eliminarla.`;
  }
  return null;
}
