"use strict";
// 27.11.2026: діагностика — артикули і штрихкоди всіх модифікацій у KeyCRM (GET /v1/offers) → _diag/keycrm-barcodes.json
// Потрібно, щоб звірити таблицю «LETIMO — штрихкоди товарів» з тим, що реально стоїть у KeyCRM (POS у бутику шукає за штрихкодом/артикулом).
const fs = require("fs");
const path = require("path");
const KEY = String(process.env.KEYCRM_API_KEY || "").trim();
const OUT = path.join(__dirname, "..", "_diag", "keycrm-barcodes.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getPage(page) {
  const url = "https://openapi.keycrm.app/v1/offers?limit=50&page=" + page + "&include=product";
  for (let a = 0; a < 3; a++) {
    const r = await fetch(url, { headers: { Authorization: "Bearer " + KEY, Accept: "application/json" } });
    if (r.status === 429) { await sleep(5000 * (a + 1)); continue; }
    if (!r.ok) throw new Error("KeyCRM HTTP " + r.status + " на сторінці " + page);
    return r.json();
  }
  throw new Error("KeyCRM: 429");
}
(async () => {
  if (!KEY) { console.log("немає KEYCRM_API_KEY"); return; }
  const out = []; let page = 1, last = 1;
  do {
    const j = await getPage(page);
    (j.data || []).forEach((o) => out.push({ id: o.id, product_id: o.product_id, sku: o.sku || "", barcode: o.barcode || "", name: (o.product && o.product.name) || "" }));
    last = Number(j.last_page) || (j.next_page_url ? page + 1 : page);
    page++; if (page <= last) await sleep(1100);
  } while (page <= last && page <= 80);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), n: out.length, offers: out }));
  console.log("KeyCRM offers: " + out.length);
})().catch((e) => { console.log("помилка: " + e.message); process.exitCode = 1; });
