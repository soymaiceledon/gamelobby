// GameLobby Xperience — marca manualmente que un lead de Media Kit respondió un correo.
// POST /api/mark-replied  body {id}  header x-admin-token
//
// No hay parsing automático de respuestas entrantes (requeriría configurar recepción
// de correo, no solo envío). Este es el botón manual en /admin: cuando revisas tu
// bandeja y ves que alguien contestó, lo marcas aquí — eso detiene el nurture
// automático para ese lead (ya no le llegan correos de seguimiento/re-enganche)
// porque a partir de ahí la conversación la llevas tú directamente.

import { kv } from "./_email.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const adminToken = process.env.LEADS_ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(503).json({ ok: false, error: "admin_token_not_set" });
  }
  if ((req.headers["x-admin-token"] || "") !== adminToken) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const id = String((body || {}).id || "").trim();
  if (!id) return res.status(400).json({ ok: false, error: "missing_id" });

  const { result } = await kv(["GET", `mk:${id}`]);
  if (!result) return res.status(404).json({ ok: false, error: "not_found" });

  let state;
  try { state = JSON.parse(result); } catch { return res.status(500).json({ ok: false, error: "bad_state" }); }

  state.repliedAt = Math.floor(Date.now() / 1000);
  await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
  await kv(["ZREM", "mk:queue", id]);

  return res.status(200).json({ ok: true, repliedAt: state.repliedAt });
}
