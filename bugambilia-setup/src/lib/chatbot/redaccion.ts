// Textos de la recomendación (Fase 4, sección 5). La IA solo escribe la introducción y un
// mensaje por ritual; productos, enlaces y firma los arma el código. Si la IA no está
// disponible (sin llave, error, límite o más de 8 s) o responde algo inválido, se usa
// esta plantilla, con el mismo formato.

export type RitualParaRedactar = { lineaId: number; ritual: string; descripcion: string };
export type Redaccion = { introduccion: string; rituales: { id_linea: number; mensaje: string }[] };

export const INTRODUCCION_PLANTILLA = "Con base en lo que nos contaste, estos son los rituales que te recomendamos:";

export function redactarConPlantilla(rituales: RitualParaRedactar[]): Redaccion {
  return {
    introduccion: INTRODUCCION_PLANTILLA,
    rituales: rituales.map((r) => ({ id_linea: r.lineaId, mensaje: `${r.ritual}: ${r.descripcion}` })),
  };
}
