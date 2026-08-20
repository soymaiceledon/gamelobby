// GameLobby Xperience — captura del form corto "Solicitar Media Kit" + arranque del nurture.
// POST /api/media-kit-lead
//
// Flujo:
//   1) valida + guarda el lead (CRM /admin, pestaña "Media Kit")
//   2) reenvía al Sheet dedicado (MEDIA_KIT_WEBHOOK_URL), separado del de la home
//   3) investiga la empresa por el dominio del correo (gratis, sin API key)
//   4) si encontramos algo de la empresa: manda el Media Kit de una vez
//      si NO encontramos nada: manda primero un correo explorador; el kit sale
//      solo a las 24h (lo dispara el cron), haya respondido o no
//
// Requiere las mismas env vars que api/lead.js (KV, RESEND_API_KEY, MAIL_FROM)
// más MEDIA_KIT_WEBHOOK_URL y SPONSOR_CALENDAR_URL (ver api/_email.js).

import { kv, esc, sendEmail, forwardToSheet, researchCompany, newLeadId, buildExploreEmail, buildKitEmail } from "./_email.js";

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

  // Honeypot anti-spam.
  if (String(body.website || "").trim() !== "") {
    return res.status(200).json({ ok: true, stored: false });
  }

  const name = String(body.name || "").trim().slice(0, 200);
  const email = String(body.email || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 60);
  const company = String(body.company || "").trim().slice(0, 200);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !phone || !company) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  const id = newLeadId();
  const { found: companyFound, domain, summary: companySummary } = await researchCompany(email);

  const lead = {
    id, type: "media_kit", name, email, phone, company,
    domain: domain || null, companyFound, companySummary: companySummary || null,
    status: "new",
    ts: new Date().toISOString(),
    ua: req.headers["user-agent"] || null,
    ip: req.headers["x-forwarded-for"] || null,
  };

  // 1) CRM: lista plana para /admin
  const r1 = await kv(["RPUSH", "leads:media_kit", JSON.stringify(lead)]);
  const stored = !!r1.ok;

  // 2) Sheet dedicado (separado del de la home)
  await forwardToSheet(lead);

  // 3) Arranca el nurture: kit directo o explorador primero
  let welcomed = false;
  const now = Math.floor(Date.now() / 1000);
  const state = { ...lead };

  if (companyFound) {
    const msg = buildKitEmail(lead);
    const sent = await sendEmail({ to: email, subject: msg.subject, text: msg.text, html: msg.html });
    welcomed = sent.ok;
    state.status = "kit_sent";
    state.kitSentAt = now;
    await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
    await kv(["ZADD", "mk:queue", String(now + 48 * 3600), id]); // checkpoint a las 48h
  } else {
    const msg = buildExploreEmail(lead);
    const sent = await sendEmail({ to: email, subject: msg.subject, text: msg.text, html: msg.html });
    welcomed = sent.ok;
    state.status = "explore_sent";
    state.exploreSentAt = now;
    await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
    await kv(["ZADD", "mk:queue", String(now + 24 * 3600), id]); // kit sale a las 24h
  }

  console.log("[GameLobby media-kit lead]", JSON.stringify(lead));

  return res.status(200).json({ ok: true, stored, welcomed, companyFound });
}
