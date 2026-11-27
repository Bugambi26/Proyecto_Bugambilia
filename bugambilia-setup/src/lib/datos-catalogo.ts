import "server-only";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { compararPorRutina, etiquetaNumerada, formatearPrecio } from "@/lib/catalogo";
import type { TipoProducto } from "@/generated/prisma/enums";

// Consultas del sitio público. Solo productos activos (los inactivos no se muestran en
// ningún lado). `connection()` hace que se consulte en cada visita y nunca en el build,
// para que un cambio de stock en el panel se vea al instante.
// Se devuelven objetos simples (sin Decimal) para poder pasarlos a componentes de cliente.

export type LineaVista = {
  id: number;
  nombre: string;
  nombreRitual: string;
  descripcion: string;
  numerada: string; // "01 · Rubios perfectos"
  precioRitual: string | null; // precio del ritual completo, ya formateado; null = no se muestra
};

export type ProductoVista = {
  id: number;
  nombre: string;
  tipoProducto: TipoProducto;
  ingredientes: string;
  beneficio: string;
  contenidoNeto: string | null;
  precio: string | null; // ya formateado; null = no se muestra
  imagenUrl: string | null;
  disponible: boolean;
  linea: LineaVista;
};

type ProductoBD = Awaited<ReturnType<typeof prisma.producto.findMany>>[number];

function aVista(p: ProductoBD, linea: LineaVista): ProductoVista {
  return {
    id: p.id,
    nombre: p.nombre,
    tipoProducto: p.tipoProducto,
    ingredientes: p.ingredientesProtagonistas,
    beneficio: p.beneficioPrincipal,
    contenidoNeto: p.contenidoNeto,
    precio: formatearPrecio(p.precio),
    imagenUrl: p.imagenUrl,
    disponible: p.stock > 0,
    linea,
  };
}

async function lineasYProductos() {
  await connection();
  const lineas = await prisma.linea.findMany({
    orderBy: { id: "asc" },
    include: { productos: { where: { activo: true } } },
  });
  // Una línea sin productos activos no se muestra (p. ej. Gotas de Oro mientras su producto
  // espera los datos de la clienta). Se filtra antes de numerarlas para no saltar números.
  return lineas
    .filter((l) => l.productos.length > 0)
    .map((l, i) => {
    const vista: LineaVista = {
      id: l.id,
      nombre: l.nombre,
      nombreRitual: l.nombreRitual,
      descripcion: l.descripcion,
      numerada: etiquetaNumerada(i + 1, l.nombre),
      precioRitual: formatearPrecio(l.precioRitual),
    };
    return { ...vista, productos: [...l.productos].sort(compararPorRutina).map((p) => aVista(p, vista)) };
    });
}

export type LineaConProductos = Awaited<ReturnType<typeof lineasYProductos>>[number];

export const obtenerLineasConProductos = lineasYProductos;

export async function obtenerProducto(id: number) {
  const lineas = await lineasYProductos();
  for (const l of lineas) {
    const producto = l.productos.find((p) => p.id === id);
    if (producto) return { producto, otros: l.productos.filter((p) => p.id !== id) };
  }
  return null; // inexistente o inactivo
}

export async function obtenerSucursales() {
  await connection();
  return prisma.sucursal.findMany({
    orderBy: { id: "asc" },
    include: { horarios: { orderBy: { diaSemana: "asc" } } },
  });
}

export type SucursalVista = Awaited<ReturnType<typeof obtenerSucursales>>[number];
