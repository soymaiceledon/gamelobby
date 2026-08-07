// GameLobby — lectura y borrado de leads capturados (uso interno).
// GET    /api/leads?type=waitlist|b2b&token=XXXX   -> lista los leads
// DELETE /api/leads  (header x-admin-token, body {type, raw}) -> borra un lead
// Protegido por LEADS_ADMIN_TOKEN (defínelo en Vercel > Project > Settings > Env).
// Los leads viven en Vercel KV (Upstash Redis).

// Busca una variable de entorno por sufijo, ignorando el prefijo que añada
// la integración (KV_, UPSTASH_REDIS_, REGISTROS_KV_, etc.).
function findEnv(suffix) {
  const key = Object.keys(process.env).find(
    (k) => k === suffix || k.endsWith("_" + suffix)
  );
  return key ? process.env[key] : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "DELETE") {
    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const adminToken = process.env.LEADS_ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(503).json({ ok: false, error: "admin_token_not_set" });
  }

  // Token: en GET por query, en DELETE por header (evita exponerlo si se loguea la URL).
  const provided = req.method === "DELETE"
    ? (req.headers["x-admin-token"] || "")
    : (req.query.token || "");
  if (provided !== adminToken) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!kvUrl || !kvToken) {
    return res.status(503).json({ ok: false, error: "kv_not_configured" });
  }

  async function kv(cmd) {
    const r = await fetch(kvUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
    });
    return r.json();
  }

  // --- Borrar un lead exacto (incluye duplicados idénticos) ---
  if (req.method === "DELETE") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    body = body || {};
    const type = ["b2b", "organizer", "glx_sponsor"].includes(body.type) ? body.type : "waitlist";
    const raw = String(body.raw || "");
    if (!raw) return res.status(400).json({ ok: false, error: "missing_raw" });
    try {
      const data = await kv(["LREM", `leads:${type}`, "0", raw]);
      return res.status(200).json({ ok: true, removed: data.result || 0 });
    } catch (e) {
      console.error("[leads] delete error", e);
      return res.status(500).json({ ok: false, error: "delete_failed" });
    }
  }

  // --- Listar leads ---
  const type = ["b2b", "organizer", "glx_sponsor"].includes(req.query.type) ? req.query.type : "waitlist";
  try {
    const data = await kv(["LRANGE", `leads:${type}`, "0", "-1"]);
    const items = (data.result || []).map((s) => {
      let o; try { o = JSON.parse(s); } catch { o = {}; }
      o._raw = s; // string original, necesario para borrar con LREM
      return o;
    });
    return res.status(200).json({ ok: true, type, count: items.length, items });
  } catch (e) {
    console.error("[leads] read error", e);
    return res.status(500).json({ ok: false, error: "read_failed" });
  }
}
