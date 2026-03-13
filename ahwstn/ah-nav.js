/**
 * ah-nav.js — Logo Typewriter + Nav Enhancements
 * @version 1.0.0
 * @cdn https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@main/ahwstn/ah-nav.min.js
 *
 * Human typewriter: </ahwstn> collapses to </> on scroll, re-expands on hover.
 * Per-char max-width with randomised intervals (L→R type, R→L delete).
 *
 * Expects Webflow DOM:
 *   .nav_logo > .nav_logo-bracket(<) + .nav_logo-slash(/) + .nav_logo-text(ahwstn) + .nav_logo-bracket(>)
 *
 * Static-first: logo is fully readable without this script.
 *
 * v1.0.0: Typewriter scroll collapse, hover re-expand, reduced-motion.
 */
(function () {
  'use strict';

  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var nav = document.querySelector('.nav_wrapper');
  var logoText = document.querySelector('.nav_logo-text');
  if (!nav || !logoText) return;

  /* --- CSS injection for per-char control --- */
  var s = document.createElement('style');
  s.textContent = ''
    + '.nav_logo-char{'
    +   'display:inline-block;'
    +   'overflow-x:clip;'
    +   'white-space:nowrap;'
    +   'transition:max-width .15s cubic-bezier(.22,1,.36,1)'
    + '}'
    /* Disable transition for instant snap on page load */
    + '.nav_logo-char.is-instant{transition:none}'
  ;
  document.head.appendChild(s);

  /* --- Wrap each character in a span --- */
  var textNode = logoText.querySelector('.nav_logo-text ~ *') || logoText;
  var word = logoText.textContent.trim();
  var charSpans = '';
  for (var i = 0; i < word.length; i++) {
    charSpans += '<span class="nav_logo-char">' + word[i] + '</span>';
  }
  logoText.innerHTML = charSpans;

  var chars = Array.from(logoText.querySelectorAll('.nav_logo-char'));
  var charWidths = [];
  var typeTimers = [];

  /* Wait for fonts before measuring natural widths */
  document.fonts.ready.then(function () {
    for (var i = 0; i < chars.length; i++) {
      charWidths[i] = chars[i].getBoundingClientRect().width;
      chars[i].style.maxWidth = charWidths[i] + 'px';
    }
  });

  function clearTimers() {
    for (var i = 0; i < typeTimers.length; i++) clearTimeout(typeTimers[i]);
    typeTimers = [];
  }

  /* Type in: left to right, randomised intervals */
  function typeIn() {
    clearTimers();
    var elapsed = 0;
    for (var i = 0; i < chars.length; i++) {
      elapsed += 50 + Math.random() * 140;
      (function (idx, delay) {
        typeTimers.push(setTimeout(function () {
          chars[idx].classList.remove('is-instant');
          chars[idx].style.maxWidth = charWidths[idx] + 'px';
        }, delay));
      })(i, elapsed);
    }
  }

  /* Delete: right to left, randomised intervals */
  function typeOut() {
    clearTimers();
    var elapsed = 0;
    for (var i = chars.length - 1; i >= 0; i--) {
      elapsed += 35 + Math.random() * 90;
      (function (idx, delay) {
        typeTimers.push(setTimeout(function () {
          chars[idx].classList.remove('is-instant');
          chars[idx].style.maxWidth = '0px';
        }, delay));
      })(i, elapsed);
    }
  }

  /* Instant snap (no animation) — used on initial page load */
  function snapOut() {
    clearTimers();
    for (var i = 0; i < chars.length; i++) {
      chars[i].classList.add('is-instant');
      chars[i].style.maxWidth = '0px';
    }
  }

  if (rm) return; /* Reduced motion: logo stays static, no typewriter */

  /* --- Scroll sentinel --- */
  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
  document.body.insertBefore(sentinel, document.body.firstChild);

  var firstIO = true;
  var isScrolled = false;

  var observer = new IntersectionObserver(function (entries) {
    var scrolled = !entries[0].isIntersecting;

    if (firstIO) {
      firstIO = false;
      isScrolled = scrolled;
      if (scrolled) snapOut();
      return;
    }

    isScrolled = scrolled;
    if (scrolled) {
      typeOut();
    } else {
      typeIn();
    }
  }, { root: null, threshold: 0 });
  observer.observe(sentinel);

  /* --- Hover: re-expand when anywhere on nav is hovered, collapse on leave --- */
  nav.addEventListener('mouseenter', function () {
    if (isScrolled) typeIn();
  });
  nav.addEventListener('mouseleave', function () {
    if (isScrolled) typeOut();
  });
})();
