import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  OUTBOUND_ROUNDS,
  pickDueSends,
  isLegacyContact,
  CAMPAIGN_2027_START,
} from "../lib/outbound-rounds.js";

const NOW = Math.floor(Date.parse("2026-11-17T17:00:00Z") / 1000);
const base = { to: "a@b.com", subject: "s", text: "t" };

const PANAMA_OK = new Set(["tigo-panama-xp", "bac-panama-xp"]);

test("ninguna ronda 2027 contacta Panamá salvo autorizados", () => {
  for (const item of OUTBOUND_ROUNDS) {
    if (item.panamaAutorizado) { assert.ok(PANAMA_OK.has(item.id) || ["reactivacion-2027","cam-12"].includes(item.ronda), item.id); continue; }
    assert.notEqual(item.pais, "Panamá", item.id);
    assert.ok(!/\.pa$|\.com\.pa$/.test(item.to.split("@")[1]), item.id);
  }
});

test("ids únicos y campos completos, con seguimientos 2 y 3", () => {
  const ids = OUTBOUND_ROUNDS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const i of OUTBOUND_ROUNDS) {
    const ks = i.sinSeguimiento ? ["to", "subject", "text"] : ["to", "subject", "text", "followupSubject", "followupText", "followup3Subject", "followup3Text"];
    for (const k of ks) {
      assert.ok(i[k], `${i.id} sin ${k}`);
    }
  }
});

test("no repite empresas ya contactadas", () => {
  const items = [{ id: "a", ...base }, { id: "b", ...base }];
  assert.deepEqual(pickDueSends(items, ["a"], NOW).map((i) => i.id), ["b"]);
});

test("respeta sendAfter, el tope diario y los países bloqueados", () => {
  const items = [
    { id: "futuro", sendAfter: "2027-01-01T00:00:00-05:00", ...base },
    { id: "pa", pais: "Panamá", ...base },
    { id: "x1", ...base },
    { id: "x2", ...base },
  ];
  assert.deepEqual(pickDueSends(items, [], NOW, 1).map((i) => i.id), ["x1"]);
});

test("Panamá solo sale con autorización explícita", () => {
  const items = [{ id: "pa", pais: "Panamá", ...base }, { id: "pa-ok", pais: "Panamá", panamaAutorizado: true, ...base }];
  assert.deepEqual(pickDueSends(items, [], NOW).map((i) => i.id), ["pa-ok"]);
});

test("contactos de ago 2026 son legacy y no reciben seguimiento", () => {
  assert.equal(isLegacyContact({ sentAt: Math.floor(Date.parse("2026-08-24T12:00:00Z") / 1000) }), true);
  assert.equal(isLegacyContact({ sentAt: CAMPAIGN_2027_START + 60 }), false);
});

test("el cron de seguimiento está activo en vercel.json", () => {
  const v = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.ok(v.crons.some((c) => c.path === "/api/cron/outbound-followup"));
});

test("la prospección sale desde el correo de Mai, no desde info@", async () => {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../api/cron/outbound-followup.js", import.meta.url), "utf8");
  assert.match(src, /m\.celedon@gamelobby\.live/);
  const calls = src.match(/sendEmail\(\{[^}]*\}/g) || [];
  assert.ok(calls.length >= 3);
  for (const c of calls) assert.match(c, /from: OUTBOUND_FROM/);
});

test("a las marcas se les envía la propuesta Presenting Partner, no el media kit con precios", async () => {
  const { OUTBOUND_ROUNDS, linkPropuesta } = await import("../lib/outbound-rounds.js");
  for (const it of OUTBOUND_ROUNDS) {
    for (const k of ["text", "followupText", "followup3Text"]) assert.ok(!(it[k] || "").includes("mediakit-xperience"), it.id + " " + k);
  }
  assert.equal(linkPropuesta("ver https://www.gamelobby.live/mediakit-xperience?marca=OXXO#stands ya"),
    "ver https://www.gamelobby.live/propuesta/presenting-partner?marca=OXXO ya");
});
