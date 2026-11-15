// 13.11.2026 (рішення Дмитра): іграшки Kiddisvit — сайт = дроп-ціна × 2, маркетплейси = дроп × 2 + комісія майданчика.
// Прайс Kiddisvit щодня приходить листом (пересилання з пошти Валентини на dklym.inc@gmail.com).
// kdSync() бере найсвіжіший прайс із пошти і кладе в GitHub:
//   _data/kd-prices.json — {артикул: [РРЦ, дроп-ціна]} для збирача фідів (fast.gs: kdPrices_);
//   kiddisvit-site.csv   — «Артикул,Цена» (дроп × 2) для імпорту цін на сайт Horoshop за посиланням;
//   _data/kd-low.json    — порожній список (правило «без іграшок зі знижкою < 25% на Rozetka» вимкнено: при ×2 збитку немає).
function kdNum_(s) { return parseFloat(String(s || '').replace(/\s/g, '').replace(',', '.')); }
function kdParse_(x) {
  const p = {};
  const g = function (o, t) { return ((o.match(new RegExp('<' + t + '>([^<]*)</' + t + '>')) || [])[1] || '').trim(); };
  (x.match(/<offer\b[\s\S]*?<\/offer>/g) || []).forEach(function (o) { // формат *_YML.xml
    const art = g(o, 'article'), rrp = kdNum_(g(o, 'price')), p1 = kdNum_(g(o, 'item_price1'));
    if (art && p1 > 0) p[art] = [rrp > 0 ? rrp : 0, p1];
  });
  (x.match(/<item>[\s\S]*?<\/item>/g) || []).forEach(function (o) { // формат *.xml (<item>)
    const art = g(o, 'item_art'), rrp = kdNum_(g(o, 'item_price2')), p1 = kdNum_(g(o, 'item_price1'));
    if (art && p1 > 0) p[art] = [rrp > 0 ? rrp : 0, p1];
  });
  return p;
}
function kdSync(force) {
  let best = null;
  GmailApp.search('has:attachment filename:xml newer_than:7d', 0, 30).forEach(function (t) {
    t.getMessages().forEach(function (m) {
      m.getAttachments().forEach(function (a) {
        if (/^\d+_\d{2}\.\d{2}\.\d{4}_[\d.]+(_YML)?\.xml$/i.test(a.getName()) && (!best || m.getDate() > best.d)) best = { a: a, d: m.getDate() };
      });
    });
  });
  if (!best) { Logger.log('kdSync: свіжого прайсу Kiddisvit у пошті немає'); return; }
  const props = PropertiesService.getScriptProperties();
  if (force !== true && props.getProperty('KD_LAST') === best.a.getName()) { Logger.log('kdSync: прайс ' + best.a.getName() + ' уже враховано'); return; }
  const p = kdParse_(best.a.getDataAsString('UTF-8'));
  const arts = Object.keys(p);
  if (arts.length < 500) { Logger.log('kdSync: у прайсі лише ' + arts.length + ' позицій — не оновлюю'); return; }
  const csv = ['Артикул,Цена'].concat(arts.map(function (a) { return '"' + a.replace(/"/g, '""') + '",' + Math.round(p[a][1] * 2); })).join('\r\n');
  ghPublish_({
    '_data/kd-prices.json': JSON.stringify({ src: best.a.getName(), p: p }),
    '_data/kd-low.json': JSON.stringify({ src: best.a.getName(), min: 0, low: [] }),
    'kiddisvit-site.csv': csv
  }, 'kiddisvit ' + best.a.getName() + ' (' + arts.length + ')');
  props.setProperty('KD_LAST', best.a.getName());
  Logger.log('kdSync: ' + best.a.getName() + ' — ' + arts.length + ' позицій');

  try { kdPresenceSync(p); } catch (e) { Logger.log('kdPresenceSync: ' + e.message); }
}
function kdSyncInstall() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'kdSync') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('kdSync').timeBased().everyHours(3).create();
  kdSync(true);
}

// 15.11.2026 правило Дмитра: чого немає у фіді постачальника — того немає в наявності.
// Іграшки сайту (категорії 1170–1181), яких немає в дилерському прайсі Kiddisvit, → «Немає в наявності» через Horoshop API
// (той самий механізм, що й drPresenceSync для ДоРечі). Якщо іграшка знову з'явилась у прайсі, а знімали її ми, — повертаємо «В наявності».
const KD_TOY_CATS_ = ['1170','1171','1172','1173','1174','1175','1176','1177','1178','1179','1180','1181'];
function kdPresenceSync(p) {
  if (!p || Object.keys(p).length < 500) { Logger.log('kdPresence: прайс неповний — пропуск'); return; }
  const x = srcXml_();
  const toys = {}; // артикул → поточна наявність у вивантаженні сайту
  (x.match(/<offer\b[^>]*>[\s\S]*?<\/offer>/g) || []).forEach(function (o) {
    const c = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    if (KD_TOY_CATS_.indexOf(c) < 0) return;
    const art = ((o.match(/<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?<\/vendorCode>/) || [])[1] || '').trim();
    if (art) toys[art] = (o.match(/^<offer\b[^>]*\bavailable="([^"]*)"/) || [])[1];
  });
  const props = PropertiesService.getScriptProperties();
  const prev = JSON.parse(props.getProperty('KD_PRES_STATE') || '{}');
  if (!props.getProperty('KD_PRES_SNAP')) { // знімок для відкату — один раз
    ghPublish_({ '_data/kd-pres-snapshot.json': JSON.stringify({ at: new Date().toISOString(), available: toys }) }, 'kiddisvit: знімок наявності іграшок до правила «немає у фіді — немає в наявності»');
    props.setProperty('KD_PRES_SNAP', '1');
  }
  const want = {};
  Object.keys(toys).forEach(function (a) {
    if (!p[a]) want[a] = 'Немає в наявності';
    else if (prev[a] === 'Немає в наявності') want[a] = 'В наявності';
  });
  const changed = Object.keys(want).filter(function (a) { return prev[a] !== want[a]; });
  const res = { toys: Object.keys(toys).length, missing: Object.keys(want).filter(function (a) { return want[a] === 'Немає в наявності'; }).length, changed: changed.length, sent: 0, errors: [] };
  for (let i = 0; i < changed.length; i += 100) {
    const part = changed.slice(i, i + 100);
    const j = hsCall_('catalog/import', { token: hsToken_(), products: part.map(function (a) { return { article: a, presence: want[a] }; }) });
    if (j.status !== 'OK' && j.status !== 'WARNING') { res.errors.push(j.status + ' ' + JSON.stringify(j.response || {}).slice(0, 200)); continue; }
    part.forEach(function (a) { if (want[a] === 'В наявності') delete prev[a]; else prev[a] = want[a]; });
    res.sent += part.length;
  }
  props.setProperty('KD_PRES_STATE', JSON.stringify(prev));
  Logger.log('Kiddisvit наявність: ' + JSON.stringify(res));
  return res;
}
// Ручний запуск: бере найсвіжіший прайс із пошти і застосовує правило наявності.
function kdPresenceRun() {
  let best = null;
  GmailApp.search('has:attachment filename:xml newer_than:7d', 0, 30).forEach(function (t) {
    t.getMessages().forEach(function (m) {
      m.getAttachments().forEach(function (a) {
        if (/^\d+_\d{2}\.\d{2}\.\d{4}_[\d.]+(_YML)?\.xml$/i.test(a.getName()) && (!best || m.getDate() > best.d)) best = { a: a, d: m.getDate() };
      });
    });
  });
  if (!best) { Logger.log('kdPresenceRun: прайсу в пошті немає'); return; }
  return kdPresenceSync(kdParse_(best.a.getDataAsString('UTF-8')));
}
