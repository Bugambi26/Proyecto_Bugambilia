"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ImagenProducto } from "@/components/ImagenProducto";
import { useAviso } from "../Aviso";
import { ajustarStock, cambiarActivo } from "./acciones";

export type FilaInventario = {
  id: number;
  nombre: string;
  lineaId: number;
  linea: string;
  precio: string | null; // ya formateado; null = sin precio
  imagenUrl: string | null;
  stock: number;
  activo: boolean;
};

type Vista = "activos" | "inactivos" | "todos";

const POR_PAGINA = 10;

// Resumen, filtros, tabla, paginación y diálogo de baja de admin/inventario.html.
export function TablaInventario({
  productosIniciales,
  lineas,
}: {
  productosIniciales: FilaInventario[];
  lineas: { id: number; nombre: string }[];
}) {
  const [productos, setProductos] = useState(productosIniciales);
  // Next 16 conserva el estado de la tabla al salir y volver (<Activity>), así que
  // cuando el servidor manda datos nuevos (p. ej. al regresar del formulario) se
  // toman aquí. Búsqueda, filtros y página se conservan.
  const [recibidos, setRecibidos] = useState(productosIniciales);
  if (productosIniciales !== recibidos) {
    setRecibidos(productosIniciales);
    setProductos(productosIniciales);
  }
  const [busqueda, setBusqueda] = useState("");
  const [linea, setLinea] = useState("todas");
  const [vista, setVista] = useState<Vista>("activos");
  const [pagina, setPagina] = useState(1);
  const [pendienteBaja, setPendienteBaja] = useState<FilaInventario | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const { aviso, mostrar } = useAviso();

  function actualizar(id: number, cambios: Partial<FilaInventario>) {
    setProductos((lista) => lista.map((p) => (p.id === id ? { ...p, ...cambios } : p)));
  }

  // Se pinta el cambio al instante y luego se corrige con el valor de la base.
  async function sumar(p: FilaInventario, delta: 1 | -1) {
    if (delta === -1 && p.stock === 0) return;
    actualizar(p.id, { stock: p.stock + delta });
    try {
      actualizar(p.id, { stock: await ajustarStock(p.id, delta) });
    } catch {
      actualizar(p.id, { stock: p.stock });
      mostrar("No se pudo guardar el stock");
    }
  }

  async function activar(p: FilaInventario, activo: boolean) {
    try {
      await cambiarActivo(p.id, activo);
      actualizar(p.id, { activo });
      mostrar(activo ? "Producto reactivado" : `«${p.nombre}» dado de baja`);
    } catch {
      mostrar("No se pudo guardar el cambio");
    }
  }

  function pedirBaja(p: FilaInventario) {
    setPendienteBaja(p);
    dialogo.current?.showModal();
  }

  function alCerrarDialogo() {
    if (dialogo.current?.returnValue === "confirmar" && pendienteBaja) {
      activar(pendienteBaja, false);
    }
    setPendienteBaja(null);
  }

  const texto = busqueda.trim().toLowerCase();
  const filtrados = productos.filter(
    (p) =>
      (vista === "todos" || (vista === "activos" ? p.activo : !p.activo)) &&
      (linea === "todas" || String(p.lineaId) === linea) &&
      (!texto || p.nombre.toLowerCase().includes(texto)),
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Activos</span>
          <strong>{productos.filter((p) => p.activo).length}</strong>
        </div>
        <div className="stat">
          <span>Agotados (stock 0)</span>
          <strong>{productos.filter((p) => p.activo && p.stock === 0).length}</strong>
        </div>
        <div className="stat">
          <span>Dados de baja (inactivos)</span>
          <strong>{productos.filter((p) => !p.activo).length}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="field" style={{ flex: "1 1 240px" }}>
          <label htmlFor="q">Buscar</label>
          <input
            id="q"
            type="search"
            className="input"
            placeholder="Nombre del producto"
            autoComplete="off"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="fl">Línea</label>
          <select
            id="fl"
            className="input"
            value={linea}
            onChange={(e) => {
              setLinea(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todas">Todas</option>
            {lineas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fe">Estado</label>
          <select
            id="fe"
            className="input"
            value={vista}
            onChange={(e) => {
              setVista(e.target.value as Vista);
              setPagina(1);
            }}
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">Productos del inventario</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Línea</th>
              <th scope="col">Precio</th>
              <th scope="col">Stock</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length ? (
              visibles.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-prod">
                      <ImagenProducto imagenUrl={p.imagenUrl} className="thumb" sizes="44px" />
                      <strong>{p.nombre}</strong>
                    </div>
                  </td>
                  <td className="muted">{p.linea}</td>
                  <td>{p.precio ?? <span className="muted">—</span>}</td>
                  <td>
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => sumar(p, -1)}
                        aria-label={`Restar una pieza a ${p.nombre}`}
                      >
                        −
                      </button>
                      <output aria-live="polite">{p.stock}</output>
                      <button type="button" onClick={() => sumar(p, 1)} aria-label={`Sumar una pieza a ${p.nombre}`}>
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    {!p.activo ? (
                      <span className="badge badge--out">Inactivo</span>
                    ) : p.stock === 0 ? (
                      <span className="badge badge--out">Agotado</span>
                    ) : (
                      <span className="badge">Activo</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <Link className="btn btn--xs" href={`/admin/productos/${p.id}`}>
                        Editar
                      </Link>
                      {p.activo ? (
                        <button type="button" className="btn btn--xs" onClick={() => pedirBaja(p)}>
                          Dar de baja
                        </button>
                      ) : (
                        <button type="button" className="btn btn--xs" onClick={() => activar(p, true)}>
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
                  No hay productos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span aria-live="polite">
          {filtrados.length
            ? `Mostrando ${inicio + 1}–${inicio + visibles.length} de ${filtrados.length} productos`
            : "Sin resultados"}
        </span>
        <div className="pager__pages">
          {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className="btn btn--sm"
              aria-current={n === paginaActual ? "page" : undefined}
              aria-label={`Página ${n}`}
              onClick={() => setPagina(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <p className="note">
        «Dar de baja» desactiva el producto (lo oculta del sitio) sin borrarlo; se puede reactivar desde el filtro
        «Inactivos».
      </p>

      {/* Confirmación de baja: <dialog> nativo del navegador */}
      <dialog className="dialog" ref={dialogo} aria-labelledby="t-baja" onClose={alCerrarDialogo}>
        <form method="dialog">
          <h2 id="t-baja">¿Dar de baja «{pendienteBaja?.nombre}»?</h2>
          <p>
            Dejará de mostrarse en el catálogo y en las recomendaciones del chatbot. No se borra: podrás reactivarlo
            después.
          </p>
          <div className="dialog__actions">
            <button value="cancelar" className="btn">
              Cancelar
            </button>
            <button value="confirmar" className="btn btn--primary">
              Dar de baja
            </button>
          </div>
        </form>
      </dialog>
      {aviso}
    </>
  );
}
