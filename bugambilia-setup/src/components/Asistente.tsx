"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useEffectEvent, useRef, useState } from "react";
import { CONTACTO } from "@/lib/contacto";
import type {
  OpcionArbol,
  PreguntaArbol,
  RespuestaArbol,
  RespuestaRecomendacion,
  RitualRecomendado,
} from "@/lib/chatbot/tipos";

// Widget del chatbot, igual al mockup (bugambilia-wireframes-html/js/chatbot.js):
//   A. preguntas del árbol (botones);
//   B. recomendación: introducción, un mensaje por ritual con sus productos y la firma;
//   C. cita de diagnóstico con botón a Instagram (o si el árbol está roto).
// Lo abren la burbuja y cualquier botón con `data-open-chat` del sitio.
// No se guarda nada: las respuestas viven solo en esta pestaña.

type Entrada =
  | { tipo: "bot"; texto: string }
  | { tipo: "yo"; texto: string }
  | { tipo: "ritual"; ritual: RitualRecomendado }
  | { tipo: "instagram" };

type Fase = "cargando" | "pregunta" | "pensando" | "recomendacion" | "diagnostico" | "error";
type Arbol = Extract<RespuestaArbol, { estado: "listo" }>;

const SALUDO = "¡Hola! Te haré unas preguntas para encontrar tu ritual ideal.";

// Profundidad máxima del árbol, para la barra de progreso (el árbol ya viene sin ciclos).
function profundidad(arbol: Arbol, id: number): number {
  const p = arbol.preguntas.find((q) => q.id === id);
  if (!p) return 0;
  return 1 + Math.max(0, ...p.opciones.map((o) => (o.siguienteId === null ? 0 : profundidad(arbol, o.siguienteId))));
}

export function Asistente() {
  const [abierto, setAbierto] = useState(false);
  const [fase, setFase] = useState<Fase>("cargando");
  const [log, setLog] = useState<Entrada[]>([]);
  const [pregunta, setPregunta] = useState<PreguntaArbol | null>(null);
  const [numPregunta, setNumPregunta] = useState(0);
  const [totalPreguntas, setTotalPreguntas] = useState(1);

  const arbol = useRef<Arbol | null>(null);
  const necesidades = useRef<number[]>([]);
  const sesion = useRef(0); // descarta respuestas de una conversación ya reiniciada o cerrada
  const ultimoFoco = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLElement>(null);
  const registro = useRef<HTMLDivElement>(null);
  const pie = useRef<HTMLDivElement>(null);

  const decir = (...entradas: Entrada[]) => setLog((l) => [...l, ...entradas]);

  function preguntar(q: PreguntaArbol, numero: number) {
    setPregunta(q);
    setNumPregunta(numero);
    decir({ tipo: "bot", texto: q.texto });
    setFase("pregunta");
  }

  function mostrarDiagnostico() {
    decir(
      { tipo: "bot", texto: "Por lo que nos cuentas, tu caso necesita una valoración personalizada." },
      { tipo: "bot", texto: "Te recomendamos agendar una cita de diagnóstico para diseñar un tratamiento según tu situación." },
      { tipo: "instagram" },
    );
    setFase("diagnostico");
  }

  async function iniciar() {
    const id = ++sesion.current;
    necesidades.current = [];
    setPregunta(null);
    setNumPregunta(0);
    setLog([{ tipo: "bot", texto: SALUDO }]);
    setFase("cargando");
    try {
      if (!arbol.current) {
        const res = await fetch("/api/chatbot");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const datos = (await res.json()) as RespuestaArbol;
        if (id !== sesion.current) return;
        if (datos.estado === "roto") return mostrarDiagnostico();
        arbol.current = datos;
      }
      const a = arbol.current;
      setTotalPreguntas(Math.max(1, profundidad(a, a.inicialId)));
      preguntar(a.preguntas.find((q) => q.id === a.inicialId)!, 1);
    } catch {
      if (id === sesion.current) setFase("error");
    }
  }

  function elegir(op: OpcionArbol) {
    decir({ tipo: "yo", texto: op.texto });
    for (const n of op.necesidades) if (!necesidades.current.includes(n)) necesidades.current.push(n);
    const siguiente = op.siguienteId === null ? undefined : arbol.current?.preguntas.find((q) => q.id === op.siguienteId);
    if (siguiente) preguntar(siguiente, numPregunta + 1);
    else void terminar();
  }

  async function terminar() {
    const id = sesion.current;
    setPregunta(null);
    setFase("pensando");
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ necesidades: necesidades.current }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const r = (await res.json()) as RespuestaRecomendacion;
      if (id !== sesion.current) return;
      if (r.tipo === "diagnostico") return mostrarDiagnostico();
      decir(
        { tipo: "bot", texto: r.introduccion },
        ...r.rituales.map((ritual): Entrada => ({ tipo: "ritual", ritual })),
        { tipo: "bot", texto: r.cierre },
      );
      setFase("recomendacion");
    } catch {
      if (id === sesion.current) setFase("error");
    }
  }

  function abrir() {
    if (abierto) return;
    ultimoFoco.current = document.activeElement as HTMLElement | null;
    setAbierto(true);
    void iniciar();
  }

  function cerrar() {
    sesion.current++;
    setAbierto(false);
    ultimoFoco.current?.focus();
  }

  // Botones del sitio con data-open-chat ("Encuentra tu ritual", "Hablar con el asistente"…) y Esc.
  const alHacerClic = useEffectEvent((e: MouseEvent) => {
    if (e.target instanceof Element && e.target.closest("[data-open-chat]")) {
      e.preventDefault();
      abrir();
    }
  });
  const alPresionarTecla = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape" && abierto) cerrar();
  });
  useEffect(() => {
    const clic = (e: MouseEvent) => alHacerClic(e);
    const tecla = (e: KeyboardEvent) => alPresionarTecla(e);
    document.addEventListener("click", clic);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("click", clic);
      document.removeEventListener("keydown", tecla);
    };
  }, []);

  // Siempre a la vista el último mensaje, y el foco en la primera opción (o en el pie).
  useEffect(() => {
    if (registro.current) registro.current.scrollTop = registro.current.scrollHeight;
  }, [log, fase]);
  useEffect(() => {
    if (!abierto) return;
    const destino = pie.current?.querySelector<HTMLElement>("button, a") ?? panel.current?.querySelector<HTMLElement>(".chat__close");
    destino?.focus();
  }, [abierto, fase, pregunta]);

  const progreso = fase === "pregunta" ? Math.min(100, (numPregunta / totalPreguntas) * 100) : fase === "cargando" ? 0 : 100;

  return (
    <>
      <section ref={panel} id="chat" className="chat" role="dialog" aria-label="Asistente Bugambilia" hidden={!abierto}>
        <header className="chat__head">
          <div className="row gap-10">
            <Image className="ph ph--round chat__avatar" src="/img/logo.webp" alt="" width={36} height={36} aria-hidden="true" />
            <div className="stack">
              <strong style={{ fontSize: 15 }}>Asistente Bugambilia</strong>
              <span className="chat__step" style={{ fontSize: 12, color: "var(--muted)" }}>
                {fase === "pregunta" ? `Pregunta ${numPregunta}` : ""}
              </span>
            </div>
          </div>
          <button type="button" className="chat__close" aria-label="Cerrar chat" onClick={cerrar}>
            ×
          </button>
        </header>
        <div className="chat__progress" aria-hidden="true">
          <span style={{ width: `${progreso}%` }} />
        </div>

        <div ref={registro} className="chat__log" aria-live="polite">
          {log.map((e, i) => (
            <Fragment key={i}>
              {e.tipo === "bot" && <div className="msg-bot">{e.texto}</div>}
              {e.tipo === "yo" && <div className="msg-me">{e.texto}</div>}
              {e.tipo === "ritual" && <Ritual ritual={e.ritual} alElegir={cerrar} />}
              {e.tipo === "instagram" && (
                <div className="instagram-box">
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Agenda por mensaje directo</span>
                  <a href={CONTACTO.instagramMensaje} className="btn btn--primary" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="#FFFFFF" />
                    </svg>
                    Escríbenos en Instagram
                  </a>
                </div>
              )}
            </Fragment>
          ))}
          {(fase === "cargando" || fase === "pensando") && (
            <div className="msg-bot" role="status">
              {fase === "pensando" ? "Estoy preparando tu ritual…" : "Un momento…"}
            </div>
          )}
          {fase === "error" && (
            <div className="msg-bot" role="alert">
              No pudimos conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.
            </div>
          )}
        </div>

        <div ref={pie} className={`chat__foot${fase === "recomendacion" ? " chat__foot--row" : ""}`}>
          {fase === "pregunta" && pregunta && (
            <>
              {pregunta.opciones.map((o) => (
                <button key={o.id} type="button" className="btn btn--left" style={{ fontSize: 14 }} onClick={() => elegir(o)}>
                  {o.texto}
                </button>
              ))}
              <button type="button" className="btn-link" style={{ fontSize: 13 }} onClick={() => void iniciar()}>
                Empezar de nuevo
              </button>
            </>
          )}
          {fase === "recomendacion" && (
            <>
              <Link href="/sucursales" className="btn btn--primary" style={{ fontSize: 14 }} onClick={cerrar}>
                Dónde comprar
              </Link>
              <button type="button" className="btn" style={{ fontSize: 14 }} onClick={() => void iniciar()}>
                Empezar de nuevo
              </button>
            </>
          )}
          {(fase === "diagnostico" || fase === "error") && (
            <button type="button" className="btn btn--block" style={{ fontSize: 14 }} onClick={() => void iniciar()}>
              {fase === "error" ? "Intentar de nuevo" : "Empezar de nuevo"}
            </button>
          )}
        </div>
      </section>

      <button
        type="button"
        className="chat-bubble"
        aria-label="Abrir asistente de recomendación"
        aria-expanded={abierto}
        aria-controls="chat"
        onClick={() => (abierto ? cerrar() : abrir())}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
      </button>
    </>
  );
}

// Un ritual recomendado: su mensaje y sus productos (tarjetas .reco del mockup).
function Ritual({ ritual, alElegir }: { ritual: RitualRecomendado; alElegir: () => void }) {
  return (
    <>
      <div className="msg-bot">{ritual.mensaje}</div>
      {ritual.productos.map((p) => (
        <Link key={p.id} href={p.href} className="reco" onClick={alElegir}>
          <Image
            className={`ph ${p.imagenUrl ? "ph--product" : "ph--logo"}`}
            src={p.imagenUrl ?? "/img/logo.webp"}
            alt=""
            width={60}
            height={60}
          />
          <div className="stack" style={{ gap: 2 }}>
            <span className="meta" style={{ fontSize: 11 }}>
              {ritual.ritual} · {p.paso}
            </span>
            <strong style={{ fontSize: 15 }}>{p.nombre}</strong>
            <span style={{ fontSize: 13, textDecoration: "underline" }}>Ver detalle</span>
          </div>
        </Link>
      ))}
      {ritual.precioRitual && (
        <p className="small" style={{ margin: 0 }}>
          {ritual.ritual} completo: <strong>{ritual.precioRitual}</strong>
        </p>
      )}
    </>
  );
}
