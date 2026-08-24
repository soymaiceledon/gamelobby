// GameLobby Xperience — cron diario del seguimiento de la ronda de correo frío
// (2026-08-22, ver api/admin/send-outbound-2026-08-22.js). Revisa ob:queue (sorted
// set, score = timestamp del próximo paso) y manda el correo 2 a quien no haya
// respondido (marcado vía api/admin/mark-outbound-replied.js) 2 días después del
// correo 1. Después de mandar el correo 2, el contacto sale de la cola — no hay
// correo 3 todavía, se agrega cuando se pida.

import { kv, sendEmail } from "../_email.js";

const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby";

const FOLLOWUP2 = {
  banistmo: {
    subject: "¿Alcanzaste a ver mi correo? — Banistmo + GameLobby Xperience",
    text: `Hola Juan Carlos,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sé si te llegó.

Sigo pensando que encaja con lo que Banistmo ya hace con jóvenes y patrocinios—"Patrocinamos Fanáticos" y la educación financiera juvenil.

¿Te interesa que te mande el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "la-curacao": {
    subject: "¿Alcanzaste a ver mi correo? — La Curaçao + GameLobby Xperience",
    text: `Hola Alejandra,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sé si te llegó.

La Curaçao ya patrocinó un torneo nuestro en 2023—este es el mismo tipo de audiencia, a mayor escala.

¿Te interesa que te mande el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  multimax: {
    subject: "¿Alcanzaste a ver mi correo? — Multimax + GameLobby Xperience",
    text: `Hola Ana,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sé si te llegó.

Sigue encajando con lo que Multimax ya hace con Max Days y Compufest.

¿Te interesa que te mande el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  hyperx: {
    subject: "¿Alcanzaste a ver mi correo? — HyperX + GameLobby Xperience",
    text: `Hola Ariel,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sé si te llegó.

HyperX ya patrocinó un torneo nuestro en 2023—este es el mismo tipo de audiencia, a mayor escala.

¿Te interesa que te mande el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "movil-cable-wireless": {
    subject: "¿Alcanzaste a ver mi correo? — +Móvil + GameLobby Xperience",
    text: `Hola Edwin,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sé si te llegó.

Sigo pensando que encaja con el posicionamiento joven de +Móvil.

¿Te interesa que te mande el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  byd: {
    subject: "¿Alcanzaste a ver mi correo? — BYD Panamá + GameLobby Xperience",
    text: `Hola Shirnice,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en Panamá en octubre. No sé si te llegó.

¿Te interesa el media kit, o me puedes conectar con el equipo de marketing de BYD en Panamá?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "bi-bank": {
    subject: "¿Alcanzaste a ver mi correo? — Bi Bank + GameLobby Xperience",
    text: `Hola Paula,

Te escribí hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sé si te llegó.

¿Te interesa que te mande el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "farmacias-arrocha": {
    subject: "¿Alcanzaron a ver mi correo? — Farmacias Arrocha + GameLobby Xperience",
    text: `Hola equipo de Farmacias Arrocha (a la atención de Lesly Silva),

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

Sigue encajando con activaciones como ExpoMaterna Panamá.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "cobre-panama-minera-panama": {
    subject: "¿Alcanzaron a ver mi correo? — Cobre Panamá + GameLobby Xperience",
    text: `Hola equipo de Cobre Panamá,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

Sigue siendo un espacio visible para conectar con público joven, en línea con Cobre Conecta.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  msi: {
    subject: "¿Alcanzaron a ver mi correo? — MSI + GameLobby Xperience",
    text: `Hola equipo de MSI,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

MSI ya patrocinó un torneo nuestro en 2023—este es el mismo tipo de audiencia, a mayor escala.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  tigo: {
    subject: "¿Alcanzaron a ver mi correo? — Tigo + GameLobby Xperience",
    text: `Hola equipo de Tigo,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

Tigo ya patrocinó un torneo nuestro en 2023—este es el mismo tipo de audiencia, a mayor escala.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "samsung-panama": {
    subject: "¿Alcanzaron a ver mi correo? — Samsung Panamá + GameLobby Xperience",
    text: `Hola equipo de Samsung Panamá,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

Sigue encajando con las activaciones inmersivas recientes y Samsung Innovation Campus.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "claro-panama": {
    subject: "¿Alcanzaron a ver mi correo? — Claro Panamá + GameLobby Xperience",
    text: `Hola equipo de Claro,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "bac-panama": {
    subject: "¿Alcanzaron a ver mi correo? — BAC Panamá + GameLobby Xperience",
    text: `Hola equipo de BAC Panamá,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "toyota-panama": {
    subject: "¿Alcanzaron a ver mi correo? — Toyota Panamá + GameLobby Xperience",
    text: `Hola equipo de Toyota Panamá,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó—este correo es para el equipo de mercadeo, agradecemos si lo redirigen.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "banco-general": {
    subject: "¿Alcanzaron a ver mi correo? — Banco General + GameLobby Xperience",
    text: `Hola equipo de Banco General,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

Sigue encajando con Visa Débito Joven y la agenda propia de eventos del banco.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "jac-motors-distribuidora-david": {
    subject: "¿Alcanzaron a ver mi correo? — JAC Motors Panamá + GameLobby Xperience",
    text: `Hola equipo de JAC Motors Panamá,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó—este correo es para el equipo de mercadeo, agradecemos si lo redirigen.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "carbone-motors": {
    subject: "¿Alcanzaron a ver mi correo? — Carbone Motors + GameLobby Xperience",
    text: `Hola equipo de Carbone Motors,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  carbone: {
    subject: "¿Alcanzaron a ver mi correo? — Carbone + GameLobby Xperience",
    text: `Hola equipo de Carbone,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  "xiaomi-panama": {
    subject: "¿Alcanzaron a ver mi correo? — Xiaomi Panamá + GameLobby Xperience",
    text: `Hola equipo de Xiaomi Panamá,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
  betcha: {
    subject: "¿Alcanzaron a ver mi correo? — Betcha + GameLobby Xperience",
    text: `Hola equipo de Betcha,

Les escribimos hace unos días sobre GameLobby Xperience, el evento presencial de gaming que armamos en el Soho Mall en octubre. No sabemos si les llegó—este correo es para el equipo de mercadeo, agradecemos si lo redirigen.

¿Les interesa que les mandemos el media kit?

Saludos,\n${SENDER_SIGNATURE}`,
  },
};

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers["authorization"] || "";
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const due = await kv(["ZRANGEBYSCORE", "ob:queue", "0", String(now)]);
  const ids = Array.isArray(due.result) ? due.result : [];

  const processed = [];
  for (const id of ids) {
    try {
      const { result } = await kv(["GET", `ob:${id}`]);
      if (!result) { await kv(["ZREM", "ob:queue", id]); processed.push({ id, outcome: "not_found" }); continue; }
      const state = JSON.parse(result);

      if (state.status === "respondio") {
        await kv(["ZREM", "ob:queue", id]);
        processed.push({ id, outcome: "ya_respondio" });
        continue;
      }

      const msg = FOLLOWUP2[id];
      if (!msg) {
        await kv(["ZREM", "ob:queue", id]);
        processed.push({ id, outcome: "sin_plantilla" });
        continue;
      }

      const sent = await sendEmail({ to: state.to, subject: msg.subject, text: msg.text });
      state.status = "followup2_enviado";
      state.followup2SentAt = now;
      await kv(["SET", `ob:${id}`, JSON.stringify(state)]);
      await kv(["ZREM", "ob:queue", id]); // no hay correo 3 todavía

      processed.push({ id, outcome: sent.ok ? "followup2_enviado" : "followup2_fallo" });
    } catch (e) {
      console.error("[outbound-followup] error", id, e);
      processed.push({ id, outcome: "error" });
    }
  }

  console.log("[outbound-followup] corrida", JSON.stringify({ now, dueCount: ids.length, processed }));
  return res.status(200).json({ ok: true, dueCount: ids.length, processed });
}
