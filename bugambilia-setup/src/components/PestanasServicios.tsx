"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Comparador } from "@/components/Comparador";

// Servicios faciales: contenido fijo y promocional (docs/catalogo-productos-y-servicios-bugambilia.md).
const FACIALES = [
  {
    nombre: "Limpieza Facial Profunda",
    enfoque: "Limpieza y renovación de la piel",
    ideal: "Ideal para: pieles con impurezas, poros congestionados, exceso de grasa o apariencia opaca.",
  },
  {
    nombre: "Hollywood Peel",
    enfoque: "Luminosidad y renovación",
    ideal: "Ideal para: quienes buscan un efecto glow y una piel más uniforme y radiante.",
  },
  {
    nombre: "BB Glow",
    enfoque: "Luminosidad y apariencia uniforme",
    ideal: "Ideal para: pieles que buscan mayor luminosidad, uniformidad y un aspecto más fresco.",
  },
  {
    nombre: "Hidrafacial",
    enfoque: "Limpieza + exfoliación + extracción + hidratación",
    ideal: "Ideal para: todo tipo de pieles que buscan una renovación completa.",
  },
];

const PESTANAS = [
  { id: "faciales", texto: "Faciales" },
  { id: "capilares", texto: "Capilares" },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

// Pestañas Faciales / Capilares con el patrón ARIA de tabs (flechas entre pestañas).
export function PestanasServicios() {
  const [activa, setActiva] = useState<Pestana>("faciales");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function teclado(e: KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const siguiente = PESTANAS[(i + (e.key === "ArrowRight" ? 1 : PESTANAS.length - 1)) % PESTANAS.length];
    setActiva(siguiente.id);
    refs.current[siguiente.id]?.focus();
  }

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Tipo de servicio">
        {PESTANAS.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[p.id] = el;
            }}
            type="button"
            className="btn"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={activa === p.id}
            aria-controls={`panel-${p.id}`}
            tabIndex={activa === p.id ? 0 : -1}
            onClick={() => setActiva(p.id)}
            onKeyDown={(e) => teclado(e, i)}
          >
            {p.texto}
          </button>
        ))}
      </div>

      <div
        id="panel-faciales"
        role="tabpanel"
        aria-labelledby="tab-faciales"
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
        hidden={activa !== "faciales"}
      >
        {FACIALES.map((s) => (
          <article key={s.nombre} className="card service">
            <div className="service__body">
              <h3 className="service__name">{s.nombre}</h3>
              <p className="service__focus">{s.enfoque}</p>
              <p className="service__ideal">{s.ideal}</p>
            </div>
          </article>
        ))}
      </div>

      <div id="panel-capilares" role="tabpanel" aria-labelledby="tab-capilares" hidden={activa !== "capilares"}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <article className="card service">
            {/* El antes/después es de servicios capilares (no de faciales). TODO: fotos reales de la clienta. */}
            <Comparador
              etiqueta="servicio capilar"
              antes={{ src: "/img/antes.webp", alt: "Antes: cabello rizado sin tratamiento" }}
              despues={{ src: "/img/despues.webp", alt: "Después: cabello rubio con ondas definidas" }}
            />
            {/* TODO: nombre, enfoque e "ideal para" de cada servicio capilar (pendientes con la clienta). */}
            <div className="service__body">
              <h3 className="service__name">Servicios capilares</h3>
              <p className="service__focus">Corte, tinte y tratamientos</p>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
