import type { Metadata } from "next";
import { cormorant, jost } from "./fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Inicio — Bugambilia Hair Boutique",
    template: "%s — Bugambilia Hair Boutique",
  },
  description:
    "Bugambilia Hair Boutique: tratamientos faciales y la Línea Bugambilia de cuidado capilar profesional.",
};

// Layout raíz: solo fuentes y estilos. El encabezado, el pie y el asistente del
// sitio público viven en (sitio)/layout.tsx; el panel tiene el suyo en admin/.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
