"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import { DIAS_SEMANA, formatoHorario } from "@/lib/horarios";

export type SucursalCliente = {
  id: number;
  nombre: string;
  tipo: "Propia" | "Tercero";
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string | null;
  whatsapp: string | null;
  fotoUrl: string | null;
  horarios: { diaSemana: number; horaApertura: string; horaCierre: string }[];
};

// Leaflet usa window: el mapa se carga solo en el navegador; mientras, se ve el recuadro del mockup.
const MapaSucursales = dynamic(() => import("@/components/MapaSucursales"), {
  ssr: false,
  loading: () => <div className="ph map" aria-hidden="true" />,
});

// Mapa + acordeón del mockup (una tarjeta abierta a la vez; los marcadores la abren y
// abrir una tarjeta centra el mapa en esa sucursal).
type Props = { sucursales: SucursalCliente[]; hoy: number; inicial: number | null };

export function ListaSucursales({ sucursales, hoy, inicial }: Props) {
  // Abre la sucursal del enlace (?sucursal=2) al llegar desde el inicio; si no, la primera.
  const [abierta, setAbierta] = useState<number | null>(inicial ?? sucursales[0]?.id ?? null);

  const abrirDesdeMapa = useCallback((id: number) => {
    setAbierta(id);
    document.getElementById(`sucursal-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <>
      <MapaSucursales sucursales={sucursales} abierta={abierta} onSeleccionar={abrirDesdeMapa} />

      <div className="branch-list">
        <div className="stack gap-16">
          {sucursales.map((s) => {
            const on = abierta === s.id;
            const tel = (s.telefono ?? "").replace(/\D/g, "");
            const wa = (s.whatsapp ?? "").replace(/\D/g, "");
            return (
              <article key={s.id} className="card branch" id={`sucursal-${s.id}`} data-open={on}>
                <button
                  type="button"
                  className="branch__toggle"
                  aria-expanded={on}
                  aria-controls={`b-${s.id}`}
                  onClick={() => setAbierta(on ? null : s.id)}
                >
                  {s.fotoUrl ? (
                    <Image className="ph" src={s.fotoUrl} alt="" width={72} height={72} />
                  ) : (
                    <div className="ph" aria-hidden="true">
                      Foto
                    </div>
                  )}
                  <div className="stack" style={{ gap: 4 }}>
                    <span className="meta" style={{ fontSize: 11.5 }}>
                      {s.tipo === "Propia" ? "Establecimiento propio" : "Punto de venta · tercero"}
                    </span>
                    <span className="branch__name">{s.nombre}</span>
                    <span className="small">{s.direccion}</span>
                  </div>
                </button>
                <div className="branch__body" id={`b-${s.id}`} hidden={!on}>
                  <table className="hours">
                    <caption>Horario</caption>
                    <tbody>
                      {DIAS_SEMANA.map((dia, i) => (
                        <tr key={dia} aria-current={i + 1 === hoy ? "date" : undefined}>
                          <th scope="row">{dia}</th>
                          <td>{formatoHorario(s.horarios, i + 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Solo se muestran los botones que tienen datos (sin enlaces vacíos). */}
                  <div className="row gap-10">
                    {wa && (
                      <a className="btn btn--primary btn--sm" href={`https://wa.me/52${wa}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    )}
                    {tel && (
                      <a className="btn btn--sm" href={`tel:${tel}`}>
                        Llamar · {s.telefono}
                      </a>
                    )}
                    <a
                      className="btn btn--sm"
                      href={`https://www.google.com/maps/search/?api=1&query=${s.latitud},${s.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cómo llegar
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="note">La disponibilidad de cada producto es general (stock global), no por sucursal.</p>
      </div>
    </>
  );
}
