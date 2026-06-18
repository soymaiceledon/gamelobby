// GameLobby — captura de leads (Wallet waitlist + B2B)
// Serverless function (Vercel). Guarda en Vercel KV (Upstash Redis) vía REST,
// y reenvía a un webhook opcional. Degrada con gracia si nada está configurado.
//
// Configuración (Vercel > Project > Storage > KV: "Connect"):
//   KV_REST_API_URL, KV_REST_API_TOKEN  -> inyectadas automáticamente al conectar KV.
// Opcional:
//   LEAD_WEBHOOK_URL -> URL a la que se hace POST con cada lead (Discord/Sheets/Zapier).
//
// Los leads quedan en las listas Redis: leads:waitlist y leads:b2b

// Busca una variable de entorno por sufijo, ignorando el prefijo que añada
// la integración (KV_, UPSTASH_REDIS_, REGISTROS_KV_, etc.).
function findEnv(suffix) {
  const key = Object.keys(process.env).find(
    (k) => k === suffix || k.endsWith("_" + suffix)
  );
  return key ? process.env[key] : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const type = body.type === "b2b" ? "b2b" : "waitlist";
  const name = String(body.name || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().slice(0, 200);
  const interest = String(body.interest || "").trim().slice(0, 200);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  const lead = {
    type, name, email, interest: interest || null,
    ts: new Date().toISOString(),
    ua: req.headers["user-agent"] || null,
    ip: req.headers["x-forwarded-for"] || null,
  };

  let stored = false;

  // 1) Persistir en Vercel KV (Upstash Redis REST) si está configurado
  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(kvUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["RPUSH", `leads:${type}`, JSON.stringify(lead)]),
      });
      stored = r.ok;
    } catch (e) {
      console.error("[lead] KV error", e);
    }
  }

  // 2) Reenviar a un webhook propio si está configurado (no bloquea el éxito)
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (e) {
      console.error("[lead] webhook error", e);
    }
  }

  // 3) Siempre dejar rastro en logs (visible en Vercel > Runtime Logs)
  console.log("[GameLobby lead]", JSON.stringify(lead));

  return res.status(200).json({ ok: true, stored });
}
