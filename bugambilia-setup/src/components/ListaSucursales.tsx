"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DIAS_SEMANA, formatoHorario } from "@/lib/horarios";

export type SucursalCliente = {
  id: number;
  nombre: string;
  tipo: "Propia" | "Tercero";
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  fotoUrl: string | null;
  notaHorario: string | null; // si existe, se muestra en lugar de la tabla de horario
  horarios: { diaSemana: number; horaApertura: string; horaCierre: string }[];
};

// Leaflet usa window: el mapa se carga solo en el navegador; mientras, se ve el recuadro del mockup.
const MapaSucursales = dynamic(() => import("@/components/MapaSucursales"), {
  ssr: false,
  loading: () => <div className="ph map" aria-hidden="true" />,
});

// Mapa + acordeón del mockup (una tarjeta abierta a la vez; los marcadores la abren y
// abrir una tarjeta centra el mapa en esa sucursal).
type Props = {
  sucursales: SucursalCliente[];
  hoy: number;
  inicial: number | null;
};

// Next 16 conserva el estado de las páginas ya visitadas (<Activity>): sin esta llave, al
// llegar desde una tarjeta del inicio (?sucursal=2) seguía abierta la sucursal de la visita
// anterior. bfcacheId cambia en cada navegación nueva y no al usar atrás/adelante.
export function ListaSucursales(props: Props) {
  const { bfcacheId } = useRouter();
  return <ListaYMapa key={bfcacheId} {...props} />;
}

function ListaYMapa({ sucursales, hoy, inicial }: Props) {
  // Abre la sucursal del enlace (?sucursal=2) al llegar desde el inicio; si no, la primera.
  const [abierta, setAbierta] = useState<number | null>(inicial ?? sucursales[0]?.id ?? null);

  // Solo van al mapa las sucursales con coordenadas (la estética no publica su dirección).
  const puntos = useMemo(
    () =>
      sucursales.flatMap((s) =>
        s.latitud !== null && s.longitud !== null ? [{ ...s, latitud: s.latitud, longitud: s.longitud }] : [],
      ),
    [sucursales],
  );

  const abrirDesdeMapa = useCallback((id: number) => {
    setAbierta(id);
    document.getElementById(`sucursal-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <>
      {puntos.length > 0 && <MapaSucursales sucursales={puntos} abierta={abierta} onSeleccionar={abrirDesdeMapa} />}

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
                    {s.direccion && <span className="small">{s.direccion}</span>}
                  </div>
                </button>
                <div className="branch__body" id={`b-${s.id}`} hidden={!on}>
                  {/* Con nota (la estética: solo con cita), la nota va en lugar de la tabla. Sin nota ni
                      horarios no se muestra nada (la tabla diría "Cerrado" toda la semana). */}
                  {s.notaHorario ? (
                    <div className="stack" style={{ gap: 6, fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>Horario</span>
                      <p style={{ margin: 0, color: "var(--ink-2)" }}>{s.notaHorario}</p>
                    </div>
                  ) : (
                    s.horarios.length > 0 && (
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
                    )
                  )}
                  {/* Solo se muestran los botones que tienen datos (sin enlaces vacíos). */}
                  <div className="row gap-10">
                    {wa && (
                      <a
                        className="btn btn--primary btn--sm"
                        href={`https://wa.me/52${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    )}
                    {tel && (
                      <a className="btn btn--sm" href={`tel:+52${tel}`}>
                        Llamar · {tel.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")}
                      </a>
                    )}
                    {s.instagram && (
                      <a className="btn btn--sm" href={s.instagram} target="_blank" rel="noopener noreferrer">
                        Instagram
                      </a>
                    )}
                    {s.latitud !== null && s.longitud !== null && (
                      <a
                        className="btn btn--sm"
                        href={`https://www.google.com/maps/search/?api=1&query=${s.latitud},${s.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Cómo llegar
                      </a>
                    )}
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
