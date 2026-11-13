// 13.11.2026: поправки машинного перекладу UA→RU (Rozetka ховає товари: «Мужчина» замість «Человечек», «Худые» замість «Худи», «бахрома» замість «махра»).
// ruFixRepo() виправляє кеші перекладів у GitHub (ru-cache.json, _test/rz-tr.json, _data/rz-tr-gas.json) — з них збираються фіди Rozetka/Prom/Kasta.
// Тригер щогодини (ruFixInstall) — щоб нові переклади теж виправлялись.
const RU_NL_ = '(?![А-Яа-яЁё])';
const RU_FIX_RULES_ = [
  ['Мужчинами', 'Человечками'], ['Мужчиной', 'Человечком'], ['Мужчину', 'Человечка'], ['Мужчине', 'Человечке'],
  ['Мужчины', 'Человечки'], ['Мужчина', 'Человечек'], ['Мужчин', 'Человечков'],
  ['мужчинами', 'человечками'], ['мужчиной', 'человечком'], ['мужчину', 'человечка'], ['мужчине', 'человечке'],
  ['мужчины', 'человечки'], ['мужчина', 'человечек'], ['мужчин', 'человечков'],
  ['Худые', 'Худи'], ['Худых', 'Худи'], ['Худыми', 'Худи'], ['Худым', 'Худи'], ['Худой', 'Худи'], ['Худая', 'Худи'],
  ['худые', 'худи'], ['худых', 'худи'], ['худыми', 'худи'], ['худым', 'худи'], ['худой', 'худи'], ['худая', 'худи']
].map(function (r) { return [new RegExp('(?<![А-Яа-яЁё])' + r[0] + RU_NL_, 'g'), r[1]]; }).concat([
  [/(?<![А-Яа-яЁё])Человек(?= (?:с |на |["«\\]|[A-Z]))/g, 'Человечек'],
  [/на бахроме/g, 'на махре'], [/Хлопковая бахрома/g, 'Хлопковая махра']
]);
function ruFix_(s) {
  if (typeof s !== 'string') return s;
  RU_FIX_RULES_.forEach(function (r) { s = s.replace(r[0], r[1]); });
  return s;
}
function ruFixRepo() {
  const p = PropertiesService.getScriptProperties();
  const get = function (f) {
    const r = UrlFetchApp.fetch('https://api.github.com/repos/' + p.getProperty('GH_REPO') + '/contents/' + f + '?ref=' + GH_BRANCH, {
      muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + p.getProperty('GH_TOKEN'), Accept: 'application/vnd.github.raw' } });
    return r.getResponseCode() === 200 ? r.getContentText('UTF-8') : null;
  };
  const out = {}, log = [];
  ['ru-cache.json', '_test/rz-tr.json', '_data/rz-tr-gas.json'].forEach(function (f) {
    const t = get(f); if (!t) { log.push(f + ': немає'); return; }
    const j = JSON.parse(t); let n = 0;
    const fix = function (o) { Object.keys(o || {}).forEach(function (k) { if (typeof o[k] === 'string') { const v = ruFix_(o[k]); if (v !== o[k]) { o[k] = v; n++; } } }); };
    if (f === 'ru-cache.json') { fix(j.n); fix(j.d); } else fix(j);
    log.push(f + ': ' + n);
    if (n) out[f] = JSON.stringify(j);
  });
  if (Object.keys(out).length) ghPublish_(out, 'ru-fix ' + Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm'));
  Logger.log('ruFixRepo: ' + log.join(', '));
}
function ruFixInstall() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'ruFixRepo') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('ruFixRepo').timeBased().everyHours(1).create();
  ruFixRepo();
}
