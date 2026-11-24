import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

// TODO (siguiente paso): ABC de productos según admin/inventario.html.
export default function Inventario() {
  return (
    <div className="admin-head">
      <div className="stack gap-8">
        <span className="lbl">Inventario · Alta / Baja / Cambio + stock global</span>
        <h1 className="admin-title">Productos</h1>
      </div>
    </div>
  );
}
