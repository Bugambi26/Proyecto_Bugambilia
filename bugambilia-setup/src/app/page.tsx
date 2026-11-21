import Link from "next/link";
import { Suspense } from "react";
import { coloresDeLinea } from "@/lib/catalogo";
import { CONTACTO, FIRMA } from "@/lib/contacto";
import { obtenerLineas } from "@/lib/datos-catalogo";

export default function Inicio() {
  return (
    <>
      {/* Portada */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
        <p className="text-xs tracking-[0.3em] text-cafe uppercase">Hair Boutique · Aguascalientes</p>
        <h1 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight text-balance text-cafe-oscuro sm:text-6xl">
          {FIRMA}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cafe">
          Rituales de cuidado capilar profesional, creados desde la experiencia de salón.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/productos"
            className="rounded-full bg-bugambilia px-8 py-3 text-sm tracking-[0.14em] text-crema uppercase transition-opacity hover:opacity-90"
          >
            Descubre los rituales
          </Link>
          <a
            href={CONTACTO.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cafe-oscuro px-8 py-3 text-sm tracking-[0.14em] text-cafe-oscuro uppercase transition-colors hover:bg-cafe-oscuro hover:text-crema"
          >
            Escríbenos
          </a>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="bg-arena/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr] md:py-20">
          <h2 className="font-serif text-3xl text-cafe-oscuro">Quiénes somos</h2>
          {/* TODO: texto real de la clienta (texto provisional con datos del catálogo). */}
          <div className="space-y-4 text-lg leading-relaxed text-cafe">
            <p>
              Bugambilia Hair Boutique es una estética en Aguascalientes dedicada al cuidado del cabello y de la
              piel, con la experiencia de salón como punto de partida.
            </p>
            <p>
              De esa experiencia nace la Línea Bugambilia · Professional Hair Care: una colección de rituales
              especializados que atienden distintas necesidades del cabello, desde la limpieza hasta el
              tratamiento y la finalización.
            </p>
          </div>
        </div>
      </section>

      {/* Rituales */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] text-cafe uppercase">Línea Bugambilia</p>
          <h2 className="mt-3 font-serif text-3xl text-cafe-oscuro sm:text-4xl">Un ritual para cada cabello</h2>
        </div>
        <Suspense fallback={<p className="mt-10 text-center text-cafe">Cargando rituales…</p>}>
          <Rituales />
        </Suspense>
      </section>
    </>
  );
}

async function Rituales() {
  const lineas = await obtenerLineas();
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lineas.map((l) => {
        const colores = coloresDeLinea(l.nombreRitual);
        return (
          <li key={l.id}>
            <Link
              href={`/productos?linea=${l.id}`}
              className="group flex h-full flex-col rounded-sm p-6 ring-1 ring-cafe/10 transition-transform ring-inset hover:-translate-y-0.5"
              style={{ backgroundColor: colores.claro }}
            >
              <span className="text-xs tracking-[0.2em] uppercase" style={{ color: colores.oscuro }}>
                {l.nombre}
              </span>
              <span className="mt-2 font-serif text-2xl" style={{ color: colores.oscuro }}>
                {l.nombreRitual}
              </span>
              <span className="mt-3 flex-1 text-sm leading-relaxed text-cafe">{l.descripcion}</span>
              <span className="mt-5 text-xs tracking-[0.14em] text-cafe-oscuro uppercase group-hover:text-bugambilia">
                Ver productos →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
