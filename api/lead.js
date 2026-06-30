// GameLobby — captura de leads (Wallet waitlist + B2B)
// Serverless function (Vercel). Guarda en Vercel KV (Upstash Redis) vía REST,
// y reenvía a un webhook opcional. Degrada con gracia si nada está configurado.
//
// Configuración (Vercel > Project > Storage > KV: "Connect"):
//   KV_REST_API_URL, KV_REST_API_TOKEN  -> inyectadas automáticamente al conectar KV.
// Opcional:
//   LEAD_WEBHOOK_URL -> URL a la que se hace POST con cada lead (Discord/Sheets/Zapier).
//   RESEND_API_KEY   -> activa el email de bienvenida automático (resend.com).
//   MAIL_FROM        -> remitente verificado, ej: "GameLobby <hola@gamelobby.gg>".
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

// Arma el email de bienvenida según el tipo de lead. Voz de marca:
// español neutral-LATAM, tú informal, sin emoji, em-dashes cerrados.
function buildWelcome(lead) {
  const firstName = (lead.name || "").split(/\s+/)[0] || "gamer";
  if (lead.type === "organizer") {
    const comm = lead.community
      ? `Registramos a ${lead.community} como Comunidad Fundadora de GameLobby.`
      : `Registramos tu comunidad como Comunidad Fundadora de GameLobby.`;
    const commHtml = lead.community
      ? `Registramos a <strong>${esc(lead.community)}</strong> como Comunidad Fundadora de GameLobby.`
      : `Registramos tu comunidad como Comunidad Fundadora de GameLobby.`;
    return {
      subject: "Tu comunidad ya es fundadora—GameLobby",
      text:
        `Hola ${firstName},\n\n` +
        `${comm} Eres de los primeros, y eso significa beneficios y condiciones que no se repiten.\n\n` +
        `Desde GameLobby vas a poder organizar torneos con brackets automáticos, cobrar inscripciones al instante, premiar a tus jugadores en su Tarjeta Visa digital, recibir cashback por tus compras y monetizar tu comunidad con suscripciones, pases VIP y espacios para patrocinadores—todo desde un solo lugar.\n\n` +
        `Y no te dejamos solo: a partir de julio, un equipo de soporte directo te acompaña en estrategia, soporte técnico y marketing para que tu pasión se convierta en algo sostenible y escale.\n\n` +
        `Pronto te contactamos con los próximos pasos. Bienvenido—esto apenas empieza.\n\n` +
        `El equipo de GameLobby\n`,
      html:
        `<p>Hola ${esc(firstName)},</p>` +
        `<p>${commHtml} Eres de los primeros, y eso significa <strong>beneficios y condiciones que no se repiten</strong>.</p>` +
        `<p>Desde GameLobby vas a poder organizar torneos con <strong>brackets automáticos</strong>, cobrar inscripciones al instante, premiar a tus jugadores en su <strong>Tarjeta Visa digital</strong>, recibir cashback por tus compras y monetizar tu comunidad con suscripciones, pases VIP y espacios para patrocinadores—todo desde un solo lugar.</p>` +
        `<p>Y no te dejamos solo: a partir de <strong>julio</strong>, un equipo de soporte directo te acompaña en estrategia, soporte técnico y marketing para que tu pasión se convierta en algo sostenible y escale.</p>` +
        `<p>Pronto te contactamos con los próximos pasos. Bienvenido—esto apenas empieza.</p>` +
        `<p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "b2b") {
    const from = lead.company ? ` desde ${lead.company}` : "";
    const interest = lead.interest ? ` Anotamos tu interés en: ${lead.interest}.` : "";
    return {
      subject: "Recibimos tu mensaje—GameLobby",
      text:
        `Hola ${firstName},\n\n` +
        `Gracias por escribirnos${from}.${interest}\n\n` +
        `GameLobby es la primera fintech gamer de Latinoamérica: conectamos a +25,000 gamers activos, +500 torneos al año y +$150,000 USD repartidos en premios.\n\n` +
        `Un miembro de nuestro equipo te contactará con los próximos pasos y el deck del Centro America Tour.\n\n` +
        `El equipo de GameLobby\n`,
      html:
        `<p>Hola ${esc(firstName)},</p>` +
        `<p>Gracias por escribirnos${esc(from)}.${interest ? " " + esc("Anotamos tu interés en: " + lead.interest + ".") : ""}</p>` +
        `<p>GameLobby es la primera fintech gamer de Latinoamérica: conectamos a <strong>+25,000 gamers activos</strong>, <strong>+500 torneos al año</strong> y <strong>+$150,000 USD</strong> repartidos en premios.</p>` +
        `<p>Un miembro de nuestro equipo te contactará con los próximos pasos y el deck del Centro America Tour.</p>` +
        `<p>El equipo de GameLobby</p>`,
    };
  }
  const place = lead.country ? ` desde ${lead.country}` : "";
  return {
    subject: "Estás dentro—bienvenido a GameLobby",
    text:
      `Hola ${firstName},\n\n` +
      `Reservaste tu lugar${place} en la lista de espera del Wallet de GameLobby—la primera fintech gamer de Latinoamérica.\n\n` +
      `Serás de los primeros en activar tu tarjeta Mastercard virtual, ganar puntos por cada consumo y canjearlos por torneos, productos y saldo real.\n\n` +
      `Mientras tanto, ya puedes competir y ganar dinero real en gamelobby.gg.\n\n` +
      `Te avisamos apenas tu Wallet esté listo.\n\n` +
      `El equipo de GameLobby\n`,
    html:
      `<p>Hola ${esc(firstName)},</p>` +
      `<p>Reservaste tu lugar${esc(place)} en la lista de espera del Wallet de GameLobby—la primera fintech gamer de Latinoamérica.</p>` +
      `<p>Serás de los primeros en activar tu <strong>tarjeta Mastercard virtual</strong>, ganar puntos por cada consumo y canjearlos por torneos, productos y saldo real.</p>` +
      `<p>Mientras tanto, ya puedes competir y ganar dinero real en <a href="https://gamelobby.gg">gamelobby.gg</a>.</p>` +
      `<p>Te avisamos apenas tu Wallet esté listo.</p>` +
      `<p>El equipo de GameLobby</p>`,
  };
}

// Escapa texto para insertarlo de forma segura en el HTML del email.
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
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

  // Anti-spam honeypot: el campo "website" está oculto para humanos.
  // Si viene relleno, es un bot: fingimos éxito y descartamos en silencio.
  if (String(body.website || "").trim() !== "") {
    return res.status(200).json({ ok: true, stored: false });
  }

  const type = body.type === "b2b" ? "b2b" : body.type === "organizer" ? "organizer" : "waitlist";
  const name = String(body.name || "").trim().slice(0, 200);
  const company = String(body.company || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().slice(0, 200);
  const country = String(body.country || "").trim().slice(0, 100);
  const interest = String(body.interest || "").trim().slice(0, 200);
  const community = String(body.community || "").trim().slice(0, 200);
  const category = String(body.category || "").trim().slice(0, 100);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  const lead = {
    type, name, company: company || null, email, country: country || null, interest: interest || null,
    community: community || null, category: category || null,
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

  // 3) Email de bienvenida vía Resend si está configurado (no bloquea el éxito)
  let welcomed = false;
  const resendKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM; // ej: "GameLobby <hola@gamelobby.gg>"
  if (resendKey && mailFrom) {
    try {
      const msg = buildWelcome(lead);
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: mailFrom,
          to: lead.email,
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
        }),
      });
      welcomed = r.ok;
      if (!r.ok) console.error("[lead] resend non-ok", r.status, await r.text());
    } catch (e) {
      console.error("[lead] resend error", e);
    }
  }

  // 4) Siempre dejar rastro en logs (visible en Vercel > Runtime Logs)
  console.log("[GameLobby lead]", JSON.stringify(lead));

  return res.status(200).json({ ok: true, stored, welcomed });
}
