/**
 * ah-cursor.js — Custom Square Cursor
 * @version 1.3.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ah-cursor.min.js
 *
 * DOM-based custom cursor: 20px square, mix-blend-mode: difference,
 * GSAP quickTo for smooth follow, scale on interactive elements,
 * hollow on click. Desktop (hover:hover) only.
 *
 * Static-first: site fully functional without this script.
 *
 * v1.3.0: Module pattern — ah.cursor with rebind() for Barba lifecycle.
 *         Cursor DOM persists (body-level); rebind() re-queries work cards.
 * v1.2.0: "VIEW" cursor state on work cards — expanded square with label text.
 * v1.1.0: Theme-aware — cursor colour via CSS custom property var(--ah-cursor-color).
 * v1.0.0: Square cursor, quickTo follow, hover scale, click hollow,
 *         edge fade, reduced-motion + touch guards.
 */
(function () {
  'use strict';

  /* --- Guards --- */
  if (!matchMedia('(hover:hover)').matches) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if (!window.gsap) return;

  window.ah = window.ah || {};

  /* --- CSS injection --- */
  var s = document.createElement('style');
  s.textContent = ''
    + '.ah-cursor{'
    +   'position:fixed;top:0;left:0;'
    +   'width:10px;height:10px;'
    +   'background-color:var(--ah-cursor-color,#F2F2F2);'
    +   'mix-blend-mode:difference;'
    +   'pointer-events:none;'
    +   'z-index:9999;'
    +   'transform:translate(-50%,-50%);'
    +   'will-change:transform;'
    +   'transition:background-color .15s ease,border-color .15s ease,'
    +     'width .2s ease,height .2s ease;'
    +   'border:2px solid transparent'
    + '}'
    + '.ah-cursor.is-hollow{'
    +   'background-color:transparent;'
    +   'border-color:var(--ah-cursor-color,#F2F2F2)'
    + '}'
    + '.ah-cursor.is-view{'
    +   'width:4.5rem;height:4.5rem;'
    +   'background-color:#0A0A0A;'
    +   'display:flex;align-items:center;justify-content:center;'
    +   'font-family:Inter,sans-serif;'
    +   'font-size:.625rem;font-weight:600;letter-spacing:.1em;'
    +   'color:#F2F2F2;'
    +   'mix-blend-mode:normal'
    + '}'
    + '[data-theme="light"] .ah-cursor.is-view{'
    +   'background-color:#F2F2F2;color:#0A0A0A'
    + '}'
    /* cursor:none handled by ahCss.js (header) for instant hide */
  ;
  document.head.appendChild(s);

  /* --- DOM --- */
  var cursor = document.createElement('div');
  cursor.className = 'ah-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.opacity = '0';
  document.body.appendChild(cursor);

  /* --- Position tracking — instant, no lag --- */
  var cursorVisible = false;
  document.addEventListener('mousemove', function (e) {
    gsap.set(cursor, { x: e.clientX, y: e.clientY });

    if (!cursorVisible) {
      cursorVisible = true;
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    }
  });

  /* --- Hover states: scale on interactive elements --- */
  var interactiveSelector = 'a,button,[role="button"]';

  document.addEventListener('mouseenter', function (e) {
    if (cursor.classList.contains('is-view')) return;
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      gsap.to(cursor, { scale: 2, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    }
  }, true);

  document.addEventListener('mouseleave', function (e) {
    if (cursor.classList.contains('is-view')) return;
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    }
  }, true);

  /* --- Work card "VIEW" cursor --- */
  var workCardHandlers = [];

  function bindWorkCards() {
    var workCards = document.querySelectorAll('.home-work_item');

    workCards.forEach(function (card) {
      var enterFn = function () {
        cursor.textContent = 'VIEW';
        cursor.classList.add('is-view');
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      };
      var leaveFn = function () {
        cursor.textContent = '';
        cursor.classList.remove('is-view');
        gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      };

      card.addEventListener('mouseenter', enterFn);
      card.addEventListener('mouseleave', leaveFn);
      workCardHandlers.push(
        { el: card, ev: 'mouseenter', fn: enterFn },
        { el: card, ev: 'mouseleave', fn: leaveFn }
      );
    });
  }

  function unbindWorkCards() {
    workCardHandlers.forEach(function (h) {
      h.el.removeEventListener(h.ev, h.fn);
    });
    workCardHandlers = [];
    /* Reset cursor state in case we're mid-VIEW */
    cursor.textContent = '';
    cursor.classList.remove('is-view');
  }

  /* Initial bind */
  bindWorkCards();

  /* --- Click animation: hollow + scale down --- */
  document.addEventListener('mousedown', function () {
    cursor.classList.add('is-hollow');
    gsap.to(cursor, { scale: 0.85, duration: 0.15, overwrite: 'auto' });
  });

  document.addEventListener('mouseup', function () {
    cursor.classList.remove('is-hollow');
    gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'back.out(1.7)', overwrite: 'auto' });
  });

  /* --- Edge: fade out when cursor leaves window --- */
  document.addEventListener('mouseleave', function () {
    gsap.to(cursor, { opacity: 0, duration: 0.2 });
  });

  document.addEventListener('mouseenter', function () {
    gsap.to(cursor, { opacity: 1, duration: 0.2 });
  });

  /* --- Expose ah.cursor for Barba lifecycle --- */
  ah.cursor = {
    rebind: function () {
      unbindWorkCards();
      bindWorkCards();
    }
  };

})();
