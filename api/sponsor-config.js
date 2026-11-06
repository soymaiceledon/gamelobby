// GameLobby Xperience — config pública para los CTAs post-envío del form de sponsors.
// GET /api/sponsor-config -> { ok, whatsappUrl, calendarUrl }
//
// Variables de entorno opcionales (Vercel > Project > Settings > Env):
//   SPONSOR_WHATSAPP_URL -> ej: https://wa.me/50760000000
//   SPONSOR_CALENDAR_URL -> se usa solo si no es el appointment retirado
//     gxjJELrWfsip6PG69. Si falta o sigue siendo el viejo, calendarUrl es
//     https://calendar.app.google/paVtHHDVLxzuwhFq8
//
// WhatsApp: si no está configurado, el frontend oculta el botón en vez de
// mostrar un link inventado. El calendario siempre tiene un enlace real.

import { sponsorCalendarUrl } from "./calendar-url.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  return res.status(200).json({
    ok: true,
    whatsappUrl: process.env.SPONSOR_WHATSAPP_URL || null,
    calendarUrl: sponsorCalendarUrl(),
  });
}
