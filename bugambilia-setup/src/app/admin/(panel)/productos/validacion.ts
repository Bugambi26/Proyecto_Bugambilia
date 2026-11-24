import type { TipoProducto } from "@/generated/prisma/enums";
import { TIPOS_PRODUCTO } from "@/lib/catalogo";

// Reglas de alta y cambio (Fase 5, sección 2). Las usa el formulario para avisar
// al momento y la Server Action para no confiar en el navegador.

export type CampoProducto =
  | "nombre"
  | "lineaId"
  | "tipoProducto"
  | "ingredientes"
  | "beneficio"
  | "precio"
  | "stock"
  | "necesidades"
  | "imagen";

export type ErroresProducto = Partial<Record<CampoProducto, string>>;

export type ProductoValido = {
  nombre: string;
  lineaId: number;
  tipoProducto: TipoProducto;
  ingredientes: string;
  beneficio: string;
  contenidoNeto: string | null;
  precio: string | null; // "123.45"; Prisma lo guarda como Decimal
  stock: number;
  necesidades: number[];
};

export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB

export function validarProducto(f: FormData): { datos: ProductoValido } | { errores: ErroresProducto } {
  const texto = (campo: string) => String(f.get(campo) ?? "").trim();
  const errores: ErroresProducto = {};

  const nombre = texto("nombre");
  if (!nombre) errores.nombre = "Escribe el nombre.";

  const lineaId = Number(texto("lineaId"));
  if (!Number.isInteger(lineaId) || lineaId <= 0) errores.lineaId = "Elige una línea.";

  const tipo = texto("tipoProducto");
  if (!(tipo in TIPOS_PRODUCTO)) errores.tipoProducto = "Elige el tipo de producto.";

  const ingredientes = texto("ingredientes");
  if (!ingredientes) errores.ingredientes = "Escribe los ingredientes protagonistas.";

  const beneficio = texto("beneficio");
  if (!beneficio) errores.beneficio = "Escribe el beneficio principal.";

  // Precio opcional: si se escribe, número > 0 con hasta 2 decimales (acepta coma).
  const precioTxt = texto("precio").replace(",", ".");
  let precio: string | null = null;
  if (precioTxt) {
    const n = Number(precioTxt);
    if (!/^\d+(\.\d{1,2})?$/.test(precioTxt) || !(n > 0)) errores.precio = "El precio debe ser mayor a 0.";
    else precio = n.toFixed(2);
  }

  const stockTxt = texto("stock") || "0";
  const stock = Number(stockTxt);
  if (!/^\d+$/.test(stockTxt) || !Number.isSafeInteger(stock)) errores.stock = "El stock es un número entero desde 0.";

  const necesidades = [...new Set(f.getAll("necesidades").map(Number))].filter((n) => Number.isInteger(n) && n > 0);
  if (!necesidades.length) errores.necesidades = "Elige al menos una necesidad.";

  const imagen = f.get("imagen");
  if (imagen instanceof File && imagen.size > 0) {
    if (!TIPOS_IMAGEN.includes(imagen.type)) errores.imagen = "La imagen debe ser JPG, PNG o WebP.";
    else if (imagen.size > MAX_IMAGEN) errores.imagen = "La imagen pesa más de 5 MB.";
  }

  if (Object.keys(errores).length) return { errores };
  return {
    datos: {
      nombre,
      lineaId,
      tipoProducto: tipo as TipoProducto,
      ingredientes,
      beneficio,
      contenidoNeto: texto("contenidoNeto") || null,
      precio,
      stock,
      necesidades,
    },
  };
}
