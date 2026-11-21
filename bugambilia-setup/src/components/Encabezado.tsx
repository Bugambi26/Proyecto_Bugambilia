import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo-bugambilia.png";

// Servicios y Sucursales se agregan al menú cuando existan sus páginas.
const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/productos", texto: "Productos" },
] as const;

export function Encabezado() {
  return (
    <header className="border-b border-arena bg-crema/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Bugambilia Hair Boutique, inicio">
          <Image src={logo} alt="Bugambilia Hair Boutique" priority className="h-11 w-auto sm:h-14" />
        </Link>
        <nav aria-label="Principal">
          <ul className="flex gap-5 text-sm tracking-[0.12em] uppercase sm:gap-8">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="text-cafe-oscuro transition-colors hover:text-bugambilia">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
