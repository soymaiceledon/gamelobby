// GameLobby — lectura de leads capturados (uso interno).
// GET /api/leads?type=waitlist|b2b&token=XXXX
// Protegido por LEADS_ADMIN_TOKEN (defínelo en Vercel > Project > Settings > Env).
// Devuelve los leads guardados en Vercel KV.

// Busca una variable de entorno por sufijo, ignorando el prefijo que añada
// la integración (KV_, UPSTASH_REDIS_, REGISTROS_KV_, etc.).
function findEnv(suffix) {
  const key = Object.keys(process.env).find(
    (k) => k === suffix || k.endsWith("_" + suffix)
  );
  return key ? process.env[key] : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const adminToken = process.env.LEADS_ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(503).json({ ok: false, error: "admin_token_not_set" });
  }
  if ((req.query.token || "") !== adminToken) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!kvUrl || !kvToken) {
    return res.status(503).json({ ok: false, error: "kv_not_configured" });
  }

  const type = req.query.type === "b2b" ? "b2b" : "waitlist";
  try {
    const r = await fetch(kvUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(["LRANGE", `leads:${type}`, "0", "-1"]),
    });
    const data = await r.json();
    const items = (data.result || []).map((s) => { try { return JSON.parse(s); } catch { return s; } });
    return res.status(200).json({ ok: true, type, count: items.length, items });
  } catch (e) {
    console.error("[leads] read error", e);
    return res.status(500).json({ ok: false, error: "read_failed" });
  }
}
