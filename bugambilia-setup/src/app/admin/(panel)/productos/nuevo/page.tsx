import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { FormularioAlta } from "../FormularioProducto";
import { opcionesDelFormulario } from "../opciones";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

export default async function NuevoProducto() {
  await connection();
  const { lineas, necesidades } = await opcionesDelFormulario();

  return (
    <>
      <div className="stack gap-8">
        <Link href="/admin/inventario" style={{ fontSize: 14 }}>
          ← Volver al inventario
        </Link>
        <span className="lbl">Mismo formulario para Alta (vacío) y Cambio (con datos)</span>
        <h1 className="admin-title">Dar de alta producto</h1>
      </div>
      <FormularioAlta lineas={lineas} necesidades={necesidades} />
    </>
  );
}
