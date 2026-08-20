// GameLobby — helpers compartidos para el flujo de nurture de sponsors (Media Kit).
// Usado por: media-kit-lead.js, kit-click.js, cal-click.js, cron/nurture.js
//
// Modelo de datos en Vercel KV (Upstash Redis):
//   leads:media_kit         -> lista plana (RPUSH) para el CRM /admin, igual patrón que los demás tipos de lead
//   mk:<id>                 -> registro mutable (JSON) con el estado del lead a lo largo del nurture
//   mk:queue                -> sorted set (ZADD), score = timestamp (segundos) del próximo paso a ejecutar
//
// Variables de entorno relevantes (además de las ya usadas por lead.js):
//   MEDIA_KIT_WEBHOOK_URL -> Apps Script del Google Sheet dedicado a estos leads (separado del de la home)
//   SPONSOR_CALENDAR_URL  -> link de Google Calendar para agendar llamada
//   SITE_URL              -> origen público del sitio, ej https://www.gamelobby.live (para armar links en emails)

export function findEnv(suffix) {
  const key = Object.keys(process.env).find(
    (k) => k === suffix || k.endsWith("_" + suffix)
  );
  return key ? process.env[key] : undefined;
}

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
}

function kvCreds() {
  const kvUrl = findEnv("KV_REST_API_URL") || findEnv("UPSTASH_REDIS_REST_URL");
  const kvToken = findEnv("KV_REST_API_TOKEN") || findEnv("UPSTASH_REDIS_REST_TOKEN");
  return { kvUrl, kvToken };
}

export async function kv(cmd) {
  const { kvUrl, kvToken } = kvCreds();
  if (!kvUrl || !kvToken) return { result: null, configured: false };
  try {
    const r = await fetch(kvUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
    });
    const data = await r.json();
    return { ...data, configured: true, ok: r.ok };
  } catch (e) {
    console.error("[nurture] kv error", cmd[0], e);
    return { result: null, configured: true, ok: false };
  }
}

export function siteUrl() {
  return (process.env.SITE_URL || "https://www.gamelobby.live").replace(/\/$/, "");
}

// Genera un id corto y suficientemente único para un lead de media kit.
export function newLeadId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---- Investigación liviana de empresa (gratuita, sin API key) ----
// A partir del dominio del correo, intenta traer el título/descripción del sitio.
// Degrada a { found:false } en cualquier error, timeout, o dominio de correo personal.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com",
  "live.com", "aol.com", "protonmail.com", "hotmail.es", "yahoo.es", "msn.com",
]);

// True si el dominio del correo NO es un proveedor de correo genérico/personal
// (gmail, hotmail, etc.) — es decir, si "parece" un correo corporativo.
// Esto es lo que decide kit inmediato vs. correo explorador; researchCompany()
// solo se usa para personalizar el texto del correo, no para esa decisión.
export function isCorporateEmail(email) {
  const domain = String(email || "").split("@")[1]?.toLowerCase().trim() || null;
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

export async function researchCompany(email) {
  const domain = String(email || "").split("@")[1]?.toLowerCase().trim() || null;
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
    return { found: false, domain: domain || null, summary: null };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://${domain}`, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timeout);
    if (!res.ok) return { found: false, domain, summary: null };
    const html = (await res.text()).slice(0, 60000);
    const descMatch =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const summary = descMatch ? descMatch[1].trim().slice(0, 280) : null;
    const title = titleMatch ? titleMatch[1].trim().slice(0, 150) : null;
    if (!summary && !title) return { found: false, domain, summary: null };
    return { found: true, domain, summary: summary || title };
  } catch (e) {
    return { found: false, domain, summary: null };
  }
}

// ---- Envío por Resend ----
export async function sendEmail({ to, subject, text, html }) {
  const resendKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM;
  if (!resendKey || !mailFrom) return { ok: false, skipped: true };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: mailFrom, to, subject, text, html }),
    });
    if (!r.ok) console.error("[nurture] resend non-ok", r.status, await r.text());
    return { ok: r.ok };
  } catch (e) {
    console.error("[nurture] resend error", e);
    return { ok: false };
  }
}

// ---- Reenvío opcional al webhook del Sheet dedicado a media kit / prospección ----
export async function forwardToSheet(lead) {
  const webhook = process.env.MEDIA_KIT_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch (e) {
    console.error("[nurture] sheet webhook error", e);
  }
}

// ============================================================
// Plantillas de correo. Voz: español neutral-LATAM, tú informal,
// sin emoji, em-dashes cerrados.
// ============================================================

function firstName(name) {
  return (name || "").split(/\s+/)[0] || "";
}

export function buildExploreEmail(lead) {
  const name = firstName(lead.name);
  return {
    subject: "Antes de mandarte el Media Kit de GameLobby Xperience",
    text:
      `Hola ${name},\n\n` +
      `Gracias por tu interés en GameLobby Xperience—Central America Tour (30–31 de octubre, Soho Mall, Panamá).\n\n` +
      `Antes de mandarte el Media Kit completo, cuéntanos en una línea qué hace ${lead.company || "tu marca"} y qué te gustaría lograr con una activación como esta—así te lo adaptamos en vez de mandarte algo genérico. Simplemente responde este correo.\n\n` +
      `De todas formas, en menos de un día te llega el kit completo—pero si nos cuentas antes, la conversación arranca más rápido.\n\n` +
      `El equipo de GameLobby\n`,
    html:
      `<p>Hola ${esc(name)},</p>` +
      `<p>Gracias por tu interés en <strong>GameLobby Xperience—Central America Tour</strong> (30–31 de octubre, Soho Mall, Panamá).</p>` +
      `<p>Antes de mandarte el Media Kit completo, cuéntanos en una línea qué hace <strong>${esc(lead.company || "tu marca")}</strong> y qué te gustaría lograr con una activación como esta—así te lo adaptamos en vez de mandarte algo genérico. Simplemente responde este correo.</p>` +
      `<p>De todas formas, en menos de un día te llega el kit completo—pero si nos cuentas antes, la conversación arranca más rápido.</p>` +
      `<p>El equipo de GameLobby</p>`,
  };
}

export function buildKitEmail(lead) {
  const name = firstName(lead.name);
  const kitUrl = `${siteUrl()}/api/kit-click?id=${encodeURIComponent(lead.id)}`;
  const calUrl = `${siteUrl()}/api/cal-click?id=${encodeURIComponent(lead.id)}`;
  const companyLine = lead.companySummary
    ? ` Vimos que ${esc(lead.company || "tu marca")} ${esc(lead.companySummary).toLowerCase().replace(/\.$/, "")}—justo el tipo de marca que le queda bien a esto.`
    : "";
  return {
    subject: "Tu Media Kit de GameLobby Xperience",
    text:
      `Hola ${name},\n\n` +
      `Acá está el Media Kit completo de GameLobby Xperience—Central America Tour: ${kitUrl}\n\n` +
      `30–31 de octubre, Soho Mall, Panamá. +2,500 asistentes presenciales y +150,000 de alcance digital estimado, conectando con 6 países de Centroamérica.\n\n` +
      `Pero el dato que más importa es este: tu marca no llega a poner un stand. Entra al juego. Cada interacción del visitante—jugar, votar, canjear—queda conectada a GameLobby Wallet, así que lo que activas no se queda en el venue: se mide.\n\n` +
      `Adentro vas a encontrar los niveles de patrocinio (desde activaciones compartidas hasta Presenting Partner), qué categorías todavía tienen exclusividad disponible, y cómo se arma una propuesta a la medida de tu marca.\n\n` +
      `Si después de verlo quieres hablarlo en vivo, agenda 15 minutos aquí: ${calUrl}\n\n` +
      `Nos vemos en Panamá,\nEl equipo de GameLobby\n`,
    html:
      `<p>Hola ${esc(name)},</p>` +
      `<p>Acá está el <a href="${kitUrl}"><strong>Media Kit completo de GameLobby Xperience—Central America Tour</strong></a>.</p>` +
      `<p><strong>30–31 de octubre, Soho Mall, Panamá.</strong> +2,500 asistentes presenciales y +150,000 de alcance digital estimado, conectando con 6 países de Centroamérica.</p>` +
      `<p>Pero el dato que más importa es este: tu marca no llega a poner un stand. <strong>Entra al juego.</strong> Cada interacción del visitante—jugar, votar, canjear—queda conectada a GameLobby Wallet, así que lo que activas no se queda en el venue: se mide.${companyLine}</p>` +
      `<p>Adentro vas a encontrar los niveles de patrocinio (desde activaciones compartidas hasta Presenting Partner), qué categorías todavía tienen exclusividad disponible, y cómo se arma una propuesta a la medida de tu marca.</p>` +
      `<p><a href="${kitUrl}">Ver el Media Kit completo →</a></p>` +
      `<p>Si después de verlo quieres hablarlo en vivo, <a href="${calUrl}">agenda 15 minutos aquí</a>.</p>` +
      `<p>Nos vemos en Panamá,<br>El equipo de GameLobby</p>`,
  };
}

export function buildFollowupEmail(lead) {
  const name = firstName(lead.name);
  const calUrl = `${siteUrl()}/api/cal-click?id=${encodeURIComponent(lead.id)}`;
  return {
    subject: `¿Qué te pareció GameLobby Xperience?`,
    text:
      `Hola ${name},\n\n` +
      `Viste el Media Kit de GameLobby Xperience hace unos días—quería saber qué te pareció.\n\n` +
      `Si tienes dudas sobre niveles de patrocinio, exclusividad de categoría, o simplemente quieres pensar en voz alta cómo se vería tu marca ahí dentro, agendemos 15 minutos: ${calUrl}\n\n` +
      `El equipo de GameLobby\n`,
    html:
      `<p>Hola ${esc(name)},</p>` +
      `<p>Viste el Media Kit de GameLobby Xperience hace unos días—quería saber qué te pareció.</p>` +
      `<p>Si tienes dudas sobre niveles de patrocinio, exclusividad de categoría, o simplemente quieres pensar en voz alta cómo se vería tu marca ahí dentro, <a href="${calUrl}">agendemos 15 minutos</a>.</p>` +
      `<p>El equipo de GameLobby</p>`,
  };
}

export function buildReengageEmail(lead) {
  const name = firstName(lead.name);
  const kitUrl = `${siteUrl()}/api/kit-click?id=${encodeURIComponent(lead.id)}`;
  return {
    subject: "Panamá, 30–31 de octubre—la exclusividad por categoría se va cerrando",
    text:
      `Hola ${name},\n\n` +
      `Te escribo porque algunas categorías de GameLobby Xperience (banco, telco, smartphone, bebida, automotriz, tecnología, retail) tienen exclusividad limitada—una vez que se cierra una, no entra otra marca de la misma categoría a la experiencia.\n\n` +
      `Si todavía no revisaste el Media Kit, acá está de nuevo: ${kitUrl}\n\n` +
      `El equipo de GameLobby\n`,
    html:
      `<p>Hola ${esc(name)},</p>` +
      `<p>Te escribo porque algunas categorías de GameLobby Xperience (banco, telco, smartphone, bebida, automotriz, tecnología, retail) tienen <strong>exclusividad limitada</strong>—una vez que se cierra una, no entra otra marca de la misma categoría a la experiencia.</p>` +
      `<p>Si todavía no revisaste el Media Kit, <a href="${kitUrl}">acá está de nuevo</a>.</p>` +
      `<p>El equipo de GameLobby</p>`,
  };
}

export function buildBookingThanksEmail(lead) {
  const name = firstName(lead.name);
  const calUrl = `${siteUrl()}/api/cal-click?id=${encodeURIComponent(lead.id)}`;
  return {
    subject: "Nos vemos pronto—una pregunta antes de la llamada",
    text:
      `Hola ${name},\n\n` +
      `Viste el link para agendar tu espacio con GameLobby Xperience. Si ya elegiste un horario, en unos minutos te llega la invitación de Google Calendar con los recordatorios. Si todavía no, aquí lo tienes de nuevo: ${calUrl}\n\n` +
      `Para llegar a la llamada con algo concreto: si ya tienes en mente un rango de presupuesto disponible, cuéntanoslo respondiendo este correo—así te adelantamos qué experiencias y niveles de patrocinio calzan en ese rango, en vez de partir de cero.\n\n` +
      `Nos vemos pronto,\nEl equipo de GameLobby\n`,
    html:
      `<p>Hola ${esc(name)},</p>` +
      `<p>Viste el link para agendar tu espacio con GameLobby Xperience. Si ya elegiste un horario, en unos minutos te llega la invitación de Google Calendar con los recordatorios. Si todavía no, <a href="${calUrl}">aquí lo tienes de nuevo</a>.</p>` +
      `<p>Para llegar a la llamada con algo concreto: si ya tienes en mente un rango de presupuesto disponible, cuéntanoslo respondiendo este correo—así te adelantamos qué experiencias y niveles de patrocinio calzan en ese rango, en vez de partir de cero.</p>` +
      `<p>Nos vemos pronto,<br>El equipo de GameLobby</p>`,
  };
}
