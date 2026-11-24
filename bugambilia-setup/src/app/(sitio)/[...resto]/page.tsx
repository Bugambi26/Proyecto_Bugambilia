import { notFound } from "next/navigation";

// Cualquier URL que no exista cae aquí para mostrar (sitio)/not-found.tsx
// con el encabezado y el pie del sitio. Sin esto, Next usaría su 404 genérico,
// porque el layout raíz ya no lleva la estructura del sitio público.
// instant = false: el notFound() a propósito no es un error de validación.
export const instant = false;

export default function RutaInexistente() {
  notFound();
}
