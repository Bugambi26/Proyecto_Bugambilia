import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import { PiePagina } from "@/components/PiePagina";
import "./globals.css";

// Tipografías provisionales (ver globals.css).
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Bugambilia Hair Boutique · Aguascalientes",
    template: "%s · Bugambilia Hair Boutique",
  },
  description:
    "Estética en Aguascalientes. Rituales de cuidado capilar profesional de la Línea Bugambilia y tratamientos faciales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${playfair.variable} ${jost.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Encabezado />
        <main className="flex-1">{children}</main>
        <PiePagina />
      </body>
    </html>
  );
}
