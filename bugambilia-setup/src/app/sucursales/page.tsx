import type { Metadata } from "next";
import { Suspense } from "react";
import { ListaSucursales } from "@/components/ListaSucursales";
import { obtenerSucursales } from "@/lib/datos-catalogo";
import { diaDeHoy } from "@/lib/horarios";

export const metadata: Metadata = {
  title: "Sucursales",
  description: "Visita Estética Bugambilia o encuentra la Línea Bugambilia en nuestro punto de venta.",
};

export default function Sucursales({ searchParams }: PageProps<"/sucursales">) {
  return (
    <>
      <section className="container stack gap-10" style={{ paddingTop: 48, paddingBottom: 24 }}>
        <span className="lbl">Sucursales</span>
        <h1 className="title-lg">Dónde encontrarnos</h1>
        <p style={{ fontSize: 16, color: "var(--ink-2)" }}>
          Visítanos en la estética o encuentra la Línea Bugambilia en nuestro punto de venta.
        </p>
      </section>
      <section className="container branches" style={{ paddingBottom: 64 }}>
        <Suspense fallback={<p className="text">Cargando sucursales…</p>}>
          <SucursalesConDatos searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function SucursalesConDatos({ searchParams }: { searchParams: PageProps<"/sucursales">["searchParams"] }) {
  const { sucursal } = await searchParams;
  const id = Number(Array.isArray(sucursal) ? sucursal[0] : sucursal);
  const sucursales = await obtenerSucursales();
  const inicial = sucursales.some((s) => s.id === id) ? id : null;
  return <ListaSucursales sucursales={sucursales} hoy={diaDeHoy()} inicial={inicial} />;
}
