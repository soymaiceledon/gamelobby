// Pruebas de /api/lead y /api/organizer-count con fetch simulado (sin red ni KV real).
// Ejecutar: node --test tests/
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.KV_REST_API_URL = "https://kv.test";
process.env.KV_REST_API_TOKEN = "tok";
process.env.RESEND_API_KEY = "re_test";
process.env.MAIL_FROM = "GameLobby <hola@test.dev>";

const { default: lead } = await import("../api/lead.js");
const { default: count } = await import("../api/organizer-count.js");

let calls, sadd, kvDown;
beforeEach(() => {
  calls = []; sadd = 1; kvDown = false;
  globalThis.fetch = async (url, opts = {}) => {
    const body = opts.body ? JSON.parse(opts.body) : null;
    calls.push({ url: String(url), body });
    if (String(url).startsWith("https://kv.test")) {
      if (kvDown) return { ok: false, status: 503, json: async () => ({}) };
      if (body[0] === "SADD") return { ok: true, status: 200, json: async () => ({ result: sadd }) };
      if (body[0] === "LRANGE") {
        return { ok: true, status: 200, json: async () => ({ result: [
          JSON.stringify({ email: "A@x.com" }), JSON.stringify({ email: "a@x.com" }), JSON.stringify({ email: "b@x.com" }), "no-json",
        ] }) };
      }
      return { ok: true, status: 200, json: async () => ({ result: 1 }) };
    }
    return { ok: true, status: 200, text: async () => "", json: async () => ({}) };
  };
});

function run(handler, method, body) {
  return new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(o) { resolve({ code: this.code, body: o }); } };
    handler({ method, body, headers: {}, query: {} }, res);
  });
}
const base = { name: "Ana Pérez", email: "ana@correo.com" };

test("registro válido: se guarda, se confirma y la bienvenida no imprime variables vacías", async () => {
  const r = await run(lead, "POST", { ...base, type: "organizer", community: "Liga Norte", consentMarketing: true, utm_source: "ig", page: "/organizadores" });
  assert.equal(r.code, 200);
  assert.equal(r.body.stored, true);
  const push = calls.find((c) => c.body && c.body[0] === "RPUSH");
  const saved = JSON.parse(push.body[2]);
  assert.equal(saved.consentMarketing, true);
  assert.equal(saved.utm_source, "ig");
  const mail = calls.find((c) => c.url.includes("resend.com"));
  const sent = JSON.parse(mail.body ? JSON.stringify(mail.body) : "{}");
  assert.match(sent.subject, /Tu comunidad ya está registrada/);
  assert.doesNotMatch(sent.text + sent.html, /undefined|\{\{|null/);
  assert.match(sent.text, /octubre de 2026/);
});

test("consentimiento comercial no se preselecciona: sin marcar queda en false", async () => {
  await run(lead, "POST", { ...base, type: "waitlist" });
  const saved = JSON.parse(calls.find((c) => c.body && c.body[0] === "RPUSH").body[2]);
  assert.equal(saved.consentMarketing, false);
});

test("comunidad sin nombre: el correo no imprime 'undefined' ni llaves", async () => {
  await run(lead, "POST", { ...base, type: "organizer" });
  const sent = calls.find((c) => c.url.includes("resend.com")).body;
  assert.doesNotMatch(sent.text + sent.html, /undefined|\{\{|null/);
  assert.match(sent.text, /tu comunidad como Comunidad Fundadora/);
});

test("duplicado: no se vuelve a guardar ni a enviar la bienvenida", async () => {
  sadd = 0;
  const r = await run(lead, "POST", { ...base, type: "waitlist" });
  assert.equal(r.body.duplicate, true);
  assert.equal(r.body.stored, true);
  assert.equal(calls.some((c) => c.body && c.body[0] === "RPUSH"), false);
  assert.equal(calls.some((c) => c.url.includes("resend.com")), false);
});

test("fallo del almacenamiento: stored=false, para que el sitio muestre el error y no un éxito falso", async () => {
  kvDown = true;
  const r = await run(lead, "POST", { ...base, type: "waitlist" });
  assert.equal(r.code, 200);
  assert.equal(r.body.stored, false);
});

test("entrada inválida: 400", async () => {
  const r = await run(lead, "POST", { name: "", email: "no-es-correo", type: "waitlist" });
  assert.equal(r.code, 400);
});

test("honeypot: el bot recibe stored=false y no se guarda nada", async () => {
  const r = await run(lead, "POST", { ...base, type: "waitlist", website: "spam.com" });
  assert.equal(r.body.stored, false);
  assert.equal(calls.length, 0);
});

test("contador de comunidades: oculto sin autorización y solo registros reales deduplicados con ella", async () => {
  delete process.env.ORGANIZER_COUNT_VISIBLE;
  let r = await run(count, "GET");
  assert.equal(r.body.visible, false);
  assert.equal(r.body.count, undefined);
  process.env.ORGANIZER_COUNT_VISIBLE = "true";
  r = await run(count, "GET");
  assert.equal(r.body.visible, true);
  assert.equal(r.body.count, 2); // A@x.com y a@x.com cuentan una vez; el registro ilegible se ignora
});
