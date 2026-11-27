// Etiquetas, orden de rutina y apariencia de cada línea. Sin acceso a la base:
// se puede usar en el servidor y en el cliente (lo reutiliza el chatbot).

import type { CSSProperties } from "react";
import type { TipoProducto } from "@/generated/prisma/enums";

export type PasoRutina = "Limpieza" | "Tratamiento" | "Finalización";

// Fase 5: tipo de producto → etiqueta (como en el mockup) y paso de rutina.
export const TIPOS_PRODUCTO: Record<TipoProducto, { etiqueta: string; paso: PasoRutina; orden: number }> = {
  Shampoo: { etiqueta: "Shampoo", paso: "Limpieza", orden: 1 },
  Mascarilla: { etiqueta: "Mascarilla", paso: "Tratamiento", orden: 2 },
  Balsamo: { etiqueta: "Bálsamo", paso: "Tratamiento", orden: 2 },
  Locion: { etiqueta: "Loción", paso: "Tratamiento", orden: 2 },
  CremaParaPeinar: { etiqueta: "Crema para peinar", paso: "Finalización", orden: 3 },
  Aceite: { etiqueta: "Aceite", paso: "Finalización", orden: 3 },
};

// Orden de los tipos en el filtro del catálogo (igual que el mockup).
export const ORDEN_FILTRO_TIPOS: TipoProducto[] = ["Shampoo", "Balsamo", "Mascarilla", "CremaParaPeinar", "Locion", "Aceite"];

// Orden de rutina: limpieza → tratamiento → finalización; empates por orden del catálogo (id).
export function compararPorRutina(
  a: { tipoProducto: TipoProducto; id: number },
  b: { tipoProducto: TipoProducto; id: number },
) {
  return TIPOS_PRODUCTO[a.tipoProducto].orden - TIPOS_PRODUCTO[b.tipoProducto].orden || a.id - b.id;
}

// Apariencia de cada línea (mockup): colores de la banda de su etiqueta, foto de la
// línea y foto del ingrediente. Va en código porque el ER no tiene esos campos.
export type AparienciaLinea = { color: string; tinta: string; img: string; ingImg: string };

const APARIENCIA_POR_LINEA: Record<string, AparienciaLinea> = {
  "Rubios Perfectos": { color: "#E9E1F4", tinta: "#4E3487", img: "/img/lineas/blonde.webp", ingImg: "/img/ingredientes/blonde.webp" },
  "Cobres Brillantes": { color: "#F6DCCB", tinta: "#9A3F22", img: "/img/lineas/copper.webp", ingImg: "/img/ingredientes/copper.webp" },
  Hidratación: { color: "#DFE8DA", tinta: "#3F5C3D", img: "/img/lineas/hydra.webp", ingImg: "/img/ingredientes/hydra.webp" },
  Reestructurante: { color: "#F1E5D2", tinta: "#735A3A", img: "/img/lineas/repair.webp", ingImg: "/img/ingredientes/repair.webp" },
  Crecimiento: { color: "#DCE5CF", tinta: "#4A5A2E", img: "/img/lineas/growth.webp", ingImg: "/img/ingredientes/growth.webp" },
  "Cotton Candy": { color: "#F8DCE3", tinta: "#A42A55", img: "/img/lineas/cotton.webp", ingImg: "/img/ingredientes/cotton.webp" },
  "Kit Antioxidante": { color: "#EDE1CF", tinta: "#6B4A2B", img: "/img/lineas/antiox.webp", ingImg: "/img/ingredientes/antiox.webp" },
  // Producto suelto (26 nov 2026): "oro claro"; aún sin foto de línea ni de ingrediente, usa la del producto.
  "Gotas de Oro": { color: "#F3E2B0", tinta: "#6B4E0F", img: "/img/productos/gotas-de-oro.webp", ingImg: "" },
};

const APARIENCIA_NEUTRA: AparienciaLinea = { color: "#EDE1CF", tinta: "#6B4A2B", img: "/img/hero.webp", ingImg: "" };

export function aparienciaDeLinea(nombreLinea: string): AparienciaLinea {
  return APARIENCIA_POR_LINEA[nombreLinea] ?? APARIENCIA_NEUTRA;
}

// Variables CSS --l-bg / --l-ink que usa el diseño en tarjetas, filtros, banner y detalle.
export function estiloLinea(nombreLinea: string): CSSProperties {
  const a = aparienciaDeLinea(nombreLinea);
  return { "--l-bg": a.color, "--l-ink": a.tinta } as CSSProperties;
}

// "1 producto" / "3 productos" (Gotas de Oro es una línea de un solo producto).
export function cuantosProductos(n: number) {
  return `${n} producto${n === 1 ? "" : "s"}`;
}

// "01 · Rubios perfectos" (etiqueta numerada de la línea, como en el mockup).
export function etiquetaNumerada(posicion: number, nombreLinea: string) {
  const nombre = nombreLinea.charAt(0) + nombreLinea.slice(1).toLowerCase();
  return `${String(posicion).padStart(2, "0")} · ${nombre}`;
}

const formatoPesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const formatoPesosEnteros = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

// Precio y contenido neto son opcionales (Fase 5): si faltan, no se muestran.
export function formatearPrecio(precio: { toString(): string } | null): string | null {
  if (precio === null) return null;
  const n = Number(precio.toString());
  return (Number.isInteger(n) ? formatoPesosEnteros : formatoPesos).format(n); // $680 · $680.50
}
