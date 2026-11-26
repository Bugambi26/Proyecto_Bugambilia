"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAviso } from "../Aviso";
import { eliminarNecesidad, guardarNecesidad } from "./acciones";
import { validarNecesidad, type ErroresNecesidad } from "./validacionNecesidad";

export type NecesidadPanel = {
  id: number;
  nombre: string;
  descripcion: string;
  productos: { linea: string; cuantos: number }[];
  opciones: string[]; // textos de las opciones del árbol que la activan
};

const usos = (n: NecesidadPanel) => n.productos.reduce((t, p) => t + p.cuantos, 0) + n.opciones.length;

function resumenDeUso(n: NecesidadPanel) {
  const productos = n.productos.reduce((t, p) => t + p.cuantos, 0);
  const partes = [];
  if (productos) partes.push(`${productos} producto${productos === 1 ? "" : "s"}`);
  if (n.opciones.length) partes.push(`${n.opciones.length} opción${n.opciones.length === 1 ? "" : "es"} del árbol`);
  return partes.length ? partes.join(" · ") : "Sin usar";
}

// Next 16 conserva el estado de las páginas ya visitadas (<Activity>): al entrar de
// nuevo desde el menú, la pantalla empieza de cero.
export function PanelNecesidades(props: { necesidades: NecesidadPanel[] }) {
  const { bfcacheId } = useRouter();
  return <ListaYFormulario key={bfcacheId} {...props} />;
}

function ListaYFormulario({ necesidades }: { necesidades: NecesidadPanel[] }) {
  const [seleccion, setSeleccion] = useState<number | null>(necesidades[0]?.id ?? null); // null = nueva
  const [reinicio, setReinicio] = useState(0);
  const [pendiente, setPendiente] = useState<NecesidadPanel | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const { aviso, mostrar } = useAviso();
  const actual = necesidades.find((n) => n.id === seleccion) ?? null;

  function pedirEliminar(n: NecesidadPanel) {
    setPendiente(n);
    dialogo.current?.showModal();
  }

  async function alCerrarDialogo() {
    const n = pendiente;
    setPendiente(null);
    if (dialogo.current?.returnValue !== "confirmar" || !n) return;
    const r = await eliminarNecesidad(n.id).catch(() => ({ ok: false as const, mensaje: "No se pudo eliminar." }));
    if (r.ok && n.id === seleccion) setSeleccion(necesidades.find((x) => x.id !== n.id)?.id ?? null);
    mostrar(r.ok ? "Necesidad eliminada" : r.mensaje);
  }

  return (
    <>
      <section className="stack gap-16" aria-labelledby="t-necesidades" style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <div className="admin-head">
          <div className="stack gap-8">
            <h2 id="t-necesidades" style={{ fontSize: 22 }}>
              Necesidades
            </h2>
            <p className="hint" style={{ maxWidth: 640 }}>
              Cada respuesta del chatbot activa necesidades, y el chatbot recomienda los productos que las cubren. Las
              necesidades se ligan a los productos desde el formulario de cada producto.
            </p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setSeleccion(null)}>
            + Nueva necesidad
          </button>
        </div>

        <div className="form-layout">
          <div className="form-side item-list" style={{ order: -1 }}>
            {necesidades.length ? (
              necesidades.map((n) => (
                <article key={n.id} className="item" aria-current={n.id === seleccion}>
                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <span className="meta" style={{ fontSize: 11 }}>
                      {resumenDeUso(n)}
                    </span>
                    <strong style={{ fontSize: 16 }}>{n.nombre}</strong>
                    <span className="hint">{n.descripcion}</span>
                  </div>
                  <div className="row gap-8" style={{ flexWrap: "nowrap" }}>
                    <button type="button" className="btn btn--xs" style={{ flex: 1 }} onClick={() => setSeleccion(n.id)}>
                      Editar<span className="sr-only"> {n.nombre}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn--xs"
                      style={{ flex: 1 }}
                      onClick={() => pedirEliminar(n)}
                      disabled={usos(n) > 0}
                      title={usos(n) > 0 ? "Está en uso: primero quítala de sus productos y opciones" : undefined}
                    >
                      Eliminar<span className="sr-only"> {n.nombre}</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty">No hay necesidades. Agrega la primera.</p>
            )}
          </div>

          <FormularioNecesidad
            key={`${reinicio}-${actual ? JSON.stringify(actual) : "nueva"}`}
            necesidad={actual}
            alGuardar={(id) => {
              setSeleccion(id);
              mostrar("Necesidad guardada");
            }}
            alCancelar={() => {
              if (!actual) setSeleccion(necesidades[0]?.id ?? null);
              setReinicio((x) => x + 1);
            }}
          />
        </div>
      </section>

      <dialog className="dialog" ref={dialogo} aria-labelledby="t-eliminar" onClose={alCerrarDialogo}>
        <form method="dialog">
          <h2 id="t-eliminar">¿Eliminar «{pendiente?.nombre}»?</h2>
          <p>Ya no se podrá elegir en los productos ni en las opciones del chatbot. Esta acción no se puede deshacer.</p>
          <div className="dialog__actions">
            <button value="cancelar" className="btn">
              Cancelar
            </button>
            <button value="confirmar" className="btn btn--primary">
              Eliminar
            </button>
          </div>
        </form>
      </dialog>
      {aviso}
    </>
  );
}

function FormularioNecesidad({
  necesidad,
  alGuardar,
  alCancelar,
}: {
  necesidad: NecesidadPanel | null;
  alGuardar: (id: number) => void;
  alCancelar: () => void;
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const [errores, setErrores] = useState<ErroresNecesidad>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(formulario.current!);
    if (necesidad) datos.set("id", String(necesidad.id));
    setMensaje("");

    const local = validarNecesidad(datos);
    if ("errores" in local) {
      setErrores(local.errores);
      formulario.current?.querySelector<HTMLElement>(`[name="${local.errores.nombre ? "nombre" : "descripcion"}"]`)?.focus();
      return;
    }

    setEnviando(true);
    const r = await guardarNecesidad(datos).catch(() => ({
      ok: false as const,
      errores: {},
      mensaje: "No se pudo guardar. Revisa tu conexión e intenta de nuevo.",
    }));
    setEnviando(false);
    if (!r.ok) {
      setErrores(r.errores);
      setMensaje(r.mensaje ?? "");
      return;
    }
    alGuardar(r.id);
  }

  const hayErrores = Object.values(errores).some(Boolean);

  return (
    <form className="panel form-main" ref={formulario} onSubmit={guardar} noValidate>
      <h2 style={{ fontSize: 20 }}>{necesidad ? `Editar: ${necesidad.nombre}` : "Nueva necesidad"}</h2>
      <div className="field">
        <label htmlFor="n-nombre">Nombre *</label>
        <input
          id="n-nombre"
          name="nombre"
          className="input"
          required
          maxLength={60}
          placeholder="Ej. Cuero cabelludo graso"
          defaultValue={necesidad?.nombre}
          aria-invalid={errores.nombre ? true : undefined}
          aria-describedby={errores.nombre ? "n-nombre-error" : undefined}
        />
        {errores.nombre && (
          <span className="error" id="n-nombre-error">
            {errores.nombre}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="n-desc">Descripción *</label>
        <textarea
          id="n-desc"
          name="descripcion"
          className="input"
          rows={3}
          required
          placeholder="Ej. Equilibrar la grasa del cuero cabelludo y mantener el cabello limpio por más tiempo"
          defaultValue={necesidad?.descripcion}
          aria-invalid={errores.descripcion ? true : undefined}
          aria-describedby="n-desc-hint"
        />
        <span className="hint" id="n-desc-hint">
          El chatbot usa el nombre y la descripción para escribir sus recomendaciones: descríbela como se la explicarías
          a una clienta, sin prometer resultados.
        </span>
        {errores.descripcion && <span className="error">{errores.descripcion}</span>}
      </div>

      {necesidad && usos(necesidad) > 0 && (
        <div className="flow" aria-label="Dónde se usa">
          {necesidad.productos.map((p) => (
            <span key={p.linea}>
              {p.cuantos} producto{p.cuantos === 1 ? "" : "s"} de {p.linea}
            </span>
          ))}
          {necesidad.opciones.map((texto) => (
            <span key={texto}>Opción del árbol: «{texto}»</span>
          ))}
          <span className="warn">Mientras esté en uso no se puede eliminar.</span>
        </div>
      )}

      <p className="alert" role="alert" hidden={!hayErrores && !mensaje}>
        {mensaje || "Revisa los campos marcados."}
      </p>
      <div className="form-actions">
        <button type="button" className="btn" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar necesidad"}
        </button>
      </div>
    </form>
  );
}
