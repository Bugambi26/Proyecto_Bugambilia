import type { TipoSucursal } from "@/generated/prisma/enums";
import { MAX_IMAGEN, TIPOS_IMAGEN } from "../productos/validacion";

// Reglas del ABC de sucursales (Fase 5, sección 5), ajustadas a lo que decidió la
// clienta el 25 nov 2026: dirección y coordenadas opcionales (la estética no publica
// su dirección), Instagram opcional y una nota que puede reemplazar al horario.
// Las usa el formulario para avisar al momento y la Server Action para no confiar
// en el navegador.

export type CampoSucursal =
  | "nombre"
  | "tipo"
  | "latitud"
  | "longitud"
  | "telefono"
  | "whatsapp"
  | "instagram"
  | "horario"
  | "foto"
  | `dia${number}`;

export type ErroresSucursal = Partial<Record<CampoSucursal, string>>;

export type HorarioValido = { diaSemana: number; horaApertura: string; horaCierre: string };

export type SucursalValida = {
  nombre: string;
  tipo: TipoSucursal;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  notaHorario: string | null;
  horarios: HorarioValido[];
};

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Acepta "kokoro.showroom", "@kokoro.showroom" o la URL del perfil; guarda la URL
// con el mismo formato que el seed (https://www.instagram.com/usuario).
export function normalizarInstagram(texto: string): string | null | undefined {
  const t = texto.trim();
  if (!t) return null;
  const usuario = t
    .replace(/^@/, "")
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(usuario) ? `https://www.instagram.com/${usuario}` : undefined;
}

// Teléfono y WhatsApp: se ignoran espacios, guiones y paréntesis; deben quedar 10 dígitos.
function diezDigitos(texto: string): string | null | undefined {
  const d = texto.replace(/[\s\-().]/g, "");
  if (!d) return null;
  return /^\d{10}$/.test(d) ? d : undefined;
}

export function validarSucursal(f: FormData): { datos: SucursalValida } | { errores: ErroresSucursal } {
  const texto = (campo: string) => String(f.get(campo) ?? "").trim();
  const errores: ErroresSucursal = {};

  const nombre = texto("nombre");
  if (!nombre) errores.nombre = "Escribe el nombre.";

  const tipo = texto("tipo");
  if (tipo !== "Propia" && tipo !== "Tercero") errores.tipo = "Elige el tipo.";

  // Coordenadas: las dos o ninguna (así lo pide también la base).
  const latTxt = texto("latitud").replace(",", ".");
  const lngTxt = texto("longitud").replace(",", ".");
  let latitud: number | null = null;
  let longitud: number | null = null;
  if (latTxt || lngTxt) {
    const lat = Number(latTxt);
    const lng = Number(lngTxt);
    if (!latTxt) errores.latitud = "Escribe la latitud, o deja vacías las dos.";
    else if (!Number.isFinite(lat) || lat < -90 || lat > 90) errores.latitud = "La latitud va de -90 a 90.";
    else latitud = lat;
    if (!lngTxt) errores.longitud = "Escribe la longitud, o deja vacías las dos.";
    else if (!Number.isFinite(lng) || lng < -180 || lng > 180) errores.longitud = "La longitud va de -180 a 180.";
    else longitud = lng;
  }

  const telefono = diezDigitos(texto("telefono"));
  if (telefono === undefined) errores.telefono = "El teléfono lleva 10 dígitos.";
  const whatsapp = diezDigitos(texto("whatsapp"));
  if (whatsapp === undefined) errores.whatsapp = "El WhatsApp lleva 10 dígitos.";

  const instagram = normalizarInstagram(texto("instagram"));
  if (instagram === undefined) errores.instagram = "Escribe el usuario de Instagram (p. ej. kokoro.showroom) o la URL del perfil.";

  // Horario: un rango por día; "Cerrado" = sin renglón. Basta un día abierto o la nota.
  const horarios: HorarioValido[] = [];
  for (let dia = 1; dia <= 7; dia++) {
    if (f.get(`cerrado${dia}`) === "on") continue;
    const abre = texto(`abre${dia}`);
    const cierra = texto(`cierra${dia}`);
    if (!HORA.test(abre) || !HORA.test(cierra)) errores[`dia${dia}`] = "Escribe la hora de apertura y de cierre, o marca «Cerrado».";
    else if (abre >= cierra) errores[`dia${dia}`] = "La apertura debe ser antes del cierre.";
    else horarios.push({ diaSemana: dia, horaApertura: abre, horaCierre: cierra });
  }
  const notaHorario = texto("notaHorario") || null;
  const hayErrorDeDia = Object.keys(errores).some((c) => c.startsWith("dia"));
  if (!hayErrorDeDia && !horarios.length && !notaHorario) {
    errores.horario = "Abre al menos un día o escribe una nota de horario (p. ej. «Solo con cita»).";
  }

  const foto = f.get("foto");
  if (foto instanceof File && foto.size > 0) {
    if (!TIPOS_IMAGEN.includes(foto.type)) errores.foto = "La foto debe ser JPG, PNG o WebP.";
    else if (foto.size > MAX_IMAGEN) errores.foto = "La foto pesa más de 5 MB.";
  }

  if (Object.keys(errores).length) return { errores };
  return {
    datos: {
      nombre,
      tipo: tipo as TipoSucursal,
      direccion: texto("direccion") || null,
      latitud,
      longitud,
      telefono: telefono ?? null,
      whatsapp: whatsapp ?? null,
      instagram: instagram ?? null,
      notaHorario,
      horarios,
    },
  };
}
