// GameLobby — rondas de correo frío de prospección de marcas (2027).
// El cron diario api/cron/outbound-followup.js manda los correos 1 que ya toquen
// (sendAfter <= ahora) y que todavía no existan en KV (ob:<id>), con tope diario.
// Así no hace falta un endpoint nuevo por ronda (el plan Hobby tiene límite de 12
// funciones) ni compartir OUTBOUND_SEND_SECRET para mandar una ronda.
//
// Reglas de la campaña 2027 (decididas por Mai, 17 nov 2026):
//   - No se contacta a nadie en Panamá (ya se trabajó en las rondas de ago 2026).
//   - Marcas grandes -> GameLobby Xperience 2027. Marcas pequeñas -> Ecosistema (desde US$1,500/mes).
//   - Remitente: MAIL_FROM (m.celedon@gamelobby.live), firma de Mai Celedón.
//
// Para agregar una ronda: agrega objetos a OUTBOUND_ROUNDS con id único (slug de la
// empresa), y sendAfter con la fecha desde la que se puede mandar.

// Contactos de las rondas anteriores a la campaña 2027 (ago 2026, Panamá): el cron
// no les manda seguimientos automáticos. Cualquier ob:<id> con sentAt anterior a esta
// fecha se ignora sin modificarlo.
export const CAMPAIGN_2027_START = Math.floor(Date.parse("2026-11-17T00:00:00-05:00") / 1000);

export const DAILY_SEND_CAP = 20;

export const BLOCKED_COUNTRIES = ["Panamá", "Panama"];

export const OUTBOUND_ROUNDS = [
  {
    "id": "bac-guatemala",
    "empresa": "BAC Guatemala",
    "to": "mchang@baccredomatic.com",
    "subject": "Gaming BAC + el tour gamer de Centroamérica 2027",
    "text": "Hola Marco Tulio,\n\nVi que BAC ya juega en serio en gaming: Gaming BAC, el Torneo Regional Gamer 2026 con gamers de los 6 países y la presencia en el Festival Gamer. Por eso te escribo directo.\n\nEn 2027 armamos GameLobby Xperience, un tour regional que arranca en México en abril, recorre Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial en Panamá el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nLo que ya hacen con Gaming BAC encaja con el paquete de Presenting Partner del Tour Centroamérica: la marca dueña del circuito en los 6 países, con exclusividad de categoría.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — BAC + GameLobby Xperience",
    "followupText": "Hola Marco Tulio,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre los 6 países de Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo por si te sirve: https://www.gamelobby.live/xperience\n\nSi tiene sentido para Gaming BAC, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — BAC + GameLobby Xperience",
    "followup3Text": "Hola Marco Tulio,\n\nNo quiero llenarte la bandeja, así que este es mi último correo. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de banca en el tour regional todavía está libre.\n\nSi en algún momento tiene sentido para BAC, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Guatemala",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "banco-industrial",
    "empresa": "Banco Industrial",
    "to": "lurcuyo@bi.com.gt",
    "subject": "Bi Mastercard + gamers en Guatemala, 2027",
    "text": "Hola Luisa Fernanda,\n\nVi la promo de Tarjetas Bi Mastercard que llevó a un tarjetahabiente a Tokio a vivir una experiencia gamer: puntos, ranking semanal y un gran premio al final. Es casi exactamente la mecánica de GameLobby, por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer que recorre Centroamérica en junio, con torneos clasificatorios por país, y cierra con una Gran Final presencial el 28 y 29 de agosto. Todo corre sobre la GameLobby Wallet: registro, misiones de marca, puntos, canje y un historial de participación por usuario que la marca puede medir.\n\nPara Bi vemos dos caminos: ser Presenting Partner del circuito en Guatemala, o entrar al ecosistema con torneos de marca mensuales para tarjetahabientes, desde US$1,500 al mes.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Bi + GameLobby Xperience",
    "followupText": "Hola Luisa Fernanda,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027 y la posibilidad de llevar la mecánica de puntos y ranking de Bi a la comunidad gamer de Guatemala.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Bi + GameLobby Xperience",
    "followup3Text": "Hola Luisa Fernanda,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de banca en Guatemala todavía está disponible.\n\nSi en algún momento tiene sentido para Bi, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Guatemala",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "claro-guatemala",
    "empresa": "Claro Guatemala",
    "to": "willy.andreatta@claro.com.gt",
    "subject": "Claro + la próxima liga que juegan los jóvenes en Guatemala",
    "text": "Hola Willy,\n\nVi que la Super Liga Claro Internacional 2026 volvió a abrir inscripciones gratis para niños y jóvenes en Guatemala. Esa misma generación hoy también compite en videojuegos, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional: México en abril, clasificatorias en los 6 países de Centroamérica en junio y una Gran Final presencial el 28 y 29 de agosto. Tiene zonas como la Football Fan Arena (torneos de fútbol virtual, retos 1v1 y penales digitales) y una Arena Mobile, donde una telco tiene un rol natural. Cada interacción queda medida en la GameLobby Wallet.\n\nPara Claro vemos el paquete de Strategic Partner del Tour Centroamérica, o el dominio de una de esas zonas.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Claro + GameLobby Xperience",
    "followupText": "Hola Willy,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Claro + GameLobby Xperience",
    "followup3Text": "Hola Willy,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de telecomunicaciones todavía está disponible.\n\nSi en algún momento tiene sentido para Claro, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Guatemala",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "gollo-costa-rica",
    "empresa": "Gollo (Grupo Unicomer Costa Rica)",
    "to": "eduardo_cordoba@unicomer.com",
    "subject": "Gollo + GameLobby, de nuevo en 2027",
    "text": "Hola Eduardo,\n\nGollo ya ha estado con GameLobby antes, y vi que la nueva Megatienda tiene un departamento completo de gaming junto a RadioShack. Por eso te escribo directo a ti.\n\nEn 2027 volvemos con algo más grande: GameLobby Xperience, un tour gamer regional con clasificatorias en Costa Rica y los demás países de Centroamérica en junio, y una Gran Final presencial el 28 y 29 de agosto. Cada gamer se registra en la GameLobby Wallet, suma puntos con misiones de marca y canjea recompensas, así que lo que Gollo active se puede medir hasta la compra.\n\nPara Gollo vemos el paquete de Presenting Partner Local de Costa Rica: protagonismo total en la parada del país y exclusividad de categoría.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Gollo + GameLobby Xperience",
    "followupText": "Hola Eduardo,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027 y la parada de Costa Rica.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Gollo + GameLobby Xperience",
    "followup3Text": "Hola Eduardo,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de retail de tecnología en Costa Rica todavía está disponible.\n\nSi en algún momento tiene sentido para Gollo, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Costa Rica",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "pollo-campero",
    "empresa": "Pollo Campero",
    "to": "mmolina@campero.com",
    "subject": "Campero + gamers, todo el año",
    "text": "Hola Manuel,\n\nVi que Campero ya estuvo en el Festival Gamer de Guatemala, y que la visita de Cry terminó con él probando Campero frente a su comunidad. Ese tipo de momento es justo lo que hacemos en GameLobby, por eso te escribo.\n\nGameLobby es una plataforma de torneos online para gamers de la región, con una wallet de recompensas. Las marcas pueden tener torneos propios cada mes: por ejemplo, un \"Torneo Campero\" de Free Fire o FC con premios canjeables en restaurante, cupones digitales y data de quién participó y quién canjeó. Se entra desde US$1,500 al mes, sin compromisos largos.\n\nY si funciona, en 2027 está GameLobby Xperience: un tour gamer por Centroamérica con Gran Final presencial el 28 y 29 de agosto, donde Campero podría tener su propia zona.\n\n¿Te mando la propuesta para que la veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Campero + GameLobby",
    "followupText": "Hola Manuel,\n\nTe escribí hace unos días sobre torneos de marca para Campero dentro de GameLobby.\n\nSi te hace sentido, agendamos 15 minutos y te muestro cómo se vería un primer torneo: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Campero + GameLobby",
    "followup3Text": "Hola Manuel,\n\nEste es mi último correo para no llenarte la bandeja. Si en algún momento quieren probar un torneo de marca con la comunidad gamer, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Guatemala",
    "producto": "Ecosistema",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  }
];

// Devuelve los correos 1 que tocan hoy: con sendAfter vencido, sin registro previo
// en KV, fuera de países bloqueados y hasta el tope diario.
export function pickDueSends(rounds, existingIds, nowSec, cap = DAILY_SEND_CAP) {
  const seen = new Set(existingIds || []);
  const out = [];
  for (const item of rounds || []) {
    if (out.length >= cap) break;
    if (!item || !item.id || !item.to || !item.subject || !item.text) continue;
    if (seen.has(item.id)) continue;
    if (BLOCKED_COUNTRIES.includes(item.pais)) continue;
    const after = item.sendAfter ? Math.floor(Date.parse(item.sendAfter) / 1000) : 0;
    if (Number.isNaN(after) || after > nowSec) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

// true si el registro es de una ronda anterior a la campaña 2027 (no se toca).
export function isLegacyContact(state) {
  return !state || !state.sentAt || state.sentAt < CAMPAIGN_2027_START;
}
