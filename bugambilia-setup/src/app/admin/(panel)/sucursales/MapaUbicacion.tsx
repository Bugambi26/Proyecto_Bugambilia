"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

type Props = {
  latitud: number | null;
  longitud: number | null;
  // Clic en el mapa: mueve el marcador y llena latitud y longitud.
  onElegir: (latitud: number, longitud: number) => void;
};

// Centro de Aguascalientes, para cuando la sucursal aún no tiene coordenadas.
const CENTRO: L.LatLngTuple = [21.8818, -102.2916];
const ZOOM_PUNTO = 16;

// Vista previa del punto (Fase 5: coordenadas copiadas de Google Maps "con vista
// previa del punto en el mapa"). Mismo Leaflet + OpenStreetMap que el sitio público.
// Solo corre en el navegador (se importa con next/dynamic y ssr: false).
export default function MapaUbicacion({ latitud, longitud, onElegir }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcador = useRef<L.CircleMarker | null>(null);
  const elegir = useRef(onElegir);

  useEffect(() => {
    elegir.current = onElegir;
  }, [onElegir]);

  useEffect(() => {
    if (!contenedor.current) return;
    const m = L.map(contenedor.current, { scrollWheelZoom: false }).setView(CENTRO, 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.on("click", (e) => elegir.current(Number(e.latlng.lat.toFixed(7)), Number(e.latlng.lng.toFixed(7))));
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      marcador.current = null;
    };
  }, []);

  // Pinta (o quita) el marcador cuando cambian las coordenadas escritas o elegidas.
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (latitud === null || longitud === null) {
      marcador.current?.remove();
      marcador.current = null;
      return;
    }
    const punto: L.LatLngTuple = [latitud, longitud];
    if (marcador.current) marcador.current.setLatLng(punto);
    else
      marcador.current = L.circleMarker(punto, {
        radius: 9,
        color: "#3e2a1f",
        weight: 3,
        fillColor: "#b98a4b",
        fillOpacity: 1,
      }).addTo(m);
    m.setView(punto, Math.max(m.getZoom(), ZOOM_PUNTO));
  }, [latitud, longitud]);

  // isolation: las capas de Leaflet (z-index altos) no deben quedar sobre el diálogo ni el aviso.
  return <div ref={contenedor} className="ph map-picker" style={{ height: 260, isolation: "isolate", zIndex: 0 }} />;
}
