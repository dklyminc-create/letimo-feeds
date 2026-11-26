"use strict";
// 26.11.2026: швидкий синк залишків ВЛАСНОГО складу KeyCRM → Rozetka через Seller API (не чекаючи XML).
// Причина: замовлення 913069777 (Apawwa ABD0026R 24) — пару вже продали/списали, а Rozetka ще продавала:
// фід оновлюється раз на 30 хв, а Rozetka забирає XML лише раз на 60 хв (до ~1,5 год «сліпої зони»).
//
// Що робить (кожні ~5 хв):
//   1) бере живі залишки KeyCRM (_data/keycrm-stock.yml, «доступно» = залишок − резерв);
//   2) зіставляє артикул KeyCRM → id товару в прайсі (через prom.xml: <vendorCode> ↔ offer id) → офер у rozetka.xml;
//   3) цільова кількість = min(KeyCRM, кількість у фіді Rozetka) — API лише ЗМЕНШУЄ / обнуляє, ніколи не «вмикає»
//      те, що фід вимкнув з інших причин (немає фото, правила ДоРечі тощо). Поповнення приходить звичайним XML;
//   4) надсилає PUT /items/mass-update лише тим товарам, де кількість змінилася з минулого запуску
//      (і раз на годину — усім нулям повторно, бо годинний XML Rozetka може повернути старе значення).
// Без секретів ROZETKA_API_TOKEN або ROZETKA_LOGIN+ROZETKA_PASSWORD — нічого не робить (лише лог).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const API = "https://api-seller.rozetka.com.ua";
const TOKEN = String(process.env.ROZETKA_API_TOKEN || "").trim();
const LOGIN = String(process.env.ROZETKA_LOGIN || "").trim();
const PASS = String(process.env.ROZETKA_PASSWORD || "").trim();
const DRY = process.env.DRY_RUN === "1";
const IDS_FILE = path.join(ROOT, "_data", "rz-item-ids.json");   // price_offer_id → item_rz_id (кеш)
const STATE_FILE = path.join(ROOT, "_data", "rz-stock-push.json"); // що надіслали минулого разу
const LOG_FILE = path.join(ROOT, "_data", "rz-stock-log.json");    // журнал останніх змін
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
const kyiv = () => new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });

function keycrmStock() {
  const f = path.join(ROOT, "_data", "keycrm-stock.yml");
  if (!fs.existsSync(f)) return null;
  const m = new Map();
  const x = fs.readFileSync(f, "utf8");
  for (const o of x.matchAll(/<vendorCode>([^<]*)<\/vendorCode><quantity_in_stock>(\d+)</g)) {
    m.set(o[1].replace(/&amp;/g, "&").trim(), Number(o[2]) || 0);
  }
  return m.size ? m : null;
}

function skuById() {
  const x = fs.readFileSync(path.join(ROOT, "prom.xml"), "utf8");
  const m = new Map();
  for (const o of x.matchAll(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g)) {
    const id = (o[1].match(/\bid="([^"]+)"/) || [])[1];
    const vc = (o[2].match(/<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]\s]+)/) || [])[1];
    if (id && vc) m.set(id, vc);
  }
  return m;
}

function rozetkaOffers() {
  const x = fs.readFileSync(path.join(ROOT, "rozetka.xml"), "utf8");
  const m = new Map();
  for (const o of x.matchAll(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g)) {
    const id = (o[1].match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const avail = !/available="false"/.test(o[1]);
    const q = Number((o[2].match(/<stock_quantity>(\d+)/) || [])[1] || (avail ? 1 : 0));
    m.set(id, avail ? q : 0);
  }
  return m;
}

async function rz(method, url, token, body) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(API + url, {
      method,
      headers: { "Content-Type": "application/json", "Content-Language": "uk", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
    const j = await r.json().catch(() => ({}));
    return j;
  }
  throw new Error("Rozetka API: немає відповіді на " + url);
}

async function getToken() {
  if (TOKEN) return TOKEN;
  const j = await rz("POST", "/sites", null, { username: LOGIN, password: Buffer.from(PASS).toString("base64") });
  const t = j && j.content && j.content.access_token;
  if (!t) throw new Error("Rozetka: авторизація не вдалась — " + JSON.stringify(j.errors || j).slice(0, 200));
  return t;
}

async function resolveIds(token, ids, cache) {
  let found = 0, miss = 0;
  for (const id of ids) {
    if (cache[id]) continue;
    const j = await rz("GET", "/goods/all?price_offer_id=" + encodeURIComponent(id), token);
    if (j && j.success === false && j.errors && /token|access/i.test(j.errors.message || "")) throw new Error("Rozetka: " + j.errors.message);
    const c = (j && j.content) || {};
    const list = c.items || c.goods || c.data || [];
    const it = list.find((g) => String(g.price_offer_id) === String(id)) || null;
    if (it && it.id) { cache[id] = Number(it.id); found++; } else { cache[id] = 0; miss++; }
    await sleep(350);
  }
  return { found, miss };
}

(async () => {
  if (!TOKEN && !(LOGIN && PASS)) { console.log("Rozetka API: секрети не задано (ROZETKA_API_TOKEN або ROZETKA_LOGIN/ROZETKA_PASSWORD) — пропускаю"); return; }
  const kc = keycrmStock();
  if (!kc) { console.log("Rozetka API: немає свіжих залишків KeyCRM — нічого не змінюю"); return; }
  const sku = skuById();
  const feed = rozetkaOffers();

  // цільові кількості для оферів Rozetka, що належать власному складу
  const target = {};
  for (const [id, feedQ] of feed) {
    const s = sku.get(id);
    if (!s || !kc.has(s)) continue;
    target[id] = Math.min(kc.get(s), feedQ);
  }
  const ids = Object.keys(target);
  console.log("Rozetka API: оферів власного складу у фіді — " + ids.length + ", з них 0 шт — " + ids.filter((i) => target[i] === 0).length);

  const token = await getToken();
  const cache = readJson(IDS_FILE, {});
  // повторно шукаємо «не знайдені» раз на добу
  const day = new Date().toISOString().slice(0, 10);
  if (cache.__day !== day) { for (const k of Object.keys(cache)) if (cache[k] === 0) delete cache[k]; cache.__day = day; }
  const r = await resolveIds(token, ids, cache);
  if (r.found || r.miss) console.log("Rozetka API: зіставлено id — нових " + r.found + ", не знайдено на Rozetka " + r.miss);

  const prev = readJson(STATE_FILE, { sent: {}, zerosAt: 0 });
  const now = Date.now();
  const resendZeros = now - (prev.zerosAt || 0) > 55 * 60 * 1000;
  const items = [], changes = [];
  for (const id of ids) {
    const rid = cache[id];
    if (!rid) continue;
    const q = target[id];
    const changed = prev.sent[id] !== q;
    if (changed || (resendZeros && q === 0)) {
      items.push({ item_rz_id: rid, stock_quantity: q });
      if (changed) changes.push({ id, sku: sku.get(id), from: prev.sent[id] ?? null, to: q });
    }
  }
  console.log("Rozetka API: до відправки " + items.length + " (змін " + changes.length + (resendZeros ? ", повтор нулів" : "") + ")" + (DRY ? " — DRY RUN" : ""));
  changes.slice(0, 50).forEach((c) => console.log("  " + c.sku + " (" + c.id + "): " + c.from + " → " + c.to));

  let ok = true;
  if (!DRY) {
    for (let i = 0; i < items.length; i += 100) {
      const j = await rz("PUT", "/items/mass-update", token, { items: items.slice(i, i + 100) });
      if (!j || j.success !== true) { ok = false; console.log("Rozetka API: помилка mass-update — " + JSON.stringify((j && (j.errors || j.content)) || j).slice(0, 400)); }
      else if (j.content && Object.keys(j.content).length) console.log("Rozetka API: зауваги — " + JSON.stringify(j.content).slice(0, 400));
      await sleep(500);
    }
  }

  fs.writeFileSync(IDS_FILE, JSON.stringify(cache));
  if (ok && !DRY) {
    const sent = {};
    for (const id of ids) if (cache[id]) sent[id] = target[id];
    fs.writeFileSync(STATE_FILE, JSON.stringify({ sent, zerosAt: resendZeros ? now : prev.zerosAt || 0 }));
    if (changes.length) {
      const log = readJson(LOG_FILE, []);
      changes.forEach((c) => log.unshift({ t: kyiv(), ...c }));
      fs.writeFileSync(LOG_FILE, JSON.stringify(log.slice(0, 500), null, 1));
    }
  }
  if (!ok) process.exitCode = 1;
})().catch((e) => { console.log("Rozetka API: " + e.message); process.exitCode = 1; });
