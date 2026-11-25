"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { ORDEN_FILTRO_TIPOS, TIPOS_PRODUCTO, aparienciaDeLinea, estiloLinea } from "@/lib/catalogo";
import type { LineaConProductos } from "@/lib/datos-catalogo";
import type { TipoProducto } from "@/generated/prisma/enums";

type Props = { lineas: LineaConProductos[]; lineaInicial: number | null };

// Catálogo del mockup: búsqueda + filtro por línea + casillas de tipo, combinables.
// La línea elegida se guarda en la URL (?linea=) para poder compartir el enlace.
export function Catalogo({ lineas, lineaInicial }: Props) {
  const [lineaId, setLineaId] = useState<number | null>(lineaInicial);
  const [busqueda, setBusqueda] = useState("");
  const [tipos, setTipos] = useState<TipoProducto[]>([]);

  const todos = useMemo(() => lineas.flatMap((l) => l.productos), [lineas]);
  const tiposExistentes = ORDEN_FILTRO_TIPOS.filter((t) => todos.some((p) => p.tipoProducto === t));
  const linea = lineas.find((l) => l.id === lineaId) ?? null;

  const q = busqueda.trim().toLowerCase();
  const lista = todos.filter(
    (p) =>
      (!linea || p.linea.id === linea.id) &&
      (tipos.length === 0 || tipos.includes(p.tipoProducto)) &&
      (!q || `${p.nombre} ${p.linea.nombreRitual} ${TIPOS_PRODUCTO[p.tipoProducto].etiqueta}`.toLowerCase().includes(q)),
  );

  function elegirLinea(id: number | null) {
    setLineaId(id);
    window.history.replaceState(null, "", id === null ? "/productos" : `/productos?linea=${id}`);
  }

  function alternarTipo(t: TipoProducto, marcado: boolean) {
    setTipos((actual) => (marcado ? [...actual, t] : actual.filter((x) => x !== t)));
  }

  return (
    <>
      {/* ===== Filtros ===== */}
      <aside className="card filters" aria-label="Filtros">
        <div className="field">
          <label htmlFor="buscar" className="filters__title">
            Buscar
          </label>
          <input
            id="buscar"
            type="search"
            className="input"
            placeholder="Shampoo, mascarilla…"
            autoComplete="off"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filters__group" role="group" aria-labelledby="t-linea">
          <span id="t-linea" className="filters__title">
            Línea
          </span>
          <div className="stack gap-8">
            <button type="button" className="filter-btn" aria-pressed={!linea} onClick={() => elegirLinea(null)}>
              Todas
            </button>
            {lineas.map((l) => (
              <button
                key={l.id}
                type="button"
                className="filter-btn"
                aria-pressed={linea?.id === l.id}
                style={estiloLinea(l.nombre)}
                onClick={() => elegirLinea(l.id)}
              >
                {l.nombre}
              </button>
            ))}
          </div>
        </div>
        <fieldset className="filters__group" style={{ border: "none", margin: 0, padding: 0 }}>
          <legend className="filters__title" style={{ padding: 0, marginBottom: 8 }}>
            Tipo de producto
          </legend>
          <div>
            {tiposExistentes.map((t) => (
              <label key={t} className="check">
                <input type="checkbox" checked={tipos.includes(t)} onChange={(e) => alternarTipo(t, e.target.checked)} />{" "}
                {TIPOS_PRODUCTO[t].etiqueta}
              </label>
            ))}
          </div>
        </fieldset>
      </aside>

      {/* ===== Resultados ===== */}
      <div className="catalog__results">
        <div className="row between gap-12">
          <p style={{ fontSize: 15, color: "var(--ink-2)" }} aria-live="polite">
            Mostrando <strong>{lista.length}</strong> productos · <span>{linea ? linea.nombre : "Todas las líneas"}</span>
          </p>
        </div>

        {linea && (
          <section className="card line-banner" style={estiloLinea(linea.nombre)}>
            <Image
              className="ph line-banner__img"
              src={aparienciaDeLinea(linea.nombre).img}
              alt={`Productos de la línea ${linea.nombre}`}
              width={1200}
              height={900}
              sizes="(min-width: 900px) 420px, 100vw"
            />
            <div className="line-banner__body">
              <span className="meta">
                {linea.numerada} · {linea.nombreRitual}
              </span>
              <h2 className="title-sm">{linea.nombre}</h2>
              <p className="text">{linea.descripcion}</p>
              {linea.productos[0]?.ingredientes && (
                <span className="small">Ingrediente protagonista: {linea.productos[0].ingredientes}</span>
              )}
              {linea.precioRitual && (
                <p className="row gap-10" style={{ alignItems: "baseline", margin: 0 }}>
                  <span className="detail__price">{linea.precioRitual}</span>
                  <span className="small">ritual completo · {linea.productos.length} productos · IVA incluido</span>
                </p>
              )}
            </div>
          </section>
        )}

        <div className="grid product-grid">
          {lista.length ? (
            lista.map((p) => <TarjetaProducto key={p.id} producto={p} />)
          ) : (
            <p className="empty" style={{ gridColumn: "1 / -1" }}>
              No hay productos con esos filtros.
            </p>
          )}
        </div>

        <div className="callout callout--sm" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 16 }}>¿No sabes cuál elegir? El asistente te recomienda según tu cabello.</span>
          <button type="button" className="btn btn--primary" data-open-chat>
            Hablar con el asistente
          </button>
        </div>
      </div>
    </>
  );
}
