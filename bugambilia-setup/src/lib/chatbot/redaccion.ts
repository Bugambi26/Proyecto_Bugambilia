// Textos de la recomendación (Fase 4, sección 5). La IA solo escribe la introducción y un
// mensaje por ritual; productos, enlaces y firma los arma el código. Si la IA no está
// disponible (sin llave, error, límite o más de 8 s) o responde algo inválido, se usa
// esta plantilla, con el mismo formato.

export type RitualParaRedactar = {
  lineaId: number;
  linea: string; // "Rubios Perfectos"
  ritual: string; // "Blonde Ritual"
  descripcion: string;
  productos: { paso: string; nombre: string; ingredientes: string; beneficio: string }[];
};
export type NecesidadParaRedactar = { nombre: string; descripcion: string };
export type Redaccion = { introduccion: string; rituales: { id_linea: number; mensaje: string }[] };

export const INTRODUCCION_PLANTILLA = "Con base en lo que nos contaste, estos son los rituales que te recomendamos:";

export function redactarConPlantilla(rituales: RitualParaRedactar[]): Redaccion {
  return {
    introduccion: INTRODUCCION_PLANTILLA,
    rituales: rituales.map((r) => ({ id_linea: r.lineaId, mensaje: `${r.ritual}: ${r.descripcion}` })),
  };
}

// Mensaje con el CONTEXTO para la IA (formato de la Fase 4). Solo datos públicos del catálogo.
export function armarContexto(necesidades: NecesidadParaRedactar[], rituales: RitualParaRedactar[]): string {
  const minuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const lineas = ["CONTEXTO", "Necesidades:"];
  for (const n of necesidades) lineas.push(`- ${n.nombre}: ${minuscula(n.descripcion)}.`);
  lineas.push("", "Rituales (en orden):");
  rituales.forEach((r, i) => {
    lineas.push(`${i + 1}. [id_linea: ${r.lineaId}] ${r.linea} — ${r.ritual}`, `   Descripción: ${r.descripcion}`);
    for (const p of r.productos) {
      lineas.push(`   - ${[p.paso, p.nombre, p.ingredientes, p.beneficio].filter((t) => t.trim()).join(" · ")}`);
    }
  });
  return lineas.join("\n");
}

// La respuesta de la IA solo se usa si habla exactamente de los rituales enviados, en el
// mismo orden, y no trae textos vacíos. Si no, se descarta y se usa la plantilla.
export function redaccionCoincide(r: Redaccion, idsEnviados: number[]): boolean {
  return (
    r.introduccion.trim() !== "" &&
    r.rituales.length === idsEnviados.length &&
    r.rituales.every((x, i) => x.id_linea === idsEnviados[i] && x.mensaje.trim() !== "")
  );
}
