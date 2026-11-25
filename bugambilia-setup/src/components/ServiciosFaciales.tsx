// Servicios faciales: contenido fijo y promocional (docs/catalogo-productos-y-servicios-bugambilia.md).
// Los servicios capilares se quitaron el 25 nov 2026 (la clienta no ha decidido si los quiere).
// Si vuelven, el antes/después está listo en Comparador.tsx con /img/antes.webp y /img/despues.webp.
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

// Tarjetas de servicios faciales (sin barra de pestañas: con una sola no tiene sentido).
export function ServiciosFaciales() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
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
  );
}
