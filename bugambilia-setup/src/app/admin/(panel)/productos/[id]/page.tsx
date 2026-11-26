import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { FormularioProducto, type ProductoEditable } from "../FormularioProducto";
import { opcionesDelFormulario } from "../opciones";

export const metadata: Metadata = {
  title: "Editar producto",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

export default async function EditarProducto({ params }: PageProps<"/admin/productos/[id]">) {
  await connection();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [p, { lineas, necesidades }] = await Promise.all([
    prisma.producto.findUnique({ where: { id }, include: { necesidades: { select: { necesidadId: true } } } }),
    opcionesDelFormulario(),
  ]);
  if (!p) notFound();

  // Objeto simple (sin Decimal) para pasarlo al formulario, que es de cliente.
  const producto: ProductoEditable = {
    id: p.id,
    nombre: p.nombre,
    lineaId: p.lineaId,
    tipoProducto: p.tipoProducto,
    ingredientes: p.ingredientesProtagonistas,
    beneficio: p.beneficioPrincipal,
    contenidoNeto: p.contenidoNeto,
    precio: p.precio?.toFixed(2) ?? null,
    stock: p.stock,
    activo: p.activo,
    imagenUrl: p.imagenUrl,
    necesidades: p.necesidades.map((n) => n.necesidadId),
  };

  return (
    <>
      <div className="stack gap-8">
        <Link href="/admin/inventario" style={{ fontSize: 14 }}>
          ← Volver al inventario
        </Link>
        <h1 className="admin-title">Editar producto</h1>
      </div>
      {/* La llave son los datos: si cambiaron (p. ej. el stock desde la tabla), el
          formulario vuelve a empezar con ellos en vez de conservar los de antes. */}
      <FormularioProducto
        key={JSON.stringify(producto)}
        producto={producto}
        lineas={lineas}
        necesidades={necesidades}
      />
    </>
  );
}
