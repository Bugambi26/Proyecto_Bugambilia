import "server-only";
import { google } from "@ai-sdk/google";
import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import { armarContexto, redaccionCoincide, type NecesidadParaRedactar, type Redaccion, type RitualParaRedactar } from "./redaccion";

// Redacción con Gemini (Fase 4, sección 5). Devuelve null cuando no se puede usar
// (sin llave, error, límite del plan gratuito, más de 8 s o respuesta inválida): en ese
// caso el servidor usa la plantilla. Nunca lanza errores.

// Prompt de sistema literal de docs/fase-4-motor-chatbot.md.
export const PROMPT_SISTEMA = `Eres la asistente virtual de Bugambilia Hair Boutique. Tu única tarea es redactar,
en español y hablando de tú, los textos de una recomendación de productos capilares
a partir de los datos de CONTEXTO.

Reglas:
1. Habla solo de los rituales que aparecen en CONTEXTO, en el mismo orden. No menciones
   otros productos, marcas ni tratamientos faciales.
2. Usa únicamente la información de CONTEXTO (necesidades, descripción de cada línea,
   tipo de producto, ingredientes y beneficio principal). No inventes beneficios,
   ingredientes, precios, modos de uso, frecuencias ni resultados.
3. Para Growth Ritual, menciona sus beneficios solo con las palabras de su beneficio
   principal. No prometas resultados ni plazos de crecimiento.
4. No hagas diagnósticos ni des indicaciones médicas.
5. Tono: elegante, cálido, femenino y profesional, como una marca premium de salón.
   Evita sonar clínica, exagerada o publicitaria. Sin emojis.
6. Extensión: "introduccion" de máximo 2 oraciones que conecte con las necesidades;
   un "mensaje" de máximo 2 oraciones por ritual que explique por qué se ajusta.
7. Devuelve solo el objeto con el formato solicitado.`;

const esquema = z.object({
  introduccion: z.string().max(300),
  rituales: z.array(z.object({ id_linea: z.number(), mensaje: z.string().max(300) })),
});

// Parámetros iniciales de la Fase 4 (ajustar en pruebas).
export const AJUSTES_IA = { temperatura: 0.4, maxTokens: 400, esperaMs: 8000 } as const;

// "gemini-flash-latest" lo mueve Google al Flash vigente (no se rompe si retiran un modelo).
// Para fijar otro: GEMINI_MODELO en el .env / Netlify.
const MODELO_POR_DEFECTO = "gemini-flash-latest";

function modeloConfigurado(): LanguageModel | null {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;
  return google(process.env.GEMINI_MODELO || MODELO_POR_DEFECTO);
}

export async function redactarConIA(
  necesidades: NecesidadParaRedactar[],
  rituales: RitualParaRedactar[],
  modelo: LanguageModel | null = modeloConfigurado(),
): Promise<Redaccion | null> {
  if (!modelo) return null;
  try {
    const { output } = await generateText({
      model: modelo,
      system: PROMPT_SISTEMA,
      prompt: armarContexto(necesidades, rituales),
      output: Output.object({ schema: esquema }),
      temperature: AJUSTES_IA.temperatura,
      maxOutputTokens: AJUSTES_IA.maxTokens,
      timeout: AJUSTES_IA.esperaMs,
      maxRetries: 0, // un reintento no cabe en los 8 s; mejor la plantilla
      // Sin "pensamiento" largo: los textos son cortos y los tokens de razonamiento
      // contarían contra el límite de salida.
      providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } },
    });
    if (redaccionCoincide(output, rituales.map((r) => r.lineaId))) return output;
    console.warn("chatbot IA: la respuesta no coincide con los rituales enviados; se usa la plantilla");
    return null;
  } catch (error) {
    console.warn("chatbot IA: se usa la plantilla →", error instanceof Error ? error.message : error);
    return null;
  }
}
