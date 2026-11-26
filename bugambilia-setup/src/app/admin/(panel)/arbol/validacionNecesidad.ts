// Reglas de las necesidades (Fase 5: crear y editar libremente; eliminar solo si no
// están ligadas). Las usa el formulario para avisar al momento y la Server Action.

export type ErroresNecesidad = Partial<Record<"nombre" | "descripcion", string>>;

export function validarNecesidad(f: FormData):
  | { datos: { nombre: string; descripcion: string } }
  | { errores: ErroresNecesidad } {
  const nombre = String(f.get("nombre") ?? "").trim();
  const descripcion = String(f.get("descripcion") ?? "").trim();
  const errores: ErroresNecesidad = {};
  if (!nombre) errores.nombre = "Escribe el nombre.";
  else if (nombre.length > 60) errores.nombre = "Máximo 60 caracteres.";
  if (!descripcion) errores.descripcion = "Escribe la descripción.";
  return Object.keys(errores).length ? { errores } : { datos: { nombre, descripcion } };
}
