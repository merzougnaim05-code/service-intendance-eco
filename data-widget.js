/* ═══════════ مركز المعطيات — ودجت البوابة ═══════════
   زر عائم يفتح لوحة رفع/تحميل معطيات البرامج من مركز service-data-hub
   لإظهار برامج محددة فقط، عرّف قبل تضمين السكربت:
   window.DATA_HUB_APPS = ['consommation','invantaire','economa','soumission','paie','rapport'];
   ═════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HUB = 'https://service-data-hub.merzougnaim05.workers.dev';
  var TOKEN_KEY = 'dataHubTokenV1';
  var ALL_APPS = [
    { key: 'consommation', name: 'برنامج التغذية', color: '#059669' },
    { key: 'invantaire', name: 'نظام الجرد', color: '#4f46e5' },
    { key: 'economa', name: 'المحاسب', color: '#0e7490' },
    { key: 'soumission', name: 'برنامج الاستشارة', color: '#0d9488' },
    { key: 'paie', name: 'الرواتب والتقاعد', color: '#d97706' },
    { key: 'rapport', name: 'التقرير اليومي', color: '#7c3aed' },
  ];
  var APPS = (window.DATA_HUB_APPS || []).length
    ? ALL_APPS.filter(function (a) { return window.DATA_HUB_APPS.indexOf(a.key) !== -1; })
    : ALL_APPS;

  var getToken = function () { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } };
  var setToken = function (t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} };

  function fmtSize(n) {
    if (!n) return '—';
    if (n < 1024) return n + ' بايت';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' كيلو';
    return (n / 1048576).toFixed(2) + ' ميجا';
  }
  function fmtWhen(iso) {
    if (!iso) return 'لا توجد نسخة بعد';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('ar-dz') + ' ' + d.toLocaleTimeString('ar-dz', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  var st = document.createElement('style');
  st.textContent =
    '.dhw{font-family:"IBM Plex Sans Arabic","Cairo",Tahoma,sans-serif;direction:rtl;z-index:99999}' +
    '.dhw-fab{position:fixed;bottom:92px;left:18px;width:62px;height:62px;border:0;border-radius:20px;cursor:pointer;' +
    'background:linear-gradient(145deg,#fbbf24,#f59e0b 55%,#d97706);border:2px solid rgba(16,185,129,.9);color:#020617;' +
    'display:grid;place-items:center;box-shadow:0 6px 0 #92400e,0 14px 28px rgba(146,64,14,.35),inset 0 2px 0 rgba(255,255,255,.45);' +
    'transition:transform .15s ease,box-shadow .15s ease;z-index:99999}' +
    '.dhw-fab:hover{transform:translateY(-2px)}' +
    '.dhw-fab:active{transform:translateY(1px);box-shadow:0 3px 0 #92400e,0 8px 18px rgba(146,64,14,.3)}' +
    '.dhw-fab svg{width:30px;height:30px}' +
    '.dhw-ov{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
    'display:none;align-items:center;justify-content:center;padding:1rem;z-index:100000}' +
    '.dhw-ov.open{display:flex}' +
    '.dhw-pn{background:#fff;width:100%;max-width:560px;max-height:86vh;display:flex;flex-direction:column;' +
    'border-radius:1.25rem;border:1px solid #a7f3d0;box-shadow:0 25px 50px -12px rgba(0,0,0,.4);overflow:hidden}' +
    '.dhw-hd{background:linear-gradient(90deg,#064e3b,#065f46,#134e4a);color:#fff;border-bottom:3px solid #f59e0b;' +
    'padding:.85rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}' +
    '.dhw-hd h3{font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:.5rem}' +
    '.dhw-hd h3 svg{width:20px;height:20px;color:#fbbf24}' +
    '.dhw-x{background:rgba(255,255,255,.15);border:0;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px}' +
    '.dhw-x:hover{background:rgba(255,255,255,.3)}' +
    '.dhw-bd{padding:.9rem 1.1rem;overflow-y:auto;display:flex;flex-direction:column;gap:.55rem}' +
    '.dhw-row{display:flex;align-items:center;gap:.7rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:.9rem;padding:.6rem .8rem}' +
    '.dhw-row .ic{width:34px;height:34px;border-radius:.7rem;display:grid;place-items:center;color:#fff;flex-shrink:0}' +
    '.dhw-row .ic svg{width:18px;height:18px}' +
    '.dhw-row .inf{flex:1;min-width:0}' +
    '.dhw-row .nm{font-weight:700;color:#1e293b;font-size:.95rem}' +
    '.dhw-row .mt{font-size:11px;color:#64748b;margin-top:2px}' +
    '.dhw-row .mt b{color:#059669}' +
    '.dhw-acts{display:flex;gap:.3rem;flex-shrink:0}' +
    '.dhw-acts button{border:0;border-radius:.6rem;padding:.4rem .55rem;font-size:11px;font-weight:700;cursor:pointer;' +
    'display:grid;place-items:center;gap:1px;font-family:inherit}' +
    '.dhw-acts button svg{width:15px;height:15px}' +
    '.dhw-up{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}' +
    '.dhw-up:hover{background:#d1fae5}' +
    '.dhw-dl{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}' +
    '.dhw-dl:hover{background:#dbeafe}' +
    '.dhw-dl[disabled]{opacity:.45;cursor:not-allowed}' +
    '.dhw-del{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}' +
    '.dhw-del:hover{background:#fee2e2}' +
    '.dhw-del[disabled]{opacity:.45;cursor:not-allowed}' +
    '.dhw-tk{border-top:1px dashed #cbd5e1;padding:.7rem 1.1rem .85rem;flex-shrink:0;background:#f0fdf4}' +
    '.dhw-tk label{display:flex;align-items:center;gap:.5rem;font-size:12px;color:#334155;font-weight:600;flex-wrap:wrap}' +
    '.dhw-tk input{flex:1;min-width:140px;border:1px solid #cbd5e1;border-radius:.5rem;padding:.35rem .6rem;font-family:inherit;font-size:12px;direction:ltr;text-align:left}' +
    '.dhw-tk button{border:0;background:#059669;color:#fff;border-radius:.5rem;padding:.35rem .8rem;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}' +
    '.dhw-msg{font-size:12px;padding:.5rem .75rem;border-radius:.6rem;margin-top:.5rem;display:none}' +
    '.dhw-msg.ok{display:block;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}' +
    '.dhw-msg.err{display:block;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}';
  document.head.appendChild(st);

  var ICON_DB = '<path d="M12 2c-4.97 0-9 1.343-9 3v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5c0-1.657-4.03-3-9-3Z"/><path d="M3 5c0 1.657 4.03 3 9 3s9-1.343 9-3"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>';
  var ICON_UP = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>';
  var ICON_DL = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>';
  var ICON_TR = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';
  var sv = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };

  /* الزر العائم */
  var fab = document.createElement('button');
  fab.className = 'dhw-fab dhw';
  fab.title = 'مركز المعطيات — رفع وتحميل معطيات البرامج';
  fab.innerHTML = sv(ICON_DB);
  document.body.appendChild(fab);

  /* اللوحة */
  var ov = document.createElement('div');
  ov.className = 'dhw-ov dhw';
  ov.innerHTML =
    '<div class="dhw-pn">' +
    '<div class="dhw-hd"><h3>' + sv(ICON_DB) + ' مركز المعطيات الموحّد</h3>' +
    '<button class="dhw-x" title="إغلاق">✕</button></div>' +
    '<div class="dhw-bd"></div>' +
    '<div class="dhw-tk"><label>🗄 توكن الرفع (يُحفظ في هذا المتصفح):' +
    '<input type="password" placeholder="HUB_TOKEN" id="dhw-token">' +
    '<button id="dhw-save-tk">حفظ</button></label>' +
    '<div class="dhw-msg" id="dhw-msg"></div></div>' +
    '</div>';
  document.body.appendChild(ov);

  var body = ov.querySelector('.dhw-bd');
  var msg = ov.querySelector('#dhw-msg');
  var tokenInput = ov.querySelector('#dhw-token');

  function say(text, ok) {
    msg.textContent = text;
    msg.className = 'dhw-msg ' + (ok ? 'ok' : 'err');
    clearTimeout(say._t);
    say._t = setTimeout(function () { msg.className = 'dhw-msg'; }, 4000);
  }

  function rowsHTML(list) {
    return list.map(function (a) {
      var m = a.meta || {};
      return '<div class="dhw-row" data-key="' + a.key + '">' +
        '<span class="ic" style="background:' + a.color + '">' + sv(ICON_DB) + '</span>' +
        '<span class="inf"><span class="nm">' + a.name + '</span>' +
        '<span class="mt">' + (m.updatedAt ? '<b>آخر رفع:</b> ' + fmtWhen(m.updatedAt) + ' — ' + fmtSize(m.size) + (m.by ? ' — بواسطة ' + m.by : '') : 'لا توجد نسخة مرفوعة بعد') + '</span></span>' +
        '<span class="acts dhw-acts">' +
        '<button class="dhw-up" title="رفع نسخة من ملف JSON">' + sv(ICON_UP) + 'رفع</button>' +
        '<button class="dhw-dl" title="تحميل النسخة الحالية"' + (m.updatedAt ? '' : ' disabled') + '>' + sv(ICON_DL) + 'تحميل</button>' +
        '<button class="dhw-del" title="حذف النسخة من المركز"' + (m.updatedAt ? '' : ' disabled') + '>' + sv(ICON_TR) + 'حذف</button>' +
        '</span>' +
        '<input type="file" accept=".json,application/json" style="display:none">' +
        '</div>';
    }).join('');
  }

  function loadApps() {
    return fetch(HUB + '/api/apps', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'فشل الاستعلام');
        var map = {};
        j.apps.forEach(function (a) { map[a.key] = a; });
        return APPS.map(function (a) { return { key: a.key, name: a.name, color: a.color, meta: map[a.key] || {} }; });
      });
  }

  function render(list) {
    body.innerHTML = rowsHTML(list);
  }

  function refresh() {
    body.innerHTML = '<div class="dhw-row"><span class="inf"><span class="mt">جارٍ جلب حالة النسخ…</span></span></div>';
    return loadApps().then(render).catch(function (e) {
      body.innerHTML = '<div class="dhw-row"><span class="inf"><span class="mt">تعذّر الاتصال بمركز المعطيات — تحقق من الأنترنت</span></span></div>';
    });
  }

  function needToken() {
    var t = tokenInput.value.trim() || getToken();
    if (!t) { say('أدخل توكن الرفع أولًا في الأسفل ثم اضغط حفظ', false); return null; }
    if (tokenInput.value.trim()) setToken(t);
    return t;
  }

  body.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button');
    var row = ev.target.closest('.dhw-row');
    if (!btn || !row) return;
    var key = row.getAttribute('data-key');
    var app = APPS.filter(function (a) { return a.key === key; })[0];

    if (btn.classList.contains('dhw-up')) {
      var file = row.querySelector('input[type=file]');
      file.value = '';
      file.click();
      return;
    }

    if (btn.classList.contains('dhw-dl')) {
      fetch(HUB + '/api/data/' + key, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('لا توجد نسخة'); return r.text(); })
        .then(function (txt) {
          var blob = new Blob([txt], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'معطيات-' + key + '-' + new Date().toISOString().slice(0, 10) + '.json';
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
          say('تم تحميل نسخة ' + app.name, true);
        })
        .catch(function () { say('تعذّر تحميل النسخة', false); });
      return;
    }

    if (btn.classList.contains('dhw-del')) {
      var t = needToken(); if (!t) return;
      if (!confirm('حذف نسخة «' + app.name + '» من المركز نهائيًا؟')) return;
      fetch(HUB + '/api/data/' + key, { method: 'DELETE', headers: { 'X-Hub-Token': t } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error);
          say('حُذفت نسخة ' + app.name + ' من المركز', true);
          refresh();
        })
        .catch(function (e) { say(e.message || 'فشل الحذف', false); });
    }
  });

  body.addEventListener('change', function (ev) {
    var input = ev.target;
    if (input.type !== 'file' || !input.files || !input.files[0]) return;
    var row = input.closest('.dhw-row');
    var key = row.getAttribute('data-key');
    var app = APPS.filter(function (a) { return a.key === key; })[0];
    var t = needToken(); if (!t) return;

    var reader = new FileReader();
    reader.onload = function () {
      var txt = String(reader.result);
      try { JSON.parse(txt); } catch (e) { say('الملف ليس JSON صالحًا', false); return; }
      fetch(HUB + '/api/data/' + key + '?by=' + encodeURIComponent('البوابة'), {
        method: 'PUT',
        headers: { 'X-Hub-Token': t, 'Content-Type': 'application/json' },
        body: txt,
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || 'فشل الرفع');
          say('رُفعت نسخة ' + app.name + ' إلى المركز بنجاح', true);
          refresh();
        })
        .catch(function (e) { say(e.message || 'فشل الرفع', false); });
    };
    reader.readAsText(input.files[0]);
  });

  ov.querySelector('#dhw-save-tk').addEventListener('click', function () {
    var t = tokenInput.value.trim();
    if (!t) { say('اكتب التوكن أولًا', false); return; }
    setToken(t);
    say('حُفظ التوكن في هذا المتصفح', true);
  });

  fab.addEventListener('click', function () {
    tokenInput.value = getToken();
    ov.classList.add('open');
    refresh();
  });
  ov.querySelector('.dhw-x').addEventListener('click', function () { ov.classList.remove('open'); });
  ov.addEventListener('click', function (e) { if (e.target === ov) ov.classList.remove('open'); });
})();
