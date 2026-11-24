import { obtenerArbol, recomendar } from "@/lib/chatbot/servidor";

// API del chatbot (Fase 4). No guarda nada: las necesidades viven en el navegador.
//   GET  → árbol de preguntas ({ estado: "roto" } si no se puede usar).
//   POST { necesidades: number[] } → recomendación o cita de diagnóstico.

const MAX_NECESIDADES = 20;

export async function GET() {
  try {
    return Response.json(await obtenerArbol());
  } catch (error) {
    console.error("chatbot GET", error);
    return Response.json({ error: "No se pudo cargar el asistente." }, { status: 500 });
  }
}

export async function POST(peticion: Request) {
  const necesidades = leerNecesidades(await peticion.json().catch(() => null));
  if (!necesidades) {
    return Response.json({ error: "Formato inválido: se espera { necesidades: number[] }." }, { status: 400 });
  }
  try {
    return Response.json(await recomendar(necesidades));
  } catch (error) {
    console.error("chatbot POST", error);
    return Response.json({ error: "No se pudo preparar la recomendación." }, { status: 500 });
  }
}

function leerNecesidades(cuerpo: unknown): number[] | null {
  if (typeof cuerpo !== "object" || cuerpo === null) return null;
  const lista = (cuerpo as { necesidades?: unknown }).necesidades;
  if (!Array.isArray(lista) || lista.length > MAX_NECESIDADES) return null;
  if (!lista.every((n) => Number.isSafeInteger(n) && n > 0)) return null;
  return lista as number[];
}
