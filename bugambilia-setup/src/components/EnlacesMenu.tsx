"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ruta: null = sin marcar la página actual (fallback mientras se lee la URL).
export function EnlacesMenu({ ruta }: { ruta?: string | null }) {
  return ruta === undefined ? <ConRuta /> : <Enlaces ruta={ruta} />;
}

function ConRuta() {
  return <Enlaces ruta={usePathname()} />;
}

function Enlaces({ ruta }: { ruta: string | null }) {
  const actual = (activo: boolean) => (activo ? ("page" as const) : undefined);
  return (
    <div className="nav__links">
      <Link href="/" className="nav__link" aria-current={actual(ruta === "/")}>
        Inicio
      </Link>
      <Link href="/#servicios" className="nav__link">
        Servicios
      </Link>
      <Link href="/productos" className="nav__link" aria-current={actual(!!ruta?.startsWith("/productos"))}>
        Productos
      </Link>
      <Link href="/sucursales" className="nav__link" aria-current={actual(!!ruta?.startsWith("/sucursales"))}>
        Sucursales
      </Link>
      <button type="button" className="btn btn--primary" data-open-chat>
        Encuentra tu ritual
      </button>
    </div>
  );
}
