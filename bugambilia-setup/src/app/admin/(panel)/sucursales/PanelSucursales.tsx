"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DIAS_SEMANA } from "@/lib/horarios";
import { useAviso } from "../Aviso";
import { reducirImagen } from "../imagen";
import { MAX_IMAGEN, TIPOS_IMAGEN } from "../productos/validacion";
import { eliminarSucursal, guardarSucursal } from "./acciones";
import { validarSucursal, type CampoSucursal, type ErroresSucursal } from "./validacion";

export type SucursalPanel = {
  id: number;
  nombre: string;
  tipo: "Propia" | "Tercero";
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  fotoUrl: string | null;
  notaHorario: string | null;
  horarios: { diaSemana: number; horaApertura: string; horaCierre: string }[];
};

// Leaflet usa window: el mapa se carga solo en el navegador.
const MapaUbicacion = dynamic(() => import("./MapaUbicacion"), {
  ssr: false,
  loading: () => <div className="ph map-picker" style={{ height: 260 }} aria-hidden="true" />,
});

// Next 16 conserva el estado de las páginas ya visitadas (<Activity>): al entrar de
// nuevo desde el menú, la pantalla empieza de cero (bfcacheId cambia en cada navegación
// nueva y no al usar atrás/adelante).
export function PanelSucursales(props: { sucursales: SucursalPanel[] }) {
  const { bfcacheId } = useRouter();
  return <ListaYFormulario key={bfcacheId} {...props} />;
}

// Lista + formulario + diálogo de eliminar de admin/sucursales.html.
function ListaYFormulario({ sucursales }: { sucursales: SucursalPanel[] }) {
  const [seleccion, setSeleccion] = useState<number | null>(sucursales[0]?.id ?? null); // null = nueva
  const [pendiente, setPendiente] = useState<SucursalPanel | null>(null);
  const [reinicio, setReinicio] = useState(0); // "Cancelar" descarta lo escrito
  const dialogo = useRef<HTMLDialogElement>(null);
  const { aviso, mostrar } = useAviso();
  const actual = sucursales.find((s) => s.id === seleccion) ?? null;

  function pedirEliminar(s: SucursalPanel) {
    setPendiente(s);
    dialogo.current?.showModal();
  }

  async function alCerrarDialogo() {
    const s = pendiente;
    setPendiente(null);
    if (dialogo.current?.returnValue !== "confirmar" || !s) return;
    const { ok } = await eliminarSucursal(s.id).catch(() => ({ ok: false }));
    // Si se eliminó la que estaba abierta en el formulario, se abre otra.
    if (ok && s.id === seleccion) setSeleccion(sucursales.find((x) => x.id !== s.id)?.id ?? null);
    mostrar(ok ? "Sucursal eliminada" : "No se pudo eliminar la sucursal");
  }

  return (
    <>
      <div className="admin-head">
        <div className="stack gap-8">
          <span className="lbl">Sucursales · agregar / editar / eliminar</span>
          <h1 className="admin-title">Sucursales</h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setSeleccion(null)}>
          + Agregar sucursal
        </button>
      </div>

      <div className="form-layout">
        <div className="form-side item-list" style={{ order: -1 }}>
          {sucursales.length ? (
            sucursales.map((s) => (
              <article key={s.id} className="item" aria-current={s.id === seleccion}>
                <div className="row gap-12" style={{ flexWrap: "nowrap" }}>
                  {s.fotoUrl ? (
                    <Image className="ph" src={s.fotoUrl} alt="" width={56} height={56} style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="ph" aria-hidden="true">
                      Foto
                    </div>
                  )}
                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <span className="meta" style={{ fontSize: 11 }}>
                      {s.tipo === "Propia" ? "Establecimiento propio" : "Punto de venta · tercero"}
                    </span>
                    <strong style={{ fontSize: 16 }}>{s.nombre}</strong>
                    <span className="hint">{s.direccion ?? "Sin dirección publicada (no sale en el mapa)"}</span>
                  </div>
                </div>
                <div className="row gap-8" style={{ flexWrap: "nowrap" }}>
                  <button type="button" className="btn btn--xs" style={{ flex: 1 }} onClick={() => setSeleccion(s.id)}>
                    Editar<span className="sr-only"> {s.nombre}</span>
                  </button>
                  <button type="button" className="btn btn--xs" style={{ flex: 1 }} onClick={() => pedirEliminar(s)}>
                    Eliminar<span className="sr-only"> {s.nombre}</span>
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="empty">No hay sucursales. Agrega la primera.</p>
          )}
        </div>

        {/* La llave son los datos: al guardar (o al cambiar de sucursal) el formulario
            vuelve a empezar con lo que hay en la base. */}
        <FormularioSucursal
          key={`${reinicio}-${actual ? JSON.stringify(actual) : "nueva"}`}
          sucursal={actual}
          alGuardar={(id) => {
            setSeleccion(id);
            mostrar("Sucursal guardada");
          }}
          alCancelar={() => {
            // En una nueva, "Cancelar" regresa a la primera; al editar, descarta lo escrito.
            if (!actual) setSeleccion(sucursales[0]?.id ?? null);
            setReinicio((n) => n + 1);
          }}
        />
      </div>

      {/* Confirmación de eliminar: <dialog> nativo del navegador */}
      <dialog className="dialog" ref={dialogo} aria-labelledby="t-eliminar" onClose={alCerrarDialogo}>
        <form method="dialog">
          <h2 id="t-eliminar">¿Eliminar «{pendiente?.nombre}»?</h2>
          <p>
            Se quitará del mapa y de la lista de sucursales del sitio, junto con su horario y su foto. Esta acción no se
            puede deshacer.
          </p>
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

const usuarioDeInstagram = (url: string | null) => url?.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "") ?? "";
const PAR_DE_COORDENADAS = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

function FormularioSucursal({
  sucursal,
  alGuardar,
  alCancelar,
}: {
  sucursal: SucursalPanel | null;
  alGuardar: (id: number) => void;
  alCancelar: () => void;
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const [latitud, setLatitud] = useState(sucursal?.latitud?.toString() ?? "");
  const [longitud, setLongitud] = useState(sucursal?.longitud?.toString() ?? "");
  // Día sin renglón en la base = "Cerrado". Una sucursal nueva empieza con todo cerrado.
  const [cerrados, setCerrados] = useState(() =>
    DIAS_SEMANA.map((_, i) => !sucursal?.horarios.some((h) => h.diaSemana === i + 1)),
  );

  const [fotoNueva, setFotoNueva] = useState<{ archivo: File; url: string } | null>(null);
  const [quitarFoto, setQuitarFoto] = useState(false);
  const fotoVisible = fotoNueva?.url ?? (quitarFoto ? null : sucursal?.fotoUrl ?? null);

  const [errores, setErrores] = useState<ErroresSucursal>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!fotoNueva) return;
    return () => URL.revokeObjectURL(fotoNueva.url);
  }, [fotoNueva]);

  // Google Maps copia "21.9228935, -102.2985236": si se pega en latitud, se reparte.
  function cambiarLatitud(valor: string) {
    const par = valor.match(PAR_DE_COORDENADAS);
    if (par) {
      setLatitud(par[1]);
      setLongitud(par[2]);
    } else setLatitud(valor);
  }

  async function elegirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type)) return setErrores((e) => ({ ...e, foto: "La foto debe ser JPG, PNG o WebP." }));
    if (archivo.size > MAX_IMAGEN) return setErrores((e) => ({ ...e, foto: "La foto pesa más de 5 MB." }));
    try {
      const reducida = await reducirImagen(archivo, 800, "sucursal");
      setFotoNueva({ archivo: reducida, url: URL.createObjectURL(reducida) });
      setQuitarFoto(false);
      setErrores((e) => ({ ...e, foto: undefined }));
    } catch {
      setErrores((e) => ({ ...e, foto: "No se pudo leer la imagen." }));
    }
  }

  function datosDelFormulario() {
    const f = new FormData(formulario.current!);
    if (sucursal) f.set("id", String(sucursal.id));
    if (fotoNueva) f.set("foto", fotoNueva.archivo);
    if (quitarFoto) f.set("quitarFoto", "1");
    return f;
  }

  function enfocarPrimerError(campos: ErroresSucursal) {
    const primero = Object.keys(campos).find((c) => campos[c as CampoSucursal]);
    if (!primero) return;
    const nombre = primero.startsWith("dia") ? `abre${primero.slice(3)}` : primero === "horario" ? "notaHorario" : primero;
    formulario.current?.querySelector<HTMLElement>(`[name="${nombre}"]`)?.focus();
  }

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = datosDelFormulario();
    setMensaje("");

    const local = validarSucursal(datos);
    if ("errores" in local) {
      setErrores(local.errores);
      enfocarPrimerError(local.errores);
      return;
    }

    setEnviando(true);
    const resultado = await guardarSucursal(datos).catch(() => ({
      ok: false as const,
      errores: {},
      mensaje: "No se pudo guardar. Revisa tu conexión e intenta de nuevo.",
    }));
    setEnviando(false);
    if (!resultado.ok) {
      setErrores(resultado.errores);
      setMensaje(resultado.mensaje ?? "");
      enfocarPrimerError(resultado.errores);
      return;
    }
    alGuardar(resultado.id);
  }

  const hayErrores = Object.values(errores).some(Boolean);
  const invalido = (campo: CampoSucursal) => (errores[campo] ? true : undefined);
  const error = (campo: CampoSucursal) =>
    errores[campo] ? (
      <span className="error" id={`${campo}-error`}>
        {errores[campo]}
      </span>
    ) : null;
  const latNum = latitud.trim() === "" ? null : Number(latitud.replace(",", "."));
  const lngNum = longitud.trim() === "" ? null : Number(longitud.replace(",", "."));
  const puntoValido = latNum !== null && lngNum !== null && Number.isFinite(latNum) && Number.isFinite(lngNum);

  return (
    <form className="panel form-main" ref={formulario} onSubmit={guardar} noValidate>
      <h2 style={{ fontSize: 20 }}>{sucursal ? `Editar: ${sucursal.nombre}` : "Nueva sucursal"}</h2>
      <div className="fieldset" style={{ border: "none", padding: 0 }}>
        <div className="field full">
          <label htmlFor="s-nombre">Nombre *</label>
          <input
            id="s-nombre"
            name="nombre"
            className="input"
            required
            defaultValue={sucursal?.nombre}
            aria-invalid={invalido("nombre")}
            aria-describedby={errores.nombre ? "nombre-error" : undefined}
          />
          {error("nombre")}
        </div>
        <fieldset className="full" style={{ border: "none", margin: 0, padding: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, padding: 0 }}>Tipo *</legend>
          <div className="radio-row">
            <label>
              <input type="radio" name="tipo" value="Propia" defaultChecked={(sucursal?.tipo ?? "Propia") === "Propia"} />{" "}
              Establecimiento propio
            </label>
            <label>
              <input type="radio" name="tipo" value="Tercero" defaultChecked={sucursal?.tipo === "Tercero"} /> Punto de
              venta (tercero)
            </label>
          </div>
          {error("tipo")}
        </fieldset>
        <div className="field full">
          <label htmlFor="s-dir">Dirección</label>
          <input
            id="s-dir"
            name="direccion"
            className="input"
            placeholder="Calle, número, colonia, ciudad"
            defaultValue={sucursal?.direccion ?? ""}
            aria-describedby="s-dir-hint"
          />
          <span className="hint" id="s-dir-hint">
            Opcional. Sin dirección no se muestra en la tarjeta.
          </span>
        </div>
        <div className="field">
          <label htmlFor="s-lat">Latitud</label>
          <input
            id="s-lat"
            name="latitud"
            className="input"
            inputMode="decimal"
            placeholder="21.9228935"
            value={latitud}
            onChange={(e) => cambiarLatitud(e.target.value)}
            aria-invalid={invalido("latitud")}
            aria-describedby="s-coord-hint"
          />
          {error("latitud")}
        </div>
        <div className="field">
          <label htmlFor="s-lng">Longitud</label>
          <input
            id="s-lng"
            name="longitud"
            className="input"
            inputMode="decimal"
            placeholder="-102.2985236"
            value={longitud}
            onChange={(e) => setLongitud(e.target.value)}
            aria-invalid={invalido("longitud")}
            aria-describedby="s-coord-hint"
          />
          {error("longitud")}
        </div>
        <div className="field full">
          <span className="field__label" id="t-mapa">
            Ubicación en el mapa
          </span>
          <span className="hint" id="s-coord-hint">
            En Google Maps, haz clic derecho sobre el lugar, copia las coordenadas y pégalas en «Latitud». También
            puedes hacer clic en el mapa. Sin coordenadas, la sucursal no sale en el mapa del sitio ni lleva «Cómo
            llegar».
          </span>
          <MapaUbicacion
            latitud={puntoValido ? latNum : null}
            longitud={puntoValido ? lngNum : null}
            onElegir={(lat, lng) => {
              setLatitud(String(lat));
              setLongitud(String(lng));
            }}
          />
          {(latitud || longitud) && (
            <button
              type="button"
              className="btn-link"
              style={{ alignSelf: "flex-start", padding: 0 }}
              onClick={() => {
                setLatitud("");
                setLongitud("");
              }}
            >
              Quitar ubicación
            </button>
          )}
        </div>
        <div className="field">
          <label htmlFor="s-tel">Teléfono</label>
          <input
            id="s-tel"
            name="telefono"
            className="input"
            type="tel"
            autoComplete="off"
            placeholder="10 dígitos"
            defaultValue={sucursal?.telefono ?? ""}
            aria-invalid={invalido("telefono")}
          />
          {error("telefono")}
        </div>
        <div className="field">
          <label htmlFor="s-wa">WhatsApp</label>
          <input
            id="s-wa"
            name="whatsapp"
            className="input"
            type="tel"
            autoComplete="off"
            placeholder="10 dígitos"
            defaultValue={sucursal?.whatsapp ?? ""}
            aria-invalid={invalido("whatsapp")}
          />
          {error("whatsapp")}
        </div>
        <div className="field full">
          <label htmlFor="s-ig">Instagram</label>
          <input
            id="s-ig"
            name="instagram"
            className="input"
            autoComplete="off"
            placeholder="usuario, p. ej. kokoro.showroom"
            defaultValue={usuarioDeInstagram(sucursal?.instagram ?? null)}
            aria-invalid={invalido("instagram")}
          />
          {error("instagram")}
        </div>
        <div className="field full">
          <span className="field__label">Foto</span>
          <div className="row gap-16">
            {fotoVisible ? (
              <Image
                className="ph"
                style={{ width: 96, height: 72, objectFit: "cover" }}
                src={fotoVisible}
                alt="Foto actual de la sucursal"
                width={96}
                height={72}
                unoptimized={!!fotoNueva}
              />
            ) : (
              <div className="ph" style={{ width: 96, height: 72 }}>
                Foto
              </div>
            )}
            <label htmlFor="s-foto" className="btn btn--sm">
              {fotoVisible ? "Cambiar foto" : "Subir foto"}
            </label>
            <input
              id="s-foto"
              type="file"
              accept={TIPOS_IMAGEN.join(",")}
              className="sr-only"
              onChange={elegirFoto}
              aria-invalid={invalido("foto")}
            />
            {fotoVisible && (
              <button
                type="button"
                className="btn-link"
                style={{ padding: 0 }}
                onClick={() => {
                  setFotoNueva(null);
                  setQuitarFoto(true);
                }}
              >
                Quitar foto
              </button>
            )}
          </div>
          <span className="hint">JPG, PNG o WebP de hasta 5 MB. Opcional.</span>
          {error("foto")}
        </div>
      </div>

      <fieldset
        className="fieldset--sep"
        style={{ border: "none", borderTop: "1px solid var(--line)", margin: 0, padding: "20px 0 0" }}
      >
        <legend style={{ fontWeight: 700, fontSize: 17, padding: 0, marginBottom: 10 }}>Horario por día</legend>
        <div className="hours-grid">
          {DIAS_SEMANA.map((dia, i) => {
            const n = i + 1;
            const h = sucursal?.horarios.find((x) => x.diaSemana === n);
            return (
              <div key={dia}>
                <div className="hours-row">
                  <span>{dia}</span>
                  <input
                    className="input"
                    type="time"
                    name={`abre${n}`}
                    aria-label={`Apertura ${dia}`}
                    defaultValue={h?.horaApertura ?? "10:00"}
                    disabled={cerrados[i]}
                    aria-invalid={invalido(`dia${n}`)}
                  />
                  <input
                    className="input"
                    type="time"
                    name={`cierra${n}`}
                    aria-label={`Cierre ${dia}`}
                    defaultValue={h?.horaCierre ?? "19:00"}
                    disabled={cerrados[i]}
                    aria-invalid={invalido(`dia${n}`)}
                  />
                  <label className="check-inline">
                    <input
                      type="checkbox"
                      name={`cerrado${n}`}
                      checked={cerrados[i]}
                      onChange={(e) => setCerrados((c) => c.map((x, j) => (j === i ? e.target.checked : x)))}
                    />{" "}
                    Cerrado
                  </label>
                </div>
                {error(`dia${n}`)}
              </div>
            );
          })}
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="s-nota">Nota de horario</label>
          <textarea
            id="s-nota"
            name="notaHorario"
            className="input"
            rows={2}
            defaultValue={sucursal?.notaHorario ?? ""}
            placeholder="Ej. Todos los días, con cita."
            aria-describedby="s-nota-hint"
            aria-invalid={invalido("horario")}
          />
          <span className="hint" id="s-nota-hint">
            Opcional. Si la escribes, el sitio la muestra en lugar de la tabla de horario (para sucursales que atienden
            con cita).
          </span>
          {error("horario")}
        </div>
      </fieldset>

      <p className="alert" role="alert" hidden={!hayErrores && !mensaje}>
        {mensaje || "Revisa los campos marcados."}
      </p>
      <div className="form-actions">
        <button type="button" className="btn" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar sucursal"}
        </button>
      </div>
    </form>
  );
}
