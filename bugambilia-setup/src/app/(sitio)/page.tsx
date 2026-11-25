import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PestanasServicios } from "@/components/PestanasServicios";
import { aparienciaDeLinea, estiloLinea } from "@/lib/catalogo";
import { CONTACTO, FIRMA } from "@/lib/contacto";
import { obtenerLineasConProductos, obtenerSucursales } from "@/lib/datos-catalogo";
import { diaDeHoy, formatoHorario } from "@/lib/horarios";

const VERBOS = ["Limpia", "Hidrata", "Nutre", "Protege", "Desenreda", "Suaviza", "Realza"];

export default function Inicio() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="container split">
          <div className="stack gap-20">
            <span className="lbl">Professional Hair Care</span>
            <h1 className="title-xl">Bugambilia Hair Boutique</h1>
            <p className="lead">{FIRMA}</p>
            {/* TODO: frase breve de bienvenida (texto de la clienta). */}
            <div className="row gap-12">
              <Link href="/productos" className="btn btn--primary">
                Ver productos
              </Link>
              <button type="button" className="btn" data-open-chat>
                Encuentra tu ritual
              </button>
            </div>
          </div>
          <Image
            className="ph hero__img"
            src="/img/hero.webp"
            alt="Las siete líneas de cuidado capilar Bugambilia sobre piedra, rodeadas de bugambilias"
            width={1448}
            height={1086}
            sizes="(min-width: 960px) 560px, 100vw"
            priority
          />
        </div>
      </section>

      {/* ===== Cinta decorativa (verbos de los pósters de la marca) ===== */}
      <div className="ribbon" aria-hidden="true">
        <div className="ribbon__track">
          {[...VERBOS, ...VERBOS].map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {/* ===== Sobre Bugambilia (contenido fijo) ===== */}
      <section className="section section--alt" aria-labelledby="t-sobre">
        <div className="container split">
          <div className="about__imgs">
            {/* TODO: foto del equipo (pendiente con la clienta). */}
            <div className="ph" role="img" aria-label="Foto del equipo">
              Foto del equipo
            </div>
            {/* Foto de la clienta (25 nov 2026), recortada sin el texto de la publicación. */}
            <Image
              className="ph"
              src="/img/espacio.webp"
              alt="Tocador y sillón de Estética Bugambilia con lavacabezas, iluminados por la luz de la tarde"
              width={900}
              height={614}
              sizes="(min-width: 960px) 280px, 50vw"
              style={{ objectPosition: "28% 50%" }} // en celular el recuadro es angosto: centra el sillón
            />

          </div>
          <div className="stack gap-16">
            <span className="lbl">Nuestra esencia</span>
            <h2 id="t-sobre" className="title-md">
              Sobre Bugambilia
            </h2>
            {/* TODO: historia y misión (texto de la clienta). Texto provisional con datos del catálogo. */}
            <p className="text">
              Bugambilia Hair Boutique es una estética en Aguascalientes dedicada al cuidado del cabello y de la
              piel, con la experiencia de salón como punto de partida.
            </p>
            <p className="text">
              De esa experiencia nace la Línea Bugambilia · Professional Hair Care: rituales especializados que
              atienden distintas necesidades del cabello.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Servicios (promocional, contenido fijo) ===== */}
      <section id="servicios" className="section" aria-labelledby="t-servicios">
        <div className="container stack gap-28">
          <div className="stack gap-10">
            <span className="lbl">Servicios</span>
            <h2 id="t-servicios" className="title-md">
              Nuestros servicios
            </h2>
            <p className="text" style={{ lineHeight: "normal" }}>
              Cada piel tiene necesidades diferentes. Piel limpia. Piel cuidada. Piel luminosa.
            </p>
          </div>
          <PestanasServicios />
          <div className="row gap-16">
            <p style={{ fontSize: 16 }}>¿Quieres un tratamiento personalizado?</p>
            <a href={CONTACTO.instagramMensaje} className="btn" target="_blank" rel="noopener noreferrer">
              Agenda tu diagnóstico en Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ===== Línea Bugambilia ===== */}
      <section className="section section--alt" aria-labelledby="t-lineas">
        <div className="container stack gap-28">
          <Suspense fallback={<EncabezadoLineas total={null} />}>
            <Lineas />
          </Suspense>
        </div>
      </section>

      {/* ===== Llamado al chatbot ===== */}
      <section className="section">
        <div className="container">
          <div className="callout">
            <div className="stack gap-8" style={{ flex: "1 1 420px" }}>
              <span className="lbl">Asistente Bugambilia</span>
              <h2 className="title-sm">¿No sabes qué producto elegir?</h2>
              <p style={{ fontSize: 16, color: "var(--ink-2)" }}>
                Responde unas preguntas y te recomendamos el ritual ideal para tu cabello.
              </p>
            </div>
            <button type="button" className="btn btn--primary" data-open-chat>
              Hablar con el asistente
            </button>
          </div>
        </div>
      </section>

      {/* ===== Sucursales (vista previa) ===== */}
      <section className="section section--alt" aria-labelledby="t-suc">
        <div className="container stack gap-24">
          <div className="row between gap-16" style={{ alignItems: "flex-end" }}>
            <div className="stack gap-10">
              <span className="lbl">Visítanos</span>
              <h2 id="t-suc" className="title-md">
                Dónde encontrarnos
              </h2>
            </div>
            <Link href="/sucursales" className="btn">
              Ver mapa
            </Link>
          </div>
          <Suspense fallback={null}>
            <SucursalesPrevia />
          </Suspense>
        </div>
      </section>
    </>
  );
}

function EncabezadoLineas({ total }: { total: number | null }) {
  return (
    <div className="row between gap-16" style={{ alignItems: "flex-end" }}>
      <div className="stack gap-10">
        <span className="lbl">Línea Bugambilia · Professional Hair Care</span>
        <h2 id="t-lineas" className="title-md">
          Encuentra tu ritual
        </h2>
      </div>
      <Link href="/productos" className="btn">
        {total === null ? "Ver productos" : `Ver los ${total} productos`}
      </Link>
    </div>
  );
}

async function Lineas() {
  const lineas = await obtenerLineasConProductos();
  const total = lineas.reduce((n, l) => n + l.productos.length, 0);
  return (
    <>
      <EncabezadoLineas total={total} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {lineas.map((l) => (
          <Link key={l.id} href={`/productos?linea=${l.id}`} className="card line-card" style={estiloLinea(l.nombre)}>
            <Image
              className="ph line-card__img"
              src={aparienciaDeLinea(l.nombre).img}
              alt=""
              width={1200}
              height={900}
              sizes="(min-width: 900px) 400px, 100vw"
            />
            <div className="line-card__body">
              <span className="meta">{l.numerada}</span>
              <span className="line-card__name">{l.nombreRitual}</span>
              <span className="small">
                {l.productos[0]?.ingredientes ? `${l.productos[0].ingredientes} · ` : ""}
                {l.productos.length} productos
              </span>
              {l.precioRitual && <span className="small">Ritual completo · <strong>{l.precioRitual}</strong></span>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

async function SucursalesPrevia() {
  const sucursales = await obtenerSucursales();
  const hoy = diaDeHoy();
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
      {sucursales.map((s) => (
        <Link
          key={s.id}
          href={`/sucursales?sucursal=${s.id}`}
          className="card"
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 6, textDecoration: "none" }}
        >
          <span className="meta">{s.tipo === "Propia" ? "Establecimiento propio" : "Punto de venta"}</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{s.nombre}</span>
          {/* Solo lo que existe: la estética no publica dirección y aún no tiene horario. */}
          {(s.direccion || s.horarios.length > 0) && (
            <span className="small">
              {[s.direccion, s.horarios.length > 0 && `Hoy: ${formatoHorario(s.horarios, hoy)}`].filter(Boolean).join(" · ")}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
