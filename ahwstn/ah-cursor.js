/**
 * ah-cursor.js — Custom Square Cursor
 * @version 1.0.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ah-cursor.min.js
 *
 * DOM-based custom cursor: 20px square, mix-blend-mode: difference,
 * GSAP quickTo for smooth follow, scale on interactive elements,
 * hollow on click. Desktop (hover:hover) only.
 *
 * Static-first: site fully functional without this script.
 *
 * v1.0.0: Square cursor, quickTo follow, hover scale, click hollow,
 *         edge fade, reduced-motion + touch guards.
 */
(function () {
  'use strict';

  /* --- Guards --- */
  if (!matchMedia('(hover:hover)').matches) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if (!window.gsap) return;

  /* --- CSS injection --- */
  var s = document.createElement('style');
  s.textContent = ''
    + '.ah-cursor{'
    +   'position:fixed;top:0;left:0;'
    +   'width:10px;height:10px;'
    +   'background-color:#F2F2F2;'
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
    +   'border-color:#F2F2F2'
    + '}'
    + '@media(hover:hover){'
    +   'body.ah-cursor-active,body.ah-cursor-active *{cursor:none!important}'
    + '}'
  ;
  document.head.appendChild(s);

  /* --- DOM --- */
  var cursor = document.createElement('div');
  cursor.className = 'ah-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.opacity = '0';
  document.body.appendChild(cursor);

  /* --- Position tracking — instant, no lag --- */
  document.addEventListener('mousemove', function (e) {
    gsap.set(cursor, { x: e.clientX, y: e.clientY });

    if (!document.body.classList.contains('ah-cursor-active')) {
      document.body.classList.add('ah-cursor-active');
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    }
  });

  /* --- Hover states: scale on interactive elements --- */
  var interactiveSelector = 'a,button,[role="button"]';

  document.addEventListener('mouseenter', function (e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      gsap.to(cursor, { scale: 2, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    }
  }, true);

  document.addEventListener('mouseleave', function (e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    }
  }, true);

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
})();
