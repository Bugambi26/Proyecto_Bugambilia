import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EnlacesMenu } from "@/components/EnlacesMenu";

// Encabezado del mockup (igual en todas las páginas públicas). Los enlaces leen la ruta
// actual para marcar la página activa; con Cache Components eso va dentro de <Suspense>
// (mientras, se muestran los mismos enlaces sin marcar).
export function Encabezado() {
  return (
    <header className="site-header">
      <nav className="container nav" aria-label="Principal">
        <Link href="/" className="nav__logo">
          <Image className="logo" src="/img/logo.webp" alt="Bugambilia Hair Boutique — inicio" width={128} height={60} priority />
        </Link>
        <Suspense fallback={<EnlacesMenu ruta={null} />}>
          <EnlacesMenu />
        </Suspense>
      </nav>
    </header>
  );
}
