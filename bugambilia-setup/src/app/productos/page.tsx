import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { coloresDeLinea } from "@/lib/catalogo";
import { obtenerLineasConProductos } from "@/lib/datos-catalogo";

export const metadata: Metadata = {
  title: "Productos",
  description: "Rituales de la Línea Bugambilia · Professional Hair Care.",
};

export default function Productos({ searchParams }: PageProps<"/productos">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <header className="text-center">
        <p className="text-xs tracking-[0.18em] text-balance text-cafe uppercase sm:tracking-[0.3em]">
          Línea Bugambilia · Professional Hair Care
        </p>
        <h1 className="mt-3 font-serif text-4xl text-cafe-oscuro sm:text-5xl">Nuestros rituales</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-cafe">
          Cuidado capilar profesional que atiende distintas necesidades del cabello mediante rituales
          especializados.
        </p>
      </header>
      <Suspense fallback={<p className="mt-12 text-center text-cafe">Cargando productos…</p>}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalogo({ searchParams }: { searchParams: PageProps<"/productos">["searchParams"] }) {
  const { linea } = await searchParams;
  const lineaId = Number(Array.isArray(linea) ? linea[0] : linea);
  const lineas = await obtenerLineasConProductos();
  const seleccionada = lineas.find((l) => l.id === lineaId);
  const visibles = (seleccionada ? [seleccionada] : lineas).filter((l) => l.productos.length > 0);

  return (
    <>
      {/* Filtro por línea */}
      <nav aria-label="Filtrar por ritual" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-2">
          <li>
            <Filtro href="/productos" activo={!seleccionada}>
              Todos
            </Filtro>
          </li>
          {lineas.map((l) => (
            <li key={l.id}>
              <Filtro href={`/productos?linea=${l.id}`} activo={seleccionada?.id === l.id}>
                {l.nombreRitual}
              </Filtro>
            </li>
          ))}
        </ul>
      </nav>

      {visibles.length === 0 && (
        <p className="mt-16 text-center text-cafe">Por ahora no hay productos en este ritual.</p>
      )}

      {visibles.map((l) => {
        const colores = coloresDeLinea(l.nombreRitual);
        return (
          <section key={l.id} aria-labelledby={`linea-${l.id}`} className="mt-14">
            <div className="border-b pb-4" style={{ borderColor: colores.oscuro }}>
              <p className="text-xs tracking-[0.2em] uppercase" style={{ color: colores.oscuro }}>
                {l.nombre}
              </p>
              <h2 id={`linea-${l.id}`} className="mt-1 font-serif text-3xl" style={{ color: colores.oscuro }}>
                {l.nombreRitual}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cafe">{l.descripcion}</p>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {l.productos.map((p) => (
                <li key={p.id}>
                  <TarjetaProducto producto={p} colores={colores} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function Filtro({ href, activo, children }: { href: string; activo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`inline-block rounded-full border px-4 py-1.5 text-sm transition-colors ${
        activo
          ? "border-cafe-oscuro bg-cafe-oscuro text-crema"
          : "border-arena bg-crema text-cafe-oscuro hover:border-cafe-oscuro"
      }`}
    >
      {children}
    </Link>
  );
}
