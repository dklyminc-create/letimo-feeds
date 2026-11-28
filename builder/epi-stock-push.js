"use strict";
// 26.11.2026: наявність на Епіцентрі через Merchant API одразу після кожного збирання фіду (раз на 30 хв),
// а не лише щоденним «Автооновленням залишків» (00:00–02:00). Охоплює і власний склад (KeyCRM), і дроп.
// POST /v1/offers { items: [{ sku, availability }] } — до 1000 за запит, асинхронно; результат: GET /v1/offers/update-results/{requestId}.
// Режим — змінна EPI_PUSH: порожньо = вимкнено; "test:<sku>" = надіслати один товар і показати результат; "live" = усі зміни.
// Надсилає лише ті товари, чия наявність у epicentr.xml змінилася з минулого надсилання (перший live-запуск — лише запам'ятовує стан).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const API = "https://merchant-api.epicentrm.com.ua";
const TOKEN = String(process.env.EPICENTR_TOKEN || "").trim();
const MODE = String(process.env.EPI_PUSH || "").trim();
const STATE = path.join(ROOT, "_data", "epi-stock-push.json");
const LOG = path.join(ROOT, "_data", "epi-stock-log.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
const kyiv = () => new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });

async function api(method, p, body) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(API + p, {
      method,
      headers: { Authorization: "Bearer " + TOKEN, Accept: "application/json", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
    const txt = await r.text();
    let j; try { j = JSON.parse(txt); } catch (e) { j = { raw: txt.slice(0, 300) }; }
    return { status: r.status, j };
  }
  throw new Error("Епіцентр API: немає відповіді на " + p);
}

function feedState() {
  const f = fs.existsSync(path.join(ROOT, "epicentr.xml")) ? path.join(ROOT, "epicentr.xml") : null;
  if (!f) return null;
  const x = fs.readFileSync(f, "utf8");
  const m = {};
  for (const o of x.matchAll(/<offer\b([^>]*)>/g)) {
    const id = (o[1].match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    m[id] = /available="false"/.test(o[1]) ? "not_available" : "in_stock";
  }
  return Object.keys(m).length > 1000 ? m : null;
}

async function send(items) {
  const res = { processed: 0, enqueued: 0, skipped: 0, forbidden: 0, other: 0, bad: [] };
  for (let i = 0; i < items.length; i += 1000) {
    const chunk = items.slice(i, i + 1000);
    const r = await api("POST", "/v1/offers", { items: chunk });
    if (r.status !== 201 && r.status !== 200) { console.log("Епіцентр: помилка " + r.status + " — " + JSON.stringify(r.j).slice(0, 400)); res.other += chunk.length; continue; }
    const rid = r.j.requestId;
    let fin = r.j;
    for (let t = 0; t < 12 && rid; t++) { // чекаємо обробку до ~2 хв
      await sleep(10000);
      const q = await api("GET", "/v1/offers/update-results/" + rid);
      if (q.status === 200) { fin = q.j; if (!(fin.items || []).some((it) => it.status === "enqueued")) break; }
    }
    (fin.items || []).forEach((it) => {
      if (res[it.status] !== undefined) res[it.status]++; else res.other++;
      if (it.status === "forbidden" || (it.errors && it.errors.length)) res.bad.push({ id: it.id, status: it.status, errors: it.errors });
    });
    await sleep(1000);
  }
  return res;
}

(async () => {
  if (!MODE) { console.log("Епіцентр API: EPI_PUSH не задано — пропускаю"); return; }
  if (!TOKEN) { console.log("Епіцентр API: немає EPICENTR_TOKEN — пропускаю"); return; }
  const cur = feedState();
  if (!cur) { console.log("Епіцентр API: немає epicentr.xml — пропускаю"); return; }

  if (MODE.startsWith("test:")) {
    const sku = MODE.slice(5).trim();
    if (!cur[sku]) { console.log("Епіцентр API (тест): " + sku + " немає у фіді"); return; }
    console.log("Епіцентр API (тест): надсилаю " + sku + " → " + cur[sku] + " (те саме, що у фіді)");
    const r = await send([{ sku, availability: cur[sku] }]);
    console.log("Епіцентр API (тест): результат " + JSON.stringify(r));
    return;
  }
  if (MODE.startsWith("off:")) { // 28.11.2026: разово зняти з продажу перелічені SKU (через кому)
    const skus = MODE.slice(4).split(",").map((x) => x.trim()).filter(Boolean);
    console.log("Епіцентр API (off): знімаю з продажу " + skus.join(", "));
    const r = await send(skus.map((sku) => ({ sku, availability: "not_available" })));
    console.log("Епіцентр API (off): результат " + JSON.stringify(r));
    return;
  }
  if (MODE !== "live") { console.log("Епіцентр API: невідомий режим " + MODE); return; }

  const prev = readJson(STATE, null);
  if (!prev || !prev.sent) {
    fs.writeFileSync(STATE, JSON.stringify({ sent: cur, t: Date.now() }));
    console.log("Епіцентр API: перший запуск — запам'ятав стан " + Object.keys(cur).length + " товарів, нічого не надсилаю");
    return;
  }
  const items = [], changes = [];
  for (const id of Object.keys(cur)) {
    if (prev.sent[id] !== cur[id]) { items.push({ sku: id, availability: cur[id] }); changes.push({ id, from: prev.sent[id] || null, to: cur[id] }); }
  }
  // 28.11.2026: товар зник із фіду (напр. DR-1842 після правила «немає» в прайсі ДоРечі), а на Епіцентрі був «в наявності» —
  // знімаємо з продажу, інакше Епіцентр так і показує його доступним.
  for (const id of Object.keys(prev.sent)) {
    if (!(id in cur) && prev.sent[id] === "in_stock") { items.push({ sku: id, availability: "not_available" }); changes.push({ id, from: "in_stock", to: "not_available (зник із фіду)" }); cur[id] = "not_available"; }
  }
  console.log("Епіцентр API: змін наявності " + items.length + (items.length ? " (з них стало «немає» " + items.filter((i) => i.availability === "not_available").length + ")" : ""));
  changes.slice(0, 40).forEach((c) => console.log("  " + c.id + ": " + c.from + " → " + c.to));
  if (!items.length) return;
  const r = await send(items);
  console.log("Епіцентр API: результат " + JSON.stringify({ ...r, bad: r.bad.slice(0, 10) }));
  // зберігаємо новий стан (товари, яких немає на Епіцентрі, — «forbidden» — однаково підхопить щоденний імпорт XML)
  fs.writeFileSync(STATE, JSON.stringify({ sent: cur, t: Date.now() }));
  const log = readJson(LOG, []);
  changes.forEach((c) => log.unshift({ t: kyiv(), ...c }));
  fs.writeFileSync(LOG, JSON.stringify(log.slice(0, 500), null, 1));
})().catch((e) => { console.log("Епіцентр API: " + e.message); });
