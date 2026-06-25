/* =========================================================
   ד.ר שחקים – רכיב נגישות (תקן ישראלי 5568 / WCAG 2.0 AA)
   נטען אוטומטית, בונה את התפריט, שומר העדפות ב-localStorage
   ========================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'shk_a11y';
  var FONT_KEY = 'shk_a11y_font';

  /* מצבי תוכן שהם מחלקות על body / html */
  var TOGGLES = [
    { id: 'acc-light',    target: 'body', label: 'ניגודיות בהירה', icon: 'contrast' },
    { id: 'acc-dark',     target: 'body', label: 'ניגודיות כהה',   icon: 'moon' },
    { id: 'acc-grayscale',target: 'body', label: 'גווני אפור',     icon: 'drop' },
    { id: 'acc-links',    target: 'body', label: 'הדגשת קישורים',  icon: 'link' },
    { id: 'acc-titles',   target: 'body', label: 'הדגשת כותרות',   icon: 'heading' },
    { id: 'acc-readable', target: 'body', label: 'גופן קריא',      icon: 'font' },
    { id: 'acc-spacing',  target: 'body', label: 'ריווח טקסט',     icon: 'spacing' },
    { id: 'acc-no-anim',  target: 'body', label: 'עצירת אנימציות', icon: 'pause' },
    { id: 'acc-cursor',   target: 'body', label: 'סמן גדול',       icon: 'cursor' }
  ];

  /* מצבים שמבטלים זה את זה (אי אפשר בהיר+כהה יחד) */
  var EXCLUSIVE = ['acc-light', 'acc-dark'];

  var ICONS = {
    contrast: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18V4a8 8 0 010 16z"/></svg>',
    moon:     '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
    drop:     '<svg viewBox="0 0 24 24"><path d="M12 2s7 8 7 12a7 7 0 11-14 0c0-4 7-12 7-12z"/></svg>',
    link:     '<svg viewBox="0 0 24 24"><path d="M3.9 12a3.1 3.1 0 013.1-3.1h4V7h-4a5 5 0 100 10h4v-1.9h-4A3.1 3.1 0 013.9 12zM8 13h8v-2H8v2zm9-6h-4v1.9h4a3.1 3.1 0 010 6.2h-4V17h4a5 5 0 000-10z"/></svg>',
    heading:  '<svg viewBox="0 0 24 24"><path d="M5 4v16h3v-6h8v6h3V4h-3v6H8V4z"/></svg>',
    font:     '<svg viewBox="0 0 24 24"><path d="M9 4L3.5 20h2.2l1.3-4h6l1.3 4h2.2L11 4H9zm-1.4 10L10 6.2 12.4 14H7.6z"/></svg>',
    spacing:  '<svg viewBox="0 0 24 24"><path d="M2 5h20v2H2zm0 6h20v2H2zm0 6h20v2H2z"/></svg>',
    pause:    '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    cursor:   '<svg viewBox="0 0 24 24"><path d="M5 2l14 7-6 1.5L17 17l-2.5 1.5L11 12l-4 4z"/></svg>',
    person:   '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 110 4 2 2 0 010-4zm9 5.5c0 .6-.4 1-1 1-2 0-3.9-.4-5.6-1l-.4-.1V11l2.8 9.1c.2.7-.2 1.4-.9 1.6-.7.2-1.4-.2-1.6-.9L12 14.5l-1.3 6.4c-.2.7-.9 1.1-1.6.9-.7-.2-1.1-.9-.9-1.6L11 11V7.4l-.4.1A18 18 0 015 8.5c-.6 0-1-.4-1-1s.4-1 1-1c2.6 0 5 .5 7 1 2-.5 4.4-1 7-1 .6 0 1 .4 1 1z"/></svg>'
  };

  var html = document.documentElement;

  /* ---------- שמירה / טעינה ---------- */
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function loadFont() {
    var v = parseInt(localStorage.getItem(FONT_KEY), 10);
    return isNaN(v) ? 0 : v;
  }
  function saveFont(step) {
    try { localStorage.setItem(FONT_KEY, String(step)); } catch (e) {}
  }

  /* ---------- גודל גופן (root font-size, האתר בנוי ב-rem) ---------- */
  var fontStep = 0;            // 0 = רגיל
  var FONT_BASE = 16;
  var FONT_DELTA = 0.5;        // 0.5px לכל דרגה
  var FONT_MAX = 8, FONT_MIN = -2;

  function applyFont() {
    var size = FONT_BASE + (fontStep * FONT_DELTA);
    html.style.fontSize = size + 'px';
  }

  /* ---------- החלת מצב ---------- */
  function applyToggle(t, on) {
    var node = t.target === 'html' ? html : document.body;
    node.classList.toggle(t.id, on);
  }

  function applyAll() {
    var state = loadState();
    TOGGLES.forEach(function (t) { applyToggle(t, !!state[t.id]); });
    applyFont();
  }

  /* ---------- בניית הממשק ---------- */
  function buildUI() {
    var state = loadState();

    // דלג לתוכן
    var skip = document.createElement('a');
    skip.className = 'acc-skip-link';
    skip.href = '#acc-main';
    skip.textContent = 'דלג לתוכן המרכזי';
    document.body.insertBefore(skip, document.body.firstChild);

    // סימון אזור התוכן הראשי
    var main = document.querySelector('main') ||
               document.querySelector('section') ||
               document.body;
    if (main && !document.getElementById('acc-main')) {
      main.id = 'acc-main';
      main.setAttribute('tabindex', '-1');
    }

    // עטיפת הרכיב
    var widget = document.createElement('div');
    widget.className = 'acc-widget';

    // כפתור פתיחה
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'acc-toggle';
    toggleBtn.setAttribute('aria-label', 'פתיחת תפריט נגישות');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'acc-panel');
    toggleBtn.innerHTML = ICONS.person;

    // החלונית
    var panel = document.createElement('div');
    panel.className = 'acc-panel';
    panel.id = 'acc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'תפריט נגישות');
    panel.hidden = true;

    // כותרת
    var head = document.createElement('div');
    head.className = 'acc-panel-head';
    head.innerHTML = '<h2>תפריט נגישות</h2>';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'acc-close';
    closeBtn.setAttribute('aria-label', 'סגירת תפריט נגישות');
    closeBtn.innerHTML = '&times;';
    head.appendChild(closeBtn);
    panel.appendChild(head);

    // גוף
    var body = document.createElement('div');
    body.className = 'acc-panel-body';

    // שליטת גופן
    var fs = document.createElement('div');
    fs.className = 'acc-fontsize';
    fs.innerHTML =
      '<span class="acc-fs-label">גודל טקסט</span>' +
      '<div class="acc-fs-btns">' +
      '<button type="button" class="acc-fs-dec" aria-label="הקטנת טקסט">א-</button>' +
      '<button type="button" class="acc-fs-reset" aria-label="גודל טקסט רגיל">א</button>' +
      '<button type="button" class="acc-fs-inc" aria-label="הגדלת טקסט">א+</button>' +
      '</div>';
    body.appendChild(fs);

    // כותרת קטגוריה
    var cat = document.createElement('div');
    cat.className = 'acc-cat-title';
    cat.textContent = 'התאמות תצוגה';
    body.appendChild(cat);

    // רשת הכפתורים
    var grid = document.createElement('div');
    grid.className = 'acc-grid';
    TOGGLES.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'acc-btn';
      b.setAttribute('data-acc', t.id);
      b.setAttribute('aria-pressed', state[t.id] ? 'true' : 'false');
      if (state[t.id]) b.classList.add('is-active');
      b.innerHTML = (ICONS[t.icon] || '') + '<span>' + t.label + '</span>';
      grid.appendChild(b);
    });
    body.appendChild(grid);
    panel.appendChild(body);

    // תחתית
    var foot = document.createElement('div');
    foot.className = 'acc-panel-foot';
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'acc-reset';
    reset.textContent = 'איפוס הגדרות נגישות';
    foot.appendChild(reset);
    var stLink = document.createElement('a');
    stLink.className = 'acc-statement-link';
    stLink.href = 'הצהרת-נגישות.html';
    stLink.textContent = 'להצהרת הנגישות המלאה ולפניות';
    foot.appendChild(stLink);
    var credit = document.createElement('div');
    credit.className = 'acc-credit';
    credit.textContent = 'התאמות נגישות לפי ת"י 5568 / WCAG 2.0 AA';
    foot.appendChild(credit);
    panel.appendChild(foot);

    widget.appendChild(toggleBtn);
    widget.appendChild(panel);
    document.body.appendChild(widget);

    /* ---------- אירועים ---------- */
    function openPanel() {
      panel.hidden = false;
      toggleBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }
    function closePanel() {
      panel.hidden = true;
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.focus();
    }
    toggleBtn.addEventListener('click', function () {
      panel.hidden ? openPanel() : closePanel();
    });
    closeBtn.addEventListener('click', closePanel);

    // Esc לסגירה + לחיצה מחוץ לחלונית
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        closePanel();
      }
    });

    // כפתורי מצב
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.acc-btn');
      if (!b) return;
      var id = b.getAttribute('data-acc');
      var t = TOGGLES.filter(function (x) { return x.id === id; })[0];
      if (!t) return;
      var st = loadState();
      var newVal = !st[id];

      // טיפול במצבים שמבטלים זה את זה
      if (newVal && EXCLUSIVE.indexOf(id) !== -1) {
        EXCLUSIVE.forEach(function (other) {
          if (other !== id && st[other]) {
            st[other] = false;
            var ot = TOGGLES.filter(function (x){ return x.id === other; })[0];
            applyToggle(ot, false);
            var ob = grid.querySelector('[data-acc="' + other + '"]');
            if (ob) { ob.classList.remove('is-active'); ob.setAttribute('aria-pressed','false'); }
          }
        });
      }

      st[id] = newVal;
      saveState(st);
      applyToggle(t, newVal);
      b.classList.toggle('is-active', newVal);
      b.setAttribute('aria-pressed', newVal ? 'true' : 'false');
    });

    // גופן
    fs.querySelector('.acc-fs-inc').addEventListener('click', function () {
      if (fontStep < FONT_MAX) { fontStep++; applyFont(); saveFont(fontStep); }
    });
    fs.querySelector('.acc-fs-dec').addEventListener('click', function () {
      if (fontStep > FONT_MIN) { fontStep--; applyFont(); saveFont(fontStep); }
    });
    fs.querySelector('.acc-fs-reset').addEventListener('click', function () {
      fontStep = 0; applyFont(); saveFont(fontStep);
    });

    // איפוס מלא
    reset.addEventListener('click', function () {
      TOGGLES.forEach(function (t) { applyToggle(t, false); });
      saveState({});
      fontStep = 0; applyFont(); saveFont(0);
      grid.querySelectorAll('.acc-btn').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
    });
  }

  /* ---------- שיפורי ARIA כלליים ---------- */
  function enhanceAria() {
    var nav = document.querySelector('nav.navbar');
    if (nav && !nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'ניווט ראשי');

    // המבורגר – aria-expanded
    var burger = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (burger && menu) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-controls', 'mobileMenu');
      var sync = function () {
        burger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
      };
      burger.addEventListener('click', function(){ setTimeout(sync, 0); });
      menu.addEventListener('click', function(){ setTimeout(sync, 0); });
    }

    // וידאו – הסתרה מהקראת מסך + עצירה במצב "עצירת אנימציות"
    document.querySelectorAll('video').forEach(function (v) {
      v.setAttribute('aria-hidden', 'true');
      v.setAttribute('tabindex', '-1');
    });

    // אייקוני FontAwesome דקורטיביים – הסתרה מהקראה
    document.querySelectorAll('i.fa-solid, i.fa-regular, i.fa-brands, i[class*="fa-"]').forEach(function (i) {
      if (!i.getAttribute('aria-hidden')) i.setAttribute('aria-hidden', 'true');
    });

    // שם נגיש לשדות טופס שיש להם placeholder בלבד
    document.querySelectorAll('input, textarea, select').forEach(function (el) {
      if (el.type === 'hidden') return;
      var hasName = el.getAttribute('aria-label') ||
                    el.getAttribute('aria-labelledby') ||
                    (el.id && document.querySelector('label[for="' + el.id + '"]'));
      if (!hasName) {
        var txt = el.getAttribute('placeholder') || el.getAttribute('name') || 'שדה';
        el.setAttribute('aria-label', txt.replace(/\*/g, '').trim());
      }
    });

    // קישור הצהרת נגישות בפוטר (אם קיים פוטר)
    var footBottom = document.querySelector('.footer-bottom');
    if (footBottom && !footBottom.querySelector('.footer-a11y-link')) {
      var fl = document.createElement('a');
      fl.className = 'footer-a11y-link';
      fl.href = 'הצהרת-נגישות.html';
      fl.textContent = 'הצהרת נגישות';
      fl.style.cssText = 'color:inherit;text-decoration:underline;opacity:.85;';
      var wrap = document.createElement('div');
      wrap.appendChild(fl);
      footBottom.appendChild(wrap);
    }
  }

  /* ---------- עצירת וידאו במצב no-anim ---------- */
  function watchVideoPause() {
    var apply = function () {
      var stop = document.body.classList.contains('acc-no-anim');
      document.querySelectorAll('video').forEach(function (v) {
        if (stop) { v.pause(); } else { if (v.autoplay) v.play().catch(function(){}); }
      });
    };
    // מאזין לשינויי מחלקה על body
    var mo = new MutationObserver(apply);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- אתחול ---------- */
  function init() {
    fontStep = loadFont();
    applyAll();
    buildUI();
    enhanceAria();
    watchVideoPause();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
