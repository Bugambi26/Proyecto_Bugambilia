"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

export type PuntoMapa = { id: number; nombre: string; tipo: "Propia" | "Tercero"; latitud: number; longitud: number };

type Props = {
  sucursales: PuntoMapa[];
  // Sucursal abierta en el acordeón: el mapa se centra en ella cuando cambia.
  abierta: number | null;
  onSeleccionar: (id: number) => void;
};

const ZOOM_SUCURSAL = 16;

function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Marcador con el diseño del mockup (gota + etiqueta); la punta de la gota queda en la coordenada.
function icono(s: PuntoMapa) {
  const tercero = s.tipo === "Tercero" ? " map__pin--third" : "";
  return L.divIcon({
    className: "map__marker",
    iconSize: [0, 0],
    html: `<span class="map__pin${tercero}"><span class="map__pin-dot" aria-hidden="true"></span><span class="map__pin-label">${escaparHtml(s.nombre)}</span></span>`,
  });
}

// Mapa real con Leaflet + mosaicos de OpenStreetMap. Solo corre en el navegador
// (se importa con next/dynamic y ssr: false desde ListaSucursales).
export default function MapaSucursales({ sucursales, abierta, onSeleccionar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcadores = useRef(new Map<number, L.Marker>());
  const seleccionar = useRef(onSeleccionar);

  useEffect(() => {
    seleccionar.current = onSeleccionar;
  }, [onSeleccionar]);

  useEffect(() => {
    if (!contenedor.current || sucursales.length === 0) return;
    const m = L.map(contenedor.current, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);

    const lista = marcadores.current;
    for (const s of sucursales) {
      const marcador = L.marker([s.latitud, s.longitud], { icon: icono(s), keyboard: true })
        .addTo(m)
        .on("click", () => seleccionar.current(s.id));
      const el = marcador.getElement();
      el?.setAttribute("role", "button");
      el?.setAttribute("aria-label", `Ver ${s.nombre}`);
      lista.set(s.id, marcador);
    }

    const limites = L.latLngBounds(sucursales.map((s) => [s.latitud, s.longitud] as L.LatLngTuple));
    m.fitBounds(limites, { padding: [80, 80], maxZoom: ZOOM_SUCURSAL });
    mapa.current = m;

    return () => {
      m.remove();
      mapa.current = null;
      lista.clear();
    };
  }, [sucursales]);

  // Al abrir una tarjeta (o al tocar un marcador), centra el mapa en esa sucursal.
  const primeraVez = useRef(true);
  useEffect(() => {
    if (primeraVez.current) {
      // Al cargar se ven todas las sucursales, salvo que se llegue a una en concreto (?sucursal=).
      primeraVez.current = false;
      if (abierta === null || sucursales[0]?.id === abierta) return;
    }
    const m = mapa.current;
    const marcador = abierta === null ? undefined : marcadores.current.get(abierta);
    if (m && marcador) m.flyTo(marcador.getLatLng(), Math.max(m.getZoom(), ZOOM_SUCURSAL), { duration: 0.6 });
  }, [abierta, sucursales]);

  return <div ref={contenedor} className="map" />;
}
