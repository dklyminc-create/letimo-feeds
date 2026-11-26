"use strict";
// 26.11.2026: наявність і кількість на Prom через публічне API одразу після кожного збирання фіду (раз на 30 хв),
// а не лише імпортом за посиланням (Prom забирає файл раз на 4 год). Власний склад (KeyCRM) і дроп.
// POST https://my.prom.ua/api/v1/products/edit_by_external_id  [{ id, presence, quantity_in_stock }]
// Режим — PROM_PUSH: порожньо = вимкнено; "test:<id>" = один товар (те саме, що у фіді); "live" = усі зміни.
// Перший live-запуск лише запам'ятовує стан; далі надсилає тільки змінене.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const API = "https://my.prom.ua/api/v1";
const TOKEN = String(process.env.PROM_API_TOKEN || "").trim();
const MODE = String(process.env.PROM_PUSH || "").trim();
const STATE = path.join(ROOT, "_data", "prom-stock-push.json");
const LOG = path.join(ROOT, "_data", "prom-stock-log.json");
const BATCH = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
const kyiv = () => new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });

function feedState() {
  const gz = path.join(ROOT, "prom.xml.gz");
  if (!fs.existsSync(gz)) return null;
  const x = zlib.gunzipSync(fs.readFileSync(gz)).toString("utf8");
  const m = {};
  for (const o of x.matchAll(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g)) {
    const id = (o[1].match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const off = /available="false"/.test(o[1]);
    const q = Number((o[2].match(/<quantity_in_stock>(\d+)/) || [])[1]);
    m[id] = off ? "0" : (Number.isFinite(q) && q > 0 ? String(q) : "a"); // "a" = в наявності без кількості
  }
  return Object.keys(m).length > 1000 ? m : null;
}
const toItem = (id, v) => (v === "0" ? { id, presence: "not_available", quantity_in_stock: 0 }
  : v === "a" ? { id, presence: "available" } : { id, presence: "available", quantity_in_stock: Number(v) });

async function post(items) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(API + "/products/edit_by_external_id", {
      method: "POST",
      headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json", Accept: "application/json", "X-LANGUAGE": "uk" },
      body: JSON.stringify(items),
    });
    if (r.status === 429 || r.status >= 500) { await sleep(5000 * (a + 1)); continue; }
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = { raw: t.slice(0, 300) }; }
    return { status: r.status, j };
  }
  return { status: 0, j: { error: "немає відповіді" } };
}

async function send(items) {
  const res = { ok: 0, errors: {}, failed: 0 };
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    const r = await post(chunk);
    if (r.status !== 200) { res.failed += chunk.length; console.log("Prom: помилка " + r.status + " — " + JSON.stringify(r.j).slice(0, 300)); continue; }
    res.ok += (r.j.processed_ids || []).length;
    Object.assign(res.errors, r.j.errors || {});
    await sleep(1000);
  }
  return res;
}

(async () => {
  if (!MODE) { console.log("Prom API: PROM_PUSH не задано — пропускаю"); return; }
  if (!TOKEN) { console.log("Prom API: немає PROM_API_TOKEN — пропускаю"); return; }
  const cur = feedState();
  if (!cur) { console.log("Prom API: немає prom.xml.gz — пропускаю"); return; }

  if (MODE.startsWith("test:")) {
    const id = MODE.slice(5).trim();
    if (!cur[id]) { console.log("Prom API (тест): " + id + " немає у фіді"); return; }
    const it = toItem(id, cur[id]);
    console.log("Prom API (тест): надсилаю " + JSON.stringify(it) + " (те саме, що у фіді)");
    const r = await post([it]);
    console.log("Prom API (тест): HTTP " + r.status + " " + JSON.stringify(r.j).slice(0, 500));
    return;
  }
  if (MODE !== "live") { console.log("Prom API: невідомий режим " + MODE); return; }

  const prev = readJson(STATE, null);
  if (!prev || !prev.sent) {
    fs.writeFileSync(STATE, JSON.stringify({ sent: cur, t: Date.now() }));
    console.log("Prom API: перший запуск — запам'ятав стан " + Object.keys(cur).length + " товарів, нічого не надсилаю");
    return;
  }
  const items = [], changes = [];
  for (const id of Object.keys(cur)) if (prev.sent[id] !== cur[id]) { items.push(toItem(id, cur[id])); changes.push({ id, from: prev.sent[id] ?? null, to: cur[id] }); }
  console.log("Prom API: змін " + items.length + " (стало «немає» " + items.filter((i) => i.presence === "not_available").length + ")");
  changes.slice(0, 40).forEach((c) => console.log("  " + c.id + ": " + c.from + " → " + c.to));
  if (!items.length) return;
  const r = await send(items);
  const errN = Object.keys(r.errors).length;
  console.log("Prom API: прийнято " + r.ok + ", помилок " + errN + (errN ? " — " + JSON.stringify(r.errors).slice(0, 400) : "") + (r.failed ? ", не відправлено " + r.failed : ""));
  if (r.failed) return; // стан не оновлюємо — повторимо наступного разу
  fs.writeFileSync(STATE, JSON.stringify({ sent: cur, t: Date.now() }));
  const log = readJson(LOG, []);
  changes.forEach((c) => log.unshift({ t: kyiv(), ...c }));
  fs.writeFileSync(LOG, JSON.stringify(log.slice(0, 500), null, 1));
})().catch((e) => { console.log("Prom API: " + e.message); });
