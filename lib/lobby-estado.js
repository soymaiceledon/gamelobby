// Estado de una tarjeta de Torneo Flash según la hora de Panamá (UTC-5, sin horario de verano).
// El día del torneo, antes de las 18:50: «HOY».
// De las 18:50 a las 21:00: «Inscripciones cerradas».
// Después de las 21:00, o en un día posterior: «Finalizado».
// Sin data-fecha (por ejemplo Free Fire reprogramado) no hay estado.

export const HORA_CIERRE_MIN = 18 * 60 + 50;
export const HORA_FIN_MIN = 21 * 60;

export function partesPanama(date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Panama",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const o = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") o[p.type] = p.value;
  }
  let hour = Number(o.hour);
  if (hour === 24) hour = 0;
  return {
    fecha: `${o.year}-${String(o.month).padStart(2, "0")}-${String(o.day).padStart(2, "0")}`,
    minutos: hour * 60 + Number(o.minute),
  };
}

export function estadoTorneo(fechaIso, ahora) {
  if (!fechaIso) return null;
  const { fecha, minutos } = partesPanama(ahora);
  if (fechaIso > fecha) return null;
  if (fechaIso < fecha) return "Finalizado";
  if (minutos < HORA_CIERRE_MIN) return "HOY";
  if (minutos <= HORA_FIN_MIN) return "Inscripciones cerradas";
  return "Finalizado";
}
