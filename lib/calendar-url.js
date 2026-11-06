// Enlace público vigente para agendar una reunión de patrocinio.
// Vive fuera de /api: Vercel publica cada .js de esa carpeta como función,
// y este módulo no es un endpoint.
//
// Producción tenía SPONSOR_CALENDAR_URL = el appointment viejo
// (calendar.app.google/gxjJELrWfsip6PG69). Ese id ya no se publica:
// si la variable falta o todavía trae el id retirado, se usa el enlace nuevo.
// Un valor de entorno distinto y vigente se respeta.

export const SPONSOR_CALENDAR_URL = "https://calendar.app.google/paVtHHDVLxzuwhFq8";
const RETIRED_CALENDAR_ID = "gxjJELrWfsip6PG69";

export function sponsorCalendarUrl() {
  const fromEnv = String(process.env.SPONSOR_CALENDAR_URL || "").trim();
  if (!fromEnv || fromEnv.includes(RETIRED_CALENDAR_ID)) return SPONSOR_CALENDAR_URL;
  return fromEnv;
}
