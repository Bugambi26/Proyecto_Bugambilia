import { BurbujaChat } from "@/components/BurbujaChat";
import { Encabezado } from "@/components/Encabezado";
import { PiePagina } from "@/components/PiePagina";

// Estructura de todas las páginas públicas.
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="contenido">{children}</main>
      <PiePagina />
      <BurbujaChat />
    </>
  );
}
