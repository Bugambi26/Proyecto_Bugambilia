"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { MAX_OPCIONES, MIN_OPCIONES } from "@/lib/chatbot/arbol";
import { useAviso } from "../Aviso";
import { eliminarPregunta, guardarPregunta } from "./accionesArbol";
import {
  arbolConCambio,
  ID_NUEVA,
  motivoParaNoEliminar,
  revisarArbol,
  type OpcionEditable,
  type PreguntaEditable,
} from "./reglasArbol";

type Necesidad = { id: number; nombre: string };

// Next 16 conserva el estado de las páginas ya visitadas (<Activity>): al entrar de
// nuevo desde el menú, el editor empieza de cero.
export function EditorArbol(props: { preguntas: PreguntaEditable[]; necesidades: Necesidad[] }) {
  const { bfcacheId } = useRouter();
  return <ListaYFormulario key={bfcacheId} {...props} />;
}

// Lista de preguntas + formulario de admin/arbol.html.
function ListaYFormulario({ preguntas, necesidades }: { preguntas: PreguntaEditable[]; necesidades: Necesidad[] }) {
  const inicial = preguntas.find((p) => p.esInicial) ?? preguntas[0];
  const [seleccion, setSeleccion] = useState<number>(inicial?.id ?? ID_NUEVA);
  const [reinicio, setReinicio] = useState(0);
  const dialogo = useRef<HTMLDialogElement>(null);
  const { aviso, mostrar } = useAviso();
  const actual = preguntas.find((p) => p.id === seleccion) ?? null;

  async function alCerrarDialogo() {
    if (dialogo.current?.returnValue !== "confirmar" || !actual) return;
    const r = await eliminarPregunta(actual.id).catch(() => ({ ok: false as const, mensaje: "No se pudo eliminar." }));
    if (r.ok) setSeleccion(preguntas.find((p) => p.id !== actual.id && p.esInicial)?.id ?? ID_NUEVA);
    mostrar(r.ok ? "Pregunta eliminada" : r.mensaje);
  }

  return (
    <section className="stack gap-16" aria-labelledby="t-preguntas">
      <div className="admin-head">
        <h2 id="t-preguntas" style={{ fontSize: 22 }}>
          Preguntas
        </h2>
        <div className="row gap-10">
          <Link href="/" className="btn" target="_blank">
            Probar el chatbot
          </Link>
          <button type="button" className="btn btn--primary" onClick={() => setSeleccion(ID_NUEVA)}>
            + Nueva pregunta
          </button>
        </div>
      </div>

      <div className="form-layout">
        <div className="panel form-side stack gap-8" style={{ padding: 16, order: -1 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Preguntas</span>
          <span className="hint">El chatbot empieza por la inicial y sigue a donde lleva cada opción.</span>
          <div className="stack gap-8">
            {preguntas.map((p) => (
              <button
                key={p.id}
                type="button"
                className="q-btn"
                aria-current={p.id === seleccion}
                onClick={() => setSeleccion(p.id)}
              >
                <strong>{p.texto}</strong>
                <span>
                  {p.esInicial ? "Inicial · " : ""}
                  {p.opciones.length} opciones
                </span>
              </button>
            ))}
            {seleccion === ID_NUEVA && (
              <button type="button" className="q-btn" aria-current>
                <strong>Nueva pregunta</strong>
                <span>Sin guardar</span>
              </button>
            )}
          </div>
        </div>

        <FormularioPregunta
          key={`${reinicio}-${actual ? JSON.stringify(actual) : "nueva"}`}
          pregunta={actual}
          preguntas={preguntas}
          necesidades={necesidades}
          alGuardar={(id, avisos) => {
            setSeleccion(id);
            mostrar(avisos.length ? "Pregunta guardada (revisa el aviso del flujo)" : "Pregunta guardada");
          }}
          alCancelar={() => {
            if (!actual) setSeleccion(inicial?.id ?? ID_NUEVA);
            setReinicio((n) => n + 1);
          }}
          alEliminar={() => dialogo.current?.showModal()}
        />
      </div>

      <dialog className="dialog" ref={dialogo} aria-labelledby="t-eliminar-p" onClose={alCerrarDialogo}>
        <form method="dialog">
          <h2 id="t-eliminar-p">¿Eliminar «{actual?.texto}»?</h2>
          <p>Se borran también sus opciones. Esta acción no se puede deshacer.</p>
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
    </section>
  );
}

const opcionVacia = (): OpcionEditable => ({ texto: "", siguienteId: null, necesidades: [] });

function FormularioPregunta({
  pregunta,
  preguntas,
  necesidades,
  alGuardar,
  alCancelar,
  alEliminar,
}: {
  pregunta: PreguntaEditable | null;
  preguntas: PreguntaEditable[];
  necesidades: Necesidad[];
  alGuardar: (id: number, avisos: string[]) => void;
  alCancelar: () => void;
  alEliminar: () => void;
}) {
  const [texto, setTexto] = useState(pregunta?.texto ?? "");
  const [esInicial, setEsInicial] = useState(pregunta?.esInicial ?? preguntas.length === 0);
  const [opciones, setOpciones] = useState<OpcionEditable[]>(
    pregunta?.opciones.map((o) => ({ ...o, necesidades: [...o.necesidades] })) ?? [opcionVacia(), opcionVacia()],
  );
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const id = pregunta?.id ?? ID_NUEVA;
  const borrador: PreguntaEditable = { id, texto, esInicial, opciones };
  // Avisos en vivo (regla 4) sobre el árbol como quedaría con este borrador.
  const { avisos } = revisarArbol(arbolConCambio(preguntas, borrador));
  const motivo = pregunta ? motivoParaNoEliminar(preguntas, pregunta.id) : null;
  const otras = preguntas.filter((p) => p.id !== id);
  const nombreNecesidad = (n: number) => necesidades.find((x) => x.id === n)?.nombre ?? `#${n}`;
  const nombrePregunta = (n: number | null) =>
    n === null ? "Fin: el chatbot recomienda" : `«${preguntas.find((p) => p.id === n)?.texto ?? "?"}»`;

  function cambiarOpcion(i: number, cambio: Partial<OpcionEditable>) {
    setOpciones((lista) => lista.map((o, j) => (j === i ? { ...o, ...cambio } : o)));
  }

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const revision = revisarArbol(arbolConCambio(preguntas, borrador));
    if (revision.errores.length) {
      setErrores(revision.errores);
      return;
    }
    setEnviando(true);
    const r = await guardarPregunta(borrador).catch(() => ({
      ok: false as const,
      errores: ["No se pudo guardar. Revisa tu conexión e intenta de nuevo."],
    }));
    setEnviando(false);
    if (!r.ok) {
      setErrores(r.errores);
      return;
    }
    alGuardar(r.id, r.avisos);
  }

  return (
    <form className="panel form-main" onSubmit={guardar} noValidate>
      <div className="row between gap-12">
        <h2 style={{ fontSize: 20 }}>{pregunta ? "Editar pregunta" : "Nueva pregunta"}</h2>
        {pregunta && (
          <button
            type="button"
            className="btn btn--xs"
            onClick={alEliminar}
            disabled={!!motivo}
            title={motivo ?? undefined}
            aria-describedby={motivo ? "q-motivo" : undefined}
          >
            Eliminar pregunta
          </button>
        )}
      </div>
      {motivo && (
        <span className="hint" id="q-motivo">
          No se puede eliminar: {motivo}
        </span>
      )}

      <div className="field">
        <label htmlFor="q-texto">Texto de la pregunta *</label>
        <input
          id="q-texto"
          className="input"
          required
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej. ¿Cómo es tu cuero cabelludo?"
        />
      </div>
      <label className="check-inline">
        <input type="checkbox" checked={esInicial} onChange={(e) => setEsInicial(e.target.checked)} /> Es la pregunta
        inicial (solo puede haber una; si marcas esta, la anterior deja de serlo)
      </label>

      <div className="stack gap-12" style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 17 }}>Opciones de respuesta</span>
        <span className="hint">
          De {MIN_OPCIONES} a {MAX_OPCIONES}. Cada opción activa sus necesidades y lleva a otra pregunta o al final, donde
          el chatbot recomienda los rituales.
        </span>
        {opciones.map((o, i) => {
          const libres = necesidades.filter((n) => !o.necesidades.includes(n.id));
          return (
            <fieldset key={i} className="option">
              <legend>Opción {i + 1}</legend>
              <div className="option__grid">
                <div className="field">
                  <label htmlFor={`op-t-${i}`}>Texto *</label>
                  <input
                    id={`op-t-${i}`}
                    className="input"
                    value={o.texto}
                    onChange={(e) => cambiarOpcion(i, { texto: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`op-s-${i}`}>Lleva a</label>
                  <select
                    id={`op-s-${i}`}
                    className="input"
                    value={o.siguienteId ?? ""}
                    onChange={(e) => cambiarOpcion(i, { siguienteId: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">Fin: recomendar rituales</option>
                    {otras.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.texto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="stack gap-6">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Necesidades que agrega</span>
                <div className="chips">
                  {o.necesidades.map((n) => (
                    <span key={n} className="chip chip--sm chip--on">
                      {nombreNecesidad(n)}
                      <button
                        type="button"
                        className="chip__x"
                        aria-label={`Quitar ${nombreNecesidad(n)} de la opción ${i + 1}`}
                        onClick={() => cambiarOpcion(i, { necesidades: o.necesidades.filter((x) => x !== n) })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {libres.length > 0 && (
                    <>
                      <label className="sr-only" htmlFor={`op-n-${i}`}>
                        Agregar necesidad a la opción {i + 1}
                      </label>
                      <select
                        id={`op-n-${i}`}
                        className="input chip chip--sm"
                        style={{ width: "auto", minHeight: 32 }}
                        value=""
                        onChange={(e) =>
                          e.target.value && cambiarOpcion(i, { necesidades: [...o.necesidades, Number(e.target.value)] })
                        }
                      >
                        <option value="">+ Agregar necesidad</option>
                        {libres.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.nombre}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {!o.necesidades.length && <span className="hint">Ninguna (p. ej. «Otro tono»)</span>}
                </div>
              </div>
              <button
                type="button"
                className="btn-link"
                style={{ alignSelf: "flex-start", padding: 0 }}
                disabled={opciones.length <= MIN_OPCIONES}
                onClick={() => setOpciones((lista) => lista.filter((_, j) => j !== i))}
              >
                Quitar opción {i + 1}
              </button>
            </fieldset>
          );
        })}
        <button
          type="button"
          className="btn"
          style={{ alignSelf: "flex-start" }}
          disabled={opciones.length >= MAX_OPCIONES}
          onClick={() => setOpciones((lista) => [...lista, opcionVacia()])}
        >
          + Agregar opción
        </button>
      </div>

      <div className="flow" aria-live="polite">
        <span>Flujo de «{texto.trim() || "esta pregunta"}»:</span>
        {opciones.map((o, i) => (
          <span key={i}>
            {o.texto.trim() || `Opción ${i + 1}`} → {nombrePregunta(o.siguienteId)}
            {o.necesidades.length ? ` · activa: ${o.necesidades.map(nombreNecesidad).join(", ")}` : ""}
          </span>
        ))}
        {avisos.map((a) => (
          <span key={a} className="warn">
            Aviso: {a}
          </span>
        ))}
      </div>

      <div className="alert" role="alert" hidden={!errores.length}>
        {errores.map((e) => (
          <p key={e} style={{ margin: 0 }}>
            {e}
          </p>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar pregunta"}
        </button>
      </div>
    </form>
  );
}
