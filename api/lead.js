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
// Fuente de verdad (sept 2026): plataforma GameLobby.gg prevista para octubre de 2026;
// Gamer Wallet con despliegue progresivo entre mediados de octubre y noviembre;
// GameLobby Xperience en agosto de 2027. Nada de esto se presenta como ya disponible.
function buildWelcome(lead) {
  const firstName = (lead.name || "").split(/\s+/)[0] || "";
  const hola = firstName ? `Hola ${firstName},` : "Hola,";
  const holaHtml = firstName ? `Hola ${esc(firstName)},` : "Hola,";
  const from = lead.company ? ` desde ${lead.company}` : "";
  const fromHtml = lead.company ? ` desde ${esc(lead.company)}` : "";

  if (lead.type === "organizer") {
    const comm = lead.community
      ? `Recibimos el registro de ${lead.community} como Comunidad Fundadora de GameLobby.`
      : `Recibimos el registro de tu comunidad como Comunidad Fundadora de GameLobby.`;
    const commHtml = lead.community
      ? `Recibimos el registro de <strong>${esc(lead.community)}</strong> como Comunidad Fundadora de GameLobby.`
      : `Recibimos el registro de tu comunidad como Comunidad Fundadora de GameLobby.`;
    const p2 = "Estamos preparando el lanzamiento de la plataforma para octubre de 2026. Queremos acompañarte en la organización de torneos y en el desarrollo de opciones para monetizar tu comunidad, con orientación en estrategia, soporte técnico y marketing.";
    const p3 = "La incorporación será progresiva. Te compartiremos las funciones disponibles, las condiciones y el siguiente paso para tu comunidad. La Gamer Wallet tiene un despliegue previsto entre mediados de octubre y noviembre; sus funciones dependerán de disponibilidad y elegibilidad.";
    const p4 = "Para preparar el acompañamiento, cuéntanos qué juego reúne a tu comunidad y qué te gustaría monetizar primero.";
    return {
      subject: "Tu comunidad ya está registrada en GameLobby",
      text: `${hola}\n\n${comm}\n\n${p2}\n\n${p3}\n\n${p4}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${commHtml}</p><p>${esc(p2)}</p><p>${esc(p3)}</p><p>${esc(p4)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "glx_sponsor") {
    const goals = lead.goals ? ` Anotamos que buscas: ${lead.goals}.` : "";
    const p1 = `Gracias por escribirnos${from}.${goals}`;
    const p2 = "GameLobby Xperience es la experiencia presencial del ecosistema GameLobby, prevista para agosto de 2027. Formato, sede y condiciones comerciales se detallarán en la propuesta.";
    const p3 = "Nuestro equipo revisará tu solicitud y te contactará con los próximos pasos.";
    return {
      subject: "Recibimos tu solicitud—GameLobby Xperience",
      text: `${hola}\n\n${p1}\n\n${p2}\n\n${p3}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>${esc(p3)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "investor") {
    const p1 = `Gracias por tu interés en GameLobby${from}. Recibimos tu solicitud de conversación de inversión.`;
    const p2 = "Nuestro equipo la revisará y te contactará para coordinar una primera conversación. El material ampliado y el data room son de acceso restringido y se comparten en conversaciones calificadas.";
    return {
      subject: "Recibimos tu solicitud—GameLobby",
      text: `${hola}\n\n${p1}\n\n${p2}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "b2b") {
    const interest = lead.interest ? ` Anotamos tu interés en: ${lead.interest}.` : "";
    const p1 = `Gracias por escribirnos${from}.${interest}`;
    const p2 = "Nuestro equipo revisará tu mensaje y te contactará con los próximos pasos y una propuesta a la medida. Formato, alcance y condiciones comerciales se definen contigo.";
    return {
      subject: "Recibimos tu mensaje—GameLobby",
      text: `${hola}\n\n${p1}\n\n${p2}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  // waitlist de la Gamer Wallet
  const place = lead.country ? ` desde ${lead.country}` : "";
  const p1 = `Ya recibimos tu interés en la Gamer Wallet de GameLobby${place}. Te avisaremos sobre el lanzamiento y los pasos para activarla cuando esté disponible para ti.`;
  const p2 = "Este registro no activa una cuenta ni garantiza disponibilidad inmediata. La primera etapa se concentra en Centroamérica y México, con despliegue progresivo entre octubre y noviembre de 2026; te informaremos los requisitos y próximos pasos.";
  return {
    subject: "Ya recibimos tu interés—GameLobby",
    text: `${hola}\n\n${p1}\n\n${p2}\n\nEl equipo de GameLobby\n`,
    html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>El equipo de GameLobby</p>`,
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

  const VALID_TYPES = ["b2b", "organizer", "glx_sponsor", "investor"];
  const type = VALID_TYPES.includes(body.type) ? body.type : "waitlist";
  const name = String(body.name || "").trim().slice(0, 200);
  const company = String(body.company || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 60);
  const country = String(body.country || "").trim().slice(0, 100);
  const interest = String(body.interest || "").trim().slice(0, 200);
  const community = String(body.community || "").trim().slice(0, 200);
  const category = String(body.category || "").trim().slice(0, 100);
  const link = String(body.link || "").trim().slice(0, 300);
  const message = String(body.message || "").trim().slice(0, 2000);
  const jobTitle = String(body.jobTitle || "").trim().slice(0, 150);
  const companyCategory = String(body.companyCategory || "").trim().slice(0, 100);
  const goals = String(body.goals || "").trim().slice(0, 400);
  const scale = String(body.scale || "").trim().slice(0, 60);
  const experiences = String(body.experiences || "").trim().slice(0, 400);
  const consentMarketing = body.consentMarketing === true || body.consentMarketing === "true";
  const attr = (v) => String(v || "").trim().slice(0, 100) || null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  const lead = {
    type, name, company: company || null, email, phone: phone || null, country: country || null, interest: interest || null,
    community: community || null, category: category || null, link: link || null, message: message || null,
    jobTitle: jobTitle || null, companyCategory: companyCategory || null, goals: goals || null,
    scale: scale || null, experiences: experiences || null,
    consentMarketing,
    utm_source: attr(body.utm_source), utm_medium: attr(body.utm_medium),
    utm_campaign: attr(body.utm_campaign), utm_content: attr(body.utm_content),
    page: attr(body.page),
    ts: new Date().toISOString(),
    ua: req.headers["user-agent"] || null,
    ip: req.headers["x-forwarded-for"] || null,
  };

  let stored = false;
  let duplicate = false;

  // 1) Persistir en Vercel KV (Upstash Redis REST) si está configurado
  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");
  if (kvUrl && kvToken) {
    try {
      const kvCall = (cmd) => fetch(kvUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      });
      // SADD devuelve 1 si el correo es nuevo para este tipo de registro y 0 si ya existía.
      const idx = await kvCall(["SADD", `leads:idx:${type}`, email.toLowerCase()]);
      const idxJson = idx.ok ? await idx.json() : null;
      if (idxJson && idxJson.result === 0) {
        duplicate = true;
        stored = true; // ya estaba guardado: no se duplica
      } else {
        const r = await kvCall(["RPUSH", `leads:${type}`, JSON.stringify(lead)]);
        stored = r.ok;
      }
    } catch (e) {
      console.error("[lead] KV error", e);
    }
  }

  // 2) Reenviar a un webhook propio si está configurado (no bloquea el éxito)
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook && !duplicate) {
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
  if (resendKey && mailFrom && !duplicate) {
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
  console.log("[GameLobby lead]", JSON.stringify({ type: lead.type, ts: lead.ts, stored, duplicate }));

  return res.status(200).json({ ok: true, stored, duplicate, welcomed });
}
