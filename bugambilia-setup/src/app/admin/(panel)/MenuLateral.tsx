"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Sucursales y Árbol son extras (S14): sus páginas aún no existen.
// "rutas": prefijos que marcan la sección como actual (el formulario de producto
// cuenta como Inventario, igual que en el mockup).
const SECCIONES = [
  { href: "/admin/inventario", texto: "Inventario", rutas: ["/admin/inventario", "/admin/productos"] },
  { href: "/admin/sucursales", texto: "Sucursales", rutas: ["/admin/sucursales"] },
  { href: "/admin/arbol", texto: "Árbol del chatbot", rutas: ["/admin/arbol"] },
];

// Menú lateral del mockup (admin/*.html).
export function MenuLateral() {
  const ruta = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await authClient.signOut();
    router.replace("/admin/login");
  }

  return (
    <nav className="sidebar" aria-label="Panel">
      <div className="sidebar__brand">
        <Image
          className="logo"
          src="/img/logo-blanco.webp"
          alt="Bugambilia Hair Boutique"
          width={128}
          height={60}
          style={{ width: "auto" }}
        />
        <span>Panel de administración</span>
      </div>
      {SECCIONES.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="side-link"
          aria-current={s.rutas.some((r) => ruta.startsWith(r)) ? "page" : undefined}
        >
          {s.texto}
        </Link>
      ))}
      <div className="sidebar__spacer"></div>
      <Link href="/" className="side-link side-link--muted">
        Ver sitio público
      </Link>
      <button type="button" className="side-link side-link--muted" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </nav>
  );
}
