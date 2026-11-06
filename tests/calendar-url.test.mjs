// El calendario público no puede volver a publicar el appointment retirado.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sponsorCalendarUrl, SPONSOR_CALENDAR_URL } from "../api/calendar-url.js";

const NEW_URL = "https://calendar.app.google/paVtHHDVLxzuwhFq8";
const OLD_URL = "https://calendar.app.google/gxjJELrWfsip6PG69";
const previous = process.env.SPONSOR_CALENDAR_URL;

afterEach(() => {
  if (previous === undefined) delete process.env.SPONSOR_CALENDAR_URL;
  else process.env.SPONSOR_CALENDAR_URL = previous;
});

test("sin variable de entorno se usa el calendario nuevo", () => {
  delete process.env.SPONSOR_CALENDAR_URL;
  assert.equal(SPONSOR_CALENDAR_URL, NEW_URL);
  assert.equal(sponsorCalendarUrl(), NEW_URL);
});

test("el appointment retirado en SPONSOR_CALENDAR_URL no se publica", () => {
  process.env.SPONSOR_CALENDAR_URL = OLD_URL;
  assert.equal(sponsorCalendarUrl(), NEW_URL);
});

test("un enlace de entorno distinto y vigente se respeta", () => {
  process.env.SPONSOR_CALENDAR_URL = "https://calendar.app.google/otroValido";
  assert.equal(sponsorCalendarUrl(), "https://calendar.app.google/otroValido");
});
