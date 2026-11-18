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
  },
  {
    "id": "claro-honduras",
    "empresa": "Claro Honduras",
    "to": "danny.rodriguez@claro.com.hn",
    "subject": "Claro Honduras + la generación que juega",
    "text": "Hola Danny,\n\nVi que Claro llevó el Claro Tech Summit a Honduras y que Claro Club suma alianzas con beneficios para sus usuarios. Una audiencia que Claro todavía puede ganar con beneficios es la gamer, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional: México en abril, clasificatorias en los 6 países de Centroamérica en junio (Honduras incluido) y una Gran Final presencial el 28 y 29 de agosto. Cada gamer se registra en la GameLobby Wallet, cumple misiones de marca y canjea recompensas, así que la marca mide quién participó y quién volvió.\n\nPara Claro Honduras vemos el paquete de Presenting Partner Local: protagonismo total en la parada del país, con exclusividad de categoría, y la Arena Mobile como espacio natural para una telco.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Claro Honduras + GameLobby",
    "followupText": "Hola Danny,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Claro Honduras + GameLobby",
    "followup3Text": "Hola Danny,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de telecomunicaciones en Honduras todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Honduras",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "walmart-centroamerica",
    "empresa": "Walmart Centroamérica",
    "to": "adrian.soto@walmart.com",
    "subject": "Walmart + el tour gamer de Centroamérica 2027",
    "text": "Hola Adrián,\n\nWalmart está en los mismos 6 países por los que pasa nuestro tour en 2027, y vende a diario la consola, el control y la snack que usa un gamer. Por eso te escribo.\n\nGameLobby Xperience es un tour gamer regional: clasificatorias en Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica y Panamá en junio, y una Gran Final presencial el 28 y 29 de agosto. Todo corre sobre la GameLobby Wallet: registro, misiones de marca con QR, puntos y canje. Eso permite conectar la activación con la compra en tienda y medirla por país.\n\nPara Walmart vemos el paquete de Strategic Partner del Tour Centroamérica: presencia en las paradas de los 6 países, misiones de marca y un reporte de participación por país.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Walmart Centroamérica + GameLobby",
    "followupText": "Hola Adrián,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Walmart Centroamérica + GameLobby",
    "followup3Text": "Hola Adrián,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de retail regional todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Regional",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "monge-costa-rica",
    "empresa": "Monge (Grupo Monge)",
    "to": "carlos.fernandez@grupomonge.com",
    "subject": "Gamer Lab de Monge + torneos todo el año",
    "text": "Hola Carlos,\n\nMonge abrió los Gamer Lab de Escazú y Zapote, y el de Zapote arrancó con un torneo de Fortnite. Eso es justo lo que hacemos en GameLobby, por eso te escribo.\n\nGameLobby es una plataforma de torneos online para gamers de la región, con una wallet de recompensas. Monge podría tener un torneo de marca cada mes, con premios canjeables en los Gamer Lab, cupones y data de quién participó y quién compró. Se entra desde US$1,500 al mes y el plan Plata, de US$3,000, suma misiones y el naming de una liga mensual.\n\nY en 2027 está GameLobby Xperience, con la parada de Costa Rica en junio, donde Monge podría tener su propia zona.\n\n¿Te mando la propuesta para que la veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Monge + GameLobby",
    "followupText": "Hola Carlos,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Monge + GameLobby",
    "followup3Text": "Hola Carlos,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de retail de tecnología en Costa Rica todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Costa Rica",
    "producto": "Ecosistema",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "taqueritos-dinant",
    "empresa": "Taqueritos (Dinant)",
    "to": "geisi.meza@dinant.com",
    "subject": "Blackout Taqueritos + torneos para la misma comunidad",
    "text": "Hola Geisi,\n\nVi \"Blackout Taqueritos\" para el Día del Gamer: convertir material publicitario viejo en cortinas para los setups de los gamers. Muy buena idea, y por eso te escribo.\n\nGameLobby es una plataforma de torneos online para gamers de la región, con una wallet de recompensas. Taqueritos podría tener su propio torneo cada mes (Free Fire, FC o Fortnite), con premios y misiones de marca, y data de quién participó y quién canjeó. Se entra desde US$1,500 al mes, sin compromisos largos.\n\nSi funciona, en 2027 está GameLobby Xperience, un tour gamer por Centroamérica con Gran Final presencial el 28 y 29 de agosto, donde la marca puede hacer sampling en vivo.\n\n¿Te mando la propuesta para que la veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Taqueritos + GameLobby",
    "followupText": "Hola Geisi,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Taqueritos + GameLobby",
    "followup3Text": "Hola Geisi,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de snacks todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "Guatemala",
    "producto": "Ecosistema",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "bancoagricola-el-salvador",
    "empresa": "Bancoagrícola",
    "to": "vmolina@bancoagricola.com.sv",
    "subject": "Bancoagrícola + los jóvenes gamers de El Salvador",
    "text": "Hola Vicky,\n\nBancoagrícola es la marca top of mind de la banca en El Salvador. La siguiente generación de clientes pasa buena parte de su tiempo compitiendo en videojuegos, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional con clasificatorias en los 6 países de Centroamérica en junio (El Salvador incluido) y una Gran Final presencial el 28 y 29 de agosto. Todo corre sobre la GameLobby Wallet: registro, misiones de marca, puntos y canje, con un historial de participación por usuario que la marca puede medir.\n\nPara Bancoagrícola vemos el paquete de Presenting Partner Local de El Salvador: protagonismo total en la parada del país y exclusividad en la categoría de banca.\n\n¿Te mando el media kit para que lo veas con calma?\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Bancoagrícola + GameLobby",
    "followupText": "Hola Vicky,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nAquí puedes ver el formato completo: https://www.gamelobby.live/xperience\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "followup3Subject": "¿Seguimos en contacto? — Bancoagrícola + GameLobby",
    "followup3Text": "Hola Vicky,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de banca en El Salvador todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby\n+507 6273-9738",
    "ronda": "cam-01",
    "pais": "El Salvador",
    "producto": "Xperience",
    "sendAfter": "2026-11-17T00:00:00-05:00"
  },
  {
    "id": "banco-atlantida-honduras",
    "empresa": "Banco Atlántida",
    "to": "dramos@bancatlan.hn",
    "subject": "Banco Atlántida + los gamers de Honduras",
    "text": "Hola Diana,\n\nVi que en «Premiamos tu Esfuerzo» Banco Atlántida sorteó consolas PlayStation 5 entre sus clientes. Eso dice mucho: el gamer ya es parte de su público, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional que arranca en México en abril, recorre los 6 países de Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nPara Banco Atlántida vemos el paquete de Presenting Partner Local de Honduras: protagonismo total en la parada del país, con exclusividad en la categoría de banca.\n\n¿Te mando el media kit para que lo veas con calma? Y si prefieres verlo en vivo, agendamos 15 minutos aquí: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Banco Atlántida + GameLobby Xperience",
    "followupText": "Hola Diana,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nPreparé una vista con su marca dentro del circuito: https://www.gamelobby.live/mediakit-xperience?marca=Banco%20Atlántida#stands\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followup3Subject": "¿Seguimos en contacto? — Banco Atlántida + GameLobby",
    "followup3Text": "Hola Diana,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de banca en Honduras todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "ronda": "cam-02",
    "pais": "Honduras",
    "producto": "Xperience",
    "sendAfter": "2026-11-18T00:00:00-05:00"
  },
  {
    "id": "banco-cuscatlan-el-salvador",
    "empresa": "Banco Cuscatlán",
    "to": "isabel.giammattei@bancocuscatlan.com",
    "subject": "Banco CUSCATLAN + los jóvenes gamers de El Salvador",
    "text": "Hola Isabel,\n\nFelicidades por el reconocimiento de LatinFinance como Banco del Año en El Salvador. Con un equipo de mercadeo joven y la expansión a Guatemala, creo que tiene sentido mostrarte algo nuevo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional que arranca en México en abril, recorre los 6 países de Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nPara CUSCATLAN vemos el paquete de Presenting Partner Local de El Salvador, con la opción de sumar Guatemala, y exclusividad en la categoría de banca.\n\n¿Te mando el media kit para que lo veas con calma? Y si prefieres verlo en vivo, agendamos 15 minutos aquí: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Banco Cuscatlán + GameLobby Xperience",
    "followupText": "Hola Isabel,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nPreparé una vista con su marca dentro del circuito: https://www.gamelobby.live/mediakit-xperience?marca=Banco%20Cuscatlán#stands\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followup3Subject": "¿Seguimos en contacto? — Banco Cuscatlán + GameLobby",
    "followup3Text": "Hola Isabel,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de banca en El Salvador todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "ronda": "cam-02",
    "pais": "El Salvador",
    "producto": "Xperience",
    "sendAfter": "2026-11-18T00:00:00-05:00"
  },
  {
    "id": "claro-el-salvador",
    "empresa": "Claro El Salvador",
    "to": "alvaro.chutin@claro.com.sv",
    "subject": "De la Super Liga Claro a la liga gamer de El Salvador",
    "text": "Hola Álvaro,\n\nLa Super Liga Claro es de los torneos juveniles más queridos del país. Hoy una buena parte de esos mismos jóvenes compite también en videojuegos, sobre la red de su operador, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional que arranca en México en abril, recorre los 6 países de Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nPara Claro El Salvador vemos el paquete de Presenting Partner Local: el operador oficial de la parada salvadoreña, con exclusividad en la categoría de telecomunicaciones.\n\n¿Te mando el media kit para que lo veas con calma? Y si prefieres verlo en vivo, agendamos 15 minutos aquí: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Claro El Salvador + GameLobby Xperience",
    "followupText": "Hola Álvaro,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nPreparé una vista con su marca dentro del circuito: https://www.gamelobby.live/mediakit-xperience?marca=Claro%20El%20Salvador#stands\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followup3Subject": "¿Seguimos en contacto? — Claro El Salvador + GameLobby",
    "followup3Text": "Hola Álvaro,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de telecomunicaciones en El Salvador todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "ronda": "cam-02",
    "pais": "El Salvador",
    "producto": "Xperience",
    "sendAfter": "2026-11-18T00:00:00-05:00"
  },
  {
    "id": "cinemark-centroamerica",
    "empresa": "Cinemark Centroamérica",
    "to": "eartiga@cinemark.com",
    "subject": "Cinemark + el tour gamer de Centroamérica 2027",
    "text": "Hola Enrique,\n\nVi la Temporada Siniestra, los Minimark y la Fiesta del Cine: Cinemark sabe convertir una visita al cine en un evento. Te escribo con una idea que va en esa línea.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional que arranca en México en abril, recorre los 6 países de Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nUno de los formatos del tour se juega en salas de cine: clasificatorias y transmisiones en pantalla grande, con el público dentro de la sala. Para Cinemark vemos el papel de sede y socio de exhibición regional del circuito, en los países donde ya tienen complejos.\n\n¿Te mando el media kit para que lo veas con calma? Y si prefieres verlo en vivo, agendamos 15 minutos aquí: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Cinemark Centroamérica + GameLobby Xperience",
    "followupText": "Hola Enrique,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nPreparé una vista con su marca dentro del circuito: https://www.gamelobby.live/mediakit-xperience?marca=Cinemark%20Centroamérica#stands\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followup3Subject": "¿Seguimos en contacto? — Cinemark Centroamérica + GameLobby",
    "followup3Text": "Hola Enrique,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de exhibición y sedes de cine todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "ronda": "cam-02",
    "pais": "Regional",
    "producto": "Xperience",
    "sendAfter": "2026-11-18T00:00:00-05:00"
  },
  {
    "id": "tigo-honduras",
    "empresa": "Tigo Honduras",
    "to": "lzelaya@tigo.com.hn",
    "subject": "Tigo + los gamers de Honduras en 2027",
    "text": "Hola Laura,\n\nTigo llevó los 104 partidos del Mundial al celular de los hondureños y fue pionero con Tigo Money. El siguiente gran contenido que el joven hondureño consume en el celular es el gaming competitivo, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional que arranca en México en abril, recorre los 6 países de Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nPara Tigo Honduras vemos el paquete de Presenting Partner Local: el operador oficial de la parada hondureña, con exclusividad en la categoría de telecomunicaciones.\n\n¿Te mando el media kit para que lo veas con calma? Y si prefieres verlo en vivo, agendamos 15 minutos aquí: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Tigo Honduras + GameLobby Xperience",
    "followupText": "Hola Laura,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nPreparé una vista con su marca dentro del circuito: https://www.gamelobby.live/mediakit-xperience?marca=Tigo%20Honduras#stands\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followup3Subject": "¿Seguimos en contacto? — Tigo Honduras + GameLobby",
    "followup3Text": "Hola Laura,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de telecomunicaciones en Honduras todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "ronda": "cam-02",
    "pais": "Honduras",
    "producto": "Xperience",
    "sendAfter": "2026-11-18T00:00:00-05:00"
  },
  {
    "id": "claro-nicaragua",
    "empresa": "Claro Nicaragua",
    "to": "kenneth.urbina@claro.com.ni",
    "subject": "De la Súper Liga Claro a la liga gamer de Nicaragua",
    "text": "Hola Kenneth,\n\nLa Súper Liga Claro es el torneo juvenil más grande de Nicaragua. Hoy muchos de esos mismos jóvenes también compiten en videojuegos, sobre la red de su operador, y por eso te escribo.\n\nEn 2027 armamos GameLobby Xperience, un tour gamer regional que arranca en México en abril, recorre los 6 países de Centroamérica en junio con clasificatorias por país y cierra con una Gran Final presencial el 28 y 29 de agosto. Cada interacción del gamer queda registrada en la GameLobby Wallet, así que la marca no solo se ve: se mide quién participó, canjeó y volvió.\n\nPara Claro Nicaragua vemos el paquete de Presenting Partner Local: el operador oficial de la parada nicaragüense, con exclusividad en la categoría de telecomunicaciones.\n\n¿Te mando el media kit para que lo veas con calma? Y si prefieres verlo en vivo, agendamos 15 minutos aquí: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followupSubject": "¿Alcanzaste a ver mi correo? — Claro Nicaragua + GameLobby Xperience",
    "followupText": "Hola Kenneth,\n\nTe escribí hace unos días sobre GameLobby Xperience 2027, el tour gamer que recorre Centroamérica y cierra en agosto con una Gran Final presencial.\n\nPreparé una vista con su marca dentro del circuito: https://www.gamelobby.live/mediakit-xperience?marca=Claro%20Nicaragua#stands\n\nSi te hace sentido, agendamos 15 minutos: https://calendar.app.google/paVtHHDVLxzuwhFq8\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "followup3Subject": "¿Seguimos en contacto? — Claro Nicaragua + GameLobby",
    "followup3Text": "Hola Kenneth,\n\nEste es mi último correo para no llenarte la bandeja. La preventa de GameLobby Xperience 2027 sigue abierta y la categoría de telecomunicaciones en Nicaragua todavía está disponible.\n\nSi en algún momento tiene sentido, aquí seguimos.\n\nSaludos,\nMai Celedón\nMarketing Manager, GameLobby",
    "ronda": "cam-02",
    "pais": "Nicaragua",
    "producto": "Xperience",
    "sendAfter": "2026-11-18T00:00:00-05:00"
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
