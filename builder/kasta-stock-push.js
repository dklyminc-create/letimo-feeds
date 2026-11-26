"use strict";
// 26.11.2026: залишки на Kasta через HUB API одразу після кожного збирання фіду (раз на 30 хв), а не коли Kasta
// сама перечитає файл (за журналом — інтервали 1–5 год). Власний склад (KeyCRM) і дроп.
// POST https://hub.kasta.ua/api/products/update-stock/id  { items: [{ unique_sku_id, stock }] } — до 1000 за запит.
// Авторизація: заголовок "Authorization: <токен>" (без Bearer). Токен генерується в кабінеті Kasta hub.
// Режим — KASTA_PUSH: порожньо = вимкнено; "probe" = показати, які unique_sku_id у Kasta; "test:<id>" = один товар
// з тим самим значенням; "live" = усі зміни (перший запуск лише запам'ятовує стан).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const API = "https://hub.kasta.ua/api";
const TOKEN = String(process.env.KASTA_API_TOKEN || "").trim();
const MODE = String(process.env.KASTA_PUSH || "").trim();
const PREFIX = String(process.env.KASTA_ID_PREFIX || ""); // якщо в Kasta ID мають префікс (напр. "rzid_")
const STATE = path.join(ROOT, "_data", "kasta-stock-push.json");
const LOG = path.join(ROOT, "_data", "kasta-stock-log.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
const kyiv = () => new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });
const H = () => ({ Authorization: TOKEN, "Content-Type": "application/json", Accept: "application/json" });

function feedState() {
  const f = path.join(ROOT, "kasta.xml");
  if (!fs.existsSync(f)) return null;
  const x = fs.readFileSync(f, "utf8");
  const m = {};
  for (const o of x.matchAll(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g)) {
    const id = (o[1].match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const q = Number((o[2].match(/<stock_quantity>(\d+)/) || [])[1] || 0);
    m[PREFIX + id] = /available="false"/.test(o[1]) ? 0 : q;
  }
  return Object.keys(m).length > 1000 ? m : null;
}

async function post(items) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(API + "/products/update-stock/id", { method: "POST", headers: H(), body: JSON.stringify({ items }) });
    if (r.status === 429 || r.status >= 500) { await sleep(5000 * (a + 1)); continue; }
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = { raw: t.slice(0, 300) }; }
    return { status: r.status, j };
  }
  return { status: 0, j: { error: "немає відповіді" } };
}

(async () => {
  if (!MODE) { console.log("Kasta API: KASTA_PUSH не задано — пропускаю"); return; }
  if (!TOKEN) { console.log("Kasta API: немає KASTA_API_TOKEN — пропускаю"); return; }

  if (MODE === "probe") {
    const r = await fetch(API + "/products/list", { headers: H() });
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = {}; }
    console.log("Kasta probe: HTTP " + r.status + (j.items ? ", товарів у відповіді " + j.items.length : " " + t.slice(0, 300)));
    (j.items || []).slice(0, 8).forEach((p) => console.log("Kasta probe: " + JSON.stringify({ unique_sku_id: p.unique_sku_id, barcode: p.barcode, article: p.article || p.vendor_code, size: p.size, stock: p.stock, status: p.status })));
    return;
  }

  const cur = feedState();
  if (!cur) { console.log("Kasta API: немає kasta.xml — пропускаю"); return; }

  if (MODE.startsWith("test:")) {
    const id = PREFIX + MODE.slice(5).trim();
    if (cur[id] === undefined) { console.log("Kasta API (тест): " + id + " немає у фіді"); return; }
    const it = { unique_sku_id: id, stock: cur[id] };
    console.log("Kasta API (тест): надсилаю " + JSON.stringify(it) + " (те саме, що у фіді)");
    const r = await post([it]);
    console.log("Kasta API (тест): HTTP " + r.status + " " + JSON.stringify(r.j).slice(0, 500));
    return;
  }
  if (MODE !== "live") { console.log("Kasta API: невідомий режим " + MODE); return; }

  const prev = readJson(STATE, null);
  if (!prev || !prev.sent) {
    fs.writeFileSync(STATE, JSON.stringify({ sent: cur, t: Date.now() }));
    console.log("Kasta API: перший запуск — запам'ятав стан " + Object.keys(cur).length + " товарів, нічого не надсилаю");
    return;
  }
  const items = [], changes = [];
  for (const id of Object.keys(cur)) if (prev.sent[id] !== cur[id]) { items.push({ unique_sku_id: id, stock: cur[id] }); changes.push({ id, from: prev.sent[id] ?? null, to: cur[id] }); }
  console.log("Kasta API: змін " + items.length + " (стало 0 — " + items.filter((i) => i.stock === 0).length + ")");
  changes.slice(0, 40).forEach((c) => console.log("  " + c.id + ": " + c.from + " → " + c.to));
  if (!items.length) return;
  let upd = 0, nf = 0, failed = 0;
  for (let i = 0; i < items.length; i += 1000) {
    const r = await post(items.slice(i, i + 1000));
    if (r.status !== 200) { failed++; console.log("Kasta API: помилка " + r.status + " — " + JSON.stringify(r.j).slice(0, 300)); continue; }
    upd += (r.j.updated || []).length; nf += (r.j["not-found"] || r.j.not_found || []).length;
    await sleep(1000);
  }
  console.log("Kasta API: оновлено " + upd + ", не знайдено на Kasta " + nf + (failed ? ", невдалих пакетів " + failed : ""));
  if (failed) return; // стан не оновлюємо — повторимо наступного разу
  fs.writeFileSync(STATE, JSON.stringify({ sent: cur, t: Date.now() }));
  const log = readJson(LOG, []);
  changes.forEach((c) => log.unshift({ t: kyiv(), ...c }));
  fs.writeFileSync(LOG, JSON.stringify(log.slice(0, 500), null, 1));
})().catch((e) => { console.log("Kasta API: " + e.message); });
