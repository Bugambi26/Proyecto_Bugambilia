// Días y formato de horarios de sucursales. dia_semana: 1 = lunes … 7 = domingo.

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

type Horario = { diaSemana: number; horaApertura: string; horaCierre: string };

// Un día sin renglón = "Cerrado" (Fase 5).
export function formatoHorario(horarios: Horario[], dia: number): string {
  const h = horarios.find((x) => x.diaSemana === dia);
  return h ? `${h.horaApertura} – ${h.horaCierre}` : "Cerrado";
}

// Día de hoy en Aguascalientes (1–7), sin depender de la zona horaria del servidor.
export function diaDeHoy(): number {
  const nombre = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Mexico_City" }).format(new Date());
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(nombre) + 1;
}
