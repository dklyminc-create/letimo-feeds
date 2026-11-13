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
}
function kdSyncInstall() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'kdSync') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('kdSync').timeBased().everyHours(3).create();
  kdSync(true);
}
