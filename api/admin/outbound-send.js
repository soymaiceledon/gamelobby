// GameLobby Xperience — endpoint reutilizable para la rutina diaria de prospección
// de sponsors. Reemplaza el patrón anterior de "crear un endpoint nuevo por ronda y
// borrarlo después" (chocaba todos los días con el límite de 12 Serverless Functions
// del plan Hobby). Este se queda desplegado siempre; cada corrida diaria solo le
// manda la lista del día por POST.
//
// POST /api/admin/outbound-send  header x-outbound-secret
//   body: { items: [{ id, empresa, to, subject, text }] }
//   - id: slug único de la empresa (minúsculas, guiones) — se usa para el tracking
//     y para que el cron de seguimiento sepa a quién mandarle el correo 2.
//   Manda cada correo, y guarda el estado en KV (ob:<id>) + lo agrega a la cola de
//   seguimiento (ob:queue, +2 días) para que api/cron/outbound-followup.js le mande
//   el correo 2 automático si no se marca como respondido antes.
//
// GET /api/admin/outbound-send  header x-outbound-secret
//   Devuelve la lista de ids ya contactados (para no repetir empresa en rondas
//   futuras — la rutina diaria debe consultar esto antes de investigar).

import { kv, sendEmail } from "../_email.js";

const FOLLOWUP_DELAY_SEC = 2 * 24 * 3600;

export default async function handler(req, res) {
  const secret = process.env.OUTBOUND_SEND_SECRET;
  if (!secret || (req.headers["x-outbound-secret"] || "") !== secret) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (req.method === "GET") {
    const { result } = await kv(["KEYS", "ob:*"]);
    const ids = (Array.isArray(result) ? result : [])
      .filter((k) => k !== "ob:queue")
      .map((k) => k.replace(/^ob:/, ""));
    return res.status(200).json({ ok: true, count: ids.length, ids });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const items = Array.isArray((body || {}).items) ? body.items : [];
  if (!items.length) return res.status(400).json({ ok: false, error: "missing_items" });

  const now = Math.floor(Date.now() / 1000);
  const results = [];
  for (const item of items) {
    const id = String(item.id || "").trim();
    const to = Array.isArray(item.to)
      ? item.to.map((x) => String(x).trim()).filter(Boolean)
      : String(item.to || "").trim();
    const hasTo = Array.isArray(to) ? to.length > 0 : !!to;
    if (!id || !hasTo || !item.subject || !item.text) {
      results.push({ id, ok: false, error: "invalid_item" });
      continue;
    }

    const sent = item.skipSend ? { ok: true } : await sendEmail({ to, subject: item.subject, text: item.text });

    const state = {
      id,
      empresa: item.empresa || id,
      to,
      status: "sent",
      sentAt: now,
      followup2SentAt: null,
      respondedAt: null,
    };
    await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
    await kv(["ZADD", "ob:queue", String(now + FOLLOWUP_DELAY_SEC), id]);

    results.push({ id, empresa: state.empresa, to, ok: sent.ok });
    await new Promise((r) => setTimeout(r, 350));
  }

  return res.status(200).json({ ok: true, total: results.length, results });
}
