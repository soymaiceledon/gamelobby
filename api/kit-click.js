// GameLobby Xperience — redirect con tracking real de clic al Media Kit.
// GET /api/kit-click?id=<leadId> -> marca el clic (si hay id) y redirige al PDF.
// Nunca bloquea el acceso: si el id no existe o KV falla, igual redirige.

import { kv } from "./_email.js";

const KIT_URL = "/assets/media-kit/GameLobby-Xperience-Media-Kit-2026.pdf";

export default async function handler(req, res) {
  const id = String(req.query.id || "").trim();

  if (id) {
    try {
      const { result } = await kv(["GET", `mk:${id}`]);
      if (result) {
        const state = JSON.parse(result);
        if (!state.kitClickedAt) {
          state.kitClickedAt = Math.floor(Date.now() / 1000);
          await kv(["SET", `mk:${id}`, JSON.stringify(state)]);
        }
      }
    } catch (e) {
      console.error("[kit-click] error", e);
    }
  }

  res.writeHead(302, { Location: KIT_URL });
  res.end();
}
