import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo } from "@/components/Catalogo";
import { obtenerLineasConProductos } from "@/lib/datos-catalogo";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de la Línea Bugambilia: rituales de cuidado capilar profesional.",
};

export default function Productos({ searchParams }: PageProps<"/productos">) {
  return (
    <>
      <section className="container stack gap-10" style={{ paddingTop: 48, paddingBottom: 24 }}>
        <span className="lbl">Línea Bugambilia · Professional Hair Care</span>
        <h1 className="title-lg">Productos</h1>
        <Suspense fallback={<Subtitulo n={null} />}>
          <SubtituloConDatos />
        </Suspense>
      </section>

      <section className="container catalog" style={{ paddingBottom: 64 }}>
        <Suspense fallback={<p className="text">Cargando productos…</p>}>
          <CatalogoConDatos searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

const NUMEROS = ["Cero", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"];

function Subtitulo({ n }: { n: number | null }) {
  const cuantos = n === null ? "Rituales" : `${NUMEROS[n] ?? n} ${n === 1 ? "ritual" : "rituales"}`;
  return (
    <p style={{ fontSize: 16, color: "var(--ink-2)" }}>
      {cuantos} de cuidado capilar profesional. Elige tu línea según lo que tu cabello necesita.
    </p>
  );
}

async function SubtituloConDatos() {
  const lineas = await obtenerLineasConProductos();
  return <Subtitulo n={lineas.length} />;
}

async function CatalogoConDatos({ searchParams }: { searchParams: PageProps<"/productos">["searchParams"] }) {
  const { linea } = await searchParams;
  const id = Number(Array.isArray(linea) ? linea[0] : linea);
  const lineas = await obtenerLineasConProductos();
  return <Catalogo lineas={lineas} lineaInicial={lineas.some((l) => l.id === id) ? id : null} />;
}
