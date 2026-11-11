import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { estadoTorneo } from "../lib/lobby-estado.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

function panama(isoUtc) {
  return new Date(isoUtc);
}

test("antes de las 18:50 el día del torneo es HOY", () => {
  assert.equal(estadoTorneo("2026-11-11", panama("2026-11-11T23:49:00Z")), "HOY");
});

test("a las 18:50 y hasta las 21:00 las inscripciones están cerradas", () => {
  assert.equal(estadoTorneo("2026-11-11", panama("2026-11-11T23:50:00Z")), "Inscripciones cerradas");
  assert.equal(estadoTorneo("2026-11-11", panama("2026-11-12T02:00:00Z")), "Inscripciones cerradas");
});

test("después de las 21:00 o al día siguiente queda finalizado", () => {
  assert.equal(estadoTorneo("2026-11-11", panama("2026-11-12T02:01:00Z")), "Finalizado");
  assert.equal(estadoTorneo("2026-11-11", panama("2026-11-12T15:00:00Z")), "Finalizado");
});

test("un día anterior no muestra estado", () => {
  assert.equal(estadoTorneo("2026-11-12", panama("2026-11-12T04:00:00Z")), null);
});

test("sin fecha no hay estado", () => {
  assert.equal(estadoTorneo("", panama("2026-11-11T23:00:00Z")), null);
  assert.equal(estadoTorneo(null, panama("2026-11-11T23:00:00Z")), null);
});

function card(id) {
  const m = html.match(new RegExp(`<article\\b[^>]*\\bid="${id}"[\\s\\S]*?</article>`));
  assert.ok(m, `falta la tarjeta ${id}`);
  return m[0];
}

test("la home anuncia premios confirmados y Free Fire reprogramado, sin otra fecha", () => {
  assert.match(html, /id="EntraAlLobby"/);
  assert.match(html, /Entra al Lobby: torneos gratis esta semana/);
  assert.match(html, /Torneo Flash · 11 y 12 de noviembre · 7:00 p\. m\. \(Panamá\)/);
  assert.equal(html.split("Premios: $10 al 1.º lugar y $5 al 2.º").length - 1, 6);
  const ff = card("lobby-freefire");
  assert.match(ff, /Reprogramado · nueva fecha muy pronto/);
  assert.equal(ff.includes("data-fecha"), false);
  assert.doesNotMatch(ff, /HOY|Inscripciones cerradas|Finalizado|18:50|7:00/);
  assert.match(ff, /href="\/freefire"/);
  assert.match(card("lobby-fortnite"), /data-fecha="2026-11-11"/);
  assert.match(card("lobby-tekken"), /data-fecha="2026-11-18"/);
  assert.match(card("lobby-tekken"), /Miércoles 18 de noviembre · 7:00 p\. m\. \(Panamá\)/);
  assert.match(card("lobby-tekken"), /El miércoles 18 de noviembre la sala está activa/);
  assert.doesNotMatch(card("lobby-tekken"), /11 de noviembre|2026-11-11|11\/11/);
  assert.match(card("lobby-tekken"), /Nueva fecha/);
  assert.match(card("lobby-fc27"), /data-fecha="2026-11-12"/);
  assert.match(card("lobby-clash"), /data-fecha="2026-11-12"/);
  const order = [...html.matchAll(/<article[^>]*id="(lobby-[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["lobby-fortnite", "lobby-fc27", "lobby-clash", "lobby-tekken", "lobby-freefire"]);
  assert.match(html, /href="#EntraAlLobby"/);
  assert.match(html, /\+25,000/);
  assert.match(html, /\+500/);
});

test("cada tarjeta lleva el banner local del juego, sin enlazar gamelobby.gg", () => {
  const banners = {
    "lobby-fortnite": ["Fortnite", "/img/torneos/fortnite.webp"],
    "lobby-tekken": ["Tekken 8", "/img/torneos/tekken-8.webp"],
    "lobby-fc27": ["EA Sports FC 27", "/img/torneos/fc-27.webp"],
    "lobby-clash": ["Clash Royale", "/img/torneos/clash-royale.webp"],
    "lobby-freefire": ["Free Fire", "/img/torneos/free-fire.webp"],
  };
  for (const [id, [alt, src]] of Object.entries(banners)) {
    const piece = card(id);
    assert.match(piece, new RegExp(`<img class="lobby-card__banner" src="${src}" alt="${alt}"[^>]*loading="lazy"`));
    assert.doesNotMatch(piece, /src="https:\/\/gamelobby\.gg\/uploads\/(?:games|gallery)/);
    const size = statSync(new URL(`..${src}`, import.meta.url)).size;
    assert.ok(size > 0 && size < 150 * 1024, `${src} pesa ${size}`);
  }
});

test("las redirecciones nuevas son temporales y no pisan la del media kit", () => {
  assert.equal(vercel.redirects[0].source, "/assets/media-kit/GameLobby-Xperience-Media-Kit-2026.pdf");
  assert.equal(vercel.redirects[0].permanent, false);
  const bySource = Object.fromEntries(vercel.redirects.map((r) => [r.source, r]));
  for (const source of ["/torneos", "/torneo", "/encuesta"]) {
    assert.equal(bySource[source].destination, "/#EntraAlLobby");
    assert.equal(bySource[source].permanent, false);
  }
  const rooms = {
    "/freefire": ["torneo-flash-gamelobby-free-fire", "freefire"],
    "/ff": ["torneo-flash-gamelobby-free-fire", "freefire"],
    "/fortnite": ["torneo-flash-gamelobby-fortnite", "fortnite"],
    "/tekken": ["torneo-flash-gamelobby-tekken-8", "tekken"],
    "/fc27": ["torneo-flash-gamelobby-ea-sports-fc-27", "fc27"],
    "/fc": ["torneo-flash-gamelobby-ea-sports-fc-27", "fc27"],
    "/clash": ["torneo-flash-gamelobby-clash-royale", "clash"],
  };
  for (const [source, [slug, content]] of Object.entries(rooms)) {
    const url = new URL(bySource[source].destination);
    assert.equal(bySource[source].permanent, false);
    assert.equal(url.origin + url.pathname, `https://gamelobby.gg/room/details/${slug}`);
    assert.equal(url.searchParams.get("utm_source"), "link");
    assert.equal(url.searchParams.get("utm_medium"), "corto");
    assert.equal(url.searchParams.get("utm_campaign"), "torneo-flash-nov26");
    assert.equal(url.searchParams.get("utm_content"), content);
  }
});
