// GameLobby Xperience — siembra el estado inicial en KV para el seguimiento automático
// de la ronda de correo frío del 2026-08-22 (ver api/admin/send-outbound-2026-08-22.js).
// Un solo uso: se corre una vez, después queda todo en manos de api/cron/outbound-followup.js
// y api/admin/mark-outbound-replied.js.
//
// POST /api/admin/seed-outbound-followup  header x-outbound-secret

import { kv } from "../_email.js";

const FOLLOWUP_DELAY_SEC = 2 * 24 * 3600; // 2 días

const CONTACTS = [
  { empresa: "Banistmo", to: "juan.cedeno@banistmo.com" },
  { empresa: "La Curaçao", to: "alejandra_descamps@unicomer.com" },
  { empresa: "Multimax", to: "ana.montenegro@multimax.net" },
  { empresa: "HYPERX", to: "ariel.plabnik@hyperx.com" },
  { empresa: "+Móvil / Cable & Wireless", to: "edwin.contreras@cwpanama.com" },
  { empresa: "BYD", to: "shirnice.lai@byd.com" },
  { empresa: "Bi Bank", to: "plondono@bibank.com.pa" },
  { empresa: "Farmacias Arrocha", to: "servicioalcliente@arrocha.com" },
  { empresa: "Cobre Panamá / Minera Panamá", to: "cobre.panama@fqml.com" },
  { empresa: "MSI", to: "LatamSupport@msi.com" },
  { empresa: "Tigo", to: "attnclientes@tigo.com.pa" },
  { empresa: "Samsung Panamá", to: "prensa.sela@samsung.com" },
  { empresa: "Claro Panamá", to: "clientesclaro@claro.com.pa" },
  { empresa: "BAC Panamá", to: "mercadeodigital@pa.bac.net" },
  { empresa: "Toyota Panamá", to: "citastaller@toyotarp.com" },
  { empresa: "Banco General", to: "info@bgeneral.com" },
  { empresa: "JAC Motors / Distribuidora David", to: "ventas@jacmotors.com.pa" },
  { empresa: "Carbone Motors", to: "carbone@carbone.com.pa" },
  { empresa: "Carbone", to: "carbone@carbone.com.pa" },
  { empresa: "Xiaomi Panamá", to: "mitowncenter@xiaomi-centroamerica.com" },
  { empresa: "Betcha", to: "support@betcha.pa" },
];

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const secret = process.env.OUTBOUND_SEND_SECRET;
  if (!secret || (req.headers["x-outbound-secret"] || "") !== secret) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  const results = [];
  for (const c of CONTACTS) {
    const id = slug(c.empresa);
    const state = {
      id,
      empresa: c.empresa,
      to: c.to,
      status: "sent",
      sentAt: now,
      followup2SentAt: null,
      respondedAt: null,
    };
    await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
    await kv(["ZADD", "ob:queue", String(now + FOLLOWUP_DELAY_SEC), id]);
    results.push(id);
  }

  return res.status(200).json({ ok: true, seeded: results.length, ids: results });
}
