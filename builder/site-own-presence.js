"use strict";
// 25.11.2026 (рішення Дмитра, варіант «А»): облік залишків Хорошопа НЕ вмикаємо (він діє на весь асортимент
// і вбив би статуси дропу). Натомість наявність ВЛАСНОГО складу на сайті letimo.com.ua ставимо з KeyCRM через Horoshop API:
//   доступно > 0  → «В наявності»;   доступно = 0 → «Немає в наявності».
// Зачіпаються ЛИШЕ артикули, що є в KeyCRM (власний склад). Дроп (MagBaby, Talvi-дроп, ДоРечі, Kiddisvit) не чіпаємо.
// Вхід: _data/keycrm-stock.yml (пише builder/keycrm-stock.js). Секрети: HS_LOGIN, HS_PASSWORD (API-адмін Хорошопа).
// Бойовий режим: файл _data/site-presence-live.txt з «1» (або змінна SITE_PRESENCE_LIVE=1); інакше — пробний режим (лише звіт, нічого не пише на сайт).
// Журнал змін (для відкату): _data/site-presence-log.json.
const fs = require("fs");
const path = require("path");

const API = "https://letimo.com.ua/api/";
const LOGIN = String(process.env.HS_LOGIN || "").trim();
const PASS = String(process.env.HS_PASSWORD || "");
const LIVE = String(process.env.SITE_PRESENCE_LIVE || "") === "1" ||
  (fs.existsSync(path.join(__dirname, "..", "_data", "site-presence-live.txt")) && fs.readFileSync(path.join(__dirname, "..", "_data", "site-presence-live.txt"), "utf8").trim() === "1");
const STOCK = path.join(__dirname, "..", "_data", "keycrm-stock.yml");
const LOG = path.join(__dirname, "..", "_data", "site-presence-log.json");
const IN = "В наявності", OUT = "Немає в наявності";
const MAX_OFF_SHARE = 0.3; // запобіжник: якщо за раз знімається >30% власних товарів — це збій даних, нічого не робимо

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(fn, body) {
  for (let a = 0; a < 3; a++) {
    const r = await fetch(API + fn + "/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const t = await r.text();
    try { return JSON.parse(t); } catch (e) { if (a === 2) throw new Error("Horoshop " + fn + " HTTP " + r.status + ": " + t.slice(0, 150)); await sleep(3000); }
  }
}

let TOKEN = null, TOKEN_AT = 0;
async function token() {
  if (TOKEN && Date.now() - TOKEN_AT < 480000) return TOKEN;
  const j = await call("auth", { login: LOGIN, password: PASS });
  if (j.status !== "OK") throw new Error("Horoshop auth: " + j.status);
  TOKEN = j.response.token; TOKEN_AT = Date.now();
  return TOKEN;
}

// Наявність у відповіді export буває рядком або об'єктом — зводимо до тексту статусу
function presText(p) {
  const v = p && p.presence;
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  const t = v.value || v.title || v.ua || "";
  return String(typeof t === "object" ? (t.ua || t.uk || "") : t).trim();
}

function readStock() {
  if (!fs.existsSync(STOCK)) return null;
  const x = fs.readFileSync(STOCK, "utf8"), m = new Map();
  const re = /<vendorCode>([^<]+)<\/vendorCode><quantity_in_stock>(-?\d+)<\/quantity_in_stock>/g;
  let k;
  while ((k = re.exec(x))) m.set(k[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim(), Number(k[2]) || 0);
  return m;
}

(async () => {
  if (!LOGIN || !PASS) { console.log("Сайт: HS_LOGIN / HS_PASSWORD не задано — пропускаю"); return; }
  const stock = readStock();
  if (!stock || stock.size < 100) { console.log("Сайт: немає свіжих залишків KeyCRM — нічого не змінюю"); return; }

  const arts = [...stock.keys()], cur = new Map();
  let sample = null;
  for (let i = 0; i < arts.length; i += 100) {
    const j = await call("catalog/export", { token: await token(), expr: { article: arts.slice(i, i + 100) }, limit: 500 });
    if (j.status === "OK") (j.response.products || []).forEach((p) => {
      if (!p.article) return;
      if (!sample) sample = p.presence;
      cur.set(String(p.article).trim(), presText(p));
    });
    else if (j.status !== "EMPTY") throw new Error("Horoshop export: " + j.status);
  }

  const upd = [];
  let on = 0, off = 0, other = 0;
  cur.forEach((now, a) => {
    const want = stock.get(a) > 0 ? IN : OUT;
    if (want === IN) on++; else off++;
    if (now !== IN && now !== OUT) other++; // інший статус («Під замовлення» тощо) — теж приводимо до факту складу
    if (now !== want) upd.push({ article: a, presence: want, was: now });
  });
  const toOff = upd.filter((u) => u.presence === OUT).length;
  console.log("Сайт: власних товарів у KeyCRM " + stock.size + ", знайдено на сайті " + cur.size +
    " (за складом: в наявності " + on + ", немає " + off + "; інших статусів " + other + "). Змінити: " + upd.length +
    " (зняти " + toOff + ", повернути " + (upd.length - toOff) + ")");
  console.log("Приклад поля presence з export: " + JSON.stringify(sample).slice(0, 200));
  upd.slice(0, 15).forEach((u) => console.log("  " + u.article + ": «" + u.was + "» → «" + u.presence + "»"));

  if (cur.size && toOff > Math.max(10, cur.size * MAX_OFF_SHARE)) {
    console.log("ЗАПОБІЖНИК: знімається " + toOff + " з " + cur.size + " — схоже на збій даних KeyCRM, нічого не змінюю");
    process.exitCode = 1; return;
  }
  if (!LIVE) { console.log("Пробний режим (SITE_PRESENCE_LIVE≠1) — на сайт нічого не записано"); return; }
  if (!upd.length) return;

  let sent = 0; const errors = [];
  for (let i = 0; i < upd.length; i += 100) {
    const part = upd.slice(i, i + 100);
    const j = await call("catalog/import", { token: await token(), products: part.map((u) => ({ article: u.article, presence: u.presence })) });
    if (j.status !== "OK" && j.status !== "WARNING") { errors.push(j.status + " " + JSON.stringify(j.response || {}).slice(0, 200)); continue; }
    sent += part.length;
  }
  let log = [];
  try { log = JSON.parse(fs.readFileSync(LOG, "utf8")); } catch (e) {}
  log.push({ at: new Date().toISOString(), changes: upd.map((u) => [u.article, u.was, u.presence]) });
  fs.writeFileSync(LOG, JSON.stringify(log.slice(-200), null, 0));
  console.log("Сайт: записано " + sent + " змін" + (errors.length ? "; помилки: " + errors.slice(0, 5).join(" | ") : ""));
  if (errors.length) process.exitCode = 1;
})().catch((e) => { console.log("Сайт: помилка — " + e.message); process.exitCode = 1; });
