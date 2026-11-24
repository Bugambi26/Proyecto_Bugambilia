"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Sucursales y Árbol son extras (S14): sus páginas aún no existen.
const SECCIONES = [
  { href: "/admin/inventario", texto: "Inventario" },
  { href: "/admin/sucursales", texto: "Sucursales" },
  { href: "/admin/arbol", texto: "Árbol del chatbot" },
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
        <Image className="logo" src="/img/logo-blanco.webp" alt="Bugambilia Hair Boutique" width={128} height={60} />
        <span>Panel de administración</span>
      </div>
      {SECCIONES.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="side-link"
          aria-current={ruta.startsWith(s.href) ? "page" : undefined}
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
