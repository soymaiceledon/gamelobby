// GameLobby Xperience — segunda ronda de correo frío (autos, IT/gaming retail,
// comida rápida). Ver Drive: Prospección diaria — GameLobby.
// Un solo uso: borrar después de correrlo, como las rondas anteriores.
//
// POST /api/admin/send-outbound-round2  header x-outbound-secret

import { sendEmail } from "../_email.js";

const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby";

const EMAILS = [
  {
    empresa: "Grupo Silaba (Kia/Mazda/Chevrolet)",
    to: "aherrera@silaba.com",
    subject: "Grupo Silaba + audiencia gamer en Panamá",
    text: `Hola Ana Priscilla,

Vi que Grupo Silaba distribuye Kia, Mazda, Chevrolet y varias marcas más en Panamá—una de las casas automotrices con más marcas del país. Por eso te escribo directo a ti.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven, con decisión de compra a futuro.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Yoytec",
    to: "yorleny.smith@yoytec.com",
    subject: "Yoytec + audiencia gamer en Panamá",
    text: `Hola Yorleny,

Vi que en Yoytec venden equipos gaming y periféricos—justo el tipo de negocio que conecta con nuestra audiencia. Por eso te escribo directo a ti.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Panacompu",
    to: "sales.pa@panacompu.com",
    subject: "Panacompu + audiencia gamer en Panamá",
    text: `Hola equipo de Panacompu,

Vimos que venden productos HP, Razer y Logitech con entrega el mismo día en Panamá—justo el tipo de negocio que conecta con nuestra audiencia gamer. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Petroautos (Hyundai)",
    to: "gbellido@petroautos.com",
    subject: "Petroautos + audiencia gamer en Panamá",
    text: `Hola equipo de Petroautos,

Este correo es para el equipo de mercadeo—no encontramos un contacto directo, así que les escribimos por acá con la esperanza de que lo redirijan.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven, con decisión de compra a futuro.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Domino's Panamá",
    to: "metromall@dominospanama.com",
    subject: "Domino's Panamá + audiencia gamer",
    text: `Hola equipo de Domino's Panamá,

Este correo es para el equipo de mercadeo—no encontramos un contacto directo, así que les escribimos por acá con la esperanza de que lo redirijan.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público que también consume comida rápida activamente.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

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
    await new Promise((r) => setTimeout(r, 400));
  }

  return res.status(200).json({ ok: true, total: results.length, results });
}
