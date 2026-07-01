// GameLobby — conteo público de comunidades registradas (para el contador FOMO).
// GET /api/organizer-count -> { ok, reserved, cap }
// Solo devuelve un número agregado (sin datos personales). Público, sin token.
// reserved = base fundadora + registros reales en Vercel KV (leads:organizer).

const BASE = 47;  // base de comunidades fundadoras ya comprometidas
const CAP = 200;  // cupos totales del programa

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

  // Cache corto para permitir "tiempo real" sin martillar el KV.
  res.setHeader("Cache-Control", "public, max-age=10, s-maxage=10");

  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");

  let real = 0;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(kvUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(["LLEN", "leads:organizer"]),
      });
      const data = await r.json();
      real = Number(data.result) || 0;
    } catch (e) {
      console.error("[organizer-count] kv error", e);
    }
  }

  const reserved = Math.min(BASE + real, CAP);
  return res.status(200).json({ ok: true, reserved, cap: CAP });
}
