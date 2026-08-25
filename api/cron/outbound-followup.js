// GameLobby Xperience — cron diario del seguimiento de TODAS las rondas de correo
// frío de prospección (manual o de la rutina diaria vía api/admin/outbound-send.js).
// Revisa ob:queue (sorted set, score = timestamp del próximo paso) y manda un
// correo 2 genérico a quien no haya sido marcado como respondido (ver
// api/admin/mark-outbound-replied.js) 2 días después del correo 1. Después del
// correo 2, el contacto sale de la cola — no hay correo 3 todavía.

import { kv, sendEmail } from "../_email.js";

const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby";

function buildFollowup2(empresa) {
  return {
    subject: `¿Alcanzaron a ver mi correo? — ${empresa} + GameLobby Xperience`,
    text: `Hola equipo de ${empresa},

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall, Panamá, el 30–31 de octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  };
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers["authorization"] || "";
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const due = await kv(["ZRANGEBYSCORE", "ob:queue", "0", String(now)]);
  const ids = Array.isArray(due.result) ? due.result : [];

  const processed = [];
  for (const id of ids) {
    try {
      const { result } = await kv(["GET", `ob:${id}`]);
      if (!result) { await kv(["ZREM", "ob:queue", id]); processed.push({ id, outcome: "not_found" }); continue; }
      const state = JSON.parse(result);

      if (state.status === "respondio") {
        await kv(["ZREM", "ob:queue", id]);
        processed.push({ id, outcome: "ya_respondio" });
        continue;
      }

      const msg = (state.followupSubject && state.followupText)
        ? { subject: state.followupSubject, text: state.followupText }
        : buildFollowup2(state.empresa || id);
      const sent = await sendEmail({ to: state.to, subject: msg.subject, text: msg.text });
      state.status = "followup2_enviado";
      state.followup2SentAt = now;
      await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
      await kv(["ZREM", "ob:queue", id]); // no hay correo 3 todavía

      processed.push({ id, outcome: sent.ok ? "followup2_enviado" : "followup2_fallo" });
    } catch (e) {
      console.error("[outbound-followup] error", id, e);
      processed.push({ id, outcome: "error" });
    }
  }

  console.log("[outbound-followup] corrida", JSON.stringify({ now, dueCount: ids.length, processed }));
  return res.status(200).json({ ok: true, dueCount: ids.length, processed });
}
