import Link from "next/link";
import { ImagenProducto } from "@/components/ImagenProducto";
import { TIPOS_PRODUCTO, type ColoresLinea } from "@/lib/catalogo";
import type { ProductoCatalogo } from "@/lib/datos-catalogo";

export function TarjetaProducto({ producto, colores }: { producto: ProductoCatalogo; colores: ColoresLinea }) {
  const agotado = producto.stock === 0;
  return (
    <Link href={`/productos/${producto.id}`} className="group block">
      <div className="relative">
        <ImagenProducto
          imagenUrl={producto.imagenUrl}
          nombre={producto.nombre}
          colorFondo={colores.claro}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {agotado && (
          <span className="absolute top-2 left-2 rounded-full bg-tinta/85 px-3 py-1 text-xs tracking-wider text-crema uppercase">
            Agotado
          </span>
        )}
      </div>
      <p className="mt-3 text-xs tracking-[0.14em] uppercase" style={{ color: colores.oscuro }}>
        {TIPOS_PRODUCTO[producto.tipoProducto].paso}
      </p>
      <h3 className="mt-1 font-serif text-lg leading-snug text-cafe-oscuro group-hover:text-bugambilia">
        {producto.nombre}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-cafe">{producto.beneficioPrincipal}</p>
    </Link>
  );
}
