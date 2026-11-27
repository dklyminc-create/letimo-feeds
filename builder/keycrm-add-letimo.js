"use strict";
// 27.11.2026 (Дмитро: «так»): додати в KeyCRM товари власного бренду LETIMO з таблиці штрихкодів, яких там не було.
// Ціни — як у тих самих моделей іншого кольору в KeyCRM (×2,1 на етикетках); кількість — з таблиці.
// Ідемпотентно: якщо SKU вже є — пропускає. Результат → _diag/keycrm-add-letimo.json
const fs = require("fs"), path = require("path");
const KEY = String(process.env.KEYCRM_API_KEY || "").trim();
const B = "https://openapi.keycrm.app/v1";
const H = { Authorization: "Bearer " + KEY, Accept: "application/json", "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ITEMS = [
  ["LETIMO-058", "Костюм флісовий з капюшоном LETIMO, сірий, 80 см", 865, 5],
  ["LETIMO-059", "Костюм флісовий з капюшоном LETIMO, сірий, 86 см", 993, 5],
  ["LETIMO-060", "Костюм флісовий з капюшоном LETIMO, сірий, 92 см", 1090, 5],
  ["LETIMO-095", "Костюм флісовий з капюшоном LETIMO, сірий, 98 см", 1188, 1],
  ["LETIMO-061", "Костюм флісовий з капюшоном LETIMO, сірий, 104 см", 1285, 5],
  ["LETIMO-062", "Костюм флісовий з капюшоном LETIMO, сірий, 110 см", 1384, 5],
  ["LETIMO-075", "Ромпер утеплений без капюшона з відкритою ніжкою LETIMO, шоколадний, 74 см", 470, 5],
  ["LETIMO-076", "Ромпер утеплений без капюшона з відкритою ніжкою LETIMO, шоколадний, 80 см", 575, 5],
  ["LETIMO-077", "Ромпер утеплений без капюшона з відкритою ніжкою LETIMO, шоколадний, 86 см", 567, 5],
  ["LETIMO-078", "Ромпер утеплений без капюшона з відкритою ніжкою LETIMO, шоколадний, 92 см", 624, 5],
  ["LETIMO-087", "Костюм утеплений з ґудзиками LETIMO, шоколадний, 68 см", 832, 5],
  ["LETIMO-088", "Костюм утеплений з ґудзиками LETIMO, шоколадний, 74 см", 851, 5],
  ["LETIMO-089", "Костюм утеплений з ґудзиками LETIMO, шоколадний, 80 см", 869, 5],
  ["LETIMO-090", "Костюм утеплений з ґудзиками LETIMO, шоколадний, 86 см", 897, 5],
];
async function call(method, url, body) {
  for (let a = 0; a < 3; a++) {
    const r = await fetch(B + url, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 429) { await sleep(5000); continue; }
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = t; }
    return { status: r.status, body: j };
  }
}
(async () => {
  const log = { at: new Date().toISOString(), created: [], skipped: [], errors: [], stock: null, warehouses: null };
  if (!KEY) throw new Error("немає ключа");
  const wh = await call("GET", "/warehouses?limit=50"); log.warehouses = wh; await sleep(1100);
  for (const [sku, name, price, qty] of ITEMS) {
    const ex = await call("GET", "/offers?filter[sku]=" + encodeURIComponent(sku)); await sleep(1100);
    if (ex.status === 200 && Array.isArray(ex.body.data) && ex.body.data.some((o) => o.sku === sku)) { log.skipped.push(sku); continue; }
    const r = await call("POST", "/products", { name, sku, price, currency_code: "UAH", description: "" }); await sleep(1100);
    if (r.status >= 200 && r.status < 300) log.created.push({ sku, id: r.body && r.body.id, qty }); else log.errors.push({ sku, status: r.status, body: r.body });
  }
  fs.mkdirSync(path.join(__dirname, "..", "_diag"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "..", "_diag", "keycrm-add-letimo.json"), JSON.stringify(log, null, 1));
  console.log("created " + log.created.length + ", skipped " + log.skipped.length + ", errors " + log.errors.length);
})().catch((e) => { console.log("помилка: " + e.message); process.exitCode = 1; });
