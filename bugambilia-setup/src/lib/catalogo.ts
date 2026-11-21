// Etiquetas, orden de rutina y colores del catálogo. Sin acceso a la base:
// se puede usar en el servidor y en el cliente (lo reutiliza el chatbot).

import type { TipoProducto } from "@/generated/prisma/enums";

export type PasoRutina = "Limpieza" | "Tratamiento" | "Finalización";

// Fase 5: tipo de producto → etiqueta con acentos y paso de rutina.
export const TIPOS_PRODUCTO: Record<TipoProducto, { etiqueta: string; paso: PasoRutina; orden: number }> = {
  Shampoo: { etiqueta: "Shampoo", paso: "Limpieza", orden: 1 },
  Mascarilla: { etiqueta: "Mascarilla", paso: "Tratamiento", orden: 2 },
  Balsamo: { etiqueta: "Bálsamo", paso: "Tratamiento", orden: 2 },
  Locion: { etiqueta: "Loción", paso: "Tratamiento", orden: 2 },
  CremaParaPeinar: { etiqueta: "Crema para Peinar", paso: "Finalización", orden: 3 },
  Aceite: { etiqueta: "Aceite", paso: "Finalización", orden: 3 },
};

// Orden de rutina: limpieza → tratamiento → finalización; empates por orden del catálogo (id).
export function compararPorRutina(a: { tipoProducto: TipoProducto; id: number }, b: { tipoProducto: TipoProducto; id: number }) {
  return TIPOS_PRODUCTO[a.tipoProducto].orden - TIPOS_PRODUCTO[b.tipoProducto].orden || a.id - b.id;
}

// Colores por ritual (paleta de la clienta: tono claro de fondo + tono oscuro de texto).
// TODO: confirmar con la clienta qué par de colores corresponde a cada línea.
export type ColoresLinea = { claro: string; oscuro: string };

const COLORES_POR_RITUAL: Record<string, ColoresLinea> = {
  "Blonde Ritual": { claro: "#E9E1F4", oscuro: "#4E3487" },
  "Copper Ritual": { claro: "#F6DCCB", oscuro: "#9A3F22" },
  "Hydra Ritual": { claro: "#DFE8DA", oscuro: "#3F5C3D" },
  "Repair Ritual": { claro: "#F1E5D2", oscuro: "#735A3A" },
  "Growth Ritual": { claro: "#DCE5CF", oscuro: "#4A5A2E" },
  "The Complete Hair Ritual": { claro: "#F8DCE3", oscuro: "#A42A55" },
};

const COLORES_NEUTROS: ColoresLinea = { claro: "#EDE1CF", oscuro: "#6B4A2B" };

export function coloresDeLinea(nombreRitual: string): ColoresLinea {
  return COLORES_POR_RITUAL[nombreRitual] ?? COLORES_NEUTROS;
}

const formatoPesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function formatearPrecio(precio: { toString(): string } | null): string | null {
  return precio === null ? null : formatoPesos.format(Number(precio.toString()));
}
