"use strict";
// 25.11.2026: живі залишки власного складу з KeyCRM (замість YML-експорту SalesDrive — LETIMO перейшла на KeyCRM 24.11.2026).
// Читає GET https://openapi.keycrm.app/v1/offers/stocks (секрет KEYCRM_API_KEY) і пише _data/keycrm-stock.yml
// у тому самому форматі, що й YML SalesDrive: <offer><vendorCode>SKU</vendorCode><quantity_in_stock>N</quantity_in_stock></offer>.
// N = доступно (залишок мінус резерв), тож товар у резерві під замовлення одразу зникає з маркетплейсів.
// Якщо ключа немає або відповідь підозріла — файл НЕ пишеться, і будівник лишається на старому джерелі.
const fs = require("fs");
const path = require("path");

const KEY = String(process.env.KEYCRM_API_KEY || "").trim();
const OUT = path.join(__dirname, "..", "_data", "keycrm-stock.yml");
const BASE = "https://openapi.keycrm.app/v1/offers/stocks";
const MIN_OFFERS = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function getPage(page) {
  const url = BASE + "?limit=50&page=" + page;
  for (let a = 0; a < 3; a++) {
    const r = await fetch(url, { headers: { Authorization: "Bearer " + KEY, Accept: "application/json" } });
    if (r.status === 429) { await sleep(5000 * (a + 1)); continue; }
    if (!r.ok) throw new Error("KeyCRM HTTP " + r.status + " на сторінці " + page);
    return r.json();
  }
  throw new Error("KeyCRM: ліміт запитів (429)");
}

(async () => {
  if (!KEY) { console.log("KeyCRM: KEYCRM_API_KEY не задано — пропускаю (лишається старе джерело залишків)"); return; }
  try { fs.unlinkSync(OUT); } catch (e) {}
  const stock = new Map();
  let page = 1, last = 1, rows = 0;
  do {
    const j = await getPage(page);
    const data = Array.isArray(j.data) ? j.data : [];
    data.forEach((o) => {
      const sku = String(o.sku || "").trim();
      if (!sku) return;
      const q = Number(o.quantity) || 0, res = Number(o.reserve) || 0;
      stock.set(sku, (stock.get(sku) || 0) + Math.max(0, Math.floor(q - res)));
      rows++;
    });
    last = Number(j.last_page) || (j.next_page_url ? page + 1 : page);
    page++;
    if (page <= last) await sleep(1100); // ліміт KeyCRM: 60 запитів/хв
  } while (page <= last && page <= 60);

  if (stock.size < MIN_OFFERS) { console.log("KeyCRM: замало позицій (" + stock.size + ") — файл не записую"); return; }
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n<yml_catalog><shop><offers>\n';
  stock.forEach((q, sku) => { x += "<offer><vendorCode>" + esc(sku) + "</vendorCode><quantity_in_stock>" + q + "</quantity_in_stock></offer>\n"; });
  x += "</offers></shop></yml_catalog>\n";
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, x);
  const sum = [...stock.values()].reduce((a, b) => a + b, 0);
  console.log("KeyCRM: залишки " + stock.size + " артикулів (рядків " + rows + "), доступно всього " + sum + " шт → " + path.relative(process.cwd(), OUT));
})().catch((e) => { console.log("KeyCRM недоступний: " + e.message + " — лишається старе джерело залишків"); try { fs.unlinkSync(OUT); } catch (_) {} });
