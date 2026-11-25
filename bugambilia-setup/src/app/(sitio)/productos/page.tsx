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

      {/* Por qué existe la línea: texto de la clienta (25 nov 2026), sin cambios. */}
      <section className="container" style={{ paddingBottom: 32 }} aria-labelledby="t-historia">
        <div className="historia stack gap-16">
          <h2 id="t-historia" className="title-sm">
            Porque cada cabello tiene su propia historia
          </h2>
          <p className="text">Así como cada mujer tiene una historia diferente, cada cabello también.</p>
          <p className="text">
            A lo largo de los años hemos aprendido que no existen dos cabellos iguales: cada uno ha vivido procesos,
            cambios, coloraciones, tratamientos y cuidados diferentes. Por eso decidimos crear y maquilar nuestros
            propios productos.
          </p>
          <p className="text">
            En Bugambilia creemos en una belleza más consciente y personalizada. Creamos fórmulas pensadas para
            responder a las necesidades reales de cada cabello, porque no queremos ofrecer un producto más; queremos
            encontrar el cuidado que tu cabello verdaderamente necesita.
          </p>
          <p className="text">
            Cada tratamiento, cada fórmula y cada recomendación nace de nuestra experiencia y del conocimiento que
            hemos construido trabajando día a día con nuestras clientas.
          </p>
          <p className="historia__frase">
            Porque para nosotras, cuidar tu cabello también es conocer su historia.
            <br />Y cuando conocemos su historia, podemos darle exactamente lo que necesita para volver a florecer.
          </p>
        </div>
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
