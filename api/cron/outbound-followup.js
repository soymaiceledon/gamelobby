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
import { OUTBOUND_ROUNDS, pickDueSends, isLegacyContact } from "../../lib/outbound-rounds.js";

const FOLLOWUP2_DELAY_SEC = 2 * 24 * 3600;

const FOLLOWUP3_DELAY_SEC = 6 * 24 * 3600;
const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738";

function buildFollowup2(empresa) {
  return {
    subject: `¿Alcanzaron a ver mi correo? — ${empresa} + GameLobby Xperience`,
    text: `Hola equipo de ${empresa},

Les escribimos hace unos días sobre GameLobby Xperience, la experiencia presencial del ecosistema GameLobby, prevista para agosto de 2027. No sabemos si les llegó.

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

  // ---- 1) Correos 1 de las rondas 2027 que ya tocan (lib/outbound-rounds.js) ----
  const firstSends = [];
  const candidates = pickDueSends(OUTBOUND_ROUNDS, [], now, Infinity);
  const existing = [];
  for (const item of candidates) {
    const r = await kv(["EXISTS", `ob:${item.id}`]);
    // Sin KV no se puede saber si ya se mandó: no se manda nada (evita duplicados).
    if (!r.configured || r.ok === false) { existing.push(item.id); continue; }
    if (r.result) existing.push(item.id);
  }
  for (const item of pickDueSends(candidates, existing, now)) {
    try {
      const sent = await sendEmail({ to: item.to, cc: item.cc, subject: item.subject, text: item.text });
      if (!sent.ok) { firstSends.push({ id: item.id, outcome: sent.skipped ? "sin_resend" : "fallo" }); continue; }
      const state = {
        id: item.id,
        empresa: item.empresa || item.id,
        to: item.to,
        ronda: item.ronda || null,
        pais: item.pais || null,
        producto: item.producto || null,
        status: "sent",
        sentAt: now,
        followup2SentAt: null,
        respondedAt: null,
        followupSubject: item.followupSubject || null,
        followupText: item.followupText || null,
        followup3Subject: item.followup3Subject || null,
        followup3Text: item.followup3Text || null,
      };
      await kv(["SET", `ob:${item.id}`, JSON.stringify(state)]);
      await kv(["ZADD", "ob:queue", String(now + FOLLOWUP2_DELAY_SEC), item.id]);
      firstSends.push({ id: item.id, outcome: "correo1_enviado" });
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      console.error("[outbound-followup] error correo 1", item.id, e);
      firstSends.push({ id: item.id, outcome: "error" });
    }
  }

  // ---- 2) Seguimientos (correo 2 y 3) de los contactos en cola ----
  const due = await kv(["ZRANGEBYSCORE", "ob:queue", "0", String(now)]);
  const ids = Array.isArray(due.result) ? due.result : [];

  const processed = [];
  for (const id of ids) {
    try {
      const { result } = await kv(["GET", `ob:${id}`]);
      if (!result) { await kv(["ZREM", "ob:queue", id]); processed.push({ id, outcome: "not_found" }); continue; }
      const state = JSON.parse(result);

      // Rondas anteriores a la campaña 2027 (Panamá, ago 2026): no se tocan.
      if (isLegacyContact(state)) { processed.push({ id, outcome: "legacy_omitido" }); continue; }

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

  console.log("[outbound-followup] corrida", JSON.stringify({ now, firstSends, dueCount: ids.length, processed }));
  return res.status(200).json({ ok: true, firstSends, dueCount: ids.length, processed });
}
