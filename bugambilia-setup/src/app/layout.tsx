import type { Metadata } from "next";
import { BurbujaChat } from "@/components/BurbujaChat";
import { Encabezado } from "@/components/Encabezado";
import { PiePagina } from "@/components/PiePagina";
import { cormorant, jost } from "./fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Inicio — Bugambilia Hair Boutique",
    template: "%s — Bugambilia Hair Boutique",
  },
  description:
    "Bugambilia Hair Boutique: tratamientos faciales, servicios capilares y la Línea Bugambilia de cuidado capilar profesional.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Encabezado />
        <main id="contenido">{children}</main>
        <PiePagina />
        <BurbujaChat />
      </body>
    </html>
  );
}
