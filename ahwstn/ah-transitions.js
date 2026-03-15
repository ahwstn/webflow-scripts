/**
 * ah-transitions.js — Barba.js Page Transitions
 * @version 2.5.0
 * @cdn https://cdn.ahwstn.com/ahwstn/ah-transitions.min.js
 *
 * Overlay wipe: charcoal bar sweeps UP covering old page, continues UP
 * off the top revealing new page sitting underneath. One element, one direction.
 *
 * v2.5.0: Init new page BEFORE overlay lifts (hidden behind it). Slower timing.
 * v2.4.0: Fix CSS/GSAP transform conflict. Destroy after overlay covers.
 */
(function () {
  'use strict';

  if (!window.barba || !window.gsap) return;
  if (!window.ah) return;

  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* --- Overlay --- */
  var overlay = document.createElement('div');
  overlay.className = 'ah-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  var s = document.createElement('style');
  s.textContent = ''
    + '.ah-overlay{'
    +   'position:fixed;top:0;left:0;width:100%;height:100%;'
    +   'background-color:#141414;'
    +   'z-index:99999;'
    +   'pointer-events:none'
    + '}'
    + '[data-theme="light"] .ah-overlay{background-color:#EEEEEC}';
  document.head.appendChild(s);

  gsap.set(overlay, { yPercent: 100 });

  /* --- Easing --- */
  var ease = 'power2.inOut';
  if (window.CustomEase) {
    CustomEase.create('ahWipe', '.645,.045,.355,1');
    ease = 'ahWipe';
  }

  /* --- Modules --- */
  var navModules = ['navScroll', 'mobileNav', 'themeToggle', 'navTypewriter'];

  var pageModules = {
    home:      ['lenis', 'hero', 'heroCanvas', 'statement', 'servicePills', 'serviceTilt',
                'workHover', 'workReveal', 'bridgeScramble', 'footerCanvas'],
    about:     ['lenis', 'footerCanvas'],
    services:  ['lenis', 'footerCanvas'],
    work:      ['lenis', 'footerCanvas'],
    casestudy: ['lenis', 'footerCanvas'],
    contact:   ['lenis', 'footerCanvas']
  };

  function getModules(ns) {
    return (pageModules[ns] || []).concat(navModules);
  }

  function destroyPage(ns) {
    var modules = getModules(ns);
    for (var i = 0; i < modules.length; i++) {
      var m = ah[modules[i]];
      if (m && typeof m.destroy === 'function') m.destroy();
    }
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    }
  }

  function initPage(ns) {
    var modules = getModules(ns);
    for (var i = 0; i < modules.length; i++) {
      var m = ah[modules[i]];
      if (m && typeof m.init === 'function') m.init();
    }
    if (ah.cursor && typeof ah.cursor.rebind === 'function') ah.cursor.rebind();
    updateNavActive();
    reinitWebflow();
  }

  function updateNavActive() {
    var path = window.location.pathname;
    document.querySelectorAll('.nav_link').forEach(function (link) {
      link.classList.toggle('w--current', link.getAttribute('href') === path);
    });
    document.querySelectorAll('.nav_overlay-link').forEach(function (link) {
      link.classList.toggle('w--current', link.getAttribute('href') === path);
    });
  }

  function reinitWebflow() {
    if (!window.Webflow) return;
    Webflow.destroy();
    Webflow.ready();
    if (Webflow.require) {
      var ix2 = Webflow.require('ix2');
      if (ix2 && typeof ix2.init === 'function') ix2.init();
    }
  }

  barba.init({
    preventRunning: true,
    transitions: [{
      name: 'overlay-wipe',

      leave: function (data) {
        if (rm) { destroyPage(data.current.namespace); return; }
        if (window.lenis) window.lenis.stop();

        return gsap.fromTo(overlay,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: ease,
            onComplete: function () {
              destroyPage(data.current.namespace);
            }
          }
        );
      },

      enter: function (data) {
        window.scrollTo(0, 0);
        if (window.lenis) window.lenis.scrollTo(0, { immediate: true });

        /* Remove old container so querySelector finds new page elements */
        if (data.current.container && data.current.container.parentNode) {
          data.current.container.parentNode.removeChild(data.current.container);
        }

        /* Init new page while overlay still covers — canvases, ScrollTriggers, etc. */
        initPage(data.next.namespace);

        if (rm) return;

        /* Now lift the overlay to reveal the fully initialised page */
        return gsap.to(overlay, {
          yPercent: -100,
          duration: 0.8,
          ease: ease,
          onComplete: function () {
            gsap.set(overlay, { yPercent: 100 });
          }
        });
      },

      after: function () {
        if (window.lenis) window.lenis.start();
      }
    }]
  });

})();
