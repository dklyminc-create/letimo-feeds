// ===== ПРИСКОРЕННЯ ФІДІВ (19.10.2026) =====
// Цей файл перевизначає кілька функцій основного скрипту (у Apps Script діє остання версія функції).
// 1) Довідники Епіцентру зберігаються у GitHub (epi-cache.json) на 7 днів, а не 6 годин у CacheService.
// 2) Епіцентр сам зупиняється на ~4,8 хв і зберігає вже завантажене — без падіння по ліміту Google.
// 3) Черга publishFeeds іде вперед ДО запуску задачі — одна задача, що впала, не блокує решту.

var EPI_FILE_LOADED_ = false, EPI_FILE_N_ = 0, EPI_TIMEOUT_ = false;

function epiFileLoad_() {
  if (EPI_FILE_LOADED_) return;
  EPI_FILE_LOADED_ = true;
  try {
    const p = PropertiesService.getScriptProperties();
    const r = UrlFetchApp.fetch('https://api.github.com/repos/' + p.getProperty('GH_REPO') + '/contents/epi-cache.json?ref=' + GH_BRANCH, {
      muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + p.getProperty('GH_TOKEN'), Accept: 'application/vnd.github.raw' }
    });
    if (r.getResponseCode() !== 200) return;
    const f = JSON.parse(r.getContentText('UTF-8'));
    if (!f.t || Date.now() - f.t > 7 * 864e5) return; // раз на тиждень довідники перечитуються з API
    Object.keys(f.m || {}).forEach(function (k) { if (!(k in EPI_MEM_)) EPI_MEM_[k] = f.m[k]; });
    EPI_FILE_N_ = Object.keys(f.m || {}).length;
    Logger.log('epi: файл-кеш ' + EPI_FILE_N_ + ' ключів');
  } catch (e) { Logger.log('epi-cache: ' + e.message); }
}

function epiFileSave_() {
  const m = {};
  Object.keys(EPI_MEM_).forEach(function (k) { if (/^(eps3_|epo3_|epi_ukr)/.test(k)) m[k] = EPI_MEM_[k]; });
  const n = Object.keys(m).length;
  if (n <= EPI_FILE_N_) return; // нічого нового
  ghPublish_({ 'epi-cache.json': JSON.stringify({ t: Date.now(), m: m }) }, 'epi-cache ' + n);
  EPI_FILE_N_ = n;
  Logger.log('epi: файл-кеш збережено, ' + n + ' ключів');
}

function epiCacheGet_(k) {
  epiFileLoad_();
  if (k in EPI_MEM_) return EPI_MEM_[k];
  const cs = CacheService.getScriptCache(); let c = cs.get(k);
  if (c && c.indexOf('#parts:') === 0) {
    const n = Number(c.slice(7)), keys = []; for (let i = 0; i < n; i++) keys.push(k + '#' + i);
    const g = cs.getAll(keys);
    c = keys.every(function (x) { return g[x] !== null; }) ? keys.map(function (x) { return g[x]; }).join('') : null;
  }
  let v = null; try { v = c ? JSON.parse(c) : null; } catch (e) { v = null; }
  if (v !== null) EPI_MEM_[k] = v;
  return v;
}

function epiGet_(path) {
  if (EPI_TIMEOUT_ || Date.now() - EPI_T0_ > 290000) { EPI_TIMEOUT_ = true; throw new Error('Епіцентр: ліміт часу, довідники збережено — наступний запуск буде швидшим'); }
  EPI_CALLS_++; const tq_ = Date.now();
  const token = PropertiesService.getScriptProperties().getProperty('EPICENTR_TOKEN');
  if (!token) throw new Error('Немає EPICENTR_TOKEN у властивостях скрипту');
  const res = UrlFetchApp.fetch(EPI_API + path, {
    headers: { Authorization: 'Bearer ' + token.trim(), Accept: 'application/json' },
    muteHttpExceptions: true
  });
  EPI_MS_ += Date.now() - tq_;
  return { code: res.getResponseCode(), body: res.getContentText('UTF-8') };
}

function publishEpicentr() {
  let xml;
  try { xml = buildEpicentr_('xml'); }
  finally { try { epiFileSave_(); } catch (e) { Logger.log('epi-cache save: ' + e.message); } }
  if (EPI_TIMEOUT_) throw new Error('Епіцентр: не встиг за 5 хв — неповний фід НЕ публікую, довідники збережено, наступний запуск буде швидшим');
  const n = (xml.match(/<offer /g) || []).length;
  if (n < 100) throw new Error('Епіцентр: у фіді лише ' + n + ' товарів — не публікую');
  const stamp = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  xml = shoeEpiBarcode_(xml); // штрихкоди взуття (23.10.2026)
  ghPublish_({ 'epicentr.xml': xml }, 'epicentr ' + stamp);
  return 'OK ' + stamp + ' epicentr offers=' + n + ' bytes=' + xml.length;
}

// Разовий прогрів: завантажує всі довідники Епіцентру і зберігає їх у GitHub. Запустити 1–2 рази вручну.
function epiWarm() {
  let from = Number(PropertiesService.getScriptProperties().getProperty('EPI_WARM_FROM') || 0);
  try {
    while (from !== null && Date.now() - EPI_T0_ < 240000) {
      const r = JSON.parse(buildEpicentr_('warm', from));
      Logger.log('epi warm: ' + JSON.stringify(r));
      from = r.next;
    }
  } catch (e) { Logger.log('epi warm stop: ' + e.message); }
  finally { epiFileSave_(); }
  PropertiesService.getScriptProperties().setProperty('EPI_WARM_FROM', from === null ? '0' : String(from));
  return from === null ? 'прогріто повністю' : 'не все — запустіть ще раз (з ' + from + ')';
}

// 4) Rozetka: готовий файл rozetka.xml на GitHub Pages замість збирання «на льоту» (~2 хв — Rozetka не дочікувалась)
if (PUB_JOBS.indexOf('rozetka') < 0) PUB_JOBS.push('rozetka');
// 04.11.2026: Prom, Kasta і Rozetka збирає GitHub Actions (без лімітів Google) — тут лишаються Епіцентр і ДоРечі.
['prom', 'kasta', 'rozetka'].forEach(function (j) { const i = PUB_JOBS.indexOf(j); if (i >= 0) PUB_JOBS.splice(i, 1); });

function publishRozetka() {
  const stamp = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  MP_PCT_ = MP_MARKUP.rozetka;
  const n = ghPublishLean_('rozetka.xml', function () { return tvCapChars_(tvDropOnlyAvail_(rzgDedupe_(rzGroup_(rzModFix_(tvBarcode_(rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_()))))))))), 24000000); }, 'rozetka ' + stamp); // 04.11.2026: економна публікація
  return 'rozetka OK ' + n;
}

function publishJob_(job) {
  const stamp = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  if (job === 'kasta') { MP_PCT_ = MP_MARKUP.kasta; ghPublishLean_('kasta.xml', function () { const kx = tvCapChars_(tvDropOnlyAvail_(kastaOwnSale_(kastaSizeFix_(tvBarcode_(kastaSplit_(buildKasta_()))))), 24000000); kastaPriceGuard_(kx); return kx; }, 'kasta ' + stamp); return 'kasta OK'; }
  if (job === 'prom') { MP_PCT_ = MP_MARKUP.prom; TV_DROP_MAX_ = 2300; ghPublishBig_('prom.xml', tvCapChars_(tvPromDropFilter_(kwV3_(toysKw_(promFix_(promEnrich_(buildFeed_()))))), 28000000), 'prom ' + stamp); return 'prom OK'; }
  if (job === 'epicentr') return publishEpicentr();
  if (job === 'dorechi') { ghPublish_({ 'dorechi.csv': buildDorechiCsv_(), 'dorechi-test.csv': buildDorechiCsv_(3) }, 'dorechi ' + stamp); return 'dorechi OK'; }
  if (job === 'rozetka') return publishRozetka();
}

// 5) Іграшки: пошукові запити Prom без «дитячий одяг» (19.10.2026) — додаємо назву категорії та бренд
const TOY_KW = {
  '1170': ['іграшки', 'игрушки'], '1171': ['іграшки для малюків', 'игрушки для малышей'],
  '1172': ['ляльки', 'куклы'], '1173': ['фігурки, ігрові набори', 'фигурки, игровые наборы'],
  '1174': ['машинки, іграшковий транспорт', 'машинки, игрушечный транспорт'], '1175': ["м'які іграшки", 'мягкие игрушки'],
  '1176': ['інтерактивні іграшки', 'интерактивные игрушки'], '1177': ['конструктори', 'конструкторы'],
  '1178': ['набори для творчості', 'наборы для творчества'], '1179': ['настільні ігри, пазли', 'настольные игры, пазлы'],
  '1180': ['спортивні іграшки', 'спортивные игрушки'], '1181': ['іграшки', 'игрушки']
};
function toysKw_(xml) {
  return xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    const cat = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    if (!cat || !TOY_KW[cat]) return o;
    const brand = ((o.match(/<vendor>([^<]*)<\/vendor>/) || [])[1] || '').trim();
    const fix = function (inner, lang) {
      const items = inner.split(',').map(function (s) { return s.trim(); })
        .filter(function (s) { return s && !/одеж|одяг|малыш|малюк/i.test(s); });
      TOY_KW[cat][lang].split(', ').concat([lang ? 'детские игрушки' : 'дитячі іграшки']).forEach(function (k) { if (items.indexOf(k) < 0) items.push(k); });
      if (brand && items.indexOf(brand) < 0) items.push(brand);
      return items.join(', ');
    };
    return o.replace(/<keywords_ua>([\s\S]*?)<\/keywords_ua>/, function (a, inner) { return '<keywords_ua>' + fix(inner, 0) + '</keywords_ua>'; })
            .replace(/<keywords>([\s\S]*?)<\/keywords>/, function (a, inner) { return '<keywords>' + fix(inner, 1) + '</keywords>'; });
  });
}

// 02.11.2026: великий RZ_RU_CACHE (24 КБ) у властивостях скрипту не дає зберегти їх через UI → переносимо у властивості користувача
function rzRuCacheMove_() {
  try {
    const sp = PropertiesService.getScriptProperties(), c = sp.getProperty('RZ_RU_CACHE');
    if (!c) return;
    PropertiesService.getUserProperties().setProperty('RZ_RU_CACHE', c);
    sp.deleteProperty('RZ_RU_CACHE');
    Logger.log('rzRuCacheMove_: ' + c.length + ' chars moved');
  } catch (e) { Logger.log('rzRuCacheMove_: ' + e.message); }
}
function publishFeeds() {
  rzRuCacheMove_();
  const props = PropertiesService.getScriptProperties();
  let k = Number(props.getProperty('PUB_NEXT') || 0) % PUB_JOBS.length;
  const t0 = Date.now(), log = [], errors = [];
  for (let n = 0; n < PUB_JOBS.length; n++) {
    const job = PUB_JOBS[k];
    if (n > 0 && (Date.now() - t0 > 100000 || job === 'rozetka' || job === 'epicentr' || job === 'prom' || job === 'kasta')) break; // важкі задачі — лише першими в запуску
    props.setProperty('PUB_NEXT', String((k + 1) % PUB_JOBS.length)); // крок уперед ДО запуску
    try { log.push(publishJob_(job) + ' ' + Math.round((Date.now() - t0) / 1000) + 's'); }
    catch (e) { errors.push(job + ': ' + e.message); }
    k = (k + 1) % PUB_JOBS.length;
  }
  Logger.log(log.join(' | ') + (errors.length ? ' | ERR ' + errors.join('; ') : ''));
  if (errors.length) throw new Error('Публікація: ' + errors.join('; '));
  return log.join(' | ');
}

// 5) Епіцентр: пледи Talvi (набір 4112 «Пледи і покривала дитячі») і светрик «Монно» (805) — 20.10.2026
// Склад — з сайту Talvi: Малюк/Сієна/Беррі/Ведмедик 100% бавовна, Луміа 50% вовна + 50% акрил, Монно 50% бавовна + 50% акрил.
const TV_EPI_COL_X = { 'світло-бежевий': ['світло-бежевий', 'бежевий'], 'темно-бежевий': ['темно-бежевий', 'бежевий'], 'кавовий': ['кавовий', 'коричневий'] };
const TV_PLED_FABRIC = { 'малюк': ['бавовна'], 'луміа': ['вовна', 'акрил'], 'сієна': ['бавовна'], 'беррі': ['бавовна'], 'ведмедик': ['бавовна'] };
const TV_MONNO_MAT = ['бавовна', 'акрил'];

function tvEpiVals_(a, name, opts) {
  const n = String(a.n).toLowerCase(), nm = String(name).toLowerCase();
  const pick = function (list) { for (let i = 0; i < list.length; i++) { if (opts[list[i]]) return [list[i]]; } return null; };
  const has = function (list) { const r = list.filter(function (x) { return opts[x]; }); return r.length ? r : null; };
  const isPled = /^плед/.test(nm), isMonno = /монно/.test(nm);
  if (isPled || isMonno) {
    const col = ((nm.match(/см, ([^,]+)$/) || nm.match(/», ([^,]+), \d+\/\d+$/) || [])[1] || '').trim();
    if (/колір виробника/.test(n)) return col ? pick(TV_EPI_COL_X[col] || TV_EPI_COL[col] || [col]) : null;
    if (isPled) {
      if (n === 'тип') return pick(['плед']);
      if (n === 'розмір') {
        const m = nm.match(/(\d+)\s*[×xх*]\s*(\d+)\s*см/); if (!m) return null;
        const want = m[1] + 'x' + m[2] + ' см';
        const k = Object.keys(opts).filter(function (o) { return o.replace(/[х×*]/g, 'x').replace(/\s+/g, ' ') === want; })[0];
        return k ? [k] : null;
      }
      if (n === 'тип тканини') { const mdl = ((nm.match(/«([^»]+)»/) || [])[1] || '').trim(); return TV_PLED_FABRIC[mdl] ? has(TV_PLED_FABRIC[mdl]) : null; }
      return null;
    }
    if (n === 'матеріал') return has(TV_MONNO_MAT);
    if (n === 'вид') return pick(['светр', 'джемпер']);
    if (n === 'стать дитини') return pick(['унісекс']);
    if (n === 'стать') return pick(['дитячі']);
    if (n === 'зріст') { const m = nm.match(/(\d+)\/(\d+)$/); return m ? has([m[1], m[2]]) : null; }
    return null;
  }
  // Шапки й комплекти Talvi (як в основному скрипті)
  if (n === 'тип') return pick(/комплект/.test(nm) ? ['набір'] : ['шапочка']);
  if (/колір виробника/.test(n)) { const c = (nm.match(/, ([^,]+), [\d-]+ см/) || [])[1]; return c ? pick(TV_EPI_COL[c.trim()] || [c.trim()]) : null; }
  if (n === 'розмір') { const s = (nm.match(/(\d+(?:-\d+)?) см/) || [])[1]; return s ? pick(TV_EPI_SIZE[s] || [s]) : null; }
  return null;
}


// 7) Штрихкоди взуття Apawwa/Clibee (EAN-13, відскановані 23.10.2026; таблиця «LETIMO — штрихкоди товарів (сканування)»).
// Ключ — артикул варіанта. Пінетки FD120 мають внутрішні коди CDEZM… (не EAN) — у фіди не йдуть.
const SHOE_BARCODE = {"ABD0026R-BLACK-23":"6979215727900","ABD0026R-BLACK-24":"6979215727917","ABD0026R-BLACK-25":"6979215727924","ABD0026R-BLACK-26":"6979215727931","ABD0026R-BLACK-27":"6979215727948","ABD0026R-BLACK-28":"6979215727955","ABD0166R-BEIGE-23":"6942778802643","ABD0166R-BEIGE-24":"6942778802650","ABD0166R-BEIGE-25":"6942778802667","ABD0166R-BEIGE-26":"6942778802674","ABD0166R-BEIGE-27":"6942778802681","ABD0166R-BEIGE-28":"6942778802766","ABD0166R-BLACK-23":"6942778802575","ABD0166R-BLACK-24":"6942778802582","ABD0166R-BLACK-25":"6942778802599","ABD0166R-BLACK-26":"6942778802605","ABD0166R-BLACK-27":"6942778802612","ABD0166R-BLACK-28":"6942778802629","ABD0176R-FUCHSIA-23":"6942778802780","ABD0176R-FUCHSIA-24":"6942778802797","ABD0176R-FUCHSIA-25":"6942778802803","ABD0176R-FUCHSIA-26":"6942778802810","ABD0176R-FUCHSIA-27":"6942778802827","ABD0176R-FUCHSIA-28":"6942778802834","ABD5521R-BLACK-22":"6942778822122","ABD5521R-BLACK-23":"6942778822139","ABD5521R-BLACK-24":"6942778822146","ABD5521R-BLACK-25":"6942778822153","ABD5521R-BLACK-26":"6942778822160","ABD5521R-BLACK-27":"6942778822177","ABD5521R-BROWN-22":"6942778822191","ABD5521R-BROWN-23":"6942778822207","ABD5521R-BROWN-24":"6942778822214","ABD5521R-BROWN-25":"6942778822221","ABD5521R-BROWN-26":"6942778822238","ABD5521R-BROWN-27":"6942778822245","ABQ0771R-CAMEL-23":"6979215725043","ABQ0771R-CAMEL-24":"6979215725050","ABQ0771R-CAMEL-25":"6979215725067","ABQ0771R-CAMEL-26":"6979215725074","ABQ0771R-CAMEL-27":"6979215725081","ABQ0771R-CAMEL-28":"6979215725098","HA828-3-PINK-23":"6980026258682","HA828-3-PINK-24":"6980026258699","HA828-3-PINK-25":"6980026258705","HA828-3-PINK-26":"6980026258712","HA828-3-PINK-27":"6980026258729","HA828-3-PINK-28":"6980026258736","KA799-4-PINK-22":"6980026250662","KA799-4-PINK-23":"6980026250679","KA799-4-PINK-24":"6980026250686","KA799-4-PINK-25":"6980026250693","KA799-4-PINK-26":"6980026250709","KA799-4-PINK-27":"6980026250716"};
const SHOE_ID0 = 6023; // id варіантів на сайті 6023…6080 ідуть у тому ж порядку, що й SHOE_ORDER
const SHOE_ORDER = ['ABD5521R-BROWN','ABD5521R-BLACK','ABD0166R-BLACK','ABQ0771R-CAMEL','ABD0026R-BLACK','ABD0166R-BEIGE','ABD0176R-FUCHSIA','FD120-WHITE','HA828-3-PINK','KA799-4-PINK'];
function shoeBcById_(id) {
  id = Number(id); // копії 9xxxx (бежеві дутики в обох категоріях Kasta/Rozetka) — без коду, щоб не було дубля штрихкоду
  const sku = SHOE_ID_MAP_[id]; return sku ? SHOE_BARCODE[sku] : null;
}
const SHOE_ID_MAP_ = (function () { // id → артикул (звірено з фідом Prom 23.10.2026)
  const sizes = { 'ABD5521R-BROWN': [22,27], 'ABD5521R-BLACK': [22,27], 'ABD0166R-BLACK': [23,28], 'ABQ0771R-CAMEL': [23,28], 'ABD0026R-BLACK': [23,28], 'ABD0166R-BEIGE': [23,28], 'ABD0176R-FUCHSIA': [23,28], 'FD120-WHITE': [18,21], 'HA828-3-PINK': [23,28], 'KA799-4-PINK': [22,27] };
  const mp = {}; let id = SHOE_ID0;
  SHOE_ORDER.forEach(function (m) { for (let s = sizes[m][0]; s <= sizes[m][1]; s++) mp[id++] = m + '-' + s; });
  return mp;
})();
// 26.10.2026: American Club XD 198 (EAN-13 з коробок; id варіантів на сайті 7697…7701 = розміри 24…28)
(function () {
  const bc = ['5903497240346', '5903497240353', '5903497240360', '5903497240377', '5903497240384'];
  for (let s = 24; s <= 28; s++) { SHOE_BARCODE['XD198-NAVY-' + s] = bc[s - 24]; SHOE_ID_MAP_[7697 + s - 24] = 'XD198-NAVY-' + s; }
})();
// Перевизначення tvBarcode_ (Prom, Kasta, Rozetka): шапки Talvi + взуття
function tvBarcode_(xml) {
  xml = stripVid_(xml);
  return xml.replace(/<offer id="(\d+)"[\s\S]*?<\/offer>/g, function (o, id) {
    const bc = TV_BARCODE[id] || shoeBcById_(id);
    if (!bc || /<barcode>/.test(o)) return o;
    return o.replace('</offer>', '<barcode>' + bc + '</barcode>\n</offer>');
  });
}
// Епіцентр: id офера = артикул; штрихкод — системний атрибут barcodes
function shoeEpiBarcode_(xml) {
  xml = stripVid_(xml);
  return xml.replace(/<offer id="([^"]+)"[\s\S]*?<\/offer>/g, function (o, sku) {
    const bc = SHOE_BARCODE[sku];
    if (!bc || /paramcode="barcodes"/.test(o)) return o;
    return o.replace('</offer>', '<param name="Штрих-код" paramcode="barcodes">' + bc + '</param>\n</offer>');
  });
}

// 8) Відео YouTube в описах (23.10.2026): на сайті відео стоїть в описі товару, у фіди маркетплейсів iframe не передаємо
function stripVid_(xml) {
  return xml
    .replace(/<p>\s*<iframe[\s\S]*?<\/iframe>\s*<\/p>/gi, '').replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/&lt;p&gt;\s*&lt;iframe[\s\S]*?&lt;\/iframe&gt;\s*&lt;\/p&gt;/gi, '').replace(/&lt;iframe[\s\S]*?&lt;\/iframe&gt;/gi, '');
}


// ═══════════ ДОДАТКОВИЙ ФІД MERCHANT CENTER — щоденне доповнення (24.10.2026) ═══════════
// Таблиця «LETIMO — додатковий фід Merchant Center (варіанти)» — додаткове джерело MC 5864152159.
// Що робить mcSuppSync (тригер щодня ~05:00, після нічного експорту Horoshop):
//  1) товари, що з'явились у Google-фіді, але відсутні в таблиці → новий рядок
//     (item_group_id, color, size, age_group, gender, material, video_link);
//  2) у наявних рядках дописує ЛИШЕ порожні color / material і нові відео YouTube з опису товару.
//  Нічого не видаляє і не перезаписує заповнені значення. Перед першим записом — копія аркуша.
const MC_SUPP_ID = '1cEDmdRIyZzlO41e3jQwVHSYciRbUOaGnT-54KuskfZw';
const MC_GFEED = 'https://letimo.com.ua/marketplace-integration/google-feed/b573742161465e3a2deba881f9129298?langId=3';

const MC_FIB_ = [
  [/бавовн|котон|cotton/, 'бавовна'], [/поліест|polyest/, 'поліестер'], [/еласт|лайкр|спандекс/, 'еластан'],
  [/поліамід/, 'поліамід'], [/нейлон/, 'нейлон'], [/(^|[^а-яі])(льон|лляна|лляний|лляне)/, 'льон'], [/віскоз/, 'віскоза'],
  [/акрил/, 'акрил'], [/(^|[^а-яі])вовн|шерст|мерино/, 'вовна'], [/фліс|полар/, 'фліс'], [/махр/, 'махра'],
  [/муслін/, 'муслін'], [/штучн\S* шкір|еко-?шкір/, 'штучна шкіра'], [/натуральн\S* шкір/, 'натуральна шкіра'],
  [/силікон(?!із)/, 'силікон'], [/поліуретан/, 'поліуретан'], [/трикотаж/, 'трикотаж'],
  [/замінник\S* шкір|шкірозамін/, 'штучна шкіра'], [/мембран/, 'мембранна тканина'],
  [/плащ/, 'плащова тканина'], [/кулір/, 'кулір'], [/тринитк/, 'тринитка'], [/інтерлок/, 'інтерлок'], [/футер/, 'футер'], [/рибан|рібан/, 'рибана'], [/велюр/, 'велюр'], [/сатин/, 'сатин']
];

function mcMat_(sklad, desc) {
  const pick = function (s) {
    s = String(s || '').toLowerCase(); const out = [];
    const hit = []; MC_FIB_.forEach(function (f) { const k = s.search(f[0]); if (k >= 0 && !hit.some(function (h) { return h[1] === f[1]; })) hit.push([k, f[1]]); });
    hit.sort(function (x, y) { return x[0] - y[0]; }); hit.forEach(function (h) { out.push(h[1]); });
    if (out.indexOf('штучна шкіра') >= 0 || out.indexOf('натуральна шкіра') >= 0) return out.filter(function (x) { return x !== 'трикотаж'; }).slice(0, 3).join('/');
    return out.filter(function (x) { return !(x === 'трикотаж' && out.length > 1); }).slice(0, 3).join('/');
  };
  let m = pick(sklad); if (m) return m;
  const d = String(desc || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const seg = d.match(/(?:склад|матеріал)[^:—–\n]{0,25}(?::|\s[—–-])\s*([^.\n]{3,140})/i) || d.match(/(?:^|[\s.])верх\s*(?::|[—–-])\s*([^.\n]{3,80})/i);
  return seg ? pick(seg[1]) : '';
}

function mcColor_(param, desc) {
  if (param) return String(param).trim();
  const d = String(desc || '').replace(/<[^>]+>/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&#39;|&rsquo;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const m = d.match(/Колір:\s*([^.,;\n]{2,40})/);
  return m ? m[1].trim() : '';
}

function mcSize_(param, name) {
  if (param) return String(param).trim();
  const m = String(name || '').match(/розмір\s+([0-9][^,]*)$/i) || String(name || '').match(/,\s*([0-9]{2,3}(?:[\/-][0-9]{2,3})?(?:\s*\([^)]*\))?)\s*$/);
  return m ? m[1].trim() : '';
}

function mcAge_(size, name) {
  const s = String(size || '').toLowerCase(), n = String(name || '').toLowerCase();
  const nums = (s.match(/\d+/g) || []).map(Number); if (!nums.length) return '';
  const a = nums[0], b = nums.length > 1 ? nums[1] : nums[0];
  const shoe = /взут|черевик|дутик|кросів|чобіт|кеди|сандал|тапоч|мокасин/.test(n);
  const head = /шапк|чепчик|панам|капелюш|пов'язк|шолом|балаклав/.test(n) || /см/.test(s);
  if (!shoe && !head && a >= 44 && a <= 176 && /^\s*\d{2,3}(\s|\/|$|\()/.test(s)) {
    return a <= 62 ? 'newborn' : (a <= 80 ? 'infant' : (a <= 110 ? 'toddler' : 'kids'));
  }
  if (/міс/.test(s)) return b <= 3 ? 'newborn' : (b <= 12 ? 'infant' : 'toddler');
  if (/рок|рік/.test(s)) return a >= 5 ? 'kids' : 'toddler';
  if (shoe && a >= 15 && a <= 36) return a <= 18 ? 'infant' : (a <= 30 ? 'toddler' : 'kids');
  if (head) return a < 42 ? 'newborn' : (a < 46 ? 'infant' : 'toddler');
  return '';
}

function mcGender_(name) {
  return /дівчин|сукн|спідниц|сарафан|купальник/i.test(String(name || '')) ? 'female' : 'unisex';
}

function mcVids_(desc) {
  const out = [];
  (String(desc || '').match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/watch\?v=)[\w-]{11}/g) || []).forEach(function (m) {
    const u = 'https://youtu.be/' + m.slice(-11); if (out.indexOf(u) < 0) out.push(u);
  });
  return out;
}

function mcParseExport_(x) {
  const byKey = {}, groups = {};
  x.split('<offer ').slice(1).forEach(function (o) {
    const g = function (re) { return ((o.match(re) || [])[1] || '').trim(); };
    const p = function (n) { return g(new RegExp('<param name="' + n + '"[^>]*>([^<]*)<')); };
    const id = g(/^id="(\d+)"/), gid = g(/group_id="(\d+)"/), vc = g(/<vendorCode>([^<]*)</);
    const desc = g(/<description_ua><!\[CDATA\[([\s\S]*?)\]\]>/) || g(/<description><!\[CDATA\[([\s\S]*?)\]\]>/);
    const rec = { id: id, gid: gid, vc: vc, name: g(/<name_ua><!\[CDATA\[([\s\S]*?)\]\]>/) || g(/<name><!\[CDATA\[([\s\S]*?)\]\]>/),
      color: p('Колір') || p('Цвет'), size: p('Розмір') || p('Размер'), sklad: p('Склад') || p('Матеріал') || p('Материал'), desc: desc };
    if (vc) byKey[vc] = rec; if (id && !byKey[id]) byKey[id] = rec;
    if (gid) (groups[gid] = groups[gid] || []).push(+id);
  });
  return { byKey: byKey, groups: groups };
}

function mcFeedIds_(t) {
  const ids = [];
  (t.match(/<g:id>[^<]*<\/g:id>/g) || []).forEach(function (m) { ids.push(m.replace(/<\/?g:id>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim()); });
  return ids;
}

// 26.10.2026: gtin — з таблиці «LETIMO — штрихкоди товарів (сканування)» (колонки C артикул, G штрихкод),
// лише справжні EAN-13 з вірною контрольною цифрою; внутрішні коди 2… (Talvi) не відправляємо — Google їх відхиляє.
// Timi Tex: артикул на сайті = штрихкод 48… → gtin = id. Заповнює лише порожні клітинки колонки gtin.
const MC_BC_SHEET = '12dfaYUwc1otAHl2kPBnfHXAC9rYJGll5QJR9QxjTfQ0';
let MC_BC_ = {};
function mcEanOk_(c) {
  c = String(c || '').trim(); if (!/^\d{13}$/.test(c) || c[0] === '2') return false;
  let s = 0; for (let i = 0; i < 12; i++) s += (+c[i]) * (i % 2 ? 3 : 1);
  return (10 - s % 10) % 10 === +c[12];
}
// 26.10.2026: title для взуття і пінеток (google_product_category 187) = назва + колір + матеріал з опису.
// Пише статичні значення в колонку title додаткового джерела MC (порада MC «Оновіть описи: Взуття»).
let MC_TT_ = {};
function mcDec_(s) {
  s = String(s);
  for (let k = 0; k < 2; k++) s = s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&rsquo;|&#8217;/g, "'").replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&amp;/g, '&');
  s = s.replace(/&#13;|\r/g, ' ').replace(/\s+([,;])/g, '$1').replace(/([,;])(\s*[,;])+/g, '$1'); // 31.10.2026: прибрати &#13; (XD198)
  return s;
}
function mcFootTitle_(name, desc) {
  name = String(name).trim().replace(/,\s*Тринитка з начосом/, '').replace(/,\s*(Чорний|Білий|Сірий)$/, '');
  const d = String(desc).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const nl = name.toLowerCase(), parts = [];
  const cm = d.match(/Колір:\s*([^.;:]{2,40}?)(?:\.|\s+Матеріал|\s+Підкладка|\s+Сезон)/);
  if (cm) {
    let c = cm[1].trim().replace('перші сніг', 'перший сніг');
    const pm = c.match(/\(([^)]*)\)/);
    if (pm) c = /[а-яіїєґ]/i.test(pm[1]) ? pm[1] : c.replace(/\s*\([^)]*\)/, '');
    if (nl.indexOf(c.toLowerCase().slice(0, 3)) < 0) parts.push(/принт/.test(c) ? c : c.toLowerCase().split(/\s+/).map(function (w) { return w.replace(/ий$|ій$/, 'і'); }).join(' '));
  }
  let mat = '';
  const mm = d.match(/Матеріал:\s*([\s\S]{3,160}?)\.(\s|$)/);
  if (mm) mat = mm[1];
  else { const a = d.match(/Матеріал верху:\s*([^.]+?)\s+(?:Підкладка та устілка|Підкладка):\s*([^.]+?)\s+(?:Застібка|Сезон|Розміри)/); if (a) mat = 'верх ' + a[1] + ', підкладка ' + a[2]; }
  if (mat) {
    let m = mat.replace(/\s+-\s+/g, ' ').replace(/\s*—\s*/g, ' ').replace(/:\s*/g, ' ').replace(/;\s*/g, ', ').replace(/\s+/g, ' ').trim();
    m = m.replace(/(^|[\s,(])([А-ЯІЇЄҐ])(?=[а-яіїєґ'’])/g, function (a, b, c) { return b + c.toLowerCase(); });
    if (nl.indexOf(m.toLowerCase()) < 0) parts.push(m);
  }
  if (!parts.length) return '';
  let t = name + ' — ' + parts.join(', ');
  if (t.length > 150) t = t.slice(0, 150).replace(/,[^,]*$/, '');
  return t;
}
function mcFootTitles_(x) {
  const out = {};
  String(x).split('<item>').slice(1).forEach(function (it) {
    if (!/<g:google_product_category>187</.test(it)) return;
    const g = function (t) { const mt = it.match(new RegExp('<g:' + t + '>([\\s\\S]*?)</g:' + t + '>')); return mt ? mcDec_(mt[1]) : ''; };
    const id = g('id').trim(), tt = mcFootTitle_(g('title'), g('description'));
    if (id && tt) out[id] = tt;
  });
  return out;
}
function mcTitlesTest() { const o = mcFootTitles_(UrlFetchApp.fetch(MC_GFEED, { muteHttpExceptions: true }).getContentText()); const k = Object.keys(o); Logger.log(k.length + ' ' + JSON.stringify(k.slice(0, 200).map(function (i) { return i + ' ' + o[i]; }))); return k.length; }

var MC_FD_ = {};
function mcFootDescs_(x) {
  const out = {};
  String(x).split('<item>').slice(1).forEach(function (it) {
    if (!/<g:google_product_category>187</.test(it)) return;
    const g = function (t) { const mt = it.match(new RegExp('<g:' + t + '>([\\s\\S]*?)</g:' + t + '>')); return mt ? mcDec_(mt[1]) : ''; };
    const id = g('id').trim(); if (id) out[id] = g('description');
  });
  return out;
}
function mcFootDesc_(base, color, mat) {
  base = String(base || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); if (!base) return '';
  const low = base.toLowerCase(), add = [];
  color = String(color || '').trim(); mat = String(mat || '').trim();
  if (color && low.indexOf(color.toLowerCase()) < 0) add.push('Колір: ' + color.toLowerCase() + '.');
  if (mat && low.indexOf(mat.toLowerCase()) < 0) add.push('Матеріал: ' + mat.toLowerCase() + '.');
  if (!add.length) return '';
  return (base + (/[.!?]$/.test(base) ? ' ' : '. ') + add.join(' ')).slice(0, 5000);
}

function mcLoadBarcodes_() {
  const mp = {};
  try {
    SpreadsheetApp.openById(MC_BC_SHEET).getSheets()[0].getDataRange().getDisplayValues().slice(1).forEach(function (r) {
      const a = String(r[2] || '').trim(), b = String(r[6] || '').trim(); if (a && mcEanOk_(b)) mp[a] = b;
    });
  } catch (e) { Logger.log('barcodes: ' + e); }
  return mp;
}
function mcGtin_(fid, rec) {
  if (MC_BC_[fid]) return MC_BC_[fid];
  if (rec && rec.vc && MC_BC_[rec.vc]) return MC_BC_[rec.vc];
  if (/^48/.test(fid) && mcEanOk_(fid)) return fid;
  return '';
}

function mcSuppPlan_(data, exp, feedIds) {
  const H = data[0].map(String), C = {};
  ['id', 'item_group_id', 'color', 'size', 'age_group', 'gender', 'material', 'pattern', 'video_link', 'gtin', 'title', 'description'].forEach(function (k) { C[k] = H.indexOf(k); });
  const have = {}; for (let r = 1; r < data.length; r++) have[String(data[r][C.id]).trim()] = r;
  const st = { feed: feedIds.length, added: 0, noExport: 0, colorFilled: 0, matFilled: 0, vidRows: 0, newVids: {} };
  const add = [], set = [];
  feedIds.forEach(function (fid) {
    const rec = exp.byKey[fid];
    if (have[fid] === undefined) {
      if (!rec) { st.noExport++; return; }
      const grp = rec.gid && exp.groups[rec.gid] && exp.groups[rec.gid].length > 1 ? 'LT' + Math.min.apply(null, exp.groups[rec.gid]) : '';
      const size = mcSize_(rec.size, rec.name), vids = mcVids_(rec.desc);
      const row = []; for (let i = 0; i < H.length; i++) row.push('');
      row[C.id] = fid; row[C.item_group_id] = grp; row[C.color] = mcColor_(rec.color, rec.desc); row[C.size] = size;
      row[C.age_group] = mcAge_(size, rec.name); row[C.gender] = mcGender_(rec.name); row[C.material] = mcMat_(rec.sklad, rec.desc);
      row[C.video_link] = vids.join(',');
      if (C.gtin >= 0) row[C.gtin] = mcGtin_(fid, rec);
      if (C.title >= 0) row[C.title] = MC_TT_[fid] || '';
      if (C.description >= 0 && MC_FD_[fid] !== undefined) row[C.description] = mcFootDesc_(MC_FD_[fid], row[C.color], row[C.material]);
      vids.forEach(function (v) { st.newVids[v] = 1; });
      have[fid] = -1; add.push(row); st.added++; return;
    }
    const r = have[fid];
    if (r >= 0 && C.title >= 0 && MC_TT_[fid] && String(data[r][C.title] || '') !== MC_TT_[fid]) { set.push([r, C.title, MC_TT_[fid]]); st.titleSet = (st.titleSet || 0) + 1; }
    if (r >= 0 && C.description >= 0 && MC_FD_[fid] !== undefined) { const dd = mcFootDesc_(MC_FD_[fid], data[r][C.color], data[r][C.material]); if (dd && String(data[r][C.description] || '') !== dd) { set.push([r, C.description, dd]); st.descSet = (st.descSet || 0) + 1; } }
    if (r < 0 || !rec) return;
    const row = data[r];
    if (!String(row[C.color] || '').trim()) { const c = mcColor_(rec.color, rec.desc); if (c) { set.push([r, C.color, c]); st.colorFilled++; } }
    if (!String(row[C.material] || '').trim()) { const m = mcMat_(rec.sklad, rec.desc); if (m) { set.push([r, C.material, m]); st.matFilled++; } }
    const cur = String(row[C.video_link] || '').split(',').map(function (s) { return s.trim(); }).filter(String);
    const vids = mcVids_(rec.desc).filter(function (v) { return cur.indexOf(v) < 0; });
    if (vids.length) { set.push([r, C.video_link, vids.concat(cur).slice(0, 10).join(',')]); st.vidRows++; vids.forEach(function (v) { st.newVids[v] = 1; }); }
    if (C.gtin >= 0 && !String(row[C.gtin] || '').trim()) { const gt = mcGtin_(fid, rec); if (gt) { set.push([r, C.gtin, gt]); st.gtinFilled = (st.gtinFilled || 0) + 1; } }
  });
  st.newVids = Object.keys(st.newVids).length;
  return { add: add, set: set, stats: st };
}

function mcSuppSync(dryRun) {
  const ss = SpreadsheetApp.openById(MC_SUPP_ID), sh = ss.getSheets()[0];
  const data = sh.getDataRange().getDisplayValues();
  MC_BC_ = mcLoadBarcodes_();
  const exp = mcParseExport_(UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText());
  const gx = UrlFetchApp.fetch(MC_GFEED, { muteHttpExceptions: true }).getContentText();
  const feedIds = mcFeedIds_(gx);
  MC_TT_ = mcFootTitles_(gx);
  MC_FD_ = mcFootDescs_(gx);
  if (feedIds.length < 4000 || Object.keys(exp.byKey).length < 4000) throw new Error('Фід або експорт неповний: ' + feedIds.length + ' / ' + Object.keys(exp.byKey).length);
  const plan = mcSuppPlan_(data, exp, feedIds);
  const msg = JSON.stringify(plan.stats);
  if (dryRun === true) {
    Logger.log(msg); Logger.log('Нові рядки (до 15): ' + JSON.stringify(plan.add.slice(0, 15)));
    Logger.log('Правки (до 60): ' + JSON.stringify(plan.set.slice(0, 60).map(function (s) { return [data[s[0]][0], data[0][s[1]], s[2]]; })));
    return msg;
  }
  if (!plan.add.length && !plan.set.length) { Logger.log('Без змін ' + msg); return 'Без змін ' + msg; }
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('MC_SUPP_BACKUP')) {
    const copy = sh.copyTo(ss); copy.setName('backup ' + Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH-mm'));
    props.setProperty('MC_SUPP_BACKUP', copy.getName());
  }
  plan.set.forEach(function (s) { const c = sh.getRange(s[0] + 1, s[1] + 1); c.setNumberFormat('@'); c.setValue(s[2]); });
  if (plan.add.length) {
    const rg = sh.getRange(sh.getLastRow() + 1, 1, plan.add.length, data[0].length);
    rg.setNumberFormat('@'); rg.setValues(plan.add);
  }
  props.setProperty('MC_SUPP_LAST', Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm') + ' ' + msg);
  Logger.log(msg); return msg;
}

function mcSuppDry() { return mcSuppSync(true); }

function setupMcSuppTrigger() {
  ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'mcSuppSync'; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('mcSuppSync').timeBased().everyDays(1).atHour(5).inTimezone('Europe/Kyiv').create();
  return 'OK';
}


// ═══════════ ROZETKA: виправлення назв за зауваженнями модераторів (24.10.2026) ═══════════
// Лише фід Rozetka (сайт, Prom, Kasta не зачіпаються). Правки тільки в <name> та <name_ua>.
// 1) «Мужчина»/«Мужской» (кривий переклад «Чоловічок») → «Человечек» — коментар Rozetka «мужчина це не вид товару».
// 2) Скорочення в назвах іграшок → повні слова — коментар «в назві виправити скорочення».
function rzNameFix_(xml) {
  return xml.replace(/<(name|name_ua)><!\[CDATA\[([\s\S]*?)\]\]><\/\1>/g, function (m, tag, n) {
    let s = n;
    if (tag === 'name') {
      s = s.replace(/^Мужчина(?=[\s,])/, 'Человечек').replace(/^Мужской(?=[\s,])/, 'Человечек')
           .replace(/\(с аксесс\.\)/g, '(с аксессуарами)').replace(/с аксесс\./g, 'с аксессуарами')
           .replace(/в асс\./g, 'в ассортименте').replace(/в ас\./g, 'в ассортименте').replace(/Набор игрушек\. оружия/g, 'Набор игрушечного оружия');
    } else {
      s = s.replace(/\(з аксес\.\)/g, '(з аксесуарами)').replace(/з аксес\./g, 'з аксесуарами')
           .replace(/в ас\./g, 'в асортименті').replace(/Набір іграшк\. зброї/g, 'Набір іграшкової зброї');
    }
    return '<' + tag + '><![CDATA[' + s + ']]></' + tag + '>';
  });
}



// ═══════════ ROZETKA: російська назва = переклад української (24.10.2026) ═══════════
// Модератори приховали ці товари: «в назвах кольори відрізняються» / «мужчина це не вид товару».
// Для них RU-назва береться як переклад UA-назви (Google Translate), щоб колір і структура збігались.
// Лише перелічені ID і лише фід Rozetka. Переклади кешуються у властивостях скрипту.
const RZ_RU_IDS = '1839,2421,1287,2874,1539,1715,716,2105,1718,1518,3798,1101,2419,553,1355,2418,1100,752,3799,2910,1841,2908,717,1534,2128,1538,2420,2871,3807,4355,2130,3803,1541,2877,1532,2690,1288,1536,1422,1722,5160,1098,2680,770,3801,778,1424,5162,776,1420,1520,2873,1717,1842,2688,897,3805,1102,750,550,3797,1543,715,2106,2506,4353,1843,1516,1716,5159,1542,2681,1099,5161,2685,1523,775,1423,3804,896,2689,4352,551,3800,1837,751,2127,708,2013,1352,3796,1427,769,1537,2676,1104,1289,2131,1421,2687,3802,712,2911,2508,1731,2678,2682,768,1840,3864,1357,2509,749,1540,4354,1719,706,1350,1521,777,1425,1531,2129,1535,747,2683,1721,898,2870,2505,2909,1650,1354,3863,1358,1519,1351,707,1105,552,746,1359,3862,1838,1530,2875,2679,1428,1730,2677,1426,1720,1732,899,1522,2686,1836,554,2684,1353,711,710,2507,709,714,3865,1517,705,549,3861,771,1103,2872,2691,1533,1356,2876,1733,3806,1529,4978,2663,4839,839,2650,847,4844,4878,2615,846,842,4841,2651,1665,937,1655,4479,4843,5121,841,848,2616,4480,840,4977,845,2617,1656,2662,1666,4842'.split(',');

function rzRuFix_(xml) {
  const set = {}; RZ_RU_IDS.forEach(function (i) { set[i] = 1; });
  const props = PropertiesService.getScriptProperties();
  let cache = {}; try { cache = JSON.parse(PropertiesService.getUserProperties().getProperty('RZ_RU_CACHE') || props.getProperty('RZ_RU_CACHE') || '{}'); } catch (e) {}
  let changed = false, n = 0;
  const out = xml.replace(/<offer id="(\d+)"([^>]*)>([\s\S]*?)<\/offer>/g, function (all, id, attrs, body) {
    if (!set[id]) return all;
    const ua = (body.match(/<name_ua><!\[CDATA\[([\s\S]*?)\]\]><\/name_ua>/) || [])[1];
    if (!ua) return all;
    let ru = cache[ua];
    if (!ru) {
      try { ru = LanguageApp.translate(ua, 'uk', 'ru'); } catch (e) { return all; }
      ru = ru.replace(/^(Мужчин[а-я]*|Мужичок|Человечек|Чоловічок)(?=[\s,])/i, 'Человечек').replace(/MagBaby/gi, 'MagBaby');
      cache[ua] = ru; changed = true;
    }
    n++;
    return all.replace(/<name>[\s\S]*?<\/name>/, '<name><![CDATA[' + ru + ']]></name>');
  });
  if (changed) { try { PropertiesService.getUserProperties().setProperty('RZ_RU_CACHE', JSON.stringify(cache)); props.deleteProperty('RZ_RU_CACHE'); } catch (e) { Logger.log('RZ_RU_CACHE save: ' + e.message); } } // 02.11: кеш >9 КБ ламав збереження властивостей скрипту через UI
  Logger.log('rzRuFix_: ' + n + ' назв');
  return out;
}

function noLetimo_(xml) {
  return rzKolgFix_(rzRuFix2_(rzRuFix_(rzNameFix_(xml.replace(/Порада LETIMO:/g, 'Порада:').replace(/Совет LETIMO:/g, 'Совет:')))));
}

function testRzRu() {
  const x = '<offer id="4978" a="1"><name><![CDATA[старе]]></name>\n<name_ua><![CDATA[Чоловічок з шапочкою "Liam" MagBaby молочний 56 см (549)]]></name_ua></offer>';
  Logger.log(rzRuFix_(x));
}

// 26.10.2026: v3 пошукових запитів Prom (правила Prom: фрази повністю відповідають товару,
// без загальних слів; збіг рахується в межах ОДНІЄЇ фрази, тож кожна фраза — готовий запит до 5 слів).
// Доповнює вже згенеровані keywords: прибирає загальні фрази й додає тип+модель/бренд/артикул/
// стать/сезон/вік/розмір/матеріал/колір. До 20 фраз і 1000 символів на мову.
const KW3_MAX = 20, KW3_LEN = 1000;
const KW3_BAN = /^(дитячий одяг|одяг для малюка|детская одежда|одежда для малыша|дитячі іграшки|детские игрушки|іграшки|игрушки|дитячий текстиль|детский текстиль)$/;
const KW3_ADJ_UA = /^(дитяч|зимов|демісезон|літн|тепл|в'язан|в’язан|утеплен|бавовнян|трикотаж|новорічн|святков|ошатн|легк|махров|флісов|велюров|вельвет|джинсов|спортивн|домашн|ігров|колекційн|інтерактивн|розвиваюч|м'як|м’як|безрозмірн|льнян|муслінов|стьобан|плюшев|вафельн|сатинов|рожев|сін|чорн|біл|бежев|теплий|пухнаст|електронн|музичн|функціональн)/;
const KW3_ADJ_RU = /^(детск|зимн|демисезон|летн|тепл|вязан|утеплен|хлопков|трикотаж|новогодн|праздничн|нарядн|легк|махров|флисов|велюров|вельвет|джинсов|спортивн|домашн|игров|коллекционн|интерактивн|развивающ|мягк|безразмерн|льнян|муслинов|стеган|плюшев|вафельн|сатинов|розов|черн|бел|бежев|пушист|электронн|музыкальн|функциональн)/;
const KW3_FAB = [
  [/бавовн|хлопок/i, 'з бавовни', 'из хлопка'], [/велюр/i, 'з велюру', 'из велюра'],
  [/фліс|флис/i, 'на флісі', 'на флисе'], [/муслін|муслин/i, 'з мусліну', 'из муслина'],
  [/льон|лен/i, 'з льону', 'изо льна'], [/начос/i, 'з начосом', 'с начесом']
];

function kw3Tag_(b, t) {
  const m = b.match(new RegExp('<' + t + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + t + '>'));
  return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim() : '';
}
function kw3Param_(b, n) {
  const m = b.match(new RegExp('<param name="' + n + '"[^>]*>([^<]*)</param>'));
  return m ? m[1].trim() : '';
}
// розбір назви: { base: 'велюровий чоловічок', noun: 'чоловічок', model: 'tim', color, ch }
function kw3Parse_(name, brand, adj) {
  let s = String(name || '').toLowerCase().replace(/&quot;/g, '"');
  const q = s.match(/["«“„]([^"»”“]{2,30})["»”“]/);
  const model = q ? q[1].trim() : '';
  const dash = s.match(/\s[-–—]\s([^,(]{2,40})$/);
  const ch = dash ? dash[1].replace(/\(.*$/, '').trim() : '';
  let head = s.split(/["«“„,(]/)[0];
  if (dash) head = head.split(/\s[-–—]\s/)[0];
  const b = String(brand || '').toLowerCase();
  let ws = head.replace(/[!:]/g, ' ').split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (b && b.split(/\s+/).indexOf(w) >= 0) break;
    if (/\d/.test(w) && i > 0) break;
    if (/^(серії|серии|для|з|із|на|с|из|у|в|-|–)$/.test(w)) { if (out.some(function (x) { return !adj.test(x); })) break; }
    out.push(w);
    if (out.length >= 4) break;
  }
  const noun = out.find(function (w) { return !adj.test(w) && !/^(для|з|із|на|с|из|у|в)$/.test(w); }) || out[out.length - 1] || '';
  const ni = out.indexOf(noun);
  const base = out.slice(0, ni + 1).join(' ');
  const colM = s.replace(/\([^)]*\)/g, '').match(/,\s*([а-яіїєґ' -]{3,30}?)(?:\s+\d|,|$)/);
  return { base: base, noun: noun, model: model, ch: ch, color: colM ? colM[1].trim() : '' };
}
function kw3Age_(name, ru) {
  const m = String(name).match(/\((?:старше\s*)?(\d+)(?:\s*-\s*(\d+))?\s*(міс|мес|рок|рік|років|год|лет)/i);
  if (!m) return [];
  const a = +m[1], b = +(m[2] || m[1]), mon = /міс|мес/i.test(m[3]);
  const out = [];
  if (mon) {
    if (a <= 1 && b <= 3) out.push(ru ? 'для новорожденного' : 'для новонародженого');
    if (b <= 12) out.push(ru ? 'для младенца' : 'для немовляти');
    if (a >= 12 && a < 24) out.push(ru ? 'на 1 год' : 'на 1 рік');
  } else if (a >= 1 && a <= 10) {
    out.push(ru ? ('на ' + a + (a === 1 ? ' год' : a < 5 ? ' года' : ' лет')) : ('на ' + a + (a === 1 ? ' рік' : a < 5 ? ' роки' : ' років')));
  }
  return out;
}
function kw3Build_(o, lang, existing) {
  const ru = lang === 'ru';
  const name = ru ? (kw3Tag_(o, 'name') || kw3Tag_(o, 'name_ua')) : kw3Tag_(o, 'name_ua');
  const brand = kw3Tag_(o, 'vendor');
  const bl = brand.toLowerCase();
  const code = kw3Tag_(o, 'vendorCode');
  const cat = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1] || '';
  const toy = +cat >= 1170 && +cat <= 1181;
  const p = kw3Parse_(name, brand, ru ? KW3_ADJ_RU : KW3_ADJ_UA);
  const N = p.noun;
  const ph = [];
  const add = function (x) { if (x) ph.push(String(x).replace(/\s+/g, ' ').trim()); };
  add(p.base);
  if (p.model && N) add(N + ' ' + p.model);
  if (bl && N) add(N + ' ' + bl);
  if (bl && p.model) add(bl + ' ' + p.model);
  // артикул моделі (взуття/іграшки): ABD0166R-BLACK-25 -> abd0166r; 75114 -> funko 75114
  const art = code.split('-')[0].toLowerCase();
  if (bl && art && ((cat === '1168' && /\d/.test(art) && art.length >= 4) || (toy && /^\d{4,6}$/.test(art)))) add(bl + ' ' + art);
  if (p.ch && N) { add(N + ' ' + p.ch); if (bl) add(p.ch + ' ' + bl); }
  existing.forEach(function (x) { add(x); });
  if (!toy && N) {
    const sx = kw3Param_(o, 'Стать');
    if (/дівч|девоч/i.test(sx) || (/для дівчинки|для девочки/.test(name.toLowerCase()))) add(N + (ru ? ' для девочки' : ' для дівчинки'));
    if (/хлопч|мальч/i.test(sx) || (/для хлопчика|для мальчика/.test(name.toLowerCase()))) add(N + (ru ? ' для мальчика' : ' для хлопчика'));
    const se = kw3Param_(o, 'Сезон').toLowerCase() || (/зимов|зимн/.test(name.toLowerCase()) ? 'зима' : '');
    if (/зим/.test(se)) add(N + (ru ? ' на зиму' : ' на зиму'));
    else if (/весн|осін|осен|демі|деми/.test(se)) { add(N + (ru ? ' на осень' : ' на осінь')); add(N + (ru ? ' на весну' : ' на весну')); }
    else if (/літо|лето/.test(se)) add(N + (ru ? ' на лето' : ' на літо'));
    kw3Age_(name, ru).forEach(function (a) { add(N + ' ' + a); });
    const fab = kw3Param_(o, 'Тип тканини') + ' ' + kw3Param_(o, 'Матеріал верху') + ' ' + (/на флісі|на флисе/i.test(name) ? 'фліс' : '');
    KW3_FAB.forEach(function (f) { if (f[0].test(fab)) add(N + ' ' + (ru ? f[2] : f[1])); });
    if (p.color) add(N + ' ' + p.color);
    const sz = (name.match(/розмір\s*(\d{2})|размер\s*(\d{2})/i) || []);
    const s2 = sz[1] || sz[2] || (name.match(/\s(\d{2,3})\s*\(/) || [])[1];
    if (s2) add(N + ' ' + s2 + (ru ? ' размер' : ' розмір'));
    if (/з хутром|на хутрі|с мехом|на меху/.test(name.toLowerCase())) add(N + (ru ? ' с мехом' : ' з хутром'));
    if (cat === '1168') {
      if (/pink|fuchsia|рожев|розов/i.test(name)) add(N + (ru ? ' для девочки' : ' для дівчинки'));
      add(ru ? 'детская обувь' : 'дитяче взуття');
      add(ru ? ('детские ' + N) : ('дитячі ' + N));
    }
  }
  const seen = {}, out = []; let len = 0;
  ph.forEach(function (x) {
    const k = x.toLowerCase();
    if (!x || x.length < 3 || seen[k] || KW3_BAN.test(k) || /:/.test(k) || /(розмір|размер)$/.test(k) && !/\d/.test(k) || x.split(/\s+/).length > 5 || out.length >= KW3_MAX || len + x.length + 2 > KW3_LEN) return;
    seen[k] = 1; out.push(x); len += x.length + 2;
  });
  return out.join(', ');
}
function kwV3_(xml) {
  let n = 0;
  const res = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    const exUa = (kw3Tag_(o, 'keywords_ua') || '').split(/\s*,\s*/).filter(Boolean);
    const exRu = (kw3Tag_(o, 'keywords') || '').split(/\s*,\s*/).filter(Boolean);
    const ua = kw3Build_(o, 'ua', exUa), ru = kw3Build_(o, 'ru', exRu);
    n++;
    o = o.replace(/<keywords_ua>[\s\S]*?<\/keywords_ua>/, '<keywords_ua>' + xmlEsc_(ua) + '</keywords_ua>');
    return o.replace(/<keywords>[\s\S]*?<\/keywords>/, '<keywords>' + xmlEsc_(ru) + '</keywords>');
  });
  if (typeof Logger !== 'undefined') Logger.log('kwV3 ' + n);
  return res;
}


// ═══════════ ROZETKA 28.10.2026: RU-назва = дослівний переклад UA-назви ═══════════
// Коментарі модераторів «назви мають повністю співпадати», «в назвах кольори відрізняються», «худые → худі».
// Лише фід Rozetka, лише перелічені ID (приховані модератором станом на 28.10). Без Google Translate — словник.
// Якщо в UA-назві трапилось слово, якого нема в словнику, назву не чіпаємо (лог: «пропущено»).
const RZ_RU2_RANGES = '599-605,607,753-762,765-767,915-932,940-951,1049,1052-1053,1055-1056,1059,1061,1065-1067,1122-1124,1126-1127,1161-1191,1193-1199,1203-1208,1468-1491,1636-1643,1645-1646,1655-1656,1665-1666,1672,1689-1712,1734-1739,1778-1805,1905-1932,1944-1964,1986-1999,2005-2012,2437-2454,2530-2557,2586-2599,2632-2643,2650-2651,2842-2869,3024-3073,3090-3145,3214-3228,3232-3243,3276-3296,3372-3393,3399,3449-3452,3515-3518,3547-3567,3594-3597,3626-3632,3689-3772,3828-3834,4095-4106,4226-4232,4845-4870,4879-4913,4979-4999,5072-5099,5196-5258,5327-5354,5601-5621,5689-5742';
const RZ_RU2_DICT = {"Євро":"Евро","євро":"евро","Велосипедки":"Велосипедки","Вельветова":"Вельветовая","Вільні":"Свободные","Вітровка-дощовик":"Ветровка-дождевик","Демісезонна":"Демисезонная","Зимова":"Зимняя","Зимовий":"Зимний","Комбінезон":"Комбинезон","комбінезон":"комбинезон","Комплект":"Комплект","Куртка-бомбер":"Куртка-бомбер","Куртка-вітровка":"Куртка-ветровка","Куртка-грязепруф":"Куртка-грязепруф","Льняні":"Льняные","Набір":"Набор","Напівкомбінезон":"Полукомбинезон","Подвійний":"Двойной","Подовжені":"Удлиненные","Потрійний":"Тройной","Піжама":"Пижама","Термокомбінезон":"Термокомбинезон","Тренувальні":"Тренировочные","Трусики-блумери":"Трусики-блумеры","Трусики-шорти":"Трусики-шорты","Утеплена":"Утепленная","Шкарпетки":"Носки","Шорти":"Шорты","шорти":"шорты","Шорти-бермуди":"Шорты-бермуды","Штани-дощовики":"Штаны-дождевики","Худі":"Худи","Колготки":"Колготки","айворі":"айвори","бавовни":"хлопка","бежевий":"бежевый","блакитний":"голубой","блискавці":"молнии","білий":"белый","бірюзовий":"бирюзовый","графітовий":"графитовый","для":"для","дощовик":"дождевик","жовтий":"желтый","з":"с","зелений":"зеленый","кавовий":"кофейный","кг":"кг","комбінований":"комбинированный","коричневий":"коричневый","кремовий":"кремовый","кроп-топом":"кроп-топом","куртка":"куртка","куртка-пуффер":"куртка-пуффер","лавандовий":"лавандовый","липучках":"липучках","липучці":"липучке","лососевий":"лососевый","ліловий":"лиловый","м'ятний":"мятный","м’ятний":"мятный","малиновий":"малиновый","махрових":"махровых","махрі":"махре","молочний":"молочный","морської":"морской","міс":"мес","на":"на","новонародженого":"новорожденного","оливковий":"оливковый","пелюшка":"пеленка","персиковий":"персиковый","помаранчевий":"оранжевый","прогулянок":"прогулок","пудровий":"пудровый","підгузник":"подгузник","підгузок":"подгузник","рожевий":"розовый","роки":"года","років":"лет","рік":"год","світло-жовтий":"светло-желтый","світло-коричневий":"светло-коричневый","світло-рожевий":"светло-розовый","світло-сірий":"светло-серый","сет":"сет","синій":"синий","см":"см","смарагдовий":"изумрудный","стьобана":"стеганая","сірий":"серый","сіро-голубий":"серо-голубой","сіро-коричневий":"серо-коричневый","темно-бежевий":"темно-бежевый","темно-зелений":"темно-зеленый","темно-коричневий":"темно-коричневый","темно-синій":"темно-синий","тренувальних":"тренировочных","труси":"трусы","трусиків":"трусиков","трусів":"трусов","у":"в","фуксія":"фуксия","фіолетовий":"фиолетовый","хакі":"хаки","хвилі":"волны","цегляний":"кирпичный","чорний":"черный","шапочкою":"шапочкой","шкарпеток":"носков","штани-шорти":"штаны-шорты","клітинку":"клетку","індиго":"индиго"};
// Іграшки: UA-назви обрізані/зі скороченнями — задаємо обидві назви вручну (однакова структура RU/UA).
const RZ_NAME_OVR = {
 "6157": [
  "Интерактивная развивающая игрушка Kiddi Smart – Слоненок Грайко (украинский язык) KIDDI SMART (6157)",
  "Інтерактивна розвивальна іграшка Kiddi Smart – Слоненя Грайко (українська мова) KIDDI SMART (6157)"
 ],
 "6171": [
  "Интерактивный робот с голосовым управлением – AT-Robot (зеленый, украинский язык) AT-Robot (6171)",
  "Інтерактивний робот з голосовим керуванням – AT-Robot (зелений, українська мова) AT-Robot (6171)"
 ],
 "6187": [
  "Развивающая игрушка-сортер – Умный домик (12 форм) Battat Lite (6187)",
  "Розвивальна іграшка-сортер – Розумний будиночок (12 форм) Battat Lite (6187)"
 ],
 "6223": [
  "Музыкальный коврик с развивающими дугами – Солнечные ноты Taf Toys (6223)",
  "Музичний килимок з розвивальними дугами – Сонячні ноти Taf Toys (6223)"
 ],
 "6432": [
  "Сенсорная развивающая игрушка – Ежик Сяйво-Веселяйво Battat (6432)",
  "Сенсорна розвивальна іграшка – Їжачок Сяйво-Веселяйво Battat (6432)"
 ],
 "6533": [
  "Интерактивный робот с голосовым управлением – AT-Robot (синий, украинский язык) AT-Robot (6533)",
  "Інтерактивний робот з голосовим керуванням – AT-Robot (синій, українська мова) AT-Robot (6533)"
 ],
 "6556": [
  "Развивающая игрушка-балансир Kiddi Smart – Лосик KIDDI SMART (6556)",
  "Розвивальна іграшка-балансир Kiddi Smart – Лосик KIDDI SMART (6556)"
 ],
 "6717": [
  "Интерактивный робот с голосовым управлением – AT-Robot (желтый, украинский язык) AT-Robot (6717)",
  "Інтерактивний робот з голосовим керуванням – AT-Robot (жовтий, українська мова) AT-Robot (6717)"
 ],
 "6752": [
  "Игровой набор - Автоперевозчик (автоперевозчик, самосвал, экскаватор, аксессуары) TechnoDrive (6752)",
  "Ігровий набір - Автоперевізник (автоперевізник, самоскид, екскаватор, аксесуари) TechnoDrive (6752)"
 ],
 "6764": [
  "Интерактивный робот с голосовым управлением – AT-Robot (розовый, украинский язык) AT-Robot (6764)",
  "Інтерактивний робот з голосовим керуванням – AT-Robot (рожевий, українська мова) AT-Robot (6764)"
 ],
 "6947": [
  "Развивающая двуязычная игрушка Kiddi Smart – Динозаврик Барвограй KIDDI SMART (6947)",
  "Розвивальна двомовна іграшка Kiddi Smart – Динозаврик Барвограй KIDDI SMART (6947)"
 ],
 "6994": [
  "Двуязычная игрушка Kiddi Smart – Моя первая книга KIDDI SMART (6994)",
  "Двомовна іграшка Kiddi Smart – Моя перша книжка KIDDI SMART (6994)"
 ]
};

function rzIdSet2_() {
  const s = {};
  RZ_RU2_RANGES.split(',').forEach(function (p) { const a = p.split('-').map(Number); for (let i = a[0]; i <= (a[1] || a[0]); i++) s[i] = 1; });
  return s;
}

function rzUa2Ru_(ua) {
  let bad = false;
  const out = ua.split(/("[^"]*"|«[^»]*»)/).map(function (p, k) {
    if (k % 2) return p;
    return p.replace(/[А-Яа-яІіЇїЄєҐґ'’]+(?:-[А-Яа-яІіЇїЄєҐґ'’]+)*/g, function (w) {
      if (Object.prototype.hasOwnProperty.call(RZ_RU2_DICT, w)) return RZ_RU2_DICT[w];
      bad = true; return w;
    });
  }).join('');
  if (bad) return null;
  return out.replace(/(\d+)-(\d+) года/g, function (m, a, b) {
    const n = +b, d = n % 10, h = n % 100;
    const f = (d === 1 && h !== 11) ? 'год' : (d >= 2 && d <= 4 && (h < 12 || h > 14)) ? 'года' : 'лет';
    return a + '-' + b + ' ' + f;
  });
}

function rzRuFix2_(xml) {
  const set = rzIdSet2_();
  let n = 0, skip = 0;
  const out = xml.replace(/<offer id="(\d+)"([^>]*)>([\s\S]*?)<\/offer>/g, function (all, id) {
    const o = RZ_NAME_OVR[id];
    if (o) {
      n++;
      return all.replace(/<name>[\s\S]*?<\/name>/, function () { return '<name><![CDATA[' + o[0] + ']]></name>'; })
                .replace(/<name_ua>[\s\S]*?<\/name_ua>/, function () { return '<name_ua><![CDATA[' + o[1] + ']]></name_ua>'; });
    }
    if (!set[id]) return all;
    const ua = (all.match(/<name_ua><!\[CDATA\[([\s\S]*?)\]\]><\/name_ua>/) || [])[1];
    if (!ua) return all;
    const ru = rzUa2Ru_(ua);
    if (!ru) { skip++; return all; }
    n++;
    return all.replace(/<name>[\s\S]*?<\/name>/, function () { return '<name><![CDATA[' + ru + ']]></name>'; });
  });
  Logger.log('rzRuFix2_: ' + n + ' назв, пропущено ' + skip);
  return out;
}

function testRzRu2() {
  const x = '<offer id="3043" a="1"><name><![CDATA[старе]]></name>\n<name_ua><![CDATA[Потрійний сет трусиків "Aida" MagBaby світло-рожевий 116 (5-6 роки) (3043)]]></name_ua></offer>' +
            '<offer id="6717" a="1"><name><![CDATA[x]]></name><name_ua><![CDATA[y]]></name_ua></offer>';
  Logger.log(rzRuFix2_(x));
}


// ═══════════ ROZETKA 28.10.2026: колготки — у параметрі «Розмір» (= «Зріст» на Rozetka) вік → зріст ═══════════
// Коментар модератора: «виправити параметр зріст — не правильне значення (вік вказано)».
// Відповідність вік→зріст — з назв одягу MagBaby (0-1 міс 56, 0-3 62, 3-6 68, 6-9 74, 9-12 80, 12-18 86, 18-24 92, 2-3р 98, 3-4р 104, 4-5р 110, 5-6р 116).
const RZ_KOLG_H = {'0-6 міс':'56-68см','6-12 міс':'74-80см','12-18 міс':'86см','18-24 міс':'92см','1-2 роки':'86-92см','2-3 роки':'98см','3-4 роки':'104см','4-5 роки':'110см','5-6 роки':'116см'};
function rzKolgFix_(xml) {
  let n = 0;
  const out = xml.replace(/<offer id="(\d+)"([^>]*)>([\s\S]*?)<\/offer>/g, function (all) {
    if (!/<name_ua><!\[CDATA\[Колготки /.test(all)) return all;
    return all.replace(/<param name="Розмір"([^>]*)>([^<]*)<\/param>/, function (p, at, val) {
      const h = RZ_KOLG_H[val.trim()];
      if (!h) return p;
      n++;
      return '<param name="Розмір"' + at + '>' + h + '</param>';
    });
  });
  Logger.log('rzKolgFix_: ' + n + ' колготок');
  return out;
}


// ═══════════ META (Facebook/Instagram): фід ЛИШЕ власного складу (28.10.2026) ═══════════
// Товари, які LETIMO закупив (накладні → таблиця «LETIMO — штрихкоди товарів»): Apawwa, Clibee, American Club, Talvi, Timi Tex.
// Джерело — Google-фід Horoshop (у Facebook-фіді Horoshop взуття немає взагалі).
// item_group_id — з Facebook-фіду Horoshop, а для взуття — артикул без розміру (ABD0026R-BLACK-23 → ABD0026R-BLACK).
// g:size / g:color — з таблиці штрихкодів (за артикулом або штрихкодом). Публікація: meta-own.xml у GitHub Pages.
const META_OWN_BRANDS = /<g:brand>(Apawwa|Clibee|American Club|Talvi|Timi Tex)<\/g:brand>/;
const META_GFEED = 'https://letimo.com.ua/marketplace-integration/google-feed/b573742161465e3a2deba881f9129298';
const META_FBFEED = 'https://letimo.com.ua/marketplace-integration/facebook/6d27c03839f164211951fa5924f9df34?langId=3';
const META_BARCODE_SHEET = '12dfaYUwc1otAHl2kPBnfHXAC9rYJGll5QJR9QxjTfQ0';

function metaEsc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function buildMetaOwn_() {
  const g = UrlFetchApp.fetch(META_GFEED, { muteHttpExceptions: true }).getContentText();
  const all = g.match(/<item>[\s\S]*?<\/item>/g) || [];
  if (all.length < 100) throw new Error('Google-фід Horoshop порожній або недоступний: ' + all.length);
  const grp = {};
  try {
    const fb = UrlFetchApp.fetch(META_FBFEED, { muteHttpExceptions: true }).getContentText();
    (fb.match(/<item>[\s\S]*?<\/item>/g) || []).forEach(function (x) {
      const id = (x.match(/<g:id>([^<]*)/) || [])[1], gr = (x.match(/<g:item_group_id>([^<]*)/) || [])[1];
      if (id && gr) grp[id] = gr;
    });
  } catch (e) { Logger.log('fb-feed: ' + e.message); }
  const byArt = {}, byBc = {};
  try {
    const rows = SpreadsheetApp.openById(META_BARCODE_SHEET).getSheetByName('Штрихкоди').getDataRange().getValues();
    rows.slice(1).forEach(function (r) {
      const v = { size: String(r[4] || '').trim(), color: String(r[5] || '').trim() };
      if (r[2]) byArt[String(r[2]).trim()] = v;
      if (r[6]) byBc[String(r[6]).trim()] = v;
    });
  } catch (e) { Logger.log('barcode sheet: ' + e.message); }
  let nGrp = 0, nSize = 0;
  const items = all.filter(function (x) { return META_OWN_BRANDS.test(x) || !!byArt[((x.match(/<g:id>([^<]*)/) || [])[1] || '').trim()]; } /* 30.10.2026: + будь-який товар із таблиці штрихкодів (власний склад, напр. ДоРечі за накладною) */).map(function (x) {
    const id = (x.match(/<g:id>([^<]*)/) || [])[1] || '';
    const gtin = (x.match(/<g:gtin>([^<]*)/) || [])[1] || '';
    const add = [];
    let gr = grp[id];
    if (!gr) { const mm = id.match(/^([A-Z0-9][A-Z0-9\-]*-[A-Z]+)-\d{2}$/); if (mm) gr = mm[1]; }
    if (gr && x.indexOf('<g:item_group_id>') < 0) { add.push('<g:item_group_id>' + metaEsc_(gr) + '</g:item_group_id>'); nGrp++; }
    const v = byArt[id] || byBc[id] || (gtin && byBc[gtin]);
    if (v) {
      if (v.size && x.indexOf('<g:size>') < 0) { add.push('<g:size>' + metaEsc_(v.size) + '</g:size>'); nSize++; }
      if (v.color && x.indexOf('<g:color>') < 0) add.push('<g:color>' + metaEsc_(v.color) + '</g:color>');
    }
    return add.length ? x.replace('</item>', '\t' + add.join('\n\t') + '\n</item>') : x;
  });
  const head = g.slice(0, g.indexOf('<item>'));
  const tail = g.slice(g.lastIndexOf('</item>') + 7);
  Logger.log('meta-own: ' + items.length + ' товарів, group ' + nGrp + ', size ' + nSize);
  return head + items.join('\n') + tail;
}

function publishMetaOwn() {
  const x = buildMetaOwn_();
  ghPublish_({ 'meta-own.xml': x }, 'meta-own ' + Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm'));
  return 'meta-own OK';
}

function setupMetaOwnTrigger() {
  ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'publishMetaOwn'; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('publishMetaOwn').timeBased().everyHours(4).create();
  return 'OK';
}


// ===== Kasta: знижка 5% на власний склад (для Outlet/акцій) + розміри 0-3/3-6 міс (29.10.2026)
const KASTA_OWN_BRANDS = /^(Talvi|Timi Tex|Apawwa|Clibee|American Club)$/;
const KASTA_OWN_DISC = 5; // %
// 31.10.2026: + ДоРечі з власного складу (рах. №754) — id пропозицій у фідах (з фіду ДоРечі)
const KASTA_OWN_IDS = ['98837654','98554708','98554702','98554735','98327061','98327088','98327094','98327121','98754047','91951667','91951690','91951692','97403420','97403443','97403445','97403447','92080489','98235219'];
function kastaOwnSale_(xml) {
  let n = 0;
  xml = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    const v = (o.match(/<vendor>(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?<\/vendor>/) || [])[1] || '';
    const oid = (o.match(/<offer\b[^>]*\bid="(?:rzid_)?([^"]+)"/) || [])[1] || '';
    if (TV_DROP_IDS_[oid]) return o; // Talvi-дроп — не власний склад, без знижки
    if (!KASTA_OWN_BRANDS.test(v) && KASTA_OWN_IDS.indexOf(oid) < 0) return o;
    const p = Number((o.match(/<price>([\d.]+)<\/price>/) || [])[1]);
    if (!(p > 0)) return o;
    const np = Math.round(p * (1 - KASTA_OWN_DISC / 100));
    n++;
    return o.replace(/<price>[^<]*<\/price>/, '<price>' + np + '</price>').replace(/<price_old>[^<]*<\/price_old>/, '<price_old>' + p + '</price_old>');
  });
  Logger.log('Kasta own sale: ' + n);
  return xml;
}
function kastaSizeFix_(xml) {
  const map = { '0-3 міс': '62см', '3-6 міс': '68см' };
  xml = xml.replace(/(<param name="Розмір"[^>]*>)(0-3 міс|3-6 міс)(<\/param>)/g, function (a, b, s, c) { return b + map[s] + c; });
  // 31.10.2026: Kasta не знає розмірів через слеш (74/80, 86/92, 56/62) — SIZE_NOT_FOUND у звіті фіда.
  // Сітка Kasta «по росту» має лише одиничні значення (74см, 80см…), тож даємо верхню межу: 74/80 → 80см.
  xml = xml.replace(/(<param name="Розмір"[^>]*>)(\d{2,3})\/(\d{2,3})(<\/param>)/g, function (a, b, lo, hi, c) { return b + hi + 'см' + c; });
  // 31.10.2026: шапки Talvi «світлий хакі» (6088, 6103) — Kasta не співставляє колір «світлий» → «хакі».
  xml = xml.replace(/(<offer id="(?:6088|6103)"(?:(?!<\/offer>)[\s\S])*?<param name="Колір">)світлий(<\/param>)/g, '$1хакі$2');
  return xml;
}
function testKastaOwn() {
  MP_PCT_ = MP_MARKUP.kasta;
  const kx = kastaOwnSale_(kastaSizeFix_(tvBarcode_(kastaSplit_(buildKasta_()))));
  const own = (kx.match(/<vendor>(?:<!\[CDATA\[)?(Talvi|Timi Tex|Apawwa|Clibee|American Club)/g) || []).length;
  Logger.log('own offers: ' + own + ' | 0-3 міс left: ' + (kx.match(/>0-3 міс</g) || []).length);
  const i = kx.indexOf('Talvi'); Logger.log(kx.slice(kx.lastIndexOf('<offer', i), kx.lastIndexOf('<offer', i) + 600).replace(/<description_ua>[\s\S]*?<\/description_ua>/, ''));
}


// 31.10.2026: діагностика MagBaby — чи всі дешеві (< 500) мають комісію у фідах
function mbDiag() {
  const p1 = p1ByArt_();
  const src = UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8');
  const site = {};
  src.split('<offer ').slice(1).forEach(function (o) {
    if (!/<vendor>\s*MagBaby\s*</.test(o)) return;
    const id = (o.match(/id="([^"]+)"/) || [])[1];
    const art = ((o.match(/<vendorCode>([^<]*)/) || [])[1] || '').trim();
    site[id] = { art: art, sp: parseFloat((o.match(/<price>([\d.]+)/) || [])[1]), p1: p1[art] };
  });
  const out = {};
  [['prom', 18], ['rozetka', 24.5], ['kasta', 22]].forEach(function (fp) {
    const t = UrlFetchApp.fetch('https://dklyminc-create.github.io/letimo-feeds/' + fp[0] + '.xml', { muteHttpExceptions: true }).getContentText('UTF-8');
    const pr = {};
    t.split('<offer ').slice(1).forEach(function (o) { const id = (o.match(/id="(?:rzid_)?([^"]+)"/) || [])[1]; pr[id] = parseFloat((o.match(/<price>([\d.]+)/) || [])[1]); });
    const s = { mb: 0, noP1: 0, cheap: 0, cheapOk: 0, cheapBad: 0, dear: 0, dearOk: 0, notInFeed: 0, bad: [] };
    Object.keys(site).forEach(function (id) {
      const r = site[id]; s.mb++;
      if (!(r.p1 > 0)) { s.noP1++; const g = pr[id]; if (g === undefined) { s.np_missFeed = (s.np_missFeed || 0) + 1; return; } const q = g / r.sp; const k = (r.sp < 500 ? 'cheap_' : 'dear_') + (q < 0.99 ? 'lt' : q < 1.01 ? 'eq' : Math.abs(q - (1 + fp[1] / 100)) < 0.02 ? 'full' : 'other'); s[k] = (s[k] || 0) + 1; if (k === 'cheap_eq' && (s.npEx = s.npEx || []).length < 5) s.npEx.push(r.art + ' ' + r.sp + ' ' + g); return; }
      if (pr[id] === undefined) { s.notInFeed++; return; }
      const exp = Math.round(r.p1 * (1 + fp[1] / 100));
      const ok = Math.abs(pr[id] - exp) <= 1;
      if (r.p1 < 500) { s.cheap++; if (ok) s.cheapOk++; else { s.cheapBad++; if (s.bad.length < 5) s.bad.push(r.art + ' p1 ' + r.p1 + ' feed ' + pr[id]); } }
      else { s.dear++; if (ok) s.dearOk++; }
    });
    out[fp[0]] = s;
  });
  Logger.log('MBDIAG ' + JSON.stringify(out));
}


// ===== 31.10.2026: Rozetka — виправлення за причинами модерації (тільки фід Rozetka) =====
// 1) Товари, приховані за фото («На фото асортимент», «Фото не відповідає вимогам», «інший колір/вік на фото») — не вивантажуємо в Rozetka.
const RZ_PHOTO_EXCLUDE = '6106,6102,6097,6107,6099,6101,7525,7483,7515,7454,7561,7446,7205,7078,6906,6553,7082,7338,6952,7428,6962,6737,6233,6833,7404,6695,6295,7343,6897,6197,6474,6529,6158,6601,6354,7073,6511,7327,7066,6404,7589,6551,7137,7189,6279,7397,7316,7380,6826,6288,6480,6680,6932,6743,6213,6185,6917,6758,7362,6355,6294,6377,6503,6356,7055,6872,6770,7122,7594,7427,7246,6308,7142,6338,6682,6982,6538,6583,6708,6635,6567,7084,763,606,764,3591,2656,903,2326,1632,2087,2659,2324,905,2089,1648,2657,1631,2329,2325,2658,906,1649,2328,907,2090,2088,904,2327,1630,1336,2350,2351,3512,2650,836,1654,4697,4696,2651,1665,1655,1338,835,1726,1656,1727,1666,1337'.split(',');
// 2) Тренувальні труси: розмір за вагою -> зріст (модератор: «виправити параметр зріст»). Зріст — за медіанами ВООЗ для цієї ваги.
const RZ_TRAIN_H = { '1': '62-80 см', '2': '74-98 см', '3': '86-104 см' };
// 3) Пінетки Apawwa FD120: вік і зріст за довжиною устілки (18 = 11 см, 20 = 12,3 см, 21 = 13 см).
const RZ_FD120 = { '18': ['9-12 міс', '74-80 см'], '19': ['12-18 міс', '80-86 см'], '20': ['12-18 міс', '80-86 см'], '21': ['18-24 міс', '86-92 см'] };
function rzSetParam_(o, name, val) {
  const re = new RegExp('<param name="' + name + '">[^<]*<\\/param>');
  return re.test(o) ? o.replace(re, '<param name="' + name + '">' + val + '</param>') : o.replace(/<\/offer>\s*$/, '<param name="' + name + '">' + val + '</param>\n</offer>');
}
function rzSetSizeInNames_(o, oldS, newS) {
  return o.replace(/(<name(?:_ua)?>(?:<!\[CDATA\[)?)([\s\S]*?)((?:\]\]>)?<\/name(?:_ua)?>)/g, function (a, b, n, c) {
    let t = oldS && n.indexOf(oldS) >= 0 ? n.split(oldS).join(newS) : n.replace(/\s*(\(\d+\))\s*$/, ' ' + newS + ' $1');
    return b + t + c;
  });
}
function rzTrRu_(ua, vendor) {
  const cache = CacheService.getScriptCache(); const key = 'rztr_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, ua, Utilities.Charset.UTF_8));
  const hit = cache.get(key); if (hit) return hit;
  let ru = null;
  try {
    const parts = vendor ? ua.split(vendor) : [ua];
    ru = parts.map(function (p) {
      const m = p.match(/^(.*?)(\s*\(\d+\)\s*)?$/); const body = m[1], tail = m[2] || '';
      return (/[А-Яа-яІіЇїЄєҐґ]/.test(body) ? LanguageApp.translate(body, 'uk', 'ru') : body) + tail;
    }).join(vendor || '');
  } catch (e) { ru = null; }
  if (ru) cache.put(key, ru, 21600);
  return ru;
}
function rzModFix_(xml) {
  const st = { excl: 0, train: 0, newborn: 0, dr: 0, fd: 0, ru: 0, ruFail: 0 };
  let trBudget = 400;
  xml = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    const id = (o.match(/<offer\b[^>]*\bid="(?:rzid_)?([^"]+)"/) || [])[1] || '';
    if (RZ_PHOTO_EXCLUDE.indexOf(id) >= 0) { st.excl++; return ''; }
    const ua = (o.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) || [])[1] || '';
    const sz = (o.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1] || '';
    let m;
    if ((m = sz.match(/^([123]) \((\d+-\d+) кг\.?\)$/)) && /трус/i.test(ua)) {
      const h = RZ_TRAIN_H[m[1]]; o = rzSetParam_(o, 'Розмір', h); o = rzSetSizeInNames_(o, sz, h + ' (' + m[2] + ' кг)'); st.train++;
    } else if ((sz === '-' || sz === '') && /комплект в пологовий/i.test(ua)) {
      o = rzSetParam_(o, 'Розмір', '56 см'); o = rzSetSizeInNames_(o, '', '56 см'); st.newborn++;
    } else if ((sz === '-' || sz === '') && /Комбінезон зимовий Діскавері/.test(ua)) {
      o = rzSetParam_(o, 'Розмір', '56-74 см'); o = rzSetSizeInNames_(o, '', '56-74 см'); st.dr++;
    } else if ((sz === '-' || sz === '') && /Пінетки зимові Леопард/.test(ua)) {
      o = rzSetParam_(o, 'Розмір', '0-18 міс'); o = rzSetSizeInNames_(o, '', '0-18 міс'); st.dr++;
    } else if (/Apawwa FD120/.test(ua) && RZ_FD120[sz]) {
      o = rzSetParam_(o, 'Вік дитини', RZ_FD120[sz][0]); o = rzSetParam_(o, 'Зріст', RZ_FD120[sz][1]); st.fd++;
    }
    // Назва RU = назва UA (українською) -> модератор ховає «Назва і Назва (ua) не співпадають»: перекладаємо RU
    if (/колготк|шкарпет/i.test(ua)) { const hh = rzAgeH_(sz); if (hh) { o = rzSetParam_(o, 'Зріст', hh); st.ageH = (st.ageH || 0) + 1; } } // 04.11.2026: Rozetka вимагає зріст, а не вік
    const ru = (o.match(/<name>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name>/) || [])[1] || '';
    const ua2 = (o.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) || [])[1] || '';
    if (ru && (ru === ua2 || rzRuBad_(ru, ua2)) && trBudget-- > 0) { // 04.11.2026: і коли RU-назва з іншою структурою (модерація: «назви мають повністю співпадати»)
      const vendor = ((o.match(/<vendor>(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?<\/vendor>/) || [])[1] || '').trim();
      const t = rzTrRu_(ua2, vendor);
      if (t && t !== ua2) { o = o.replace(/<name>[\s\S]*?<\/name>/, function () { return '<name><![CDATA[' + t + ']]></name>'; }); st.ru++; } else st.ruFail++;
    }
    return o;
  });
  Logger.log('rzModFix_: ' + JSON.stringify(st));
  return xml;
}


function rzModTest() {
  MP_PCT_ = MP_MARKUP.rozetka;
  const x = rzModFix_(tvBarcode_(rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_()))))));
  const n = (x.match(/<offer /g) || []).length;
  const pick = function (id) { const o = (x.match(new RegExp('<offer id="' + id + '"[\\s\\S]*?<\\/offer>')) || [''])[0]; return id + ' | ' + ((o.match(/<name>([\s\S]*?)<\/name>/) || [])[1] || '-') + ' | ' + ((o.match(/<name_ua>([\s\S]*?)<\/name_ua>/) || [])[1] || '-') + ' | ' + (o.match(/<param name="(Розмір|Вік дитини|Зріст)">[^<]*<\/param>/g) || []).join(' '); };
  Logger.log('RZTEST offers ' + n + '\n' + ['2883', '3022', '6066', '98235379', '98235405', '6106'].map(pick).join('\n'));
}


// 01.11.2026 перевірка: ДоРечі = дроп ×2
function testDrX2() {
  const dr = drOffers_();
  const out = [];
  dr.offers.slice(0, 400).forEach(function (o) {
    const art = hsUnesc_(hsTag_(o, 'vendorCode'));
    if (!/^(DR-1908-15|DR-1906-15|DR-1842-F|DR-1810-F|DR-2087|DR-2010-48|DR-2106|DR-2030)$/.test(art)) return;
    const p = Number(hsTag_(o, 'price'));
    out.push(art + ' site=' + p + ' rz=' + mpPrice_(art, '', p, 24.5) + ' prom=' + mpPrice_(art, '', p, 18));
  });
  Logger.log('offers ' + dr.offers.length + '\n' + out.join('\n'));
}

// 01.11.2026: оновити ціни/наявність ДоРечі на сайті без створення нових товарів
function hsSyncDorechiPricesOnly() { return hsSyncDorechi(0); }

function hsCheckDrPrices() {
  const j = hsCall_('catalog/export', { token: hsToken_(), article: ['DR-2087', 'DR-2106', 'DR-1908-15', 'DR-2010-48'], limit: 10 });
  Logger.log(j.status + ' ' + (j.response && j.response.products || []).map(function (p) { return p.article + '=' + JSON.stringify(p.price); }).join(' | '));
  const r = hsCall_('catalog/import', { token: hsToken_(), products: [{ article: 'DR-2106', price: 210 }] });
  Logger.log('import: ' + JSON.stringify(r).slice(0, 600));
}

// 01.11.2026: ціни ДоРечі на сайті = дроп ×2 (власний склад — DR_OWN_PRICE_). Лише ціна, лише товари, що вже є на сайті (за фідом сайту)
function hsDrPricesX2() {
  const site = UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8');
  const onSite = {};
  site.replace(/<vendorCode>(?:<!\[CDATA\[)?\s*(DR-[^<\]\s]+)/g, function (a, art) { onSite[art] = 1; return a; });
  const upd = [];
  hsDrItems_().forEach(function (it) { if (onSite[it.art] && it.price > 0) upd.push({ article: it.art, price: it.price }); });
  let ok = 0; const err = [];
  for (let i = 0; i < upd.length; i += 25) {
    const j = hsCall_('catalog/import', { token: hsToken_(), products: upd.slice(i, i + 25) });
    if (j.status !== 'OK' && j.status !== 'WARNING') { err.push(j.status); continue; }
    ((j.response && j.response.log) || []).forEach(function (l) { if ((l.info || []).some(function (x) { return Number(x.code) === 0; })) ok++; else err.push(l.article + ': ' + JSON.stringify(l.info).slice(0, 120)); });
  }
  Logger.log('on site ' + Object.keys(onSite).length + ', to update ' + upd.length + ', ok ' + ok + ', errors ' + err.length + ' ' + err.slice(0, 10).join(' | '));
  Logger.log(upd.filter(function (u) { return /^(DR-2087|DR-2010-48|DR-2106|DR-1908-15|DR-2030|DR-1842-F)$/.test(u.article); }).map(function (u) { return u.article + '=' + u.price; }).join(', '));
}

// 01.11.2026: розміри власного складу з нульовим залишком у SalesDrive -> «Немає в наявності» на сайті (звідти — у всі фіди)
function hsOutOfStock0111() {
  const arts = ['TV-03645-CHORN-4648','TV-03645-CHORN-4850','TV-03645-BEZH-4648','TV-03645-BIL-4850','TV-05293-KOR-5052','ABD0166R-BEIGE-25','ABD0166R-BEIGE-28','ABD0166R-BLACK-23','ABD0166R-BLACK-27','ABD0026R-BLACK-27','ABQ0771R-CAMEL-23','FD120-WHITE-19'];
  const j = hsCall_('catalog/import', { token: hsToken_(), products: arts.map(function (a) { return { article: a, presence: 'Немає в наявності' }; }) });
  Logger.log(j.status + ' ' + ((j.response && j.response.log) || []).map(function (l) { return l.article + ':' + (l.info || []).map(function (x) { return x.code + ' ' + x.message; }).join(';'); }).join(' | '));
}


// 01.11.2026 — тест: додати 1 AI-фото (Higgsfield) до 1 товару Timi Tex через API, без перезапису наявних
function hsPhotoTest1() {
  const url = 'https://d8j0ntlcm91z4.cloudfront.net/user_3L25UGJgYE0Ow5V3oAWDkwqiEds/hf_20261101_151642_2de6e51f-39c2-45c1-bc8a-371249bec201.png';
  const r = hsCall_('catalog/import', { token: hsToken_(), products: [{ article: '4820000272414', images: { override: false, links: [url] } }] });
  Logger.log(JSON.stringify(r).slice(0, 1500));
}


// 01.11.2026 — AI-фото Timi Tex (Higgsfield) третім кадром на всі 76 модифікацій; наявні фото не чіпаємо (override:false)
const TT_PHOTO_ART_ = {"4820000300384":0,"4820000299572":1,"4820000272414":2,"4820000273305":3,"4820000271332":4,"4820000255318":4,"4820000301954":5,"4820000301961":5,"4820000260930":6,"4820000255127":6,"4820000255028":6,"4820000260640":7,"4820000260763":7,"4820000260701":7,"4820000291057":8,"4820000291002":8,"4820000273794":9,"4820000275736":9,"4820000295086":10,"4820000263313":11,"4820000263320":11,"4820000273787":12,"4820000275699":12,"4820000273701":13,"4820000275934":13,"4820000286848":14,"4820000291712":14,"4820000287074":15,"4820000293778":15,"4820000286831":16,"4820000294270":16,"4820000291729":17,"4820000273763":18,"4820000291781":18,"4820000295109":19,"4820000263870":20,"4820000291705":20,"4820000273817":21,"4820000294041":21,"4820000298407":22,"4820000309172":23,"4820000311892":24,"4820000311885":24,"4820000311922":25,"4820000312929":25,"4820000301336":26,"4820000301381":26,"4820000290647":27,"4820000311809":28,"4820000052023":29,"4820000052030":29,"4820000301817":30,"4820000273732":31,"4820000275927":31,"4820000263351":32,"4820000276337":32,"4820000293754":33,"4820000291996":34,"4820000299213":35,"4820000298018":36,"4820000294089":37,"4820000285476":38,"4820000285506":38,"4820000285490":39,"4820000309776":40,"4820000309783":40,"4820000309790":40,"4820000280761":41,"4820000280815":41,"4820000280853":41,"4820000280785":42,"4820000279895":42,"4820000279987":42,"4820000280808":43,"4820000280846":43,"4820000280884":43};
const TT_PHOTO_URL_ = {"0":"20261101_152136_60b13201-eefd-4d21-8a3c-7720c3c28201.png","1":"20261101_152056_58ba929d-b29d-4598-b53d-637c1e12c258.png","2":"20261101_151642_2de6e51f-39c2-45c1-bc8a-371249bec201.png","3":"20261101_152139_9aea691f-4c9d-4a9d-82fb-ef6ec79f66d0.png","4":"20261101_152345_0ec11366-8ed1-466b-93a9-0afb3e708fe4.png","5":"20261101_152058_836eb10c-09d9-4714-a456-3def8af86025.png","6":"20261101_152136_24cd590f-cbae-4122-8a85-98e872adedfa.png","7":"20261101_152057_f3436dd3-7e56-4ee8-906c-5fd4384d77f6.png","8":"20261101_152058_77041811-c5e1-42be-9d75-0b3cf4802d9b.png","9":"20261101_152057_baadfb21-b126-4463-897f-7848ee978e0a.png","10":"20261101_152058_b53e1563-816d-448a-bbb4-8b85edda308d.png","11":"20261101_152136_fbf17077-db4d-4938-be99-5e6e2e1a50df.png","12":"20261101_152346_ac829d72-e042-4fff-a73c-9f36545eb7a1.png","13":"20261101_152239_27022351-84a6-4da5-bee2-50721284cffe.png","14":"20261101_152239_ade67585-e2fb-4929-b042-35a8096b116a.png","15":"20261101_152239_2f303a80-9205-421f-991c-e0c78b9f796d.png","16":"20261101_152238_a464bf22-9d98-43e3-a014-21e84734b371.png","17":"20261101_152240_68c554e0-7d7f-43fe-acb5-b4f9e0026503.png","18":"20261101_152238_7fc89a8e-253d-48bf-83af-a724e0dfb7a7.png","19":"20261101_152238_9eef7d0c-e6b1-45e5-a98e-c058ea07c511.png","20":"20261101_152238_1c6cff5d-db34-44e3-9394-81ec8dabd27f.png","21":"20261101_152345_0ad325a4-9fee-4231-941e-d85467f5f7b5.png","22":"20261101_152345_b76e97bb-0367-48ca-83e6-5a8c72f8857b.png","23":"20261101_152346_6f067e0f-d5be-40ba-bd04-728eb09bcdc5.png","24":"20261101_152344_ae7ffaea-0cd8-47af-ac52-7b397709df78.png","25":"20261101_152345_38416c38-6206-4f6a-9786-0f56f5f8b16c.png","26":"20261101_152446_d6e42044-470c-4146-9432-7ae3f736fba8.png","27":"20261101_152445_12369277-4d9e-4746-a6c9-65c26437a344.png","28":"20261101_152445_a3054bb5-c776-48e7-a390-a4d2433a81b0.png","29":"20261101_152718_52761e97-ff25-4fdd-8fbd-4b868097c67b.png","30":"20261101_152718_0bf7253c-0a00-4596-a763-5f8f6b0e0b3d.png","31":"20261101_152717_82eb1a07-0b51-4ec1-a3ad-a57de1dd3d6e.png","32":"20261101_152719_3c1319d1-cd3a-49dd-8e91-a308a80e8aeb.png","33":"20261101_152541_27d8fb14-0576-4cc6-b950-6b9e45aaad9c.png","34":"20261101_152540_3620e37f-3f5c-4374-b766-ee42406020ec.png","35":"20261101_152718_2939f835-56a4-4b7f-913c-7eb9a8b98d55.png","36":"20261101_152540_ac17a9f8-4440-43e8-90f8-f0cd475bd9a0.png","37":"20261101_152718_7ed7feb4-3327-4e94-a2b0-783dc52b0b4e.png","38":"20261101_152539_464012cb-7439-487e-a406-f3589e4744cb.png","39":"20261101_152540_dc952d69-5b11-4542-a38a-a5124b027e78.png","40":"20261101_152751_96d5c970-e5f3-4706-90cd-94164ebf19a0.png","41":"20261101_152738_756f8582-e968-4ce2-99d3-4e60878134ec.png","42":"20261101_152734_f4cfca74-c95a-4868-b51d-26756f90c3ca.png","43":"20261101_152734_08cfed8c-57fe-4fb0-bfc9-b484b6ba6df6.png"};
function hsPhotoTimiAll() {
  const base = 'https://d8j0ntlcm91z4.cloudfront.net/user_3L25UGJgYE0Ow5V3oAWDkwqiEds/hf_';
  const arts = Object.keys(TT_PHOTO_ART_).filter(function (a) { return a !== '4820000272414'; }); // цей вже зроблено тестом
  let ok = 0, bad = [];
  for (let i = 0; i < arts.length; i += 8) {
    const chunk = arts.slice(i, i + 8);
    const r = hsCall_('catalog/import', { token: hsToken_(), products: chunk.map(function (a) { return { article: a, images: { override: false, links: [base + TT_PHOTO_URL_[TT_PHOTO_ART_[a]]] } }; }) });
    const log = (r && r.response && r.response.log) || [];
    chunk.forEach(function (a) {
      const e = log.filter(function (x) { return String(x.article) === a; })[0];
      const good = e && (e.info || []).some(function (x) { return x.code === 22; });
      if (good) ok++; else bad.push(a + ':' + JSON.stringify(e || r).slice(0, 200));
    });
  }
  Logger.log('ok ' + ok + ' / ' + arts.length + (bad.length ? '\nBAD:\n' + bad.join('\n') : ''));
}


// 01.11.2026 — 2-га хвиля: AI-фото «річ на пледі» (flat-lay) четвертим кадром; кокон (idx 0) пропущено свідомо
const TT_FLAT_URL_ = {"1":"20261101_155252_b0756c07-a5c8-4a46-8335-244678fe6c89.png","2":"20261101_155254_c929b162-a320-4a97-ba19-65226fec35f7.png","3":"20261101_155253_3369b85f-6995-4ac7-b1c9-e753ce97603e.png","4":"20261101_155254_e2ed6067-3403-4e5a-a909-476e321f6dd3.png","5":"20261101_155253_814a5729-b973-46f3-91c9-2cf998588f41.png","6":"20261101_155255_0c9aa431-3a79-4200-9dd5-b6f99bdc900f.png","7":"20261101_155430_fd9a873b-20ae-431a-b2e9-07a151695f80.png","8":"20261101_155314_71db1526-c3e2-4d02-9ce9-ae479108f252.png","9":"20261101_155430_c1aad249-53be-4f9a-96af-47d55a689ca7.png","10":"20261101_155430_8b5c05d4-74ae-40d7-b7d0-0c5019f9ea8a.png","11":"20261101_155315_56e0412b-974b-4437-b32e-356d4e99f0c1.png","12":"20261101_155318_a985d8c5-640a-49f3-ad51-59e2fdcf9a0d.png","13":"20261101_155317_64db6395-f7d7-457b-9424-b7f4435f2ae8.png","14":"20261101_155523_33c62e3b-865c-4a5e-9697-3c6839378599.png","15":"20261101_155523_4af9dbff-d46d-4a05-8235-586d323ec4cc.png","16":"20261101_155523_71bdf381-7a2f-424a-8036-7474d8bc9cbb.png","17":"20261101_155522_e8c6d418-5343-4f3b-afba-9581379c36b9.png","18":"20261101_155800_b13d7567-87da-4ed1-90d8-9d9d0eb521a3.png","19":"20261101_155937_fe7e3df4-dd11-4232-966d-59f298754895.png","20":"20261101_160119_880d86aa-e9bb-47b0-82bc-88669c490acf.png","21":"20261101_155936_246d65c2-dc55-45e8-84d4-9862133c8120.png","22":"20261101_155937_61f35472-c730-4859-8e35-fa44deb0b2d3.png","23":"20261101_155938_6b53e28a-593a-43c3-b732-648ccf6da95f.png","24":"20261101_155937_cfad1534-1738-403d-ab8a-895658aaccda.png","25":"20261101_160010_14ea556d-6590-46e9-bef2-46c55baaec43.png","26":"20261101_160010_bfa74ca8-4fbe-4e40-9a96-f789b87759c0.png","27":"20261101_160011_33d03818-3f9f-4699-b0da-e2310e54bedd.png","28":"20261101_160041_294bf025-cf0e-415c-a405-04fc59ee3959.png","29":"20261101_155802_f0ea59e7-014f-45bb-866f-4ec57acd0bef.png","30":"20261101_160041_e908a579-5101-4b0c-827e-a8e5fd9210be.png","31":"20261101_160228_1da1d665-9ee2-4816-8f83-b4cdf5d2b854.png","32":"20261101_160228_1df3a712-b0b6-4371-880e-8ff09d857e51.png","33":"20261101_160119_324038e2-69af-4727-b6cb-35448ffde0ca.png","34":"20261101_160120_094186dc-61b1-4efd-92d5-c9456ad0e827.png","35":"20261101_160228_4a97e1ac-7a8a-4314-a227-d351570f7089.png","36":"20261101_160229_e3356e10-b229-49aa-b223-b6d6df376ded.png","37":"20261101_160229_e93f7618-fe20-4ce9-a4a9-066cf2ef2f69.png","38":"20261101_155759_7119e0d1-41c5-4ea2-818c-3a7705028a8e.png","39":"20261101_155801_8fe69411-a301-426f-b8da-7343a468aadb.png","40":"20261101_155801_d619aaf1-a8f2-4965-9f1a-32197505ee53.png","41":"20261101_155800_fa52c8ed-31af-4ca5-8973-54d28bfff8f6.png","42":"20261101_155801_11c6a254-f3d7-4c55-a86f-ea6832502973.png","43":"20261101_155938_bfcb3455-725a-44d0-97a3-4c41417f9b5d.png"};
function hsPhotoTimiFlat() {
  const base = 'https://d8j0ntlcm91z4.cloudfront.net/user_3L25UGJgYE0Ow5V3oAWDkwqiEds/hf_';
  const arts = Object.keys(TT_PHOTO_ART_).filter(function (a) { return TT_FLAT_URL_[String(TT_PHOTO_ART_[a])]; });
  let ok = 0, bad = [];
  for (let i = 0; i < arts.length; i += 8) {
    const chunk = arts.slice(i, i + 8);
    const r = hsCall_('catalog/import', { token: hsToken_(), products: chunk.map(function (a) { return { article: a, images: { override: false, links: [base + TT_FLAT_URL_[String(TT_PHOTO_ART_[a])]] } }; }) });
    const log = (r && r.response && r.response.log) || [];
    chunk.forEach(function (a) {
      const e = log.filter(function (x) { return String(x.article) === a; })[0];
      const good = e && (e.info || []).some(function (x) { return x.code === 22; });
      if (good) ok++; else bad.push(a + ':' + JSON.stringify(e || r).slice(0, 200));
    });
  }
  Logger.log('ok ' + ok + ' / ' + arts.length + (bad.length ? '\nBAD:\n' + bad.join('\n') : ''));
}


// 01.11.2026 вечір — продано 3 пари Apawwa (списання SalesDrive №7), автосинхронізація не зняла наявність
function hsOutOfStock0111b() {
  const arts = ['ABD5521R-BLACK-22', 'ABD0026R-BLACK-28', 'ABD0166R-BLACK-28'];
  const r = hsCall_('catalog/import', { token: hsToken_(), products: arts.map(function (a) { return { article: a, presence: 'Немає в наявності' }; }) });
  Logger.log(JSON.stringify(r).slice(0, 1500));
}


// ===== 01.11.2026: ГРУПУВАННЯ НА ROZETKA для власних брендів =====
// Правила групування Rozetka (кабінет → Управління товарами → Правила групування):
// одяг малюків (чоловічки, комплекти, боді, конверти, пісочники, плаття, гольфи, футболки, светри, піжами) — Колір + Зріст;
// шапки — Колір + Окружність голови; пінетки — Колір + Вік; взуття — Колір + Розмір (вже є).
// Значення й id — з довідників категорій Rozetka (download-options) станом на 01.11.2026.
const RZG_BRANDS_ = /^(Timi Tex|Talvi|Apawwa|Clibee|American Club)$/;
const RZG_CLOTH_ = [4646072, 4635767, 4635623, 195407, 4636879, 4635631, 4654673, 4636407, 4636927, 4636551, 4637087, 4636255, 4636735];
const RZG_HEIGHT_ = {"56":1132079,"62":1132087,"68":1132095,"74":1013055,"80":1014021,"86":1013818,"92":1013664,"98":1013216,"104":1013685,"110":1013363,"116":1013636};
const RZG_HEAD_ = {"36":3518575,"37":3518581,"38":3518587,"39":3518593,"40":3518599,"41":3518605,"42":3518611,"43":3518617,"44":3518623,"45":3518629,"46":3518635,"47":3518641,"48":3518647,"49":3518653,"50":3518659,"51":3518665,"52":3518671,"53":3518677,"54":3518683};
const RZG_AGE_ = {"1 місяць":1416456,"2 місяці":1416464,"3 місяці":1416472,"4 місяці":1416480,"5 місяців":1416488,"6 місяців":1416496,"7 місяців":1416504,"8 місяців":1416512,"9 місяців":1416520,"10 місяців":1416528,"11 місяців":1416536,"1 рік":1416544,"1.5 року":1416552,"2 роки":1416560,"Від народження":1416448};
const RZG_COLOR_ = {"бежевий":["Бежевий",1008148],"чорний":["Чорний",1008470],"білий":["Білий",1008176],"пудровий":["Пудровий",1094473],"персиковий":["Персиковий",1010444],"коричневий":["Коричневий",1008435],"ліловий":["Ліловий",1010430],"молочний":["Молочний",1010395],"кавовий":["Кавовий",1009149],"сірий":["Сірий",1008407],"сливовий":["Сливовий",1008750],"кремовий":["Кремовий",1010416],"темно-синій":["Синій",1008190],"світло-рожевий":["Рожевий",1273336],"рожевий":["Рожевий",1273336],"світло-сірий":["Сірий",1008407],"світло-бежевий":["Бежевий",1008148],"темно-бежевий":["Бежевий",1008148],"комбінований":["Різнобарвний",1008519],"темно-коричневий":["Коричневий",1008435],"графітовий":["Графіт",1009457],"хакі":["Хакі",1008757],"світлий":["Хакі",1008757],"оливковий":["Оливковий",1008743],"гірчичний":["Гірчичний",1008701],"синій":["Синій",1008190]};
// нові категорії Rozetka замість невірних (футболки/светри лежали в «сорочечках для немовлят», піжами — без категорії)
const RZG_NEWCATS_ = {
  990101: [4654673, 'Дитячі гольфи'], 990102: [4636407, 'Футболки для хлопчиків'], 990103: [4636927, 'Футболки для дівчаток'],
  990104: [4636551, 'Светри для хлопчиків'], 990105: [4637087, 'Светри для дівчаток'], 990106: [4636255, 'Піжами для хлопчиків'],
  990107: [4636735, 'Піжами для дівчаток'], 990108: [4635631, 'Пісочники для малюків']
};
function rzgAgeName_(m) { m = +m; if (m === 12) return '1 рік'; if (m === 18) return '1.5 року'; if (m === 24) return '2 роки'; if (m === 1) return '1 місяць'; return m + (m >= 2 && m <= 4 ? ' місяці' : ' місяців'); }
function rzgParam_(o, name, pid, map, vals) {
  const ok = vals.filter(function (v) { return map[v]; });
  if (!ok.length) return o;
  const tag = '<param name="' + name + '" paramid="' + pid + '" valueid="' + ok.map(function (v) { return map[v]; }).join(', ') + '">' + ok.join(', ') + '</param>';
  const re = new RegExp('<param name="' + name + '"[^>]*>[^<]*<\\/param>');
  return re.test(o) ? o.replace(re, tag) : o.replace(/<\/offer>\s*$/, tag + '\n</offer>');
}
function rzGroup_(xml) {
  const rz = {}, parent = {};
  xml.replace(/<category id="(\d+)"([^>]*)>/g, function (a, id, rest) { rz[id] = +((rest.match(/rz_id="(\d+)"/) || [])[1] || 0); parent[id] = (rest.match(/parentId="(\d+)"/) || [])[1] || ''; return a; });
  const stat = { own: 0, height: 0, head: 0, age: 0, color: 0, recat: 0, dup: 0 };
  xml = xml.replace(/<offer id="(\d+)"[^>]*>[\s\S]*?<\/offer>/g, function (o, id) {
    const vendor = (o.match(/<vendor>([^<]*)<\/vendor>/) || [])[1] || '';
    if (!RZG_BRANDS_.test(vendor)) return o;
    stat.own++;
    const cat = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    const nameUa = (o.match(/<name_ua><!\[CDATA\[([\s\S]*?)\]\]><\/name_ua>/) || [])[1] || '';
    o = o.replace(/с рыбаной/g, 'из рибаны').replace(/с кулиром/g, 'из кулира');
    // 1) номер у дужках з назв — заважав групуванню
    o = o.replace(/(<name(?:_ua)?><!\[CDATA\[[\s\S]*?)\s*\(\d+\)(\]\]>)/g, '$1$2');
    // 2) категорія
    let newCat = null, genders = null;
    if (cat === '1124' && /^Гольф/i.test(nameUa)) newCat = ['990101'];
    else if (cat === '1124' && /^Футболк/i.test(nameUa)) newCat = /графіт/i.test(nameUa) ? ['990102'] : /пудр|рож/i.test(nameUa) ? ['990103'] : ['990102', '990103'];
    else if (cat === '1150' && /светр/i.test(nameUa)) newCat = ['990104', '990105'];
    else if (cat === '1148') newCat = ['990106', '990107'];
    else if (cat === '1130' && /^Пісочник/i.test(nameUa)) newCat = ['990108'];
    // 3) колір з id довідника
    const col = ((o.match(/<param name="Колір">([^<]*)<\/param>/) || [])[1] || '').trim().toLowerCase();
    const C = RZG_COLOR_[col];
    if (C) { o = o.replace(/<param name="Колір">[^<]*<\/param>/, '<param name="Колір" paramid="131559" valueid="' + C[1] + '">' + C[0] + '</param>'); stat.color++; }
    // 4) зріст / окружність голови / вік
    const sz = ((o.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1] || '');
    const nums = (sz.match(/\d{2,3}/g) || []);
    const crz = newCat ? RZG_NEWCATS_[newCat[0]][0] : rz[cat];
    if (RZG_CLOTH_.indexOf(crz) >= 0 && nums.length) { const before = o; o = rzgParam_(o, 'Зріст', 131587, RZG_HEIGHT_, nums); if (o !== before) stat.height++; }
    else if (crz === 4669759 && nums.length) { const before = o; o = rzgParam_(o, 'Окружність голови', 232291, RZG_HEAD_, nums); if (o !== before) stat.head++; }
    else if (crz === 4634041) {
      const ag = ((o.match(/<param name="Вік дитини">([^<]*)<\/param>/) || [])[1] || '').match(/(\d+)\s*-\s*(\d+)\s*міс/);
      if (ag) { const before = o; o = rzgParam_(o, 'Вік', 151000, RZG_AGE_, [rzgAgeName_(ag[1]), rzgAgeName_(ag[2])]); if (o !== before) stat.age++; }
    }
    if (!newCat) return o;
    stat.recat++;
    return newCat.map(function (nc, i) {
      let x = o.replace(/<categoryId>\d+<\/categoryId>/, '<categoryId>' + nc + '</categoryId>');
      if (newCat.length > 1) {
        const g = /хлопч/.test(RZG_NEWCATS_[nc][1]) ? [' для хлопчика', ' для мальчика'] : [' для дівчинки', ' для девочки'];
        x = x.replace(/(<name_ua><!\[CDATA\[[\s\S]*?)(\]\]>)/, '$1' + g[0] + '$2').replace(/(<name><!\[CDATA\[[\s\S]*?)(\]\]>)/, '$1' + g[1] + '$2');
        if (i > 0) { x = x.replace(/<offer id="(\d+)"/, '<offer id="98$1"'); stat.dup++; }
      }
      return x;
    }).join('\n');
  });
  const add = Object.keys(RZG_NEWCATS_).map(function (k) { return '<category id="' + k + '" parentId="1157" rz_id="' + RZG_NEWCATS_[k][0] + '">' + RZG_NEWCATS_[k][1] + '</category>'; }).join('\n');
  xml = xml.replace(/<\/categories>/, add + '\n</categories>');
  RZG_STAT_ = stat;
  return xml;
}
var RZG_STAT_ = null;
function testRzGroup() {
  MP_PCT_ = MP_MARKUP.rozetka;
  const x = rzgDedupe_(rzGroup_(rzModFix_(tvBarcode_(rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_()))))))));
  Logger.log(JSON.stringify(RZG_STAT_));
  const names = {}; let dupNames = [];
  x.replace(/<offer id="(\d+)"[^>]*>[\s\S]*?<\/offer>/g, function (o, id) {
    const n = (o.match(/<name_ua><!\[CDATA\[([\s\S]*?)\]\]>/) || [])[1];
    if (n) { if (names[n]) dupNames.push(n); names[n] = 1; }
    return o;
  });
  const ruN={};let ruDup=0;x.replace(/<offer id="\d+"[^>]*>[\s\S]*?<\/offer>/g,function(o){const n=(o.match(/<name><!\[CDATA\[([\s\S]*?)\]\]>/)||[])[1];if(n&&RZG_BRANDS_.test((o.match(/<vendor>([^<]*)<\/vendor>/)||[])[1]||'')){if(ruN[n])ruDup++;ruN[n]=1}return o});Logger.log('own RU dup: '+ruDup);
  Logger.log('dup names total: ' + dupNames.length + ' own: ' + dupNames.filter(function (n) { return /Timi Tex|Talvi|Apawwa|Clibee|American Club/.test(n); }).slice(0, 10).join(' || '));
  ['7629', '7688', '7622', '6081', '6065', '6125'].forEach(function (id) {
    const m = x.match(new RegExp('<offer id="' + id + '"[\\s\\S]*?<\\/offer>'));
    if (m) Logger.log(m[0].replace(/<description[\s\S]*?<\/description(_ua)?>/g, '').replace(/<picture>[^<]*<\/picture>\n?/g, '').slice(0, 900));
  });
}


// дублікати назв після прибирання (id): взуття в обох статях → «для хлопчика/дівчинки», RU без кольору → додаємо колір, решта → повертаємо (id)
const RZG_RU_COL_ = {"Бежевий":"бежевый","Чорний":"черный","Білий":"белый","Пудровий":"пудровый","Персиковий":"персиковый","Коричневий":"коричневый","Ліловий":"лиловый","Молочний":"молочный","Кавовий":"кофейный","Сірий":"серый","Сливовий":"сливовый","Кремовий":"кремовый","Синій":"синий","Рожевий":"розовый","Різнобарвний":"разноцветный","Графіт":"графит","Хакі":"хаки","Оливковий":"оливковый","Гірчичний":"горчичный"};
function rzgDedupe_(xml) {
  const own = function (o) { return RZG_BRANDS_.test((o.match(/<vendor>([^<]*)<\/vendor>/) || [])[1] || ''); };
  const nm = function (o, tag) { return (o.match(new RegExp('<' + tag + '><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>')) || [])[1] || ''; };
  const setNm = function (o, tag, v) { return o.replace(new RegExp('(<' + tag + '><!\\[CDATA\\[)[\\s\\S]*?(\\]\\]>)'), function (a, b, c) { return b + v + c; }); };
  function counts(x) { const c = { name: {}, name_ua: {} }; x.replace(/<offer id="\d+"[^>]*>[\s\S]*?<\/offer>/g, function (o) { ['name', 'name_ua'].forEach(function (t) { const v = nm(o, t); if (v) c[t][v] = (c[t][v] || 0) + 1; }); return o; }); return c; }
  const steps = [
    function (o, tag) { const cat = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1]; const ru = tag === 'name'; if (cat === '11681') return nm(o, tag) + (ru ? ' для девочки' : ' для дівчинки'); if (cat === '11682') return nm(o, tag) + (ru ? ' для мальчика' : ' для хлопчика'); return null; },
    function (o, tag) { if (tag !== 'name') return null; const c = (o.match(/<param name="Колір"[^>]*>([^<]*)<\/param>/) || [])[1]; const ru = RZG_RU_COL_[c]; const n = nm(o, tag); if (ru && n.toLowerCase().indexOf(ru) < 0) return n + ', ' + ru; return null; },
    function (o, tag) { const id = (o.match(/<offer id="(\d+)"/) || [])[1]; return nm(o, tag) + ' (' + id + ')'; }
  ];
  let fixed = 0;
  steps.forEach(function (step) {
    const c = counts(xml);
    xml = xml.replace(/<offer id="\d+"[^>]*>[\s\S]*?<\/offer>/g, function (o) {
      if (!own(o)) return o;
      ['name', 'name_ua'].forEach(function (t) { const v = nm(o, t); if (v && c[t][v] > 1) { const nv = step(o, t); if (nv) { o = setNm(o, t, nv); fixed++; } } });
      return o;
    });
  });
  Logger.log('rzgDedupe_: ' + fixed + ' правок назв');
  return xml;
}


// ===== 01.11.2026 21:55: проданих розмірів НЕ МАЄ бути в наявності в жодному фіді =====
// id товарів сайту (з вивантаження Хорошопу): Фінн чорний 46-48/48-50, Фінн бежевий 46-48, Фінн білий 48-50, Освін коричневий,
// Apawwa ABD0166R beige 25/28, black 23/27/28, ABD0026R black 27/28, ABQ0771R camel 23, FD120 white 19, ABD5521R black 22
const OOS_IDS_ = ['6082','6038','6088','6083','6081','6084','6098','6055','6058','6035','6039','6040','6051','6052','6041','6066','6029']; // 02.11 13:41: 6083 (Фінн чорний 48-50) продано
// Епіцентр використовує артикул як id оферу
const OOS_ARTS_ = ['TV-03645-CHORN-4648','ABD0166R-BLACK-26','TV-02425-SKHAKI-4446','TV-03645-CHORN-4850','TV-03645-BEZH-4648','TV-03645-BIL-4850','TV-05293-KOR-5052','ABD0166R-BEIGE-25','ABD0166R-BEIGE-28','ABD0166R-BLACK-23','ABD0166R-BLACK-27','ABD0166R-BLACK-28','ABD0026R-BLACK-27','ABD0026R-BLACK-28','ABQ0771R-CAMEL-23','FD120-WHITE-19','ABD5521R-BLACK-22'];
function oosHit_(id) {
  if (OOS_ARTS_.indexOf(id) >= 0) return true;
  return OOS_IDS_.some(function (x) { return id === x || id === '9' + x || id === '98' + x || new RegExp('^' + x + '\\D').test(id); });
}
// 02.11.2026: AI-фото Timi Tex — оригінали з вивантаження Хорошопу віддають 404, і мітка AI на сайті не зберігається → прибираємо їх з усіх фідів
const AI_BAD_PICS_ = '84358592311774,22277379029318,27314969279891,13441625702669,68087032756617,98933904844238,30031448600583,37396303222498,29387738550691,66390297283471,94729890883484,48229952088595,61075968281231,12025960159049,39904538331176,42680564809389,20311361194721,37674605096389,62767623046542,50143641087859,45600349052652,99396161912167,30939219896270,91789462050914,25859096450981,65866568876212,42900406098571,97498415277042,36567305264644,65832647561452,42389991476214,94720386783751,41488370815199,56446710542891,92405047756512,87343836568111,59177427003787,60398957210476,14623103307164,33105842014005,96840067975621,26432373970359,53782546015327,83683133031796,56017764567940,12411240633175,95638565783979,59318217703736,82999463360111,16809631489564,57324430784899,83084947868304,96800609497124,19206243552204,16028008156093,26131083709171,25476054785385,51396906206537,64436218270964,13486051539943,17032865931391,13498585984370,52540008683797,48383865971334,82409446666918,68449240222218,56038028890619,81879368671498,93547708145530,50213292479203,70469693029964,52567625357750,21411559921082,48101226304043,52436288782109,63914581364120,75704484078827,81769842531935,94458193211722,35383316729491,46814040606917,32490591868983,81838136687185,59796977156166,11414518346912,56779487616497,71706919577078,53662810654202,74040850768682,85541760925160,29682392812271,66413532670167,16522897990144,52243143733075,59075026705942,74900859351078,52735167476034,17212787143254,49533554293881,39038368097790,13281690183408,80529406382758,70741321320099,49612059439883,53939778036058,77443869672637,68601762752103,30333336339220,81640243361338,52801973101337,15012112662446,46580086510376,42515821780983,46133165747161,34212659539993,51342225771172,43938371290826,12367321548692,17494320047624,59990009313433,95007538278087,24621103040515,37004333782685,39644537644869,36527329832082,73309787514805,67092911963211,33922037592960,74094748518654,61052546035112,50076505408841,21187732734151,14343271321142,43856995314795,99350321512152,29208790404607,22883375477645,50409231233790,30433822710645,75358323374721,66973221340086,18912738185301,24896160415189,65939133331472,93663406435095,77873517948668,98716365186506,83545745564333,56267386887075,87995358309026,71103968323734'.split(',').reduce(function (o, k) { o[k] = 1; return o; }, {});
function aiPicStrip_(xml) {
  var n = 0;
  var out = xml.replace(/[ \t]*<([a-zA-Z:_]+)>[^<]*?\/(\d{14})_\+[0-9a-f]+\.png[^<]*<\/\1>\s*?\n?/g, function (s, tag, id) {
    if (!AI_BAD_PICS_[id]) return s; n++; return '';
  });
  Logger.log('aiPicStrip_: ' + n + ' pictures removed');
  return out;
}
function oosPatch_(xml) {
  xml = aiPicStrip_(xml);
  var n = 0;
  var out = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    var mm = o.match(/^<offer\b[^>]*\bid="([^"]+)"/);
    if (!mm || !oosHit_(mm[1])) return o;
    n++;
    o = o.replace(/^(<offer\b[^>]*?)\savailable="[^"]*"/, '$1').replace(/^<offer\b/, '<offer available="false"');
    o = o.replace(/<(stock_quantity|quantity_in_stock|quantity|count|stock)>[^<]*<\/\1>/g, '<$1>0</$1>');
    return o;
  });
  Logger.log('oosPatch_: ' + n + ' offers → not available');
  return out;
}
function publishKastaProm() {
  Logger.log(publishJob_('kasta') + ' | ' + publishJob_('prom'));
}

// 04.11.2026: ручна публікація лише Kasta
function pubKastaNow() { Logger.log(publishJob_('kasta')); }

// 04.11.2026: ручна публікація лише Prom
function pubPromNow() { Logger.log(publishJob_('prom')); }

// ===== 04.11.2026: GitHub Actions — збирач фідів (Prom, Kasta, Rozetka) =====
// Apps Script викладає в репозиторій: код збирача (builder/), копію цього коду (builder/gs/) і знімки даних (_data/).
const GH_BUILDER_FILES_ = {"builder/run.js":"#!/usr/bin/env node\n/**\n * LETIMO — збирач фідів маркетплейсів на GitHub Actions.\n * Запускає той самий код, що й Google Apps Script (builder/gs/*.gs), з емуляцією сервісів Google:\n * UrlFetchApp (curl), Utilities, Logger, PropertiesService, CacheService, SpreadsheetApp (знімки з _data/).\n * Ліміту 50 МБ і пам'яті Google тут немає.\n *\n * Використання: node builder/run.js <job> [<job> ...]\n *   job: prom | kasta | rozetka\n */\n'use strict';\nconst fs = require('fs');\nconst path = require('path');\nconst vm = require('vm');\nconst zlib = require('zlib');\nconst crypto = require('crypto');\nconst { spawnSync } = require('child_process');\nconst os = require('os');\n\nconst ROOT = path.resolve(__dirname, '..');\nconst DATA = path.join(ROOT, '_data');\nconst TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lf-'));\n\n/* ---------------- байти ---------------- */\n// Apps Script повертає byte[] як масив знакових чисел (-128..127). Тут — Buffer, а назовні віддаємо Int8Array-сумісний масив.\nfunction toBuf(x) {\n  if (Buffer.isBuffer(x)) return x;\n  if (x && x.__buf) return x.__buf;\n  if (typeof x === 'string') return Buffer.from(x, 'utf8');\n  if (x && typeof x.length === 'number') return Buffer.from(Int8Array.from(x).buffer);\n  return Buffer.alloc(0);\n}\nfunction bytesOut(buf) { const a = new Int8Array(buf.buffer, buf.byteOffset, buf.length); a.__buf = buf; return a; }\n\n/* ---------------- Blob ---------------- */\nfunction Blob(buf, type, name) { this._b = buf; this._t = type || 'application/octet-stream'; this._n = name || null; }\nBlob.prototype.getBytes = function () { return bytesOut(this._b); };\nBlob.prototype.getDataAsString = function () { return this._b.toString('utf8'); };\nBlob.prototype.getContentType = function () { return this._t; };\nBlob.prototype.setContentType = function (t) { this._t = t; return this; };\nBlob.prototype.getName = function () { return this._n; };\nBlob.prototype.setName = function (n) { this._n = n; return this; };\nBlob.prototype.getBlob = function () { return this; };\n\n/* ---------------- Utilities ---------------- */\nfunction fmtDate(d, tz, pat) {\n  const parts = {};\n  new Intl.DateTimeFormat('en-GB', { timeZone: tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })\n    .formatToParts(d).forEach(p => { parts[p.type] = p.value; });\n  return pat.replace(/'([^']*)'|yyyy|MM|dd|HH|mm|ss/g, (m, q) => {\n    if (q !== undefined) return q;\n    return { yyyy: parts.year, MM: parts.month, dd: parts.day, HH: parts.hour, mm: parts.minute, ss: parts.second }[m];\n  });\n}\nconst Utilities = {\n  Charset: { UTF_8: 'UTF-8', US_ASCII: 'US-ASCII' },\n  DigestAlgorithm: { MD5: 'md5', SHA_1: 'sha1', SHA_256: 'sha256', SHA_512: 'sha512' },\n  formatDate: (d, tz, pat) => fmtDate(d, tz, pat),\n  base64Encode: (x) => toBuf(x).toString('base64'),\n  base64EncodeWebSafe: (x) => toBuf(x).toString('base64').replace(/\\+/g, '-').replace(/\\//g, '_'),\n  base64Decode: (s) => bytesOut(Buffer.from(String(s), 'base64')),\n  newBlob: (data, type, name) => new Blob(toBuf(data), type, name),\n  gzip: (blob, name) => new Blob(zlib.gzipSync(toBuf(blob.getBytes ? blob.getBytes() : blob), { level: 9 }), 'application/x-gzip', name || null),\n  ungzip: (blob) => new Blob(zlib.gunzipSync(toBuf(blob.getBytes ? blob.getBytes() : blob))),\n  computeDigest: (alg, value) => bytesOut(crypto.createHash(alg).update(toBuf(value)).digest()),\n  sleep: (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms),\n};\n\n/* ---------------- Logger ---------------- */\nconst Logger = { log: function () { const a = Array.from(arguments); console.log(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ')); } };\n\n/* ---------------- Properties ---------------- */\nconst PROPS_FILE = path.join(DATA, 'props.json');\nlet PROPS = {}; try { PROPS = JSON.parse(fs.readFileSync(PROPS_FILE, 'utf8')); } catch (e) {}\n// секрети — зі змінних середовища (GitHub Secrets)\n['GH_TOKEN', 'GH_REPO', 'MB_FEED_URL', 'DR_FEED_URL', 'EPICENTR_TOKEN'].forEach(k => { if (process.env[k]) PROPS[k] = String(process.env[k]).trim(); });\nconst propStore = {\n  getProperty: (k) => (PROPS[k] === undefined ? null : PROPS[k]),\n  setProperty: (k, v) => { PROPS[k] = String(v); return propStore; },\n  deleteProperty: (k) => { delete PROPS[k]; return propStore; },\n  getProperties: () => Object.assign({}, PROPS),\n  setProperties: (o) => { Object.assign(PROPS, o); return propStore; },\n};\nconst PropertiesService = { getScriptProperties: () => propStore, getUserProperties: () => propStore };\n\n/* ---------------- Cache ---------------- */\nconst CACHE = new Map();\nconst cache = {\n  get: (k) => (CACHE.has(k) ? CACHE.get(k) : null),\n  getAll: (ks) => { const o = {}; ks.forEach(k => { if (CACHE.has(k)) o[k] = CACHE.get(k); }); return o; },\n  put: (k, v) => { CACHE.set(k, String(v)); },\n  putAll: (o) => { Object.keys(o).forEach(k => CACHE.set(k, String(o[k]))); },\n  remove: (k) => { CACHE.delete(k); },\n  removeAll: (ks) => { ks.forEach(k => CACHE.delete(k)); },\n};\nconst CacheService = { getScriptCache: () => cache, getUserCache: () => cache };\n\n/* ---------------- SpreadsheetApp (знімки з _data/sheets/<id>.json: {sheetName: [[...]]}) ---------------- */\nfunction Range(vals) { this._v = vals; }\nRange.prototype.getValues = function () { return this._v.map(r => r.slice()); };\nRange.prototype.getDisplayValues = function () { return this._v.map(r => r.map(c => (c === null || c === undefined) ? '' : String(c))); };\nfunction Sheet(name, vals) { this._n = name; this._v = vals || []; }\nSheet.prototype.getName = function () { return this._n; };\nSheet.prototype.getDataRange = function () { return new Range(this._v); };\nSheet.prototype.getLastRow = function () { return this._v.length; };\nSheet.prototype.getLastColumn = function () { return this._v[0] ? this._v[0].length : 0; };\nconst SpreadsheetApp = {\n  openById: (id) => {\n    const f = path.join(DATA, 'sheets', id + '.json');\n    if (!fs.existsSync(f)) throw new Error('Немає знімка таблиці ' + id);\n    const j = JSON.parse(fs.readFileSync(f, 'utf8'));\n    const names = Object.keys(j);\n    return {\n      getSheetByName: (n) => (j[n] ? new Sheet(n, j[n]) : null),\n      getSheets: () => names.map(n => new Sheet(n, j[n])),\n    };\n  },\n};\n\n/* ---------------- UrlFetchApp (curl) ---------------- */\nlet fetchN = 0;\nfunction fetchOne(url, opt) {\n  opt = opt || {};\n  const n = ++fetchN;\n  const bodyF = path.join(TMP, 'b' + n), hdrF = path.join(TMP, 'h' + n);\n  const args = ['-sS', '--compressed', '-o', bodyF, '-D', hdrF, '-w', '%{http_code}', '--max-time', '600', '-X', String(opt.method || 'get').toUpperCase()];\n  if (opt.followRedirects !== false) args.push('-L');\n  const hdrs = Object.assign({}, opt.headers || {});\n  if (opt.contentType) hdrs['Content-Type'] = opt.contentType;\n  Object.keys(hdrs).forEach(k => args.push('-H', k + ': ' + hdrs[k]));\n  if (opt.payload !== undefined && opt.payload !== null) {\n    const pf = path.join(TMP, 'p' + n);\n    let p = opt.payload;\n    if (typeof p === 'object' && !Buffer.isBuffer(p) && !(p && p.length !== undefined && typeof p !== 'string')) {\n      p = Object.keys(p).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(p[k])).join('&');\n      if (!opt.contentType) args.push('-H', 'Content-Type: application/x-www-form-urlencoded');\n    }\n    fs.writeFileSync(pf, typeof p === 'string' ? Buffer.from(p, 'utf8') : toBuf(p));\n    args.push('--data-binary', '@' + pf);\n  }\n  args.push(url);\n  let r;\n  for (let a = 0; a < 3; a++) {\n    r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 1 << 20 });\n    if (r.status === 0) break;\n    Utilities.sleep(3000 * (a + 1));\n  }\n  if (r.status !== 0) throw new Error('fetch ' + url.replace(/\\?.*/, '') + ': ' + (r.stderr || '').trim());\n  const code = Number(r.stdout.trim());\n  const body = fs.readFileSync(bodyF); fs.unlinkSync(bodyF);\n  const rawH = fs.readFileSync(hdrF, 'utf8'); fs.unlinkSync(hdrF);\n  const blocks = rawH.split(/\\r?\\n\\r?\\n/).filter(Boolean); const last = blocks[blocks.length - 1] || '';\n  const headers = {}; last.split(/\\r?\\n/).slice(1).forEach(l => { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });\n  const resp = {\n    getResponseCode: () => code,\n    getContentText: () => body.toString('utf8'),\n    getContent: () => bytesOut(body),\n    getBlob: () => new Blob(body, headers['Content-Type'] || headers['content-type']),\n    getHeaders: () => headers,\n    getAllHeaders: () => headers,\n  };\n  if (code >= 400 && !opt.muteHttpExceptions) throw new Error('Request failed for ' + url.replace(/\\?.*/, '') + ' returned code ' + code + '. ' + body.toString('utf8').slice(0, 200));\n  return resp;\n}\nconst UrlFetchApp = {\n  fetch: (url, opt) => fetchOne(url, opt),\n  fetchAll: (reqs) => reqs.map(q => fetchOne(typeof q === 'string' ? q : q.url, typeof q === 'string' ? {} : q)),\n};\n\n/* ---------------- заглушки ---------------- */\nconst ScriptApp = {\n  getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => {} }), everyHours: () => ({ create: () => {} }), after: () => ({ create: () => {} }), atHour: () => ({ everyDays: () => ({ create: () => {} }) }) }) }),\n  deleteTrigger: () => {}, getScriptId: () => 'github-actions', getOAuthToken: () => '',\n};\nconst ContentService = { MimeType: { XML: 'xml', TEXT: 'text', JSON: 'json' }, createTextOutput: (s) => ({ setMimeType: function () { return this; }, getContent: () => s }) };\nconst DriveApp = { getFiles: () => ({ hasNext: () => false }) };\n// LanguageApp.translate — через публічний endpoint Google Translate (той самий рушій)\nconst TR_CACHE = new Map();\nconst LanguageApp = {\n  translate: (text, from, to) => {\n    const k = from + '|' + to + '|' + text;\n    if (TR_CACHE.has(k)) return TR_CACHE.get(k);\n    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text);\n    const r = fetchOne(url, { muteHttpExceptions: true });\n    if (r.getResponseCode() !== 200) throw new Error('translate HTTP ' + r.getResponseCode());\n    const j = JSON.parse(r.getContentText());\n    let out = (j[0] || []).map(x => x[0]).join('');\n    if (out) out = (text.match(/^\\s*/) || [''])[0] + out.trim() + (text.match(/\\s*$/) || [''])[0]; // зберігаємо пробіли по краях, як LanguageApp\n    if (!out) throw new Error('translate empty');\n    TR_CACHE.set(k, out);\n    return out;\n  },\n};\n\n/* ---------------- завантаження коду ---------------- */\nfunction loadCode() {\n  const ctx = vm.createContext({\n    UrlFetchApp, Utilities, Logger, PropertiesService, CacheService, SpreadsheetApp, ScriptApp, ContentService, DriveApp, LanguageApp, console,\n  });\n  const dir = path.join(__dirname, 'gs');\n  const order = ['letimo-prom-feed-v2.gs', 'fast.gs'];\n  order.forEach(f => {\n    let code = fs.readFileSync(path.join(dir, f), 'utf8');\n    code = patchForNode(code);\n    vm.runInContext(code, ctx, { filename: f });\n  });\n  // Публікація: замість GitHub API пишемо файли в робочу папку, коміт робить workflow (git, з повтором).\n  const OUT = path.join(ROOT, process.env.FEEDS_LIVE === '1' ? '' : '_test/'); // поки FEEDS_LIVE≠1 — тестова папка _test/\n  const write = (name, data) => { const f = path.join(OUT, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); console.log('  → ' + path.relative(ROOT, f) + ' (' + (data.length / 1048576).toFixed(1) + ' МБ)'); };\n  const oos = (t) => (typeof ctx.oosPatch_ === 'function' ? ctx.oosPatch_(t) : t);\n  // Кеш перекладів ru-cache.json лежить у цьому ж репозиторії — читаємо з диска (без токена GitHub API).\n  const ruF = path.join(ROOT, 'ru-cache.json');\n  ctx.prRuLoad_ = function () {\n    try { const c = JSON.parse(fs.readFileSync(ruF, 'utf8')); c.n = c.n || {}; c.d = c.d || {}; return c; }\n    catch (e) { console.log('ru-cache: ' + e.message); return { n: {}, d: {} }; }\n  };\n  // Постійний словник перекладів назв Rozetka (UA → RU): у Google він жив у кеші між запусками, тут — у файлі репозиторію.\n  // Лежить у _test/ — цю папку workflow вже комітить.\n  const trF = path.join(ROOT, '_test', 'rz-tr.json');\n  let trMap = {}; try { trMap = JSON.parse(fs.readFileSync(trF, 'utf8')); } catch (e) { console.log('rz-tr: ' + e.message); }\n  let trSeeded = false;\n  if (!Object.keys(trMap).length) {\n    try {\n      const live = fs.readFileSync(path.join(ROOT, 'rozetka.xml'), 'utf8');\n      (live.match(/<offer\\b[\\s\\S]*?<\\/offer>/g) || []).forEach(function (o) {\n        const n = (o.match(/<name>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/name>/) || [])[1];\n        const u = (o.match(/<name_ua>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/name_ua>/) || [])[1];\n        if (n && u && n !== u) trMap[u] = n;\n      });\n      trSeeded = true; console.log('rz-tr: засіяно з rozetka.xml — ' + Object.keys(trMap).length);\n    } catch (e) { console.log('rz-tr seed: ' + e.message); }\n  }\n  // Переклади, які зробив Apps Script (LanguageApp працює там; з серверів GitHub Google Translate віддає 429).\n  try { const g = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'rz-tr-gas.json'), 'utf8')); Object.keys(g).forEach(function (k) { if (!trMap[k]) trMap[k] = g[k]; }); } catch (e) {}\n  // Прибираємо «переклади», що відрізняються лише пробілами (Google Translate їх обрізає).\n  const nsp = function (x) { return String(x).replace(/\\s+/g, ''); };\n  Object.keys(trMap).forEach(function (k) { if (nsp(k) === nsp(trMap[k])) delete trMap[k]; });\n  const trTodo = {};\n  const trStart = Object.keys(trMap).length; let trErr = 0, trLastErr = '';\n  ctx.rzTrRu_ = function (ua, vendor) {\n    if (trMap[ua]) return trMap[ua];\n    if (trErr >= 3) { trTodo[ua] = vendor || ''; return null; } // перекладач недоступний — у чергу для Apps Script\n    let ru = null;\n    try {\n      const parts = vendor ? ua.split(vendor) : [ua];\n      ru = parts.map(function (p) {\n        const m = p.match(/^(.*?)(\\s*\\(\\d+\\)\\s*)?$/); const body = m[1], tail = m[2] || '';\n        return (/[А-Яа-яІіЇїЄєҐґ]/.test(body) ? LanguageApp.translate(body, 'uk', 'ru') : body) + tail;\n      }).join(vendor || '');\n    } catch (e) { trErr++; trLastErr = String(e && e.message || e); ru = null; trTodo[ua] = vendor || ''; }\n    if (ru && nsp(ru) === nsp(ua)) ru = ua;\n    if (ru && ru !== ua) trMap[ua] = ru;\n    return ru;\n  };\n  process.on('exit', function () {\n    const n = Object.keys(trMap).length;\n    console.log('rz-tr: було ' + trStart + ', стало ' + n + ', помилок перекладу ' + trErr + (trLastErr ? ' (' + trLastErr + ')' : ''));\n    try { fs.mkdirSync(path.join(ROOT, '_test'), { recursive: true }); fs.writeFileSync(path.join(ROOT, '_test', 'rz-tr-todo.json'), JSON.stringify(trTodo)); console.log('rz-tr: у черзі на переклад ' + Object.keys(trTodo).length); } catch (e) {}\n    if (n !== trStart || trSeeded) { try { fs.mkdirSync(path.dirname(trF), { recursive: true }); fs.writeFileSync(trF, JSON.stringify(trMap)); } catch (e) {} }\n  });\n  ctx.ghPublish_ = function (files) { Object.keys(files).forEach(k => { let v = files[k]; if (/\\.xml$/.test(k)) v = oos(v); write(k, Buffer.from(v, 'utf8')); }); };\n  ctx.ghPublishBig_ = function (name, text) { write(name + '.gz', zlib.gzipSync(Buffer.from(oos(text), 'utf8'), { level: 9 })); };\n  ctx.ghPublishLean_ = function (name, produce) {\n    const t = produce(); const n = (t.match(/<offer /g) || []).length;\n    if (n < 1000) throw new Error(name + ': у фіді лише ' + n + ' товарів — не публікую');\n    write(name, Buffer.from(oos(t), 'utf8')); return n;\n  };\n  return ctx;\n}\n\n// Тут немає лімітів Google — знімаємо запобіжники розміру; ліміт тарифу Prom (9 500 позицій) лишається.\nfunction patchForNode(code) {\n  return code\n    .replace(/TV_DROP_MAX_ = \\d+;/g, 'TV_DROP_MAX_ = 0;')\n    .replace(/let trBudget = \\d+;/, 'let trBudget = 30000;')\n    .replace(/function tvCapChars_\\(xml, maxChars\\) \\{/, 'function tvCapChars_(xml, maxChars) { return xml;')\n    .replace(/headers: \\{ Range: 'bytes=' \\+ start \\+ '-' \\+ \\(start \\+ CH - 1\\), 'Accept-Encoding': 'identity' \\} \\}/, 'headers: {} }')\n    .replace(/const DR_FEED = [^;]*;/, \"const DR_FEED = (PropertiesService.getScriptProperties().getProperty('DR_FEED_URL') || '');\");\n}\n\n/* ---------------- запуск ---------------- */\nfunction main() {\n  const jobs = process.argv.slice(2);\n  if (!jobs.length) { console.error('Вкажіть задачу: prom | kasta | rozetka'); process.exit(2); }\n  const ctx = loadCode();\n  let failed = 0;\n  jobs.forEach(job => {\n    const t0 = Date.now();\n    try {\n      let res;\n      if (job === 'rozetka') res = ctx.publishRozetka();\n      else res = ctx.publishJob_(job);\n      console.log('✔ ' + job + ': ' + res + ' (' + Math.round((Date.now() - t0) / 1000) + ' с)');\n    } catch (e) {\n      failed++;\n      console.error('✖ ' + job + ': ' + (e && e.stack || e));\n    }\n  });\n  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}\n  process.exit(failed ? 1 : 0);\n}\nmain();\n",".github/workflows/feeds.yml":"name: Фіди маркетплейсів (Prom, Kasta, Rozetka)\n\non:\n  schedule:\n    - cron: '15,45 * * * *'   # кожні 30 хв\n  workflow_dispatch: {}\n\nconcurrency:\n  group: feeds-build\n  cancel-in-progress: false\n\npermissions:\n  contents: write\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    timeout-minutes: 40\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 1\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n\n      - name: Зібрати фіди\n        env:\n          MB_FEED_URL: ${{ secrets.MB_FEED_URL }}\n          DR_FEED_URL: ${{ secrets.DR_FEED_URL }}\n          FEEDS_LIVE: ${{ vars.FEEDS_LIVE }}\n        run: node --max-old-space-size=6144 builder/run.js prom kasta rozetka\n\n      - name: Опублікувати\n        run: |\n          git config user.name \"letimo-feeds-bot\"\n          git config user.email \"feeds-bot@users.noreply.github.com\"\n          git add -A -- '*.xml' '*.xml.gz' '_test/*' || true\n          if git diff --cached --quiet; then echo \"Без змін\"; exit 0; fi\n          git commit -m \"actions: prom kasta rozetka $(TZ=Europe/Kyiv date '+%Y-%m-%d %H:%M')\"\n          for i in 1 2 3 4 5; do\n            if git push; then exit 0; fi\n            git pull --rebase -X theirs || { git rebase --abort; git pull --no-rebase -X ours; }\n            sleep $((i*5))\n          done\n          exit 1\n"};
function ghSelfSources_() {
  const url = 'https://script.google.com/feeds/download/export?id=' + ScriptApp.getScriptId() + '&format=json';
  const r = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('export HTTP ' + r.getResponseCode());
  const out = {};
  JSON.parse(r.getContentText()).files.forEach(function (f) {
    if (f.type !== 'server_js') return;
    let s = f.source;
    s = s.replace(/^const DR_FEED = '[^']*';/m, "const DR_FEED = '';"); // ключ ДоРечі — лише в GitHub Secrets
    out['builder/gs/' + f.name.replace(/\.gs$/, '') + '.gs'] = s;
  });
  return out;
}
function ghDataFiles_() {
  const files = {};
  const tv = SpreadsheetApp.openById(TV_DROP_SHEET_ID).getSheetByName('Talvi_залишки').getDataRange().getValues()
    .map(function (r) { return [r[0], '', '', '', '', '', '', r[7]]; });
  const o1 = {}; o1['Talvi_залишки'] = tv;
  files['_data/sheets/' + TV_DROP_SHEET_ID + '.json'] = JSON.stringify(o1);
  const sh = SpreadsheetApp.openById(MC_BC_SHEET).getSheets()[0];
  const o2 = {}; o2[sh.getName()] = sh.getDataRange().getDisplayValues();
  files['_data/sheets/' + MC_BC_SHEET + '.json'] = JSON.stringify(o2);
  const rz = PropertiesService.getUserProperties().getProperty('RZ_RU_CACHE') || PropertiesService.getScriptProperties().getProperty('RZ_RU_CACHE') || '{}';
  files['_data/props.json'] = JSON.stringify({ RZ_RU_CACHE: rz });
  return files;
}
function ghHash_(s) { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s, Utilities.Charset.UTF_8)); }
/** Викласти/оновити дані й код для GitHub Actions (лише змінене). force=true — усе. */
function ghDataExport(force) {
  const p = PropertiesService.getScriptProperties();
  const files = Object.assign({}, ghDataFiles_(), ghSelfSources_(), GH_BUILDER_FILES_);
  const old = JSON.parse(p.getProperty('GH_DATA_HASH') || '{}'), now = {}, changed = {};
  Object.keys(files).forEach(function (k) { now[k] = ghHash_(files[k]); if (force === true || old[k] !== now[k]) changed[k] = files[k]; });
  const keys = Object.keys(changed);
  if (!keys.length) { Logger.log('GitHub дані: без змін'); return; }
  const wf = keys.filter(function (k) { return /^\.github\//.test(k); });
  const rest = {}; keys.filter(function (k) { return wf.indexOf(k) < 0; }).forEach(function (k) { rest[k] = changed[k]; });
  if (Object.keys(rest).length) ghPublish_(rest, 'data ' + Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm') + ' (' + Object.keys(rest).length + ')');
  wf.forEach(function (k) {
    try { const o = {}; o[k] = changed[k]; ghPublish_(o, 'workflow'); }
    catch (e) { Logger.log('Workflow не опубліковано (потрібен дозвіл workflow у токена): ' + String(e.message).slice(0, 200)); delete now[k]; }
  });
  p.setProperty('GH_DATA_HASH', JSON.stringify(now));
  Logger.log('GitHub дані: оновлено ' + keys.join(', '));
}
function ghInstallBuilder() { ghDataExport(true); }

// ===== СИНХРОНІЗАЦІЯ З GITHUB ACTIONS (04.11.2026) =====
// Збирач на GitHub не може перекладати (Google Translate віддає 429 серверам GitHub) — перекладає Apps Script.
function rzTrSync() {
  const p = PropertiesService.getScriptProperties(), t0 = Date.now();
  const get = function (f) {
    const r = UrlFetchApp.fetch('https://api.github.com/repos/' + p.getProperty('GH_REPO') + '/contents/' + f + '?ref=' + GH_BRANCH, { muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + p.getProperty('GH_TOKEN'), Accept: 'application/vnd.github.raw' } });
    return r.getResponseCode() === 200 ? JSON.parse(r.getContentText('UTF-8')) : null;
  };
  const todo = get('_test/rz-tr-todo.json') || {}, done = get('_data/rz-tr-gas.json') || {};
  let n = 0, fail = 0;
  Object.keys(todo).some(function (ua) {
    if (done[ua]) return false;
    if (Date.now() - t0 > 240000) return true;
    const t = rzTrRu_(ua, todo[ua]);
    if (t && t.replace(/\s+/g, '') !== ua.replace(/\s+/g, '')) { done[ua] = t; n++; } else fail++;
    return false;
  });
  if (n) ghPublish_({ '_data/rz-tr-gas.json': JSON.stringify(done) }, 'rz-tr +' + n);
  Logger.log('rzTrSync: перекладено ' + n + ', помилок ' + fail + ', у черзі було ' + Object.keys(todo).length);
}
// Запуск збірки фідів на GitHub Actions: комітимо «пульс» _data/tick.txt — workflow стартує на push цього файлу
// (розклад GitHub ненадійний, а прямий запуск токен не дозволяє).
function ghDispatch_() {
  const stamp = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm:ss');
  ghPublish_({ '_data/tick.txt': stamp + '\n' }, 'tick ' + stamp);
  Logger.log('Збірку на GitHub запущено: ' + stamp);
}
function ghSync() {
  try { ghDataExport(); } catch (e) { Logger.log('ghDataExport: ' + e.message); }
  try { ghDispatch_(); } catch (e) { Logger.log('ghDispatch_: ' + e.message); }
  try { rzTrSync(); } catch (e) { Logger.log('rzTrSync: ' + e.message); }
}
function ghSyncInstall() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'ghSync') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('ghSync').timeBased().everyMinutes(30).create();
  ghSync();
}

// 04.11.2026: Talvi на Епіцентр — пошук категорій (наборів) і їх обов'язкових полів. Результат у _diag/epi-sets.txt
function tvEpiSets() {
  const out = [], rx = /волосс|резинк|заколк|шап|панам|головн|пов.яз|обідк|бандан|косинк|чепч|манішк|снуд|шарф|рукавиц|рукавич|мітен|плед|покрив|сукн|плать|плаття|костюм|комплект|кофт|светр|лонгсл|лосин/i;
  for (let page = 41; page <= 200; page++) {
    let r = epiGet_('/v2/pim/attribute-sets?page=' + page);
    if (r.code !== 200) { Utilities.sleep(3000); r = epiGet_('/v2/pim/attribute-sets?page=' + page); }
    if (r.code !== 200) { out.push('HTTP ' + r.code + ' p' + page); continue; }
    const j = JSON.parse(r.body);
    (j.items || []).forEach(function (it) {
      const ua = ((it.translations || []).filter(function (t) { return t.languageCode === 'ua'; })[0] || {}).title || '';
      if (rx.test(ua)) out.push(it.code + ' | ' + ua + ' | req: ' + it.attributes.filter(function (x) { return x.isRequired && !x.isSystem; }).map(function (x) { const t = ((x.translations || []).filter(function (q) { return q.languageCode === 'ua'; })[0] || {}).title || ''; return x.code + ':' + t + '(' + x.type + ')'; }).join(', '));
    });
    if (page >= (j.pages || 1)) { out.push('сторінок ' + page); break; }
  }
  for (let a = 0; a < 4; a++) { try { ghPublish_({ '_diag/epi-sets2.txt': out.join('\n') }, 'diag epi sets'); break; } catch (e) { Logger.log('publish: ' + e.message); Utilities.sleep(5000); } }
  Logger.log('знайдено ' + out.length);
}

function tvEpiOptsDump() {
  const out = [];
  [['2417'], ['6635'], ['2418'], ['2419'], ['4112'], ['2427'], ['797'], ['805'], ['6585']].forEach(function (s) {
    const S = s[0];
    let attrs; try { attrs = epiSetAttrs_(S); } catch (e) { out.push(S + ' ERR ' + e.message); return; }
    out.push('=== ' + S + ': ' + attrs.map(function (a) { return a.c + (a.r ? '*' : '') + ':' + a.n + '(' + a.t + ')'; }).join(', '));
    attrs.forEach(function (a) {
      if (!a.r || ['select', 'multiselect'].indexOf(a.t) < 0 || ['brand', 'country_of_origin', 'measure'].indexOf(a.c) >= 0) return;
      try { const o = epiOptions_(S, a.c); const k = Object.keys(o); out.push('  ' + a.c + ' ' + a.n + ' [' + k.length + ']: ' + k.slice(0, a.c === '78' ? 400 : 250).join(' | ')); } catch (e) { out.push('  ' + a.c + ' ERR ' + e.message); }
    });
  });
  try { epiFileSave_(); } catch (e) {}
  for (let a = 0; a < 4; a++) { try { ghPublish_({ '_diag/epi-opts.txt': out.join('\n') }, 'diag epi opts'); break; } catch (e) { Utilities.sleep(5000); } }
}

// ===== TALVI-ДРОП → ЕПІЦЕНТР (04.11.2026) =====
// Категорії Епіцентру для артикулів TALVI- (лише в наявності) і значення обов'язкових полів з назви та характеристик Talvi.
// Значення беруться тільки з довідника Епіцентру; якщо підходящого немає — поле не заповнюється, товар пропускається (не вгадуємо).
function tvSizeNorm_(s) { return String(s || '').toLowerCase().replace(/[–—]/g, '-').replace(/\s*см\.?\s*$/, '').replace(/\s+/g, '').trim(); }
function tvSizePick_(s, opts) {
  const n = tvSizeNorm_(s), keys = Object.keys(opts || {});
  if (!n) return [];
  if (/універс|onesize/.test(n)) { const k = keys.filter(function (x) { return /one size|універс/.test(x); })[0]; return k ? [k] : []; }
  if (opts[n]) return [n];
  const m = n.match(/^(\d+)(?:-(\d+))?$/); if (!m) return [];
  const a = +m[1], b = +(m[2] || m[1]);
  let best = null, bw = 1e9;
  keys.forEach(function (k) { const q = k.match(/^(\d+)-(\d+)$/); if (q && +q[1] <= a && +q[2] >= b && (+q[2] - +q[1]) < bw) { best = k; bw = +q[2] - +q[1]; } });
  if (best) return [best];
  if (opts[String(a)]) return [String(a)];
  if (opts[String(b)]) return [String(b)];
  // найближче значення довідника: найбільше перекриття діапазонів, мінус зайве поза нашим діапазоном
  let bo = null, bs = 0;
  keys.forEach(function (k) {
    const q = k.match(/^(\d+)(?:-(\d+))?$/); if (!q) return;
    const x = +q[1], y = +(q[2] || q[1]);
    const ov = Math.min(b, y) - Math.max(a, x); if (ov < 0) return;
    const sc = (q[2] ? ov : 0.5) - 0.5 * (Math.max(0, a - x) + Math.max(0, y - b));
    if (sc > bs) { bs = sc; bo = k; }
  });
  return bo ? [bo] : [];
}
const TV_EPI_BASE_ = [[/бузо?к|лаванд|фіолет|сливов/, 'фіолетовий'], [/крем|таш|беж|мокко|кава|карамел|пісоч|капучин|молоч|айвор|вершк/, 'бежевий'],
  [/пудр|рожев|корал|персик/, 'рожевий'], [/малин|червон|бордо|вишн/, 'червоний'], [/гірчиц|жовт|лимон/, 'жовтий'], [/оливк|хакі|м.ят|ментол|зелен|смараг/, 'зелений'],
  [/графіт|антрацит|сір|попеляст|меланж/, 'сірий'], [/чорн/, 'чорний'], [/біл/, 'білий'], [/блакит|джинс|бірюз/, 'блакитний'], [/син/, 'синій'],
  [/коричн|шоколад|теракот/, 'коричневий'], [/помаранч|оранж/, 'помаранчевий']];
function tvBase_(s) { s = String(s || '').toLowerCase(); for (let i = 0; i < TV_EPI_BASE_.length; i++) if (TV_EPI_BASE_[i][0].test(s)) return TV_EPI_BASE_[i][1]; return epiBaseColor_(s); }
// Повертає правило [категорія, rx, набір, назва, пакування]; false — пропустити товар; undefined — звичайні правила.
function tvDropEpiRule_(cat, nl, size) {
  if (/кепк/.test(nl)) return [cat, /./, '6585', 'Кепки дитячі', 'small'];
  if (/панам/.test(nl)) { try { if (tvSizePick_(size, epiOptions_('6635', '2293')).length) return [cat, /./, '6635', 'Дитячі панамки', 'small']; } catch (e) {} }
  if (cat === '1128' || cat === '1136') return [cat, /./, '166', 'Головні убори для новонароджених', 'small'];
  if (cat === '1122') return [cat, /./, '2418', 'Шарфи і снуди дитячі', 'small'];
  if (cat === '1108') return [cat, /./, '4112', 'Пледи і покривала дитячі', 'big'];
  if (cat === '1088') return false; // рукавички: розміри Talvi (0–12 міс, універсальний) не мають відповідника в довіднику Епіцентру
  if (cat === '1150') {
    if (/сукн|плать/.test(nl)) return [cat, /./, '797', 'Плаття дитячі', 'light'];
    if (/костюм|комплект/.test(nl)) return [cat, /./, '2427', 'Костюми дитячі', 'mid'];
    return [cat, /./, '805', 'Светри і кофти дитячі', 'mid'];
  }
  return undefined;
}
function tvDropEpiVals_(a, S, opts, P, nameUa) {
  const nm = String(nameUa || '').toLowerCase(), keys = Object.keys(opts || {});
  const pick = function (list) { const o = []; list.forEach(function (v) { v = String(v || '').toLowerCase().trim(); if (v && keys.indexOf(v) >= 0 && o.indexOf(v) < 0) o.push(v); }); return o; };
  const c = String(a.c), size = P['Розмір'] || '';
  const g = /дівч/.test(nm) && !/хлопч/.test(nm) ? 'g' : /хлопч/.test(nm) && !/дівч/.test(nm) ? 'b' : 'u';
  if (c === '2293' || c === '5575') return tvSizePick_(size, opts);
  if (c === '12036') {
    const m = String(size + ' ' + nm).match(/(\d{2,3})\s*[*xх×]\s*(\d{2,3})/); if (!m) return [];
    const x = +m[1], y = +m[2];
    const k = keys.filter(function (z) { const q = z.match(/(\d+)\s*[xх]\s*(\d+)/); return q && ((+q[1] === x && +q[2] === y) || (+q[1] === y && +q[2] === x)); })[0];
    return k ? [k] : [];
  }
  if (c === '2295' || c === '2465') {
    const sz = String(P['Сезон'] || '').toLowerCase();
    let v;
    if (/зимов|утеплен|тепл|хутр|пухнаст|фліс|вушанк/.test(nm) || /зим/.test(sz)) v = ['зима', 'осінь'];
    else if (/літн|панам|муслін|батист|одношаров|котонов/.test(nm) || /літ/.test(sz)) v = ['літо'];
    else v = ['демісезон', 'весна', 'осінь'];
    let r = pick(v); if (!r.length) r = pick(['демісезон']); return r;
  }
  if (c === '2292') return pick([g === 'g' ? 'для дівчинки' : g === 'b' ? 'для хлопчика' : 'унісекс']);
  if (c === '2469') { const r = pick(g === 'g' ? ['для дівчаток', 'для дівчинки'] : g === 'b' ? ['для хлопчиків', 'для хлопчика'] : ['унісекс', 'дитячі']); return r.length ? r : pick(['для дівчаток', 'для хлопчиків']); }
  if (c === '50' && S === '166') return pick([/комплект|набір/.test(nm) ? 'набір' : /косинк/.test(nm) ? 'косинка' : /чепчик/.test(nm) ? 'чепчик' : /пов.яз|чалм/.test(nm) ? "пов'язка" : /бандан/.test(nm) ? 'бандана' : 'шапочка']);
  if (c === '51' && S === '2418') return pick([/ман[іи]шк|мон[іи]шк/.test(nm) ? 'манишка' : /снуд/.test(nm) ? 'снуд' : /хомут/.test(nm) ? 'хомут' : /комплект|набір/.test(nm) ? 'набір' : 'шарф']);
  if (c === '2418' && S === '4112') return pick(['плед']);
  if (c === '78') {
    const sh = String(P['Відтінок'] || '').toLowerCase().replace(/№\s*\d+/g, '').replace(/(^|\s)[a-zа-яіїєґ]*-?\d+[a-zа-яіїєґ]*(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
    const col = String(P['Колір'] || '').toLowerCase().trim();
    return pick([sh, col, tvBase_(sh || col)]).slice(0, 1);
  }
  if (c === '12097') return pick([tvBase_(P['Відтінок'] || ''), tvBase_(P['Колір'] || '')]).slice(0, 1);
  if (c === '2075') return pick([/принт|малюнк/.test(nm) ? 'із принтом' : /горох|горош/.test(nm) ? 'горошок' : /смуж/.test(nm) ? 'смужка' : 'без візерунка (однотонний)']);
  if (c === '1011') {
    const top = /футболк/.test(nm) ? 'футболка' : /лонгслів|реглан/.test(nm) ? 'реглан' : /кофт|світшот|худі|толстовк/.test(nm) ? 'кофта' : /майк/.test(nm) ? 'майка' : /светр/.test(nm) ? 'светр' : /сорочк/.test(nm) ? 'сорочка' : '';
    const bot = /лосин/.test(nm) ? ['лосини', 'легінси'] : /легінс/.test(nm) ? ['легінси', 'лосини'] : /штан|джогер/.test(nm) ? ['штани'] : /шорт/.test(nm) ? ['шорти'] : /спідн/.test(nm) ? ['спідниця'] : [];
    if (!top) return [];
    const cand = []; bot.forEach(function (x) { cand.push(top + ' і ' + x, top + ' та ' + x); if (top === 'кофта') cand.push('светр і ' + x); });
    return pick(cand).slice(0, 1);
  }
  if (c === '52' || c === '5333') {
    const sk = (String(P['Склад'] || '') + ' ' + nm).toLowerCase(), m = [];
    [[/бавовн|котон|cotton/, 'бавовна'], [/муслін/, 'муслін'], [/батист/, 'батист'], [/акрил/, 'акрил'], [/вовн|мерин/, 'вовна'], [/віскоз|бамбук/, 'віскоза'],
     [/поліест|поліефір/, 'поліестер'], [/еластан|спандекс|лайкр/, 'еластан'], [/фліс/, 'фліс'], [/велюр|тедді|плюш|велсофт/, c === '5333' ? 'велсофт' : 'велюр'], [/трикотаж|в.язан|рубчик/, 'трикотаж']
    ].forEach(function (r) { if (r[0].test(sk) && m.indexOf(r[1]) < 0) m.push(r[1]); });
    let out = pick(m); if (!out.length && c === '52' && S === '166') out = pick(['трикотаж']);
    return out.slice(0, 3);
  }
  if (c === '11972' || c === '2200') {
    const nums = (tvSizeNorm_(size).match(/\d+/g) || []).map(Number).filter(function (x) { return x >= 44 && x <= 182; });
    if (c === '2200') { const r = pick([tvSizeNorm_(size)]); if (r.length) return r; }
    return pick(nums.map(String)).slice(0, 2);
  }
  return null;
}
// Діагностика: звіт лише по Talvi-дропу → _diag/epi-talvi.json
function epiDiagTalvi() {
  EPI_DIAG_ = /TALVI-/;
  const r = buildEpicentr_('report');
  try { epiFileSave_(); } catch (e) {}
  for (let i = 0; i < 4; i++) { try { ghPublish_({ '_diag/epi-talvi.json': r }, 'diag epi talvi'); break; } catch (e) { Utilities.sleep(5000); } }
  Logger.log(r.slice(0, 3000));
}

// 04.11.2026: довідник «Колір виробника» (78) Епіцентру — 101 сторінка; раніше читалось лише 40 (немає «чорний» тощо).
// Разово читаємо повністю і кладемо в кеш для наборів, де він потрібен Talvi-дропу (код опцій спільний для атрибута).
function tvEpiColorsWarm() {
  const base = '/v2/pim/attribute-sets/166/attributes/78/options?page=';
  const map = {}; let page = 1, pages = 1, fails = 0;
  while (page <= pages && page <= 150) {
    const r = epiGet_(base + page);
    if (r.code !== 200) { if (++fails > 5) throw new Error('78 HTTP ' + r.code + ' p' + page); Utilities.sleep(2000); continue; }
    const j = JSON.parse(r.body); pages = j.pages || 1;
    (j.items || []).forEach(function (o) { const ua = (o.translations || []).filter(function (t) { return t.languageCode === 'ua'; })[0]; if (ua) map[String(ua.value).replace(/&#039;/g, "'").toLowerCase().trim()] = o.code; });
    page++;
  }
  ['166', '2418', '4112', '6585', '2427', '797', '805', '6635'].forEach(function (S) {
    try { if (epiSetAttrs_(S).some(function (a) { return a.c === '78'; })) epiCachePut_('epo3_' + S + '_78', map); } catch (e) { Logger.log(S + ': ' + e.message); }
  });
  EPI_FILE_N_ = 0; epiFileSave_();
  Logger.log('Кольорів у довіднику: ' + Object.keys(map).length + ', сторінок ' + pages + '; чорний=' + !!map['чорний'] + ', бузок=' + !!map['бузок']);
}

function tvEpiProbe() {
  const o = [], b = '/v2/pim/attribute-sets/166/attributes/78/options';
  ['?page=1', '?filter%5Bsearch%5D=' + encodeURIComponent('чорний'), '?search=' + encodeURIComponent('чорний'), '?filter%5Bvalue%5D=' + encodeURIComponent('чорний'), '?filter%5Btitle%5D=' + encodeURIComponent('чорний'), '?filter%5Btranslations.value%5D=' + encodeURIComponent('чорний'), '?filter%5Bcodes%5D%5B%5D=black', '?limit=500', '?per_page=500', '?perPage=500'].forEach(function (q) {
    try { const r = epiGet_(b + q); let info = ''; try { const j = JSON.parse(r.body); info = 'pages=' + j.pages + ' n=' + (j.items || []).length + ' first=' + JSON.stringify((j.items || []).slice(0, 2)).slice(0, 300); } catch (e) { info = r.body.slice(0, 200); } o.push(q + ' -> ' + r.code + ' ' + info); } catch (e) { o.push(q + ' ERR ' + e.message); }
  });
  for (let a = 0; a < 4; a++) { try { ghPublish_({ '_diag/epi-probe.txt': o.join('\n') }, 'diag probe'); break; } catch (e) { Utilities.sleep(5000); } }
}

function tvEpiDbg() {
  const P = { 'Колір': 'Бузок', 'Відтінок': 'Бузок' };
  const o1 = epiOptions_('2427', '12097'), o2 = epiOptions_('2427', '78');
  Logger.log('base=' + tvBase_('Бузок') + ' | 12097 n=' + Object.keys(o1).length + ' has=' + ('фіолетовий' in o1) + ' -> ' + JSON.stringify(tvDropEpiVals_({ c: '12097' }, '2427', o1, P, 'Костюм «Люсі», бузок, 86–92')) + ' | 78 n=' + Object.keys(o2).length + ' -> ' + JSON.stringify(tvDropEpiVals_({ c: '78' }, '2427', o2, P, 'x')) + ' | rx=' + TV_EPI_BASE_[0][0].source);
}

// 04.11.2026: Rozetka відхиляє ~950 товарів «Назва і Назва (ua) не співпадають» — RU-назви з фіду MagBaby мають іншу структуру.
// Такі RU-назви замінюємо перекладом української назви (той самий порядок слів, колір, розмір).
function rzRuBad_(ru, ua) {
  const nums = function (s) { return (String(s).match(/\d+/g) || []).join(','); };
  const commas = function (s) { return (String(s).match(/,/g) || []).length; };
  return /\b(True|False)\b/.test(ru) || nums(ru) !== nums(ua) || ru.length > ua.length * 1.35 || commas(ru) > commas(ua) + 1;
}
// Вік у розмірі (0-6 міс, 1-2 р) → зріст, см (верхня межа діапазону).
function rzAgeH_(sz) {
  const s = String(sz || '').toLowerCase().replace(/[–—]/g, '-');
  let m = s.match(/(\d+)\s*-\s*(\d+)\s*міс/); const M = { 3: 62, 6: 68, 9: 74, 12: 80, 18: 86, 24: 92 };
  if (m) return M[+m[2]] ? String(M[+m[2]]) : '';
  m = s.match(/(\d+)\s*-\s*(\d+)\s*(р|рок)/); const Y = { 1: 80, 2: 92, 3: 98, 4: 104, 5: 110, 6: 116, 7: 122, 8: 128, 9: 134, 10: 140, 11: 146, 12: 152 };
  if (m) return Y[+m[2]] ? String(Y[+m[2]]) : '';
  return '';
}
