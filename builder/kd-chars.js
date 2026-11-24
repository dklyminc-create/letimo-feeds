// 24.11.2026: характеристики іграшок Kiddisvit з карток kiddisvit.ua (таблиця «Характеристики» + «Вік» у шапці).
// Потрібні для фіду Епіцентру: країна-виробник, матеріал, вік, стать, габарити упаковки — у дилерському прайсі їх немає.
// Вхід: _data/kd-links.json (артикул -> шлях картки, з дилерського YML). Вихід: _data/kd-chars.json. Дочитує лише нові/старші 30 днів.
const fs = require('fs');
const links = JSON.parse(fs.readFileSync('_data/kd-links.json', 'utf8')).l;
let db = { t: 0, m: {} }; try { db = JSON.parse(fs.readFileSync('_data/kd-chars.json', 'utf8')); } catch (e) {}
const un = s => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
function parse(h) {
  const o = {};
  const tb = (h.match(/b-tabs-characteristics[\s\S]*?<\/table>/) || [''])[0];
  tb.replace(/<tr>\s*<th>([\s\S]*?)<\/th>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g, (_, k, v) => { o[un(k)] = un(v); return _; });
  const age = h.match(/<span>Вік:<\/span>\s*<small>([\s\S]*?)<\/small>/); if (age) o['Вік'] = un(age[1]);
  const art = h.match(/Артикул:<\/span>\s*([^<]+)/); if (art) o['Артикул'] = un(art[1]);
  return o;
}
(async () => {
  const now = Date.now();
  // спершу — іграшки, які є на сайті (prom.xml.gz), потім решта прайсу
  let site = new Set(); try { const x = require('zlib').gunzipSync(fs.readFileSync('prom.xml.gz')).toString('utf8'); (x.match(/<vendorCode>(?:<!\[CDATA\[)?\s*[^<\]]+/g) || []).forEach(m => site.add(m.replace(/<vendorCode>(?:<!\[CDATA\[)?\s*/, '').trim())); } catch (e) {}
  const todo = Object.keys(links).filter(a => !db.m[a] || now - (db.m[a]._t || 0) > 30 * 864e5).sort((a, b) => (site.has(b) ? 1 : 0) - (site.has(a) ? 1 : 0));
  const T0 = Date.now(), LIMIT = 40 * 60 * 1000; let fails = 0;
  console.log('до читання', todo.length, 'з', Object.keys(links).length);
  let i = 0, ok = 0, bad = 0;
  const save = () => { db.t = now; fs.writeFileSync('_data/kd-chars.json', JSON.stringify(db)); };
  // 24.11.2026: перший прохід (3 потоки) зупинився на ~370 картках — тепер 1 потік, пауза, відступ при 429/5xx, проміжне збереження
  while (i < todo.length && Date.now() - T0 < LIMIT) {
    const a = todo[i++];
    try {
      const r = await fetch('https://kiddisvit.ua' + links[a], { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LETIMO dealer sync; +https://letimo.com.ua)' } });
      if (r.status === 429 || r.status >= 500 || r.status === 403) { bad++; fails++; console.log('HTTP', r.status, 'на', a); await new Promise(z => setTimeout(z, Math.min(120000, 15000 * fails))); if (fails >= 8) break; i--; continue; }
      fails = 0;
      if (r.status !== 200) { bad++; continue; }
      const o = parse(await r.text()); if (!Object.keys(o).length) { bad++; continue; }
      o._t = now; db.m[a] = o; ok++;
      if (ok % 100 === 0) { save(); console.log('…', ok); }
    } catch (e) { bad++; fails++; await new Promise(z => setTimeout(z, 10000)); if (fails >= 8) break; }
    await new Promise(z => setTimeout(z, 1200));
  }
  save();
  console.log('прочитано', ok, 'помилок', bad, 'лишилось', todo.length - i);
})();
