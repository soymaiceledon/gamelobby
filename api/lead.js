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
    const p2 = "Como Comunidad Fundadora tendrás tu propio lobby en gamelobby.gg, con rooms de tus juegos y modos, inscripciones, brackets, chat, juez, streaming y cobros en un solo lugar. Para las fundadoras es gratis y sin comisiones por tus torneos (solo aplican los cargos básicos de la Wallet, como la emisión de tarjeta).";
    const p3 = "En los próximos días te escribimos para una llamada corta, para darte tu lobby y armar tu torneo de lanzamiento. Mientras tanto, descarga la Wallet GameLobby (App Store y Google Play) en https://www.gamelobby.live/wallet: con ella se cobran las inscripciones y se pagan los premios, sin efectivo.";
    const p4 = "Si quieres adelantar, responde este correo con el juego, el día y la hora en que juega tu comunidad.";
    return {
      subject: "Tu comunidad ya está registrada en GameLobby",
      text: `${hola}\n\n${comm}\n\n${p2}\n\n${p3}\n\n${p4}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${commHtml}</p><p>${esc(p2)}</p><p>${esc(p3)}</p><p>${esc(p4)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "glx_sponsor") {
    const goals = lead.goals ? ` Anotamos que buscas: ${lead.goals}.` : "";
    const p1 = `Gracias por escribirnos${from}.${goals}`;
    const p2 = "GameLobby Xperience es el tour gamer de México y Centroamérica, con Gran Final presencial en Panamá el 28 y 29 de agosto de 2027. Te preparamos una propuesta a la medida de tu marca.";
    const p3 = "Nuestro equipo revisará tu solicitud y te contactará con los próximos pasos.";
    return {
      subject: "Recibimos tu solicitud—GameLobby Xperience",
      text: `${hola}\n\n${p1}\n\n${p2}\n\n${p3}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>${esc(p3)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "xp_fan") {
    const where = lead.country ? ` desde ${lead.country}` : "";
    const p1 = `Ya estás en la lista de GameLobby Xperience 2027${where}.`;
    const p2 = "Serás de los primeros en saber cuándo abre la venta de entradas para la Gran Final en Panamá (28 y 29 de agosto de 2027) y cuándo arrancan las clasificatorias de tu país, para que puedas competir.";
    const p3 = "Mientras tanto, hay torneos gratis cada semana en GameLobby.gg.";
    return {
      subject: "Ya estás en la lista de GameLobby Xperience 2027",
      text: `${hola}\n\n${p1}\n\n${p2}\n\n${p3}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>${esc(p3)} <a href="https://gamelobby.gg">Entrar a GameLobby.gg</a></p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "xp_press") {
    const p1 = `Recibimos tu solicitud de acreditación de prensa para GameLobby Xperience 2027${from}.`;
    const p2 = "Te escribiremos con el kit de prensa, el calendario del tour y las condiciones de acreditación para la Gran Final en Panamá (28 y 29 de agosto de 2027). Las acreditaciones se confirman por medio y por fecha.";
    return {
      subject: "Recibimos tu solicitud de acreditación—GameLobby Xperience",
      text: `${hola}\n\n${p1}\n\n${p2}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>El equipo de GameLobby</p>`,
    };
  }
  if (lead.type === "xp_creator") {
    const p1 = "Recibimos tu postulación al programa de creadores y embajadores de GameLobby Xperience 2027.";
    const p2 = "Revisamos cada perfil y te contactamos si encaja con el tour: contenido antes, durante y después del evento, presencia en la Gran Final y colaboraciones con marcas.";
    return {
      subject: "Recibimos tu postulación—Creadores GameLobby Xperience",
      text: `${hola}\n\n${p1}\n\n${p2}\n\nEl equipo de GameLobby\n`,
      html: `<p>${holaHtml}</p><p>${esc(p1)}</p><p>${esc(p2)}</p><p>El equipo de GameLobby</p>`,
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

  const VALID_TYPES = ["b2b", "organizer", "glx_sponsor", "investor", "xp_fan", "xp_press", "xp_creator"];
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
  if (!webhook) {
    console.log("[lead] webhook not configured (LEAD_WEBHOOK_URL unset) — no se reenvía al Sheet");
  } else if (duplicate) {
    console.log("[lead] webhook skipped (duplicate email, no se reenvía)");
  } else {
    try {
      const wr = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      console.log("[lead] webhook response", { status: wr.status, ok: wr.ok });
    } catch (e) {
      console.error("[lead] webhook error", String(e));
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
          ...(lead.type === "organizer" ? { reply_to: process.env.LEADS_NOTIFY_EMAIL || "m.celedon@gamelobby.live" } : {}),
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

  // 3b) Aviso interno al equipo comercial para leads de marcas (b2b y sponsors de Xperience).
  // Llega a LEADS_NOTIFY_EMAIL (por defecto, el correo de Mai) con reply-to al lead.
  if (resendKey && mailFrom && !duplicate && ["b2b", "organizer", "glx_sponsor", "xp_press", "xp_creator"].includes(lead.type)) {
    try {
      const notifyTo = process.env.LEADS_NOTIFY_EMAIL || "m.celedon@gamelobby.live";
      const rows = [
        ["Nombre", lead.name], ["Empresa o medio", lead.company], ["Canal o perfil", lead.link], ["Comunidad", lead.community], ["Juego", lead.game], ["País", lead.country], ["Tamaño", lead.scale], ["Cargo", lead.jobTitle], ["Correo", lead.email],
        ["Teléfono", lead.phone], ["País", lead.country], ["Interés", lead.interest], ["Categoría", lead.companyCategory],
        ["Objetivos", lead.goals], ["Mensaje", lead.message], ["Página", lead.page],
        ["Origen", [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || null],
      ].filter((r) => r[1]);
      const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
      const html = "<table>" + rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#647489">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join("") + "</table>";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: mailFrom,
          to: notifyTo,
          reply_to: lead.email,
          subject: `${{ b2b: "Nuevo lead de marca", glx_sponsor: "Nuevo lead de marca", xp_press: "Acreditación de prensa", xp_creator: "Postulación de creador", organizer: "Nueva Comunidad Fundadora" }[lead.type]}: ${lead.company || lead.community || lead.name}${lead.interest ? " · " + lead.interest : ""}`,
          text: `Nuevo contacto desde la web de GameLobby.\n\n${text}\n`,
          html: `<p>Nuevo contacto desde la web de GameLobby.</p>${html}`,
        }),
      });
      if (!r.ok) console.error("[lead] notify non-ok", r.status, await r.text());
    } catch (e) {
      console.error("[lead] notify error", e);
    }
  }

  // 4) Siempre dejar rastro en logs (visible en Vercel > Runtime Logs)
  console.log("[GameLobby lead]", JSON.stringify({ type: lead.type, ts: lead.ts, stored, duplicate }));

  return res.status(200).json({ ok: true, stored, duplicate, welcomed });
}
