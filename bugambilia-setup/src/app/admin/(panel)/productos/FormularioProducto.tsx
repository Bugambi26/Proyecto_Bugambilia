"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { TipoProducto } from "@/generated/prisma/enums";
import { estiloLinea, formatearPrecio, ORDEN_FILTRO_TIPOS, TIPOS_PRODUCTO } from "@/lib/catalogo";
import { avisarEnSiguientePagina, useAviso } from "../Aviso";
import { guardarProducto } from "./acciones";
import { MAX_IMAGEN, TIPOS_IMAGEN, validarProducto, type CampoProducto, type ErroresProducto } from "./validacion";

export type ProductoEditable = {
  id: number;
  nombre: string;
  lineaId: number;
  tipoProducto: TipoProducto;
  ingredientes: string;
  beneficio: string;
  contenidoNeto: string | null;
  precio: string | null; // "123.45"
  stock: number;
  activo: boolean;
  imagenUrl: string | null;
  necesidades: number[];
};

type Opcion = { id: number; nombre: string };

// Next 16 conserva el estado de las páginas ya visitadas (<Activity>). Sin una
// llave, al volver a "Dar de alta" seguirían los datos de la vez anterior y el
// botón en "Guardando…". bfcacheId cambia en cada navegación nueva (no al usar
// atrás/adelante). "Editar" usa como llave los datos del producto (ver [id]/page).
export function FormularioAlta(props: { lineas: Opcion[]; necesidades: Opcion[] }) {
  const { bfcacheId } = useRouter();
  return <FormularioProducto key={bfcacheId} producto={null} {...props} />;
}

// Formulario de admin/producto.html: vacío para el alta, con datos para el cambio.
export function FormularioProducto({
  producto,
  lineas,
  necesidades,
}: {
  producto: ProductoEditable | null;
  lineas: Opcion[];
  necesidades: Opcion[];
}) {
  const { aviso, mostrar } = useAviso();
  const formulario = useRef<HTMLFormElement>(null);
  const dialogoBaja = useRef<HTMLDialogElement>(null);

  // Campos que alimentan la vista previa de la tarjeta.
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [lineaId, setLineaId] = useState(producto?.lineaId ?? lineas[0]?.id ?? 0);
  const [contenido, setContenido] = useState(producto?.contenidoNeto ?? "250 ml");
  const [precio, setPrecio] = useState(producto?.precio ?? "");
  const [stock, setStock] = useState(String(producto?.stock ?? 0));
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [elegidas, setElegidas] = useState<number[]>(producto?.necesidades ?? []);

  // Imagen: la actual (URL), una nueva ya reducida (archivo + vista previa) o ninguna.
  const [imagenNueva, setImagenNueva] = useState<{ archivo: File; url: string } | null>(null);
  const [quitarImagen, setQuitarImagen] = useState(false);
  const imagenVisible = imagenNueva?.url ?? (quitarImagen ? null : producto?.imagenUrl ?? null);

  const [errores, setErrores] = useState<ErroresProducto>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Libera la vista previa anterior al cambiar de imagen o salir de la página.
  useEffect(() => {
    if (!imagenNueva) return;
    return () => URL.revokeObjectURL(imagenNueva.url);
  }, [imagenNueva]);

  async function elegirImagen(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setErrores((e) => ({ ...e, imagen: "La imagen debe ser JPG, PNG o WebP." }));
      return;
    }
    if (archivo.size > MAX_IMAGEN) {
      setErrores((e) => ({ ...e, imagen: "La imagen pesa más de 5 MB." }));
      return;
    }
    try {
      const reducida = await reducirImagen(archivo, 600);
      setImagenNueva({ archivo: reducida, url: URL.createObjectURL(reducida) });
      setQuitarImagen(false);
      setErrores((e) => ({ ...e, imagen: undefined }));
    } catch {
      mostrar("No se pudo leer la imagen");
    }
  }

  function quitar() {
    setImagenNueva(null);
    setQuitarImagen(true);
  }

  function alternarNecesidad(id: number) {
    setElegidas((lista) => (lista.includes(id) ? lista.filter((n) => n !== id) : [...lista, id]));
  }

  // Desactivar pide confirmación (Fase 5); reactivar no.
  function alternarActivo() {
    if (activo) dialogoBaja.current?.showModal();
    else setActivo(true);
  }

  function datosDelFormulario() {
    const f = new FormData(formulario.current!);
    elegidas.forEach((id) => f.append("necesidades", String(id)));
    f.set("activo", String(activo));
    if (producto) f.set("id", String(producto.id));
    if (imagenNueva) f.set("imagen", imagenNueva.archivo);
    if (quitarImagen) f.set("quitarImagen", "1");
    return f;
  }

  function enfocarPrimerError(campos: ErroresProducto) {
    const orden: CampoProducto[] = ["nombre", "lineaId", "tipoProducto", "ingredientes", "beneficio", "precio", "stock"];
    const primero = orden.find((c) => campos[c]);
    if (primero) formulario.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
  }

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = datosDelFormulario();
    setMensaje("");

    const local = validarProducto(datos);
    if ("errores" in local) {
      setErrores(local.errores);
      enfocarPrimerError(local.errores);
      return;
    }

    setEnviando(true);
    // Si se guarda, la acción redirige al inventario desde el servidor y este
    // código ya no sigue; por eso el aviso se deja listo antes y se cancela si falla.
    avisarEnSiguientePagina(producto ? "Cambios guardados" : "Producto dado de alta");
    let resultado;
    try {
      resultado = await guardarProducto(datos);
    } catch {
      resultado = { ok: false as const, errores: {}, mensaje: "No se pudo guardar. Revisa tu conexión e intenta de nuevo." };
    }
    if (resultado) {
      avisarEnSiguientePagina("");
      setErrores(resultado.errores);
      setMensaje(resultado.mensaje ?? "");
      setEnviando(false);
      enfocarPrimerError(resultado.errores);
    }
  }

  const hayErrores = Object.values(errores).some(Boolean);
  const lineaElegida = lineas.find((l) => l.id === lineaId);
  const stockNumero = Number.parseInt(stock, 10) || 0;
  const precioVista = /^\d+([.,]\d{1,2})?$/.test(precio.trim()) && Number(precio.replace(",", ".")) > 0
    ? formatearPrecio(precio.replace(",", "."))
    : null;
  const invalido = (campo: CampoProducto) => (errores[campo] ? true : undefined);
  const error = (campo: CampoProducto) =>
    errores[campo] ? (
      <span className="error" id={`${campo}-error`}>
        {errores[campo]}
      </span>
    ) : null;

  return (
    <div className="form-layout">
      <form className="panel" ref={formulario} onSubmit={guardar} noValidate>
        <fieldset className="fieldset">
          <legend>Datos generales</legend>
          <div className="field full">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              name="nombre"
              className="input"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={invalido("nombre")}
              aria-describedby={errores.nombre ? "nombre-error" : undefined}
            />
            {error("nombre")}
          </div>
          <div className="field">
            <label htmlFor="linea">Línea *</label>
            <select
              id="linea"
              name="lineaId"
              className="input"
              required
              value={lineaId}
              onChange={(e) => setLineaId(Number(e.target.value))}
              aria-invalid={invalido("lineaId")}
            >
              {lineas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
            {producto && lineaId !== producto.lineaId && (
              <span className="hint" role="status">
                Cambiaste la línea: revisa que las necesidades sigan correspondiendo.
              </span>
            )}
            {error("lineaId")}
          </div>
          <div className="field">
            <label htmlFor="tipo">Tipo de producto *</label>
            <select
              id="tipo"
              name="tipoProducto"
              className="input"
              required
              defaultValue={producto?.tipoProducto ?? ORDEN_FILTRO_TIPOS[0]}
              aria-invalid={invalido("tipoProducto")}
            >
              {ORDEN_FILTRO_TIPOS.map((t) => (
                <option key={t} value={t}>
                  {TIPOS_PRODUCTO[t].etiqueta}
                </option>
              ))}
            </select>
            {error("tipoProducto")}
          </div>
          <div className="field full">
            <label htmlFor="ingredientes">Ingredientes protagonistas *</label>
            <input
              id="ingredientes"
              name="ingredientes"
              className="input"
              required
              defaultValue={producto?.ingredientes}
              aria-invalid={invalido("ingredientes")}
              aria-describedby={errores.ingredientes ? "ingredientes-error" : undefined}
            />
            {error("ingredientes")}
          </div>
          <div className="field full">
            <label htmlFor="beneficio">Beneficio principal *</label>
            <textarea
              id="beneficio"
              name="beneficio"
              className="input"
              rows={3}
              required
              defaultValue={producto?.beneficio}
              aria-invalid={invalido("beneficio")}
              aria-describedby={errores.beneficio ? "beneficio-error" : "beneficio-hint"}
            />
            <span className="hint" id="beneficio-hint">
              Se muestra en el detalle del producto.
            </span>
            {error("beneficio")}
          </div>
          <div className="field">
            <label htmlFor="contenido">Contenido neto</label>
            <input
              id="contenido"
              name="contenidoNeto"
              className="input"
              placeholder="Ej. 250 ml"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="precio">Precio (MXN)</label>
            <input
              id="precio"
              name="precio"
              className="input"
              inputMode="decimal"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              aria-invalid={invalido("precio")}
              aria-describedby="precio-error"
            />
            <span className="error" id="precio-error" hidden={!errores.precio}>
              {errores.precio ?? "El precio debe ser mayor a 0."}
            </span>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Inventario</legend>
          <div className="field">
            <label htmlFor="stock">Stock (piezas, global) *</label>
            <input
              id="stock"
              name="stock"
              className="input"
              type="number"
              min={0}
              step={1}
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              aria-invalid={invalido("stock")}
              aria-describedby={errores.stock ? "stock-error" : undefined}
            />
            {error("stock")}
          </div>
          {/* Fase 5: el producto se crea activo; el interruptor solo aparece al editar. */}
          {producto && (
            <div className="field">
              <span className="field__label" id="t-estado">
                Estado
              </span>
              <button
                type="button"
                className="switch"
                role="switch"
                aria-checked={activo}
                aria-labelledby="t-estado"
                onClick={alternarActivo}
              >
                {activo ? "Activo" : "Inactivo (dado de baja)"}
              </button>
              <span className="hint">Inactivo = dado de baja: no aparece en el sitio ni en el chatbot.</span>
            </div>
          )}
        </fieldset>

        <fieldset className="fieldset" style={{ display: "flex", flexDirection: "column" }}>
          <legend>Imagen</legend>
          <div className="row gap-16">
            <Image
              className={`ph ph--product${imagenVisible ? "" : " ph--logo"}`}
              style={{ width: 120, height: 120 }}
              src={imagenVisible ?? "/img/logo.webp"}
              alt="Imagen actual del producto"
              width={120}
              height={120}
              unoptimized={!!imagenNueva}
            />
            <div className="stack gap-8">
              <label htmlFor="img" className="btn" style={{ alignSelf: "flex-start" }}>
                {imagenVisible ? "Subir otra imagen" : "Subir imagen"}
              </label>
              <input
                id="img"
                type="file"
                accept={TIPOS_IMAGEN.join(",")}
                className="sr-only"
                onChange={elegirImagen}
                aria-invalid={invalido("imagen")}
              />
              {imagenVisible && (
                <button type="button" className="btn-link" style={{ alignSelf: "flex-start", padding: 0 }} onClick={quitar}>
                  Quitar imagen (usar el logo)
                </button>
              )}
              <span className="hint">
                Foto cuadrada con fondo beige liso. JPG, PNG o WebP de hasta 5 MB. Sin foto se muestra el logo.
              </span>
              {error("imagen")}
            </div>
          </div>
        </fieldset>

        <fieldset className="fieldset" style={{ display: "flex", flexDirection: "column" }}>
          <legend>Necesidades que cubre (chatbot) *</legend>
          <span className="hint">El chatbot recomienda el producto a quien elija estas necesidades. Elige al menos una.</span>
          <div className="chips">
            {necesidades.map((n) => (
              <button
                key={n.id}
                type="button"
                className="chip"
                aria-pressed={elegidas.includes(n.id)}
                onClick={() => alternarNecesidad(n.id)}
              >
                {n.nombre}
              </button>
            ))}
          </div>
          {error("necesidades")}
        </fieldset>

        <p className="alert" role="alert" hidden={!hayErrores && !mensaje}>
          {mensaje || "Revisa los campos marcados."}
        </p>
        <div className="form-actions">
          <Link href="/admin/inventario" className="btn">
            Cancelar
          </Link>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      <aside aria-label="Vista previa" className="stack gap-10" style={{ maxWidth: 300 }}>
        <span className="lbl" style={{ color: "var(--muted)" }}>
          Vista previa en el catálogo
        </span>
        <article className="card product-card" style={estiloLinea(lineaElegida?.nombre ?? "")}>
          <Image
            className={`ph ph--product product-card__img${imagenVisible ? "" : " ph--logo"}`}
            style={{ height: 200 }}
            src={imagenVisible ?? "/img/logo.webp"}
            alt=""
            width={300}
            height={200}
            unoptimized={!!imagenNueva}
          />
          <div className="product-card__body">
            <span className="product-card__line">{lineaElegida?.nombre}</span>
            <strong className="product-card__name">{nombre.trim() || "[Nombre del producto]"}</strong>
            {contenido.trim() && <span className="small">{contenido.trim()}</span>}
            <div className="product-card__foot">
              <strong>{precioVista}</strong>
              <span className={`badge${!activo || stockNumero === 0 ? " badge--out" : ""}`}>
                {!activo ? "Inactivo" : stockNumero > 0 ? "Disponible" : "Agotado"}
              </span>
            </div>
          </div>
        </article>
      </aside>

      {/* Confirmación de baja desde el interruptor de estado */}
      <dialog
        className="dialog"
        ref={dialogoBaja}
        aria-labelledby="t-baja"
        onClose={() => dialogoBaja.current?.returnValue === "confirmar" && setActivo(false)}
      >
        <form method="dialog">
          <h2 id="t-baja">¿Dar de baja «{nombre.trim() || producto?.nombre}»?</h2>
          <p>
            Este producto dejará de verse en el sitio y en las recomendaciones del chatbot. No se borra: podrás
            reactivarlo después. El cambio se aplica al guardar.
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
    </div>
  );
}

// Reduce la imagen a "max" px por el lado mayor y la convierte a WebP (o JPEG si
// el navegador no sabe hacer WebP), igual que el mockup. Así pesa poco al subirla.
function reducirImagen(archivo: File, max: number): Promise<File> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new window.Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(img.width * k);
      lienzo.height = Math.round(img.height * k);
      lienzo.getContext("2d")!.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(url);
      lienzo.toBlob(
        (webp) => {
          if (webp?.type === "image/webp") return resolver(new File([webp], "producto.webp", { type: "image/webp" }));
          lienzo.toBlob(
            (jpg) => (jpg ? resolver(new File([jpg], "producto.jpg", { type: "image/jpeg" })) : rechazar(new Error())),
            "image/jpeg",
            0.8,
          );
        },
        "image/webp",
        0.8,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}
