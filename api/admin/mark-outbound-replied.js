// GameLobby Xperience — marca manualmente que una empresa de la ronda de correo frío
// (2026-08-22) respondió. Detiene el seguimiento automático para ese contacto.
//
// POST /api/admin/mark-outbound-replied  header x-outbound-secret  body {id}
// El "id" es el nombre de la empresa en minúsculas y con guiones (ej. "banistmo",
// "la-curacao", "mo-vil-cable-wireless"). GET sin body lista todos los ids disponibles.

import { kv } from "../_email.js";

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function handler(req, res) {
  const secret = process.env.OUTBOUND_SEND_SECRET;
  if (!secret || (req.headers["x-outbound-secret"] || "") !== secret) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (req.method === "GET") {
    const { result } = await kv(["ZRANGE", "ob:queue", "0", "-1"]);
    return res.status(200).json({ ok: true, pendientes: result || [] });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const rawId = String((body || {}).id || (body || {}).empresa || "").trim();
  if (!rawId) return res.status(400).json({ ok: false, error: "missing_id" });
  const id = slug(rawId);

  const { result } = await kv(["GET", `ob:${id}`]);
  if (!result) return res.status(404).json({ ok: false, error: "not_found", id });

  const status = String((body || {}).status || "respondio");

  const state = JSON.parse(result);
  state.respondedAt = Math.floor(Date.now() / 1000);
  state.status = status;
  await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
  await kv(["ZREM", "ob:queue", id]);

  return res.status(200).json({ ok: true, id, empresa: state.empresa, status });
}
