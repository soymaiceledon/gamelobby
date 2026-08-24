// GameLobby Xperience — envío único de la primera ronda de correo frío de prospección.
// POST /api/admin/send-outbound-2026-08-22  header x-outbound-secret
//
// Endpoint de un solo uso: manda los 23 correos ya redactados y aprobados a la lista de
// prospectos de sponsors (ver Drive: Prospección diaria — GameLobby / seguimiento-outbound).
// No reutilizar para otras rondas — cada ronda futura debería ser su propio archivo con su
// propia lista, para no arriesgar reenviar por error a alguien que ya recibió este correo.

import { sendEmail } from "../_email.js";

const SENDER_SIGNATURE = "Mai Celedón\nMarketing Manager, GameLobby";

const EMAILS = [
  // ---- 9 con nombre de persona ----
  {
    empresa: "Banistmo",
    to: "juan.cedeno@banistmo.com",
    subject: "Banistmo + jóvenes gamers en Panamá",
    text: `Hola Juan Carlos,

Vi que Banistmo lleva más de 10 años apoyando la educación financiera de jóvenes en Panamá, y que "Patrocinamos Fanáticos" conecta al banco con la pasión de sus clientes por el deporte. Justo por eso te escribo.

En octubre armamos GameLobby Xperience en el Soho Mall—un evento de gaming presencial en Panamá que conecta marcas con la audiencia gamer, uno de los públicos jóvenes más difíciles de alcanzar por medios tradicionales. Cada interacción del visitante queda conectada a GameLobby Wallet, así que lo que Banistmo active ahí no se queda en el venue: se mide.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "La Curaçao",
    to: "alejandra_descamps@unicomer.com",
    subject: "La Curaçao + GameLobby, otra vez",
    text: `Hola Alejandra,

La Curaçao patrocinó el LATAM Pro Gamers League Panamá 2023, el torneo que organizamos en GameLobby.gg. Por eso te escribo directo a ti.

En octubre volvemos a Panamá con algo más grande: GameLobby Xperience, un evento presencial de gaming en el Soho Mall que conecta marcas con la audiencia gamer de toda la región. Encaja bien con el alcance regional de La Curaçao en Centroamérica.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Multimax",
    to: "ana.montenegro@multimax.net",
    subject: "Multimax + gamers en Panamá",
    text: `Hola Ana,

Vi que Multimax organiza sus propios eventos, como Max Days y Compufest, en sus 8 tiendas de Panamá. Por eso pensé en ustedes.

En octubre armamos GameLobby Xperience en el Soho Mall—un evento presencial de gaming que conecta marcas con la audiencia gamer, un público que ya consume tecnología y periféricos de forma activa. Encaja directo con lo que Multimax vende todos los días.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "HYPERX",
    to: "ariel.plabnik@hyperx.com",
    subject: "HyperX + GameLobby, segunda ronda",
    text: `Hola Ariel,

HyperX patrocinó el LATAM Pro Gamers League Panamá 2023, el torneo que organizamos en GameLobby.gg. Por eso te escribo directo a ti.

En octubre volvemos a Panamá con algo más grande: GameLobby Xperience, un evento presencial en el Soho Mall que conecta marcas con la audiencia gamer de Centroamérica. Para una marca de periféricos gaming como HyperX, es prácticamente el público que ya los usa.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "+Móvil / Cable & Wireless",
    to: "edwin.contreras@cwpanama.com",
    subject: "+Móvil + jóvenes gamers en Panamá",
    text: `Hola Edwin,

+Móvil se posiciona como una marca joven y disruptiva en el mercado panameño. Por eso te escribo.

En octubre armamos GameLobby Xperience en el Soho Mall—un evento presencial de gaming que conecta marcas con la audiencia gamer, uno de los públicos jóvenes más difíciles de alcanzar por medios tradicionales. Cada interacción del visitante queda conectada a GameLobby Wallet, así que lo que active +Móvil ahí no se queda en el venue: se mide.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "BYD",
    to: "shirnice.lai@byd.com",
    subject: "BYD Panamá + GameLobby Xperience",
    text: `Hola Shirnice,

Te escribo sobre BYD en Panamá específicamente—vimos la fuerte presencia de la marca ahí en el segmento eléctrico e híbrido.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña, un público joven, tecnológico y con alto poder de decisión de compra a futuro.

¿Te interesa que te mandemos el media kit, o nos puedes conectar con el equipo de marketing de BYD en Panamá directamente?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Bi Bank",
    to: "plondono@bibank.com.pa",
    subject: "Bi Bank + audiencia gamer en Panamá",
    text: `Hola Paula,

Vi que lideras gestión humana, asuntos corporativos y mercadeo en Bi Bank—por eso te escribo directo a ti.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña, un público joven y digital.

¿Te interesa que te mande el media kit para que lo veas con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Farmacias Arrocha",
    to: "servicioalcliente@arrocha.com",
    subject: "Farmacias Arrocha + audiencia gamer (a la atención de Lesly Silva)",
    text: `Hola equipo de Farmacias Arrocha,

Este correo es a la atención de Lesly Silva, Gerente de Mercadeo y Publicidad—no encontramos su correo directo, así que les escribimos por acá.

Vimos que Arrocha hace activaciones como ExpoMaterna Panamá, conectando la marca directo con el consumidor. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven, con las 49 sucursales de Arrocha como respaldo de cercanía.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Cobre Panamá / Minera Panamá",
    to: "cobre.panama@fqml.com",
    subject: "Cobre Panamá + audiencia joven",
    text: `Hola equipo de Cobre Panamá,

Vimos el programa Cobre Conecta y el trabajo activo de acercamiento al público panameño, especialmente a las nuevas generaciones. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un espacio visible y positivo para conectar con público joven.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  // ---- 14 con correo genérico de la empresa (sin nombre confirmado) ----
  {
    empresa: "MSI",
    to: "LatamSupport@msi.com",
    subject: "MSI + GameLobby, segunda ronda",
    text: `Hola equipo de MSI,

MSI patrocinó el LATAM Pro Gamers League Panamá 2023, el torneo que organizamos en GameLobby.gg. Por eso les escribimos directo.

En octubre volvemos a Panamá con algo más grande: GameLobby Xperience, un evento presencial de gaming en el Soho Mall que conecta marcas con la audiencia gamer de Centroamérica. Para una marca de hardware gaming como MSI, es el público que ya los usa.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Tigo",
    to: "attnclientes@tigo.com.pa",
    subject: "Tigo + GameLobby, segunda ronda",
    text: `Hola equipo de Tigo,

Tigo patrocinó el LATAM Pro Gamers League Panamá 2023, el torneo que organizamos en GameLobby.gg. Por eso les escribimos directo.

En octubre volvemos a Panamá con algo más grande: GameLobby Xperience, un evento presencial de gaming en el Soho Mall que conecta marcas con la audiencia gamer de la región. Encaja directo con la presencia de Tigo en Centroamérica.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Samsung Panamá",
    to: "prensa.sela@samsung.com",
    subject: "Samsung Panamá + audiencia gamer",
    text: `Hola equipo de Samsung Panamá,

Vimos las activaciones inmersivas recientes de Samsung en Panamá (el lanzamiento de los nuevos plegables, las viewing parties) y el programa Samsung Innovation Campus para jóvenes en IA. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven, tecnológico, y ya familiarizado con el ecosistema Samsung.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Claro Panamá",
    to: "clientesclaro@claro.com.pa",
    subject: "Claro Panamá + audiencia gamer",
    text: `Hola equipo de Claro,

Vimos que Claro es patrocinador oficial del torneo AASCA Pacific Division Soccer 2025 en Panamá. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público que ya consume datos y conectividad de forma intensiva.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "BAC Panamá",
    to: "mercadeodigital@pa.bac.net",
    subject: "BAC Panamá + audiencia gamer",
    text: `Hola equipo de BAC Panamá,

Vimos que BAC organiza eventos y capacitaciones de marketing digital para pymes en Panamá. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven y digital que puede ser relevante para el banco.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Toyota Panamá",
    to: "citastaller@toyotarp.com",
    subject: "Toyota Panamá + audiencia gamer",
    text: `Hola equipo de Toyota Panamá,

Este correo es para el equipo de mercadeo—no encontramos un contacto directo, así que les escribimos por acá con la esperanza de que lo redirijan.

Vimos que Ricardo Pérez celebra sus lanzamientos de producto con eventos experienciales, como el de la nueva RAV4 en Panamá La Vieja. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven, con poder de decisión de compra a futuro.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Banco General",
    to: "info@bgeneral.com",
    subject: "Banco General + audiencia gamer",
    text: `Hola equipo de Banco General,

Vimos el producto Visa Débito Joven y la agenda propia de eventos de Banco General. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—el mismo público joven al que ya le hablan con productos como ese.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "JAC Motors / Distribuidora David",
    to: "ventas@jacmotors.com.pa",
    subject: "JAC Motors Panamá + audiencia gamer",
    text: `Hola equipo de JAC Motors Panamá,

Este correo es para el equipo de mercadeo—les escribimos por acá con la esperanza de que lo redirijan.

Vimos que Distribuidora David lidera las ventas de autos chinos y eléctricos en Panamá. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven y tecnológico, con interés creciente en movilidad eléctrica.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Carbone Motors",
    to: "carbone@carbone.com.pa",
    subject: "Carbone Motors + audiencia gamer",
    text: `Hola equipo de Carbone Motors,

Vimos que Carbone Motors es distribuidor oficial de Dongfeng en Panamá. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público joven y con interés en tecnología automotriz.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Carbone",
    to: "carbone@carbone.com.pa",
    subject: "Carbone + audiencia gamer en Panamá",
    text: `Hola equipo de Carbone,

Vimos que Carbone tiene 35 tiendas "Total" en Panamá, con línea de tecnología incluida. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—un público que ya consume tecnología de forma activa.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Xiaomi Panamá",
    to: "mitowncenter@xiaomi-centroamerica.com",
    subject: "Xiaomi Panamá + audiencia gamer",
    text: `Hola equipo de Xiaomi Panamá,

Vimos que Mi Store es el primer distribuidor oficial de Xiaomi en Panamá. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—el mismo público que ya sigue de cerca la tecnología móvil de Xiaomi.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
  },
  {
    empresa: "Betcha",
    to: "support@betcha.pa",
    subject: "Betcha + audiencia gamer en Panamá",
    text: `Hola equipo de Betcha,

Este correo es para el equipo de mercadeo—les escribimos por acá con la esperanza de que lo redirijan.

Vimos que Betcha ya ofrece apuestas de esports dentro de su plataforma regulada por la Junta de Control de Juegos de Panamá. Por eso les escribimos.

En octubre armamos GameLobby Xperience en el Soho Mall, un evento presencial de gaming que conecta marcas con la audiencia gamer panameña—el mismo público al que Betcha ya le habla con esports.

¿Les interesa que les mandemos el media kit para que lo vean con calma?

Saludos,
${SENDER_SIGNATURE}`,
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
