import Link from "next/link";
import { ImagenProducto } from "@/components/ImagenProducto";
import { estiloLinea } from "@/lib/catalogo";
import type { ProductoVista } from "@/lib/datos-catalogo";

// Tarjeta del catálogo (mockup). Precio y contenido neto solo si existen.
export function TarjetaProducto({ producto: p }: { producto: ProductoVista }) {
  return (
    <article className="card product-card" style={estiloLinea(p.linea.nombre)}>
      <ImagenProducto
        imagenUrl={p.imagenUrl}
        className="product-card__img"
        sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
      />
      <div className="product-card__body">
        <span className="product-card__line">{p.linea.nombre}</span>
        <h2 className="product-card__name">{p.nombre}</h2>
        {p.contenidoNeto && <span className="small">{p.contenidoNeto}</span>}
        <div className="product-card__foot">
          <span style={{ fontWeight: 700 }}>{p.precio}</span>
          <span className={`badge${p.disponible ? "" : " badge--out"}`}>{p.disponible ? "Disponible" : "Agotado"}</span>
        </div>
        <Link href={`/productos/${p.id}`} className="btn btn--sm" style={{ marginTop: 8 }}>
          Ver detalle<span className="sr-only"> de {p.nombre}</span>
        </Link>
      </div>
    </article>
  );
}
