// TEMPORAL: diagnóstico de la conexión a la base en Netlify. Borrar al resolverlo.
// No devuelve secretos: la URL se reduce al host y se enmascara cualquier credencial.
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

function sinSecretos(texto: string) {
  return texto.replace(/postgres(ql)?:\/\/[^\s"']+/g, "postgresql://***").slice(0, 600);
}

export async function GET() {
  await connection();
  const url = process.env.DATABASE_URL;
  let host: string | null = null;
  try {
    host = url ? new URL(url).hostname.replace(/^ep-[^.-]+-[^.-]+-[^.-]+/, "ep-***") : null;
  } catch {
    host = "URL inválida";
  }
  const base = {
    node: process.version,
    tieneDatabaseUrl: Boolean(url),
    comillasEnUrl: url ? /^["']|["']$/.test(url) : null,
    host,
    webSocketGlobal: typeof globalThis.WebSocket,
  };
  try {
    const lineas = await prisma.linea.count();
    return Response.json({ ok: true, ...base, lineas });
  } catch (e) {
    const err = e as Error & { code?: string; cause?: unknown };
    return Response.json(
      {
        ok: false,
        ...base,
        error: err?.name,
        codigo: err?.code ?? null,
        mensaje: sinSecretos(String(err?.message ?? e)),
        causa: err?.cause ? sinSecretos(String((err.cause as Error)?.message ?? err.cause)) : null,
      },
      { status: 500 },
    );
  }
}
