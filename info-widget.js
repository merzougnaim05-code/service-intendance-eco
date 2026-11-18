/* ═══════════ معطيات المؤسسة — زر الشريط العلوي في البوابة ═══════════
   لوحة إدخال الهوية الرسمية للمؤسسة (الولاية، المديرية، الدائرة، البلدية،
   الرقم الميكانوغرافي، رقم الحساب، رمز الآمر بالصرف، السنة الدراسية)
   — حفظ محلي + رفع/تحميل من مركز service-info-hub بمفتاح الرقم الميكانوغرافي
   — كل مؤسسة بسجلها الخاص، لا تداخل بين المؤسسات
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HUB = 'https://service-info-hub.merzougnaim05.workers.dev';
  var LS_INFO = 'instInfoV1';
  var LS_MECANO = 'instInfoMecanoV1';
  var LS_UPDATED = 'instInfoUpdatedAtV1';

  var FIELDS = [
    { key: 'institution', label: 'اسم المؤسسة' },
    { key: 'wilaya', label: 'الولاية' },
    { key: 'direction', label: 'المديرية' },
    { key: 'daira', label: 'الدائرة' },
    { key: 'commune', label: 'البلدية' },
    { key: 'mecano', label: 'الرقم الميكانوغرافي' },
    { key: 'account', label: 'رقم الحساب' },
    { key: 'ordonnateurCode', label: 'رمز الآمر بالصرف' },
    { key: 'academicYear', label: 'السنة الدراسية/المالية' },
  ];

  function getLS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function setLS(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function getInfo() { try { return JSON.parse(getLS(LS_INFO) || '{}') || {}; } catch (e) { return {}; } }
  function getMecano() { return getLS(LS_MECANO) || ''; }
  function getUpdated() { return getLS(LS_UPDATED) || ''; }
  function collect() {
    var o = {};
    FIELDS.forEach(function (f) { o[f.key] = (document.getElementById('iih-' + f.key) || {}).value || ''; });
    return o;
  }
  function fill(info) {
    FIELDS.forEach(function (f) {
      var el = document.getElementById('iih-' + f.key);
      if (el) el.value = info[f.key] || '';
    });
  }
  function fmtWhen(iso) {
    try { return new Date(iso).toLocaleString('ar-dz'); } catch (e) { return iso || ''; }
  }

  var st = document.createElement('style');
  st.textContent =
    '.iih{font-family:"IBM Plex Sans Arabic","Cairo",Tahoma,sans-serif;direction:rtl}' +
    '.iih-dot{display:none;position:absolute;top:-4px;left:-4px;width:10px;height:10px;border-radius:50%;' +
    'background:#ef4444;border:2px solid #fff;box-shadow:0 0 6px #ef4444}' +
    '.iih-dot.on{display:block;animation:iihPulse 1.2s infinite}' +
    '@keyframes iihPulse{50%{opacity:.45}}' +
    '.iih-ov{position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
    'display:none;align-items:center;justify-content:center;padding:1rem}' +
    '.iih-ov.open{display:flex}' +
    '.iih-pn{background:#fff;width:100%;max-width:520px;max-height:88vh;display:flex;flex-direction:column;' +
    'border-radius:1.25rem;border:1px solid #a7f3d0;box-shadow:0 25px 50px -12px rgba(0,0,0,.4);overflow:hidden}' +
    '.iih-hd{background:linear-gradient(90deg,#064e3b,#065f46,#134e4a);color:#fff;border-bottom:3px solid #f59e0b;' +
    'padding:.85rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}' +
    '.iih-hd h3{font-size:1.05rem;font-weight:700;margin:0}' +
    '.iih-x{background:rgba(255,255,255,.15);border:0;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px}' +
    '.iih-x:hover{background:rgba(255,255,255,.3)}' +
    '.iih-bd{padding:1rem 1.15rem;overflow-y:auto}' +
    '.iih-grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}' +
    '@media(max-width:520px){.iih-grid{grid-template-columns:1fr}}' +
    '.iih-f{display:flex;flex-direction:column;gap:3px}' +
    '.iih-f.wide{grid-column:1/-1}' +
    '.iih-f label{font-size:11px;font-weight:700;color:#334155}' +
    '.iih-f input{border:1px solid #cbd5e1;border-radius:.6rem;padding:.45rem .65rem;font-family:inherit;font-size:.9rem;font-weight:600;color:#0f172a}' +
    '.iih-f input:focus{outline:0;border-color:#059669;box-shadow:0 0 0 2px rgba(5,150,105,.2)}' +
    '.iih-note{font-size:11px;color:#64748b;line-height:1.8;margin:.6rem 0 0}' +
    '.iih-msg{display:none;font-size:12px;font-weight:700;padding:.5rem .75rem;border-radius:.6rem;margin-top:.6rem}' +
    '.iih-msg.ok{display:block;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}' +
    '.iih-msg.err{display:block;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}' +
    '.iih-acts{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem;padding-top:.9rem;border-top:1px dashed #cbd5e1}' +
    '.iih-acts button{border:0;border-radius:.7rem;padding:.5rem .9rem;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;' +
    'display:inline-flex;align-items:center;gap:5px}' +
    '.iih-save{background:#059669;color:#fff}' +
    '.iih-save:hover{background:#047857}' +
    '.iih-up{background:#f59e0b;color:#020617;border:1px solid #fde68a}' +
    '.iih-up:hover{background:#fbbf24}' +
    '.iih-dl{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}' +
    '.iih-dl:hover{background:#dbeafe}' +
  document.head.appendChild(st);

  /* زر معطيات المؤسسة داخل الكادر — مقابل «تطبيقات موحّدة» */
  function bindStat() {
    var el = document.getElementById('instInfoStat');
    if (!el) return;
    el.addEventListener('click', openPanel);
  }

  function refreshStatHint() {
    var m = document.getElementById('instInfoStatHint');
    if (!m) return;
    var mecano = getMecano();
    var u = getUpdated();
    m.textContent = mecano
      ? 'المؤسسة الحالية: ' + mecano + (u ? ' — آخر نشر: ' + fmtWhen(u) : '')
      : 'اضغط لتعبئة الهوية الرسمية ونشرها لكل التطبيقات';
  }

  /* اللوحة */
  var ov = document.createElement('div');
  ov.className = 'iih-ov iih';
  ov.innerHTML =
    '<div class="iih-pn">' +
    '<div class="iih-hd"><h3>🏛 معطيات المؤسسة</h3><button class="iih-x" title="إغلاق">✕</button></div>' +
    '<div class="iih-bd">' +
    '<div class="iih-grid">' +
    FIELDS.map(function (f) {
      return '<div class="iih-f' + (f.key === 'institution' || f.key === 'account' ? ' wide' : '') + '">' +
        '<label>' + f.label + ':</label>' +
        '<input id="iih-' + f.key + '" type="text">' +
        '</div>';
    }).join('') +
    '</div>' +
    '<p class="iih-note">اضغط «حفظ ونشر» — تُحفظ المعطيات في هذا المتصفح وتُنشر للمركز بمفتاح <b>الرقم الميكانوغرافي</b> فتظهر في كل أجهزة المؤسسة، وكل مؤسسة بسجلها المنفصل. الرقم الميكانوغرافي إلزامي.</p>' +
    '<div class="iih-acts">' +
    '<button class="iih-save" id="iih-save">💾 حفظ ونشر</button>' +
    '<button class="iih-dl" id="iih-pull">⬇ تحميل من المركز</button>' +
    '</div>' +
    '<div class="iih-meta" id="iih-meta"></div>' +
    '<div class="iih-msg" id="iih-msg"></div>' +
    '</div>' +
    '</div>';
  document.body.appendChild(ov);

  var msg = ov.querySelector('#iih-msg');
  var meta = ov.querySelector('#iih-meta');
  
  function say(text, ok) {
    msg.textContent = text;
    msg.className = 'iih-msg ' + (ok ? 'ok' : 'err');
    clearTimeout(say._t);
    say._t = setTimeout(function () { msg.className = 'iih-msg'; }, 5000);
  }
  function refreshMeta() {
    var mecano = getMecano();
    var u = getUpdated();
    meta.textContent = mecano
      ? 'المؤسسة الحالية: ' + mecano + (u ? ' — آخر مزامنة: ' + fmtWhen(u) : '')
      : 'لم يُحدَّد الرقم الميكانوغرافي بعد';
  }
  function refreshDot() {
    // نقطة حمراء إن وُجدت نسخة على المركز أحدث من آخر تطبيق محلي
    var dot = document.getElementById('iih-dot');
    if (!dot) return;
    var mecano = getMecano();
    if (!mecano) { var d0 = document.getElementById('iih-dot');
      if (!d0) return;
      d0.className = 'iih-dot'; return; }
    fetch(HUB + '/api/info/' + encodeURIComponent(mecano), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok || !j.updatedAt) { dot.className = 'iih-dot'; return; }
        var mine = getUpdated();
        if (!mine || new Date(j.updatedAt) > new Date(mine)) dot.className = 'iih-dot on';
        else { var d1 = document.getElementById('iih-dot'); if (d1) d1.className = 'iih-dot'; }
      })
      .catch(function () { dot.className = 'iih-dot'; });
  }

  function openPanel() {
    fill(getInfo());
    refreshMeta();
    refreshDot();
    refreshStatHint();
    ov.classList.add('open');
  }

  /* حفظ ونشر تلقائي */
  ov.querySelector('#iih-save').addEventListener('click', function () {
    var info = collect();
    var mecano = String(info.mecano || '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!mecano) { say('أدخل الرقم الميكانوغرافي أولًا — هو مفتاح المؤسسة في المركز', false); return; }
    say('جارٍ الحفظ والنشر…', true);
    fetch(HUB + '/api/info/' + encodeURIComponent(mecano) + '?by=' + encodeURIComponent('البوابة'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'فشل النشر');
        setLS(LS_INFO, JSON.stringify(info));
        setLS(LS_MECANO, mecano);
        setLS(LS_UPDATED, j.updatedAt);
        refreshMeta();
        refreshDot();
    refreshStatHint();
        say('✓ حُفظت المعطيات ونُشرت — كل أجهزة المؤسسة ستعرضها عند التحميل', true);
      })
      .catch(function (e) { say('✗ ' + (e.message || 'تعذّر النشر — تحقق من الأنترنت'), false); });
  });

  /* تحميل من المركز */
  ov.querySelector('#iih-pull').addEventListener('click', function () {
    var mecano = String(collect().mecano || getMecano() || '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!mecano) { say('أدخل الرقم الميكانوغرافي الذي سُجل به المؤسسة في المركز', false); return; }
    say('جارٍ الجلب…', true);
    fetch(HUB + '/api/info/' + encodeURIComponent(mecano), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'فشل الجلب');
        fill(j.info);
        setLS(LS_INFO, JSON.stringify(j.info));
        setLS(LS_MECANO, mecano);
        setLS(LS_UPDATED, j.updatedAt || '');
        refreshMeta();
        refreshDot();
    refreshStatHint();
        say('✓ جُلب سجل المؤسسة (' + (j.info.institution || mecano) + ')', true);
      })
      .catch(function (e) { say('✗ ' + (e.message || 'تعذّر الجلب'), false); });
  });

  ov.querySelector('.iih-x').addEventListener('click', function () { ov.classList.remove('open'); });
  ov.addEventListener('click', function (e) { if (e.target === ov) ov.classList.remove('open'); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindStat);
  else bindStat();

  /* مزامنة تلقائية عند فتح البوابة:
     - إن كان الرقم الميكانوغرافي محفوظًا: جلب آخر معطيات من المركز وتحديث النسخة المحلية بصمت
     - وإلا وُجدت مؤسسة واحدة فقط في المركز: تُتبنى آليًا (قبل تسجيل مؤسسات أخرى) */
  function autoSync() {
    var mecano = getMecano();
    if (mecano) { syncFromHub(mecano); return; }
    fetch(HUB + '/api/orgs', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok || !j.orgs || j.orgs.length !== 1) return;
        var m = String(j.orgs[0].mecano || '').toLowerCase().replace(/s+/g, '-');
        if (!/^[a-z0-9._-]{3,32}$/.test(m)) return;
        setLS(LS_MECANO, m);
        syncFromHub(m);
      })
      .catch(function () { /* اختياري */ });
  }
  function syncFromHub(mecano) {
    fetch(HUB + '/api/info/' + encodeURIComponent(mecano), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok || !j.info) return;
        setLS(LS_INFO, JSON.stringify(j.info));
        setLS(LS_UPDATED, j.updatedAt || '');
        refreshDot();
    refreshStatHint();
      })
      .catch(function () { /* اختياري */ });
  }

  if (getMecano()) refreshDot();
    refreshStatHint();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoSync);
  else autoSync();

  window.InstitutionInfo = { open: openPanel };
})();
