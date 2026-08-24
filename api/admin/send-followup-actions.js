// GameLobby Xperience — envío puntual de las dos acciones de seguimiento del
// 2026-08-22: reenvío a Cobre Conecta (bandeja correcta) + propuesta formal a
// Banco General (pidieron PDF + datos de contacto). Un solo uso — borrar después
// de correrlo, igual que send-outbound-2026-08-22.js, para no pasar el límite de
// 12 Serverless Functions del plan Hobby.
//
// POST /api/admin/send-followup-actions  header x-outbound-secret

import { sendEmail, siteUrl } from "../_email.js";

const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby";
const KIT_URL = `${siteUrl()}/api/kit-click?id=outbound-banco-general`;

const EMAILS = [
  {
    empresa: "Cobre Panamá / Minera Panamá (reenvío a Cobre Conecta)",
    to: "pan_cobreconecta@fqml.com",
    subject: "Cobre Panamá + audiencia joven",
    text: `Hola equipo de Cobre Conecta,

Les escribimos porque recepción nos indicó que esta es la bandeja correcta para propuestas de patrocinio.

Vimos el programa Cobre Conecta y el trabajo activo de acercamiento al público panameño, especialmente a las nuevas generaciones. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un espacio visible y positivo para conectar con público joven.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Banco General (propuesta formal)",
    to: "info@bgeneral.com",
    subject: "Propuesta GameLobby Xperience — Banco General",
    text: `Buenas tardes,

Gracias por la respuesta. Acá está el enlace a nuestra propuesta completa (Media Kit en PDF), con los niveles de patrocinio, el alcance del evento, y cómo se mide el retorno a través de GameLobby Wallet: ${KIT_URL}

Datos de contacto de la persona a cargo de esta propuesta:
${SENDER_SIGNATURE}

Quedo atenta a cualquier pregunta.

Saludos,\n${SENDER_SIGNATURE}`,
  },
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const secret = process.env.OUTBOUND_SEND_SECRET;
  if (!secret || (req.headers["x-outbound-secret"] || "") !== secret) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const results = [];
  for (const item of EMAILS) {
    const sent = await sendEmail({ to: item.to, subject: item.subject, text: item.text });
    results.push({ empresa: item.empresa, to: item.to, ok: sent.ok });
  }

  return res.status(200).json({ ok: true, results });
}
