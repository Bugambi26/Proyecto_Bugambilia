import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { formatearPrecio } from "@/lib/catalogo";
import { prisma } from "@/lib/prisma";
import { TablaInventario, type FilaInventario } from "./TablaInventario";

export const metadata: Metadata = {
  title: "Inventario",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

// Igual a admin/inventario.html. Son pocos productos (21), así que se cargan
// todos y la búsqueda, los filtros y la paginación se hacen en el navegador.
export default async function Inventario() {
  await connection();
  const [lineas, productos] = await Promise.all([
    prisma.linea.findMany({ orderBy: { id: "asc" }, select: { id: true, nombre: true } }),
    prisma.producto.findMany({ orderBy: [{ lineaId: "asc" }, { id: "asc" }], include: { linea: true } }),
  ]);

  const filas: FilaInventario[] = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    lineaId: p.lineaId,
    linea: p.linea.nombre,
    precio: formatearPrecio(p.precio),
    imagenUrl: p.imagenUrl,
    stock: p.stock,
    activo: p.activo,
  }));

  return (
    <>
      <div className="admin-head">
        <div className="stack gap-8">
          <span className="lbl">Inventario · Alta / Baja / Cambio + stock global</span>
          <h1 className="admin-title">Productos</h1>
        </div>
        <Link href="/admin/productos/nuevo" className="btn btn--primary">
          + Dar de alta producto
        </Link>
      </div>
      <TablaInventario productosIniciales={filas} lineas={lineas} />
    </>
  );
}
