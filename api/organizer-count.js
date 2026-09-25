// GameLobby — conteo público de comunidades registradas.
// GET /api/organizer-count -> { ok, visible, count? }
//
// Solo devuelve un número agregado (sin datos personales). Público, sin token.
// Reglas (sept 2026):
//  - El conteo es SOLO de registros reales, deduplicados por correo (leads:organizer).
//  - No hay base fundadora ni cupo: no se suma ninguna cifra de respaldo.
//  - Se muestra únicamente si alguien lo autoriza explícitamente con la variable
//    de entorno ORGANIZER_COUNT_VISIBLE=true. Si no, responde visible:false y el
//    frontend oculta el contador.

// Busca una variable de entorno por sufijo, ignorando el prefijo que añada la
// integración (KV_, UPSTASH_REDIS_, REGISTROS_KV_, etc.).
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

  // Cache corto para no martillar el KV.
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");

  if (String(process.env.ORGANIZER_COUNT_VISIBLE || "").toLowerCase() !== "true") {
    return res.status(200).json({ ok: true, visible: false });
  }

  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!kvUrl || !kvToken) {
    return res.status(200).json({ ok: true, visible: false });
  }

  try {
    const r = await fetch(kvUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(["LRANGE", "leads:organizer", "0", "-1"]),
    });
    if (!r.ok) return res.status(200).json({ ok: true, visible: false });
    const data = await r.json();
    const emails = new Set();
    for (const raw of Array.isArray(data.result) ? data.result : []) {
      try {
        const e = String(JSON.parse(raw).email || "").trim().toLowerCase();
        if (e) emails.add(e);
      } catch { /* registro ilegible: se ignora */ }
    }
    return res.status(200).json({ ok: true, visible: emails.size > 0, count: emails.size });
  } catch (e) {
    console.error("[organizer-count] kv error", e);
    return res.status(200).json({ ok: true, visible: false });
  }
}
