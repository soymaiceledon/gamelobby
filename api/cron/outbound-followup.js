// GameLobby Xperience — cron diario del seguimiento de TODAS las rondas de correo
// frío de prospección (manual o de la rutina diaria vía api/admin/outbound-send.js).
// Revisa ob:queue (sorted set, score = timestamp del próximo paso) y avanza cada
// contacto por la secuencia según su status actual:
//   sent               -> manda correo 2 (2 días después del correo 1), reprograma correo 3
//   followup2_enviado  -> manda correo 3 (6 días después del correo 2), último toque
//   followup3_enviado  -> ya no hace nada más, sale de la cola
// Un contacto marcado "respondio" (api/admin/mark-outbound-replied.js) sale de la
// cola en cualquier punto de la secuencia.

import { kv, sendEmail } from "../_email.js";

const FOLLOWUP3_DELAY_SEC = 6 * 24 * 3600;
const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738";

function buildFollowup2(empresa) {
  return {
    subject: `¿Alcanzaron a ver mi correo? — ${empresa} + GameLobby Xperience`,
    text: `Hola equipo de ${empresa},

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall, Panamá, el 30–31 de octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  };
}

function buildFollowup3(empresa) {
  return {
    subject: `¿Seguimos en contacto? — ${empresa} + GameLobby Xperience`,
    text: `Hola equipo de ${empresa},

Te escribimos un par de veces sobre GameLobby Xperience — no sabemos si te llegaron. Sin ningún compromiso: si en algún momento tiene sentido para ${empresa}, aquí seguimos.

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

      if (state.status === "followup2_enviado") {
        const msg = (state.followup3Subject && state.followup3Text)
          ? { subject: state.followup3Subject, text: state.followup3Text }
          : buildFollowup3(state.empresa || id);
        const sent = await sendEmail({ to: state.to, subject: msg.subject, text: msg.text });
        state.status = "followup3_enviado";
        state.followup3SentAt = now;
        await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
        await kv(["ZREM", "ob:queue", id]); // secuencia terminada, no hay correo 4
        processed.push({ id, outcome: sent.ok ? "followup3_enviado" : "followup3_fallo" });
        continue;
      }

      // status === "sent" (o cualquier otro caso base) -> correo 2
      const msg = (state.followupSubject && state.followupText)
        ? { subject: state.followupSubject, text: state.followupText }
        : buildFollowup2(state.empresa || id);
      const sent = await sendEmail({ to: state.to, subject: msg.subject, text: msg.text });
      state.status = "followup2_enviado";
      state.followup2SentAt = now;
      await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
      await kv(["ZADD", "ob:queue", String(now + FOLLOWUP3_DELAY_SEC), id]); // reprograma correo 3

      processed.push({ id, outcome: sent.ok ? "followup2_enviado" : "followup2_fallo" });
    } catch (e) {
      console.error("[outbound-followup] error", id, e);
      processed.push({ id, outcome: "error" });
    }
  }

  console.log("[outbound-followup] corrida", JSON.stringify({ now, dueCount: ids.length, processed }));
  return res.status(200).json({ ok: true, dueCount: ids.length, processed });
}
