import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { PanelSucursales, type SucursalPanel } from "./PanelSucursales";

export const metadata: Metadata = {
  title: "Sucursales",
};

// Cada página del panel lo lleva: con una sesión vencida, la validación de
// navegación instantánea de dev choca con la redirección al login.
export const instant = false;

// Igual a admin/sucursales.html: lista de sucursales y su formulario en la misma página.
export default async function Sucursales() {
  await connection();
  const datos = await prisma.sucursal.findMany({
    orderBy: { id: "asc" },
    include: { horarios: { orderBy: { diaSemana: "asc" } } },
  });

  // Objetos simples para el componente de cliente.
  const sucursales: SucursalPanel[] = datos.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    tipo: s.tipo,
    direccion: s.direccion,
    latitud: s.latitud,
    longitud: s.longitud,
    telefono: s.telefono,
    whatsapp: s.whatsapp,
    instagram: s.instagram,
    fotoUrl: s.fotoUrl,
    notaHorario: s.notaHorario,
    horarios: s.horarios.map(({ diaSemana, horaApertura, horaCierre }) => ({ diaSemana, horaApertura, horaCierre })),
  }));

  return <PanelSucursales sucursales={sucursales} />;
}
