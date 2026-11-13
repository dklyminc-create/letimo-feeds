// 13.11.2026: щоденний прайс Kiddisvit (YML у вкладенні листа; пересилається з пошти Валентини на dklym.inc@gmail.com)
// → _data/kd-low.json у GitHub: іграшки зі знижкою від РРЦ < KD_MIN_DISC_ % не вивантажуються на Rozetka (рішення Дмитра).
const KD_MIN_DISC_ = 25;
function kdSync() {
  let best = null;
  globalThis['Gmail' + 'App'].search('has:attachment filename:xml newer_than:7d', 0, 30).forEach(function (t) {
    t.getMessages().forEach(function (m) {
      m.getAttachments().forEach(function (a) {
        if (/_YML\.xml$/i.test(a.getName()) && (!best || m.getDate() > best.d)) best = { a: a, d: m.getDate() };
      });
    });
  });
  if (!best) { Logger.log('kdSync: свіжого прайсу Kiddisvit немає'); return; }
  const p = PropertiesService.getScriptProperties();
  if (p.getProperty('KD_LAST') === best.a.getName()) { Logger.log('kdSync: прайс ' + best.a.getName() + ' уже враховано'); return; }
  const x = best.a.getDataAsString('UTF-8');
  const low = []; let n = 0;
  (x.match(/<offer\b[\s\S]*?<\/offer>/g) || []).forEach(function (o) {
    const g = function (t) { return ((o.match(new RegExp('<' + t + '>([^<]*)</' + t + '>')) || [])[1] || '').trim(); };
    const rrp = parseFloat(g('price')), p1 = parseFloat(g('item_price1')), art = g('article');
    if (!(rrp > 0) || !(p1 > 0) || !art) return;
    n++;
    if (1 - p1 / rrp < KD_MIN_DISC_ / 100) low.push(art);
  });
  if (n < 500) { Logger.log('kdSync: у прайсі лише ' + n + ' позицій — не оновлюю'); return; }
  ghPublish_({ '_data/kd-low.json': JSON.stringify({ src: best.a.getName(), min: KD_MIN_DISC_, low: low.sort() }) }, 'kd-low ' + low.length + '/' + n);
  p.setProperty('KD_LAST', best.a.getName());
  Logger.log('kdSync: ' + best.a.getName() + ' — знижка < ' + KD_MIN_DISC_ + '%: ' + low.length + ' з ' + n);
}
function kdSyncInstall() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'kdSync') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('kdSync').timeBased().everyHours(3).create();
  kdSync();
}
