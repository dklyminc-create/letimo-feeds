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
  const now = Date.now(), todo = Object.keys(links).filter(a => !db.m[a] || now - (db.m[a]._t || 0) > 30 * 864e5);
  console.log('до читання', todo.length, 'з', Object.keys(links).length);
  let i = 0, ok = 0, bad = 0;
  async function worker() {
    while (i < todo.length) {
      const a = todo[i++];
      try {
        const r = await fetch('https://kiddisvit.ua' + links[a], { headers: { 'User-Agent': 'LETIMO dealer sync (letimo.com.ua)' } });
        if (r.status !== 200) { bad++; continue; }
        const o = parse(await r.text()); if (!Object.keys(o).length) { bad++; continue; }
        o._t = now; db.m[a] = o; ok++;
      } catch (e) { bad++; }
      await new Promise(r => setTimeout(r, 300));
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  db.t = now; fs.writeFileSync('_data/kd-chars.json', JSON.stringify(db));
  console.log('прочитано', ok, 'помилок', bad);
})();
