import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ImagenProducto } from "@/components/ImagenProducto";
import { aparienciaDeLinea, estiloLinea } from "@/lib/catalogo";
import { ENLACE_ASISTENTE } from "@/lib/contacto";
import { obtenerProducto } from "@/lib/datos-catalogo";

type Params = PageProps<"/productos/[id]">["params"];

async function datosDeParams(params: Params) {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? obtenerProducto(n) : null;
}

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const d = await datosDeParams(params);
  if (!d) return { title: "Producto no disponible" };
  return { title: `${d.producto.nombre} — ${d.producto.linea.nombreRitual}`, description: d.producto.beneficio };
}

export default function FichaProducto({ params }: PageProps<"/productos/[id]">) {
  return (
    <Suspense fallback={<div className="container section text">Cargando producto…</div>}>
      <Ficha params={params} />
    </Suspense>
  );
}

async function Ficha({ params }: { params: Params }) {
  const d = await datosDeParams(params);
  if (!d) notFound(); // inexistente o dado de baja

  const { producto: p, otros } = d;
  const l = p.linea;
  const apariencia = aparienciaDeLinea(l.nombre);

  return (
    <div style={estiloLinea(l.nombre)}>
      <nav className="container breadcrumb" aria-label="Ruta">
        <Link href="/productos">Productos</Link> / <Link href={`/productos?linea=${l.id}`}>{l.nombre}</Link> /{" "}
        <span>{p.nombre}</span>
      </nav>

      <section className="container detail">
        <ImagenProducto
          imagenUrl={p.imagenUrl}
          alt={`${p.nombre} — ${l.nombre}${p.contenidoNeto ? `, ${p.contenidoNeto}` : ""}`}
          className="detail__img"
          sizes="(min-width: 960px) 560px, 100vw"
          prioridad
        />
        <div className="detail__info">
          <span className="meta" style={{ fontSize: 13, color: "var(--l-ink, var(--muted))" }}>
            {l.numerada.toUpperCase()} — {l.nombreRitual.toUpperCase()}
          </span>
          <h1 className="detail__title">{p.nombre}</h1>
          <div className="row gap-16">
            {p.precio && <span className="detail__price">{p.precio}</span>}
            <span className={`badge${p.disponible ? "" : " badge--out"}`}>{p.disponible ? "Disponible" : "Agotado"}</span>
          </div>
          <p className="text">{l.descripcion}</p>
          <dl className="specs">
            {p.ingredientes && (
              <div>
                <dt>Ingrediente protagonista</dt>
                <dd className="ingredient">
                  {apariencia.ingImg && (
                    <Image className="ph" src={apariencia.ingImg} alt="" width={72} height={72} />
                  )}
                  <span>{p.ingredientes}</span>
                </dd>
              </div>
            )}
            {p.contenidoNeto && (
              <div>
                <dt>Contenido neto</dt>
                <dd>{p.contenidoNeto}</dd>
              </div>
            )}
            <div className="specs__full">
              <dt>Beneficio principal</dt>
              <dd>{p.beneficio}</dd>
            </div>
          </dl>
          <div className="row gap-12">
            <Link href="/sucursales" className="btn btn--primary">
              Dónde comprarlo
            </Link>
            <a href={ENLACE_ASISTENTE} className="btn" target="_blank" rel="noopener noreferrer">
              ¿Es para mí? Pregunta al asistente
            </a>
          </div>
          <p className="note">Sin carrito ni pagos: la compra se hace en la estética o en el punto de venta.</p>
        </div>
      </section>

      {otros.length > 0 && (
        <section className="section section--alt" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div className="container stack gap-24">
            <div className="stack gap-10">
              <span className="lbl">Productos de la misma línea</span>
              <h2 className="title-sm">Completa tu {l.nombreRitual}</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {otros.map((o) => (
                <Link key={o.id} href={`/productos/${o.id}`} className="card related-card">
                  <ImagenProducto imagenUrl={o.imagenUrl} sizes="96px" />
                  <div className="stack" style={{ gap: 4 }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{o.nombre}</span>
                    <span className="small">{o.precio ? `${o.precio} · Ver detalle` : "Ver detalle"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
