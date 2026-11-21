import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ImagenProducto } from "@/components/ImagenProducto";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { TIPOS_PRODUCTO, coloresDeLinea, formatearPrecio } from "@/lib/catalogo";
import { CONTACTO } from "@/lib/contacto";
import { obtenerProducto } from "@/lib/datos-catalogo";

type Params = PageProps<"/productos/[id]">["params"];

async function productoDeParams(params: Params) {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? obtenerProducto(n) : null;
}

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const p = await productoDeParams(params);
  if (!p) return { title: "Producto no encontrado" };
  return { title: `${p.nombre} · ${p.linea.nombreRitual}`, description: p.beneficioPrincipal };
}

export default function FichaProducto({ params }: PageProps<"/productos/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <Suspense fallback={<p className="text-center text-cafe">Cargando producto…</p>}>
        <Ficha params={params} />
      </Suspense>
    </div>
  );
}

async function Ficha({ params }: { params: Params }) {
  const p = await productoDeParams(params);
  if (!p) notFound(); // inexistente o inactivo

  const colores = coloresDeLinea(p.linea.nombreRitual);
  const tipo = TIPOS_PRODUCTO[p.tipoProducto];
  const precio = formatearPrecio(p.precio);
  const agotado = p.stock === 0;

  return (
    <>
      <nav aria-label="Ruta" className="text-sm text-cafe">
        <Link href="/productos" className="hover:text-bugambilia">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/productos?linea=${p.linea.id}`} className="hover:text-bugambilia">
          {p.linea.nombreRitual}
        </Link>
      </nav>

      <article className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ImagenProducto
          imagenUrl={p.imagenUrl}
          nombre={p.nombre}
          colorFondo={colores.claro}
          sizes="(min-width: 768px) 50vw, 100vw"
          prioridad
        />

        <div>
          <p className="text-xs tracking-[0.2em] uppercase" style={{ color: colores.oscuro }}>
            {p.linea.nombre} · {p.linea.nombreRitual}
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-cafe-oscuro">{p.nombre}</h1>
          <p className="mt-3 text-sm tracking-[0.12em] text-cafe uppercase">
            {tipo.etiqueta} · {tipo.paso}
          </p>

          <p className="mt-6 text-lg leading-relaxed text-tinta">{p.beneficioPrincipal}</p>

          <dl className="mt-8 divide-y divide-arena border-y border-arena text-sm">
            <Dato termino="Ingredientes protagonistas">{p.ingredientesProtagonistas}</Dato>
            {p.contenidoNeto && <Dato termino="Contenido neto">{p.contenidoNeto}</Dato>}
            {precio && <Dato termino="Precio">{precio}</Dato>}
            <Dato termino="Disponibilidad">
              {agotado ? (
                <span className="font-medium text-bugambilia">Agotado</span>
              ) : (
                <span style={{ color: colores.oscuro }}>Disponible</span>
              )}
            </Dato>
          </dl>

          <a
            href={CONTACTO.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-bugambilia px-8 py-3 text-sm tracking-[0.14em] text-crema uppercase transition-opacity hover:opacity-90"
          >
            Pregúntanos por WhatsApp
          </a>
        </div>
      </article>

      {p.otros.length > 0 && (
        <section aria-labelledby="completa-ritual" className="mt-16">
          <h2 id="completa-ritual" className="font-serif text-2xl text-cafe-oscuro">
            Completa tu {p.linea.nombreRitual}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {p.otros.map((o) => (
              <li key={o.id}>
                <TarjetaProducto producto={o} colores={colores} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Dato({ termino, children }: { termino: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-3">
      <dt className="text-cafe">{termino}</dt>
      <dd className="text-right text-tinta">{children}</dd>
    </div>
  );
}
