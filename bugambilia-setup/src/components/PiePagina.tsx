import Image from "next/image";
import Link from "next/link";
import { CONTACTO, FIRMA } from "@/lib/contacto";

// Pie de página del mockup (igual en todas las páginas públicas).
export function PiePagina() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="stack gap-12">
          <Image className="logo" src="/img/logo-blanco.webp" alt="Bugambilia Hair Boutique" width={115} height={54} />
          <span>{FIRMA}</span>
        </div>
        <nav className="stack gap-8" aria-label="Pie de página">
          <Link href="/productos">Productos</Link>
          <Link href="/sucursales">Sucursales</Link>
          <a href={CONTACTO.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
        <div className="stack gap-8">
          <a href={CONTACTO.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={`tel:+52${CONTACTO.telefono}`}>Llamar · {CONTACTO.telefonoVisible}</a>
          {/* La ruta del panel la define Miguelinchis en la S13. */}
          <Link href="/admin" className="muted-link">
            Acceso administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
