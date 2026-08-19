// GameLobby Xperience — config pública para los CTAs post-envío del form de sponsors.
// GET /api/sponsor-config -> { ok, whatsappUrl, calendarUrl }
//
// Variables de entorno opcionales (Vercel > Project > Settings > Env):
//   SPONSOR_WHATSAPP_URL -> ej: https://wa.me/50760000000
//   SPONSOR_CALENDAR_URL -> ej: https://cal.com/gamelobby/sponsors
//
// Si no están configuradas, el frontend oculta el botón correspondiente en vez
// de mostrar un link inventado.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  return res.status(200).json({
    ok: true,
    whatsappUrl: process.env.SPONSOR_WHATSAPP_URL || null,
    calendarUrl: process.env.SPONSOR_CALENDAR_URL || null,
  });
}
