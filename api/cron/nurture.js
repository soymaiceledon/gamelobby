// GameLobby Xperience — cron diario del nurture de Media Kit.
// Configurado en vercel.json para correr 1x/día. Revisa mk:queue (sorted set,
// score = próximo timestamp a evaluar) y avanza cada lead según su estado.
//
// Máquina de estados (ver api/_email.js para las plantillas):
//   new -> (según researchCompany en media-kit-lead.js) explore_sent | kit_sent
//   explore_sent  + 24h                       -> kit_sent (el kit sale igual, haya respondido o no)
//   kit_sent      + 48h sin clic al kit       -> reengage_sent
//   kit_sent      + 3d  con clic al kit       -> followup_sent
//   reengage_sent + 5d sin más actividad      -> paused
//   followup_sent + 4d sin más actividad      -> paused
//   (clic al link de agendar -> booked, lo maneja cal-click.js directo, sale de la cola ahí)

import { kv, sendEmail, buildKitEmail, buildFollowupEmail, buildReengageEmail } from "../_email.js";

const HOUR = 3600;
const DAY = 24 * HOUR;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers["authorization"] || "";
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const due = await kv(["ZRANGEBYSCORE", "mk:queue", "0", String(now)]);
  const ids = Array.isArray(due.result) ? due.result : [];

  const processed = [];
  for (const id of ids) {
    try {
      const outcome = await processLead(id, now);
      processed.push({ id, outcome });
    } catch (e) {
      console.error("[nurture] error procesando", id, e);
      processed.push({ id, outcome: "error" });
    }
  }

  console.log("[nurture] corrida", JSON.stringify({ now, dueCount: ids.length, processed }));
  return res.status(200).json({ ok: true, dueCount: ids.length, processed });
}

async function processLead(id, now) {
  const { result } = await kv(["GET", `mk:${id}`]);
  if (!result) {
    await kv(["ZREM", "mk:queue", id]);
    return "not_found";
  }
  const state = JSON.parse(result);

  if (state.status === "paused" || state.status === "booked") {
    await kv(["ZREM", "mk:queue", id]);
    return "already_done";
  }

  // explore_sent -> kit_sent (a las 24h, siempre)
  if (state.status === "explore_sent") {
    const msg = buildKitEmail(state);
    const sent = await sendEmail({ to: state.email, subject: msg.subject, text: msg.text, html: msg.html });
    state.status = "kit_sent";
    state.kitSentAt = now;
    await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
    await kv(["ZADD", "mk:queue", String(now + 48 * HOUR), id]);
    return sent.ok ? "kit_sent" : "kit_send_failed";
  }

  // kit_sent -> reengage_sent (sin clic a las 48h) o followup_sent (con clic a los 3d)
  if (state.status === "kit_sent") {
    const elapsed = now - state.kitSentAt;
    if (state.kitClickedAt) {
      if (elapsed >= 3 * DAY) {
        const msg = buildFollowupEmail(state);
        const sent = await sendEmail({ to: state.email, subject: msg.subject, text: msg.text, html: msg.html });
        state.status = "followup_sent";
        state.followupSentAt = now;
        await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
        await kv(["ZADD", "mk:queue", String(now + 4 * DAY), id]);
        return sent.ok ? "followup_sent" : "followup_send_failed";
      }
      await kv(["ZADD", "mk:queue", String(state.kitSentAt + 3 * DAY), id]);
      return "waiting_followup_window";
    }
    if (elapsed >= 48 * HOUR) {
      const msg = buildReengageEmail(state);
      const sent = await sendEmail({ to: state.email, subject: msg.subject, text: msg.text, html: msg.html });
      state.status = "reengage_sent";
      state.reengageSentAt = now;
      await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
      await kv(["ZADD", "mk:queue", String(now + 5 * DAY), id]);
      return sent.ok ? "reengage_sent" : "reengage_send_failed";
    }
    await kv(["ZADD", "mk:queue", String(state.kitSentAt + 48 * HOUR), id]);
    return "waiting_reengage_window";
  }

  // reengage_sent / followup_sent -> paused (si no hay más actividad tras la ventana)
  if (state.status === "reengage_sent" || state.status === "followup_sent") {
    if (state.kitClickedAt && state.status === "reengage_sent") {
      // reaccionó después de todo -> lo dejamos, ya no seguimos automatizando
      state.status = "paused";
      await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
      await kv(["ZREM", "mk:queue", id]);
      return "paused_after_late_click";
    }
    state.status = "paused";
    await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
    await kv(["ZREM", "mk:queue", id]);
    return "paused";
  }

  // Estado inesperado: no lo dejamos en un loop infinito.
  await kv(["ZREM", "mk:queue", id]);
  return "unknown_status";
}
