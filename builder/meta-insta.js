#!/usr/bin/env node
// LETIMO — фід для реклами Instagram/Facebook (каталог Meta), 12.11.2026.
// Бренди: Talvi, ДоРечі, взуття (Apawwa, Clibee, American Club). Лише «in stock».
// Основа — Google-фід сайту (у штатному Facebook-фіді Хорошопа немає взуття і ДоРечі);
// item_group_id — з Facebook-фіду Хорошопа, а де його немає — з артикула без розміру.
'use strict';
const fs = require('fs');
const GFEED = 'https://letimo.com.ua/marketplace-integration/google-feed/b573742161465e3a2deba881f9129298';
const FBFEED = 'https://letimo.com.ua/marketplace-integration/facebook/6d27c03839f164211951fa5924f9df34?langId=3';
const BRANDS = /^(Talvi|ДоРечі|Apawwa|Clibee|American Club)$/;
const OUT = 'meta-insta.xml';
const MIN_ITEMS = 500; // запобіжник: якщо сайт віддав обрізаний фід — не перезаписуємо робочий

function tag(x, n) {
  const m = x.match(new RegExp('<g:' + n + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</g:' + n + '>'));
  return m ? m[1].trim() : '';
}
function items(xml) { return xml.split('<item>').slice(1).map(x => x.split('</item>')[0]); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// група і розмір з артикула: ABD5521R-BROWN-22 → ABD5521R-BROWN / 22; DR-2095-80-O → DR-2095-O / 80
function fromId(id) {
  let m = id.match(/^(DR-\d+)-(\d{2,3})-(.+)$/);
  if (m) return { group: m[1] + '-' + m[3], size: m[2] };
  m = id.match(/^(.+)-(\d{2})$/);
  if (m) return { group: m[1], size: m[2] };
  return { group: '', size: '' };
}

function build(gXml, fbXml) {
  const grp = new Map();
  items(fbXml).forEach(x => { const id = tag(x, 'id'), g = tag(x, 'item_group_id'); if (id && g) grp.set(id, g); });
  const out = [];
  const stat = {};
  items(gXml).forEach(x => {
    const brand = tag(x, 'brand');
    if (!BRANDS.test(brand) || tag(x, 'availability') !== 'in stock') return;
    if (!tag(x, 'image_link') || !tag(x, 'price')) return; // без фото/ціни не публікуємо
    const id = tag(x, 'id');
    const add = [];
    const f = fromId(id);
    if (x.indexOf('<g:item_group_id>') < 0) {
      const g = grp.get(id) || f.group;
      if (g) add.push('<g:item_group_id>' + esc(g) + '</g:item_group_id>');
    }
    if (f.size && x.indexOf('<g:size>') < 0 && brand !== 'Talvi') add.push('<g:size>' + esc(f.size) + '</g:size>');
    out.push('<item>' + x + add.join('') + '</item>');
    stat[brand] = (stat[brand] || 0) + 1;
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel>' +
    '<title>LETIMO — Instagram</title><link>https://letimo.com.ua</link><description>Talvi, ДоРечі, взуття — у наявності</description>\n' +
    out.join('\n') + '\n</channel></rss>\n';
  return { xml, count: out.length, stat };
}

async function get(url) {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (letimo-feeds)' } });
      if (r.ok) { const t = await r.text(); if (t.indexOf('<item>') > 0) return t; }
      console.log('спроба', i, url.split('?')[0], r.status);
    } catch (e) { console.log('спроба', i, e.message); }
    await new Promise(r => setTimeout(r, 10000 * i));
  }
  throw new Error('не вдалося отримати ' + url.split('?')[0]);
}

if (require.main === module) {
  (async () => {
    const [g, fb] = await Promise.all([get(GFEED), get(FBFEED)]);
    const r = build(g, fb);
    console.log('meta-insta:', r.count, JSON.stringify(r.stat));
    if (r.count < MIN_ITEMS) { console.log('Замало товарів — фід не оновлюю'); process.exit(1); }
    fs.writeFileSync(OUT, r.xml);
  })().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { build, fromId };
