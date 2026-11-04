#!/usr/bin/env node
/**
 * LETIMO — збирач фідів маркетплейсів на GitHub Actions.
 * Запускає той самий код, що й Google Apps Script (builder/gs/*.gs), з емуляцією сервісів Google:
 * UrlFetchApp (curl), Utilities, Logger, PropertiesService, CacheService, SpreadsheetApp (знімки з _data/).
 * Ліміту 50 МБ і пам'яті Google тут немає.
 *
 * Використання: node builder/run.js <job> [<job> ...]
 *   job: prom | kasta | rozetka
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, '_data');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lf-'));

/* ---------------- байти ---------------- */
// Apps Script повертає byte[] як масив знакових чисел (-128..127). Тут — Buffer, а назовні віддаємо Int8Array-сумісний масив.
function toBuf(x) {
  if (Buffer.isBuffer(x)) return x;
  if (x && x.__buf) return x.__buf;
  if (typeof x === 'string') return Buffer.from(x, 'utf8');
  if (x && typeof x.length === 'number') return Buffer.from(Int8Array.from(x).buffer);
  return Buffer.alloc(0);
}
function bytesOut(buf) { const a = new Int8Array(buf.buffer, buf.byteOffset, buf.length); a.__buf = buf; return a; }

/* ---------------- Blob ---------------- */
function Blob(buf, type, name) { this._b = buf; this._t = type || 'application/octet-stream'; this._n = name || null; }
Blob.prototype.getBytes = function () { return bytesOut(this._b); };
Blob.prototype.getDataAsString = function () { return this._b.toString('utf8'); };
Blob.prototype.getContentType = function () { return this._t; };
Blob.prototype.setContentType = function (t) { this._t = t; return this; };
Blob.prototype.getName = function () { return this._n; };
Blob.prototype.setName = function (n) { this._n = n; return this; };
Blob.prototype.getBlob = function () { return this; };

/* ---------------- Utilities ---------------- */
function fmtDate(d, tz, pat) {
  const parts = {};
  new Intl.DateTimeFormat('en-GB', { timeZone: tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).forEach(p => { parts[p.type] = p.value; });
  return pat.replace(/'([^']*)'|yyyy|MM|dd|HH|mm|ss/g, (m, q) => {
    if (q !== undefined) return q;
    return { yyyy: parts.year, MM: parts.month, dd: parts.day, HH: parts.hour, mm: parts.minute, ss: parts.second }[m];
  });
}
const Utilities = {
  Charset: { UTF_8: 'UTF-8', US_ASCII: 'US-ASCII' },
  DigestAlgorithm: { MD5: 'md5', SHA_1: 'sha1', SHA_256: 'sha256', SHA_512: 'sha512' },
  formatDate: (d, tz, pat) => fmtDate(d, tz, pat),
  base64Encode: (x) => toBuf(x).toString('base64'),
  base64EncodeWebSafe: (x) => toBuf(x).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
  base64Decode: (s) => bytesOut(Buffer.from(String(s), 'base64')),
  newBlob: (data, type, name) => new Blob(toBuf(data), type, name),
  gzip: (blob, name) => new Blob(zlib.gzipSync(toBuf(blob.getBytes ? blob.getBytes() : blob), { level: 9 }), 'application/x-gzip', name || null),
  ungzip: (blob) => new Blob(zlib.gunzipSync(toBuf(blob.getBytes ? blob.getBytes() : blob))),
  computeDigest: (alg, value) => bytesOut(crypto.createHash(alg).update(toBuf(value)).digest()),
  sleep: (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms),
};

/* ---------------- Logger ---------------- */
const Logger = { log: function () { const a = Array.from(arguments); console.log(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ')); } };

/* ---------------- Properties ---------------- */
const PROPS_FILE = path.join(DATA, 'props.json');
let PROPS = {}; try { PROPS = JSON.parse(fs.readFileSync(PROPS_FILE, 'utf8')); } catch (e) {}
// секрети — зі змінних середовища (GitHub Secrets)
['GH_TOKEN', 'GH_REPO', 'MB_FEED_URL', 'DR_FEED_URL', 'EPICENTR_TOKEN'].forEach(k => { if (process.env[k]) PROPS[k] = String(process.env[k]).trim(); });
const propStore = {
  getProperty: (k) => (PROPS[k] === undefined ? null : PROPS[k]),
  setProperty: (k, v) => { PROPS[k] = String(v); return propStore; },
  deleteProperty: (k) => { delete PROPS[k]; return propStore; },
  getProperties: () => Object.assign({}, PROPS),
  setProperties: (o) => { Object.assign(PROPS, o); return propStore; },
};
const PropertiesService = { getScriptProperties: () => propStore, getUserProperties: () => propStore };

/* ---------------- Cache ---------------- */
const CACHE = new Map();
const cache = {
  get: (k) => (CACHE.has(k) ? CACHE.get(k) : null),
  getAll: (ks) => { const o = {}; ks.forEach(k => { if (CACHE.has(k)) o[k] = CACHE.get(k); }); return o; },
  put: (k, v) => { CACHE.set(k, String(v)); },
  putAll: (o) => { Object.keys(o).forEach(k => CACHE.set(k, String(o[k]))); },
  remove: (k) => { CACHE.delete(k); },
  removeAll: (ks) => { ks.forEach(k => CACHE.delete(k)); },
};
const CacheService = { getScriptCache: () => cache, getUserCache: () => cache };

/* ---------------- SpreadsheetApp (знімки з _data/sheets/<id>.json: {sheetName: [[...]]}) ---------------- */
function Range(vals) { this._v = vals; }
Range.prototype.getValues = function () { return this._v.map(r => r.slice()); };
Range.prototype.getDisplayValues = function () { return this._v.map(r => r.map(c => (c === null || c === undefined) ? '' : String(c))); };
function Sheet(name, vals) { this._n = name; this._v = vals || []; }
Sheet.prototype.getName = function () { return this._n; };
Sheet.prototype.getDataRange = function () { return new Range(this._v); };
Sheet.prototype.getLastRow = function () { return this._v.length; };
Sheet.prototype.getLastColumn = function () { return this._v[0] ? this._v[0].length : 0; };
const SpreadsheetApp = {
  openById: (id) => {
    const f = path.join(DATA, 'sheets', id + '.json');
    if (!fs.existsSync(f)) throw new Error('Немає знімка таблиці ' + id);
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    const names = Object.keys(j);
    return {
      getSheetByName: (n) => (j[n] ? new Sheet(n, j[n]) : null),
      getSheets: () => names.map(n => new Sheet(n, j[n])),
    };
  },
};

/* ---------------- UrlFetchApp (curl) ---------------- */
let fetchN = 0;
function fetchOne(url, opt) {
  opt = opt || {};
  const n = ++fetchN;
  const bodyF = path.join(TMP, 'b' + n), hdrF = path.join(TMP, 'h' + n);
  const args = ['-sS', '--compressed', '-o', bodyF, '-D', hdrF, '-w', '%{http_code}', '--max-time', '600', '-X', String(opt.method || 'get').toUpperCase()];
  if (opt.followRedirects !== false) args.push('-L');
  const hdrs = Object.assign({}, opt.headers || {});
  if (opt.contentType) hdrs['Content-Type'] = opt.contentType;
  Object.keys(hdrs).forEach(k => args.push('-H', k + ': ' + hdrs[k]));
  if (opt.payload !== undefined && opt.payload !== null) {
    const pf = path.join(TMP, 'p' + n);
    let p = opt.payload;
    if (typeof p === 'object' && !Buffer.isBuffer(p) && !(p && p.length !== undefined && typeof p !== 'string')) {
      p = Object.keys(p).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(p[k])).join('&');
      if (!opt.contentType) args.push('-H', 'Content-Type: application/x-www-form-urlencoded');
    }
    fs.writeFileSync(pf, typeof p === 'string' ? Buffer.from(p, 'utf8') : toBuf(p));
    args.push('--data-binary', '@' + pf);
  }
  args.push(url);
  let r;
  for (let a = 0; a < 3; a++) {
    r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 1 << 20 });
    if (r.status === 0) break;
    Utilities.sleep(3000 * (a + 1));
  }
  if (r.status !== 0) throw new Error('fetch ' + url.replace(/\?.*/, '') + ': ' + (r.stderr || '').trim());
  const code = Number(r.stdout.trim());
  const body = fs.readFileSync(bodyF); fs.unlinkSync(bodyF);
  const rawH = fs.readFileSync(hdrF, 'utf8'); fs.unlinkSync(hdrF);
  const blocks = rawH.split(/\r?\n\r?\n/).filter(Boolean); const last = blocks[blocks.length - 1] || '';
  const headers = {}; last.split(/\r?\n/).slice(1).forEach(l => { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  const resp = {
    getResponseCode: () => code,
    getContentText: () => body.toString('utf8'),
    getContent: () => bytesOut(body),
    getBlob: () => new Blob(body, headers['Content-Type'] || headers['content-type']),
    getHeaders: () => headers,
    getAllHeaders: () => headers,
  };
  if (code >= 400 && !opt.muteHttpExceptions) throw new Error('Request failed for ' + url.replace(/\?.*/, '') + ' returned code ' + code + '. ' + body.toString('utf8').slice(0, 200));
  return resp;
}
const UrlFetchApp = {
  fetch: (url, opt) => fetchOne(url, opt),
  fetchAll: (reqs) => reqs.map(q => fetchOne(typeof q === 'string' ? q : q.url, typeof q === 'string' ? {} : q)),
};

/* ---------------- заглушки ---------------- */
const ScriptApp = {
  getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => {} }), everyHours: () => ({ create: () => {} }), after: () => ({ create: () => {} }), atHour: () => ({ everyDays: () => ({ create: () => {} }) }) }) }),
  deleteTrigger: () => {}, getScriptId: () => 'github-actions', getOAuthToken: () => '',
};
const ContentService = { MimeType: { XML: 'xml', TEXT: 'text', JSON: 'json' }, createTextOutput: (s) => ({ setMimeType: function () { return this; }, getContent: () => s }) };
const DriveApp = { getFiles: () => ({ hasNext: () => false }) };
// LanguageApp.translate — через публічний endpoint Google Translate (той самий рушій)
const TR_CACHE = new Map();
const LanguageApp = {
  translate: (text, from, to) => {
    const k = from + '|' + to + '|' + text;
    if (TR_CACHE.has(k)) return TR_CACHE.get(k);
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text);
    const r = fetchOne(url, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw new Error('translate HTTP ' + r.getResponseCode());
    const j = JSON.parse(r.getContentText());
    let out = (j[0] || []).map(x => x[0]).join('');
    if (out) out = (text.match(/^\s*/) || [''])[0] + out.trim() + (text.match(/\s*$/) || [''])[0]; // зберігаємо пробіли по краях, як LanguageApp
    if (!out) throw new Error('translate empty');
    TR_CACHE.set(k, out);
    return out;
  },
};

/* ---------------- завантаження коду ---------------- */
function loadCode() {
  const ctx = vm.createContext({
    UrlFetchApp, Utilities, Logger, PropertiesService, CacheService, SpreadsheetApp, ScriptApp, ContentService, DriveApp, LanguageApp, console,
  });
  const dir = path.join(__dirname, 'gs');
  const order = ['letimo-prom-feed-v2.gs', 'fast.gs'];
  order.forEach(f => {
    let code = fs.readFileSync(path.join(dir, f), 'utf8');
    code = patchForNode(code);
    vm.runInContext(code, ctx, { filename: f });
  });
  // Публікація: замість GitHub API пишемо файли в робочу папку, коміт робить workflow (git, з повтором).
  const OUT = path.join(ROOT, process.env.FEEDS_LIVE === '1' ? '' : '_test/'); // поки FEEDS_LIVE≠1 — тестова папка _test/
  const write = (name, data) => { const f = path.join(OUT, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); console.log('  → ' + path.relative(ROOT, f) + ' (' + (data.length / 1048576).toFixed(1) + ' МБ)'); };
  const oos = (t) => (typeof ctx.oosPatch_ === 'function' ? ctx.oosPatch_(t) : t);
  // Кеш перекладів ru-cache.json лежить у цьому ж репозиторії — читаємо з диска (без токена GitHub API).
  const ruF = path.join(ROOT, 'ru-cache.json');
  ctx.prRuLoad_ = function () {
    try { const c = JSON.parse(fs.readFileSync(ruF, 'utf8')); c.n = c.n || {}; c.d = c.d || {}; return c; }
    catch (e) { console.log('ru-cache: ' + e.message); return { n: {}, d: {} }; }
  };
  // Постійний словник перекладів назв Rozetka (UA → RU): у Google він жив у кеші між запусками, тут — у файлі репозиторію.
  // Лежить у _test/ — цю папку workflow вже комітить.
  const trF = path.join(ROOT, '_test', 'rz-tr.json');
  let trMap = {}; try { trMap = JSON.parse(fs.readFileSync(trF, 'utf8')); } catch (e) { console.log('rz-tr: ' + e.message); }
  let trSeeded = false;
  if (!Object.keys(trMap).length) {
    try {
      const live = fs.readFileSync(path.join(ROOT, 'rozetka.xml'), 'utf8');
      (live.match(/<offer\b[\s\S]*?<\/offer>/g) || []).forEach(function (o) {
        const n = (o.match(/<name>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name>/) || [])[1];
        const u = (o.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) || [])[1];
        if (n && u && n !== u) trMap[u] = n;
      });
      trSeeded = true; console.log('rz-tr: засіяно з rozetka.xml — ' + Object.keys(trMap).length);
    } catch (e) { console.log('rz-tr seed: ' + e.message); }
  }
  // Переклади, які зробив Apps Script (LanguageApp працює там; з серверів GitHub Google Translate віддає 429).
  try { const g = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'rz-tr-gas.json'), 'utf8')); Object.keys(g).forEach(function (k) { if (!trMap[k]) trMap[k] = g[k]; }); } catch (e) {}
  // Прибираємо «переклади», що відрізняються лише пробілами (Google Translate їх обрізає).
  const nsp = function (x) { return String(x).replace(/\s+/g, ''); };
  Object.keys(trMap).forEach(function (k) { if (nsp(k) === nsp(trMap[k])) delete trMap[k]; });
  // 04.11.2026: прибираємо й «переклади» зі старою структурою (засіяні з живого фіду) — вони дають відхилення «Назва і Назва (ua) не співпадають»
  if (typeof ctx.rzRuBad_ === 'function') { let nb = 0; Object.keys(trMap).forEach(function (k) { if (ctx.rzRuBad_(trMap[k], k)) { delete trMap[k]; nb++; } }); console.log('rz-tr: прибрано зі старою структурою ' + nb); }
  const trTodo = {};
  const trStart = Object.keys(trMap).length; let trErr = 0, trLastErr = '';
  ctx.rzTrRu_ = function (ua, vendor) {
    if (trMap[ua]) return trMap[ua];
    if (trErr >= 3) { trTodo[ua] = vendor || ''; return null; } // перекладач недоступний — у чергу для Apps Script
    let ru = null;
    try {
      const parts = vendor ? ua.split(vendor) : [ua];
      ru = parts.map(function (p) {
        const m = p.match(/^(.*?)(\s*\(\d+\)\s*)?$/); const body = m[1], tail = m[2] || '';
        return (/[А-Яа-яІіЇїЄєҐґ]/.test(body) ? LanguageApp.translate(body, 'uk', 'ru') : body) + tail;
      }).join(vendor || '');
    } catch (e) { trErr++; trLastErr = String(e && e.message || e); ru = null; trTodo[ua] = vendor || ''; }
    if (ru && nsp(ru) === nsp(ua)) ru = ua;
    if (ru && ru !== ua) trMap[ua] = ru;
    return ru;
  };
  process.on('exit', function () {
    const n = Object.keys(trMap).length;
    console.log('rz-tr: було ' + trStart + ', стало ' + n + ', помилок перекладу ' + trErr + (trLastErr ? ' (' + trLastErr + ')' : ''));
    try { fs.mkdirSync(path.join(ROOT, '_test'), { recursive: true }); fs.writeFileSync(path.join(ROOT, '_test', 'rz-tr-todo.json'), JSON.stringify(trTodo)); console.log('rz-tr: у черзі на переклад ' + Object.keys(trTodo).length); } catch (e) {}
    if (n !== trStart || trSeeded) { try { fs.mkdirSync(path.dirname(trF), { recursive: true }); fs.writeFileSync(trF, JSON.stringify(trMap)); } catch (e) {} }
  });
  ctx.ghPublish_ = function (files) { Object.keys(files).forEach(k => { let v = files[k]; if (/\.xml$/.test(k)) v = oos(v); write(k, Buffer.from(v, 'utf8')); }); };
  ctx.ghPublishBig_ = function (name, text) { write(name + '.gz', zlib.gzipSync(Buffer.from(oos(text), 'utf8'), { level: 9 })); };
  ctx.ghPublishLean_ = function (name, produce) {
    const t = produce(); const n = (t.match(/<offer /g) || []).length;
    if (n < 1000) throw new Error(name + ': у фіді лише ' + n + ' товарів — не публікую');
    write(name, Buffer.from(oos(t), 'utf8')); return n;
  };
  return ctx;
}

// Тут немає лімітів Google — знімаємо запобіжники розміру; ліміт тарифу Prom (9 500 позицій) лишається.
function patchForNode(code) {
  return code
    .replace(/TV_DROP_MAX_ = \d+;/g, 'TV_DROP_MAX_ = 0;')
    .replace(/let trBudget = \d+;/, 'let trBudget = 30000;')
    .replace(/function tvCapChars_\(xml, maxChars\) \{/, 'function tvCapChars_(xml, maxChars) { return xml;')
    .replace(/headers: \{ Range: 'bytes=' \+ start \+ '-' \+ \(start \+ CH - 1\), 'Accept-Encoding': 'identity' \} \}/, 'headers: {} }')
    .replace(/const DR_FEED = [^;]*;/, "const DR_FEED = (PropertiesService.getScriptProperties().getProperty('DR_FEED_URL') || '');");
}

/* ---------------- запуск ---------------- */
function main() {
  const jobs = process.argv.slice(2);
  if (!jobs.length) { console.error('Вкажіть задачу: prom | kasta | rozetka'); process.exit(2); }
  const ctx = loadCode();
  let failed = 0;
  jobs.forEach(job => {
    const t0 = Date.now();
    try {
      let res;
      if (job === 'rozetka') res = ctx.publishRozetka();
      else res = ctx.publishJob_(job);
      console.log('✔ ' + job + ': ' + res + ' (' + Math.round((Date.now() - t0) / 1000) + ' с)');
    } catch (e) {
      failed++;
      console.error('✖ ' + job + ': ' + (e && e.stack || e));
    }
  });
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(failed ? 1 : 0);
}
main();
