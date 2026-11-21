"use client";

import { useState, type CSSProperties } from "react";

type Props = {
  etiqueta: string; // para el aria-label del control
  antes?: { src: string; alt: string };
  despues?: { src: string; alt: string };
};

// Comparador antes/después del mockup: un <input type="range"> invisible mueve --pos
// y el CSS recorta la capa "después". Sin fotos, muestra los placeholders del mockup.
export function Comparador({ etiqueta, antes, despues }: Props) {
  const [pos, setPos] = useState(50);
  const conFoto = Boolean(antes && despues);

  return (
    <div className={`compare${conFoto ? " compare--photo" : ""}`} style={{ "--pos": `${pos}%` } as CSSProperties}>
      {conFoto ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- capas recortadas con clip-path */}
          <img className="ph compare__layer" src={antes!.src} alt={antes!.alt} width={900} height={643} loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ph compare__layer compare__layer--after" src={despues!.src} alt={despues!.alt} width={900} height={643} loading="lazy" />
          <span className="compare__tag compare__tag--photo compare__tag--before">Antes</span>
          <span className="compare__tag compare__tag--photo compare__tag--after">Después</span>
        </>
      ) : (
        <>
          <div className="ph compare__layer">
            <span className="compare__tag compare__tag--before">Antes</span>
          </div>
          <div className="ph compare__layer compare__layer--after">
            <span className="compare__tag compare__tag--after">Después</span>
          </div>
        </>
      )}
      <span className="compare__line" aria-hidden="true" />
      <input
        className="compare__range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar antes y después: ${etiqueta}`}
      />
      <span className="compare__handle" aria-hidden="true">
        ‹›
      </span>
    </div>
  );
}
