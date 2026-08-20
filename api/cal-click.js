// GameLobby Xperience — redirect con tracking al link de agendar llamada.
// GET /api/cal-click?id=<leadId> -> marca el clic, manda el correo "Nos vemos pronto"
// (solo la primera vez), y redirige al calendario. Nunca bloquea el acceso.

import { kv, sendEmail, buildBookingThanksEmail } from "./_email.js";

function calendarUrl() {
  return process.env.SPONSOR_CALENDAR_URL || "/xperience#glx-sponsors";
}

export default async function handler(req, res) {
  const id = String(req.query.id || "").trim();

  if (id) {
    try {
      const { result } = await kv(["GET", `mk:${id}`]);
      if (result) {
        const state = JSON.parse(result);
        if (!state.calClickedAt) {
          state.calClickedAt = Math.floor(Date.now() / 1000);
          state.status = "booked";
          await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
          await kv(["ZREM", "mk:queue", id]);
          const msg = buildBookingThanksEmail(state);
          await sendEmail({ to: state.email, subject: msg.subject, text: msg.text, html: msg.html });
        }
      }
    } catch (e) {
      console.error("[cal-click] error", e);
    }
  }

  res.writeHead(302, { Location: calendarUrl() });
  res.end();
}
