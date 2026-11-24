// 24.11.2026: разова діагностика довідників Епіцентру для іграшок Kiddisvit (категорії сайту 1170–1181).
// Пише: _diag/epi-allsets.json (усі набори + обов'язкові поля), _diag/epi-toysets.json (набори-кандидати для іграшок з варіантами
// обов'язкових полів), _data/epi-brands.json (повний довідник брендів: назва в нижньому регістрі -> код), _data/epi-countries.json.
const fs = require('fs');
const API = 'https://merchant-api.epicentrm.com.ua', TOKEN = String(process.env.EPICENTR_TOKEN || '').trim();
if (!TOKEN) { console.error('Немає EPICENTR_TOKEN'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(p) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(API + p, { headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/json' } });
      if (r.status === 200) return await r.json();
      if (r.status === 429 || r.status >= 500) { await sleep(2000 * (i + 1)); continue; }
      return { _err: r.status };
    } catch (e) { await sleep(2000); }
  }
  return { _err: 'fail' };
}
const ua = t => ((t || []).find(x => x.languageCode === 'ua') || {});
async function opts(set, attr, cap) {
  const m = {}; let page = 1, pages = 1;
  do { const j = await get(`/v2/pim/attribute-sets/${set}/attributes/${encodeURIComponent(attr)}/options?page=${page}`); if (j._err) return { _err: j._err };
    pages = j.pages || 1; (j.items || []).forEach(o => { const v = ua(o.translations).value; if (v) m[String(v).replace(/&#039;/g, "'").toLowerCase().trim()] = o.code; }); page++;
  } while (page <= pages && page <= cap);
  return m;
}
(async () => {
  fs.mkdirSync('_diag', { recursive: true }); fs.mkdirSync('_data', { recursive: true });
  const sets = []; let page = 1, pages = 1;
  do { const j = await get('/v2/pim/attribute-sets?page=' + page); if (j._err) { console.error('sets page', page, j._err); break; }
    pages = j.pages || 1;
    (j.items || []).forEach(s => sets.push({ c: s.code, n: ua(s.translations).title, a: (s.attributes || []).map(a => ({ c: a.code, t: a.type, r: !!a.isRequired, s: !!a.isSystem, n: ua(a.translations).title })) }));
    page++;
  } while (page <= pages);
  console.log('наборів', sets.length);
  fs.writeFileSync('_diag/epi-allsets.json', JSON.stringify(sets.map(s => ({ c: s.c, n: s.n, req: s.a.filter(a => a.r && !a.s).map(a => a.c + ':' + a.n + '(' + a.t + ')') }))));
  const TOY = /іграш|ляльк|пупс|фігур|конструктор|пазл|настільн|головолом|машинк|автомодел|радіокер|моделі|творч|слайм|шолом|захисн|бластер|мильн|копилк|розвива|сортер|робот|пісоч|антистрес|колекц|ігров|лазер|кубик|набори для|пластилін|тісто для|скретч|розмальов|скетч|наліпк|браслет|бісер|мозаїк|книж|прорізув|брязкальц|музичн|динозавр|тварин/i;
  const toy = {};
  for (const s of sets.filter(s => TOY.test(s.n || ''))) {
    const req = s.a.filter(a => a.r && !a.s), o = {};
    for (const a of req) if (a.t === 'select' || a.t === 'multiselect') o[a.c] = await opts(s.c, a.c, 30);
    toy[s.c] = { n: s.n, attrs: s.a.filter(a => !a.s).map(a => (a.r ? '*' : '') + a.c + ':' + a.n + '(' + a.t + ')'), opts: o };
  }
  console.log('кандидатів-іграшок', Object.keys(toy).length);
  fs.writeFileSync('_diag/epi-toysets.json', JSON.stringify(toy));
  const anySet = Object.keys(toy)[0] || '787';
  fs.writeFileSync('_data/epi-countries.json', JSON.stringify(await opts(anySet, 'country_of_origin', 20)));
  const br = await opts(anySet, 'brand', 2000);
  console.log('брендів', Object.keys(br).length);
  fs.writeFileSync('_data/epi-brands.json', JSON.stringify({ t: Date.now(), set: anySet, m: br }));
})();
